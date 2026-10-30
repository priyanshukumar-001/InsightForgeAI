"""
InsightForge AI - Python Data Analytics Service (FastAPI)
Deterministic analytics engine for dataset profiling, statistical calculation,
data cleaning, chart preparation, and AI tool execution.
"""

import os
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import io

from app.services.profiling import profile_dataframe, get_paginated_preview
from app.services.statistics import (
    calculate_numeric_summary,
    calculate_categorical_summary,
    calculate_correlations,
    compare_groups,
    detect_anomalies_iqr
)
from app.services.cleaning import apply_cleaning_pipeline
from app.services.charts import (
    generate_bar_chart_data,
    generate_line_chart_data,
    generate_scatter_chart_data,
    generate_histogram_data,
    generate_pie_chart_data,
    generate_area_chart_data,
    generate_box_plot_data
)

app = FastAPI(
    title="InsightForge AI Data Analytics Service",
    description="Deterministic pandas/numpy computation engine for InsightForge AI",
    version="2.0.0"
)

# Enable CORS for local Express backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Helper function to load dataframe from path or records
def load_dataframe(
    file_path: Optional[str] = None,
    records: Optional[List[Dict[str, Any]]] = None
) -> pd.DataFrame:
    if file_path:
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"File not found: {file_path}")
        ext = os.path.splitext(file_path)[1].lower()
        try:
            if ext in [".xlsx", ".xls"]:
                return pd.read_excel(file_path)
            return pd.read_csv(file_path)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")

    if records is not None:
        return pd.DataFrame(records)

    raise HTTPException(status_code=400, detail="Either 'filePath' or 'records' must be provided.")


# Request Models
class DatasetRef(BaseModel):
    filePath: Optional[str] = None
    records: Optional[List[Dict[str, Any]]] = None


class PreviewRequest(DatasetRef):
    page: int = 1
    pageSize: int = 20
    search: str = ""


class CleaningRequest(DatasetRef):
    operations: List[Dict[str, Any]]
    saveAsCleanedPath: Optional[str] = None


class ChartRequest(DatasetRef):
    chartType: str  # 'bar', 'line', 'scatter', 'histogram', 'pie'
    xAxis: Optional[str] = None
    yAxis: Optional[str] = None
    category: Optional[str] = None
    aggregation: str = "sum"
    bins: int = 10
    limit: int = 15


class ToolExecuteRequest(DatasetRef):
    toolName: str
    arguments: Dict[str, Any]


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "InsightForge Data Analytics Engine",
        "engine": "FastAPI + Pandas + NumPy",
        "version": "2.0.0"
    }


@app.post("/profile")
def profile_endpoint(req: DatasetRef):
    df = load_dataframe(req.filePath, req.records)
    profile = profile_dataframe(df)
    return {"success": True, "data": profile}


@app.post("/preview")
def preview_endpoint(req: PreviewRequest):
    df = load_dataframe(req.filePath, req.records)
    preview = get_paginated_preview(df, page=req.page, page_size=req.pageSize, search=req.search)
    return {"success": True, "data": preview}


@app.post("/statistics")
def statistics_endpoint(req: DatasetRef):
    df = load_dataframe(req.filePath, req.records)
    numeric_stats = calculate_numeric_summary(df)
    cat_stats = calculate_categorical_summary(df)
    correlations = calculate_correlations(df)
    return {
        "success": True,
        "data": {
            "numeric": numeric_stats,
            "categorical": cat_stats,
            "correlations": correlations
        }
    }


@app.post("/correlations")
def correlations_endpoint(req: DatasetRef):
    df = load_dataframe(req.filePath, req.records)
    corr = calculate_correlations(df)
    return {"success": True, "data": corr}


@app.post("/clean")
def clean_endpoint(req: CleaningRequest):
    df = load_dataframe(req.filePath, req.records)
    cleaned_df, audit = apply_cleaning_pipeline(df, req.operations)

    cleaned_file_path = None
    if req.saveAsCleanedPath:
        os.makedirs(os.path.dirname(req.saveAsCleanedPath), exist_ok=True)
        cleaned_df.to_csv(req.saveAsCleanedPath, index=False)
        cleaned_file_path = req.saveAsCleanedPath

    # Sample preview of the cleaned dataset
    preview = get_paginated_preview(cleaned_df, page=1, page_size=10)

    return {
        "success": True,
        "data": {
            "audit": audit,
            "cleanedFilePath": cleaned_file_path,
            "preview": preview
        }
    }


@app.post("/chart-data")
def chart_data_endpoint(req: ChartRequest):
    df = load_dataframe(req.filePath, req.records)
    ctype = req.chartType.lower()

    if ctype == "bar":
        result = generate_bar_chart_data(df, req.xAxis, req.yAxis, agg=req.aggregation, limit=req.limit)
    elif ctype == "line":
        result = generate_line_chart_data(df, req.xAxis, req.yAxis, agg=req.aggregation)
    elif ctype == "area":
        result = generate_area_chart_data(df, req.xAxis, req.yAxis, agg=req.aggregation)
    elif ctype == "scatter":
        result = generate_scatter_chart_data(df, req.xAxis, req.yAxis, category_col=req.category, limit=req.limit or 500)
    elif ctype == "histogram":
        result = generate_histogram_data(df, req.xAxis or req.yAxis, bins=req.bins)
    elif ctype == "pie":
        result = generate_pie_chart_data(df, req.xAxis or req.category, limit=req.limit)
    elif ctype == "boxplot":
        result = generate_box_plot_data(df, req.yAxis or req.xAxis, group_by=req.category or req.xAxis, limit=req.limit or 6)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported chartType: '{req.chartType}'")

    return {"success": True, "data": result}


@app.post("/tool-execute")
def tool_execute_endpoint(req: ToolExecuteRequest):
    """
    Executes grounded analysis tools called by the AI assistant.
    Strictly isolated and deterministic: no arbitrary code execution.
    """
    df = load_dataframe(req.filePath, req.records)
    tool = req.toolName
    args = req.arguments

    if tool == "profile_dataset":
        return {"success": True, "tool": tool, "result": profile_dataframe(df)}

    elif tool == "calculate_kpi":
        col = args.get("column")
        operation = args.get("operation", "sum").lower()  # sum, mean, count, min, max, median
        if col not in df.columns:
            raise HTTPException(status_code=400, detail=f"Column '{col}' does not exist.")

        series = pd.to_numeric(df[col], errors="coerce").dropna()
        if operation == "sum":
            val = float(series.sum())
        elif operation == "mean":
            val = float(series.mean())
        elif operation == "median":
            val = float(series.median())
        elif operation == "min":
            val = float(series.min())
        elif operation == "max":
            val = float(series.max())
        elif operation == "count":
            val = int(series.count())
        else:
            raise HTTPException(status_code=400, detail=f"Unknown operation: '{operation}'")

        res_data = {
            "column": col,
            "operation": operation,
            "value": round(val, 2)
        }
        return {
            "success": True,
            "tool": tool,
            "data": res_data,
            "result": res_data
        }

    elif tool == "compare_groups":
        group_by = args.get("groupBy")
        metric = args.get("metric")
        agg = args.get("aggregation", "mean")
        res = compare_groups(df, group_by, metric, aggregation=agg)
        return {"success": True, "tool": tool, "data": res, "result": res}

    elif tool == "detect_anomalies":
        col = args.get("column")
        multiplier = float(args.get("multiplier", 1.5))
        res = detect_anomalies_iqr(df, col, multiplier=multiplier)
        return {"success": True, "tool": tool, "data": res, "result": res}

    elif tool == "get_top_categories":
        col = args.get("column")
        limit = int(args.get("limit", 5))
        if col not in df.columns:
            raise HTTPException(status_code=400, detail=f"Column '{col}' not found.")
        counts = df[col].value_counts().head(limit)
        items = [{"label": str(k), "count": int(v)} for k, v in counts.items()]
        res = {"column": col, "top": items}
        return {"success": True, "tool": tool, "data": res, "result": res}

    elif tool == "get_chart_data":
        ctype = args.get("chartType", "bar")
        x_col = args.get("xAxis")
        y_col = args.get("yAxis")
        agg = args.get("aggregation", "sum")
        if ctype == "bar":
            res = generate_bar_chart_data(df, x_col, y_col, agg=agg)
        elif ctype == "line":
            res = generate_line_chart_data(df, x_col, y_col, agg=agg)
        elif ctype == "scatter":
            res = generate_scatter_chart_data(df, x_col, y_col)
        elif ctype == "histogram":
            res = generate_histogram_data(df, x_col or y_col)
        else:
            res = generate_pie_chart_data(df, x_col)
        return {"success": True, "tool": tool, "data": res, "result": res}

    elif tool == "get_correlations":
        corr = calculate_correlations(df)
        return {"success": True, "tool": tool, "data": corr, "result": corr}

    elif tool == "get_missing_values":
        prof = profile_dataframe(df)
        res = {"missingValues": prof["missingValues"], "healthScore": prof["healthScore"]}
        return {"success": True, "tool": tool, "data": res, "result": res}

    elif tool == "get_duplicate_summary":
        exact_dupes = int(df.duplicated().sum())
        id_cols = [c for c in df.columns if "id" in str(c).lower() or str(c).lower().endswith("_key") or str(c).lower() == "key"]
        repeated_summary = {}
        for c in id_cols:
            repeated_summary[str(c)] = int(df.duplicated(subset=[c]).sum())
        res = {
            "totalRows": len(df),
            "exactDuplicateRows": exact_dupes,
            "exactDuplicatePercentage": round((exact_dupes / len(df) * 100), 2) if len(df) > 0 else 0,
            "repeatedIdKeys": repeated_summary,
            "note": "Exact duplicate rows have identical values across all columns. Repeated ID keys represent non-unique identifier values across transactions."
        }
        return {
            "success": True,
            "tool": tool,
            "data": res,
            "result": res
        }

    elif tool == "get_numeric_summary":
        stats = calculate_numeric_summary(df)
        res = {"summary": stats}
        return {"success": True, "tool": tool, "data": res, "result": res}

    elif tool == "get_date_trends":
        date_col = args.get("dateColumn")
        value_col = args.get("valueColumn")
        agg = args.get("aggregation", "sum")
        if not date_col or date_col not in df.columns:
            date_candidates = [c for c in df.columns if "date" in str(c).lower() or "time" in str(c).lower()]
            date_col = date_candidates[0] if date_candidates else df.columns[0]
        if not value_col or value_col not in df.columns:
            num_candidates = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
            value_col = num_candidates[0] if num_candidates else df.columns[1]
        line_data = generate_line_chart_data(df, date_col, value_col, agg=agg)
        return {"success": True, "tool": tool, "data": line_data, "result": line_data}

    elif tool == "filter_dataset":
        col = args.get("column")
        operator = args.get("operator", "==")  # '==', '!=', '>', '<', '>=', '<=', 'contains'
        target_value = args.get("value")

        if col not in df.columns:
            raise HTTPException(status_code=400, detail=f"Column '{col}' not found.")

        if operator == "==":
            filtered = df[df[col].astype(str) == str(target_value)]
        elif operator == "!=":
            filtered = df[df[col].astype(str) != str(target_value)]
        elif operator == "contains":
            filtered = df[df[col].astype(str).str.contains(str(target_value), case=False, na=False)]
        elif operator in [">", "<", ">=", "<="]:
            num_series = pd.to_numeric(df[col], errors="coerce")
            num_val = float(target_value)
            if operator == ">":
                filtered = df[num_series > num_val]
            elif operator == "<":
                filtered = df[num_series < num_val]
            elif operator == ">=":
                filtered = df[num_series >= num_val]
            else:
                filtered = df[num_series <= num_val]
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported operator: {operator}")

        return {
            "success": True,
            "tool": tool,
            "result": {
                "filteredRowCount": len(filtered),
                "originalRowCount": len(df),
                "preview": get_paginated_preview(filtered, page=1, page_size=5)
            }
        }

    else:
        raise HTTPException(status_code=400, detail=f"Unknown tool: '{tool}'")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
