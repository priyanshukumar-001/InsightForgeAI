"""
InsightForge AI - Data Profiling Service
Provides deterministic dataset profiling: dimensions, column types, missingness,
unique values, duplicate rows, and paginated previews.
"""

from typing import Any, Dict, List
import pandas as pd
import numpy as np


def infer_column_type(series: pd.Series) -> str:
    """
    Infer semantic data type for a pandas Series.
    Returns: 'numeric', 'datetime', 'categorical', 'boolean', or 'text'.
    """
    if pd.api.types.is_bool_dtype(series):
        return "boolean"
    if pd.api.types.is_numeric_dtype(series):
        return "numeric"
    if pd.api.types.is_datetime64_any_dtype(series):
        return "datetime"

    # Try parsing string series as datetime if sample matches
    non_null = series.dropna()
    if len(non_null) > 0 and isinstance(non_null.iloc[0], str):
        # Quick heuristic for ISO or standard date formats
        if len(non_null.iloc[0]) in (10, 19, 24) and ("-" in non_null.iloc[0] or "/" in non_null.iloc[0]):
            try:
                pd.to_datetime(non_null.head(20), errors="raise")
                return "datetime"
            except (ValueError, TypeError):
                pass

        # Check unique ratio for categorical vs free-form text
        unique_ratio = non_null.nunique() / len(non_null)
        if unique_ratio < 0.5 or non_null.nunique() <= 50:
            return "categorical"
        return "text"

    return "categorical"


def profile_dataframe(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Generate comprehensive metadata and quality metrics for a dataframe.
    """
    total_rows = len(df)
    total_cols = len(df.columns)
    duplicate_rows = int(df.duplicated().sum())

    columns_summary: List[Dict[str, Any]] = []
    missing_value_summary: List[Dict[str, Any]] = []
    type_counts: Dict[str, int] = {
        "numeric": 0,
        "categorical": 0,
        "datetime": 0,
        "boolean": 0,
        "text": 0
    }

    for col in df.columns:
        series = df[col]
        missing_count = int(series.isna().sum())
        non_null_count = total_rows - missing_count
        missing_pct = round((missing_count / total_rows * 100), 2) if total_rows > 0 else 0.0
        unique_count = int(series.nunique(dropna=True))
        inferred_type = infer_column_type(series)

        type_counts[inferred_type] = type_counts.get(inferred_type, 0) + 1

        sample_values = [
            None if pd.isna(v) else (v.item() if hasattr(v, "item") else v)
            for v in series.dropna().head(3).tolist()
        ]

        col_info = {
            "name": str(col),
            "inferredType": inferred_type,
            "pandasType": str(series.dtype),
            "nonNullCount": non_null_count,
            "missingCount": missing_count,
            "missingPercentage": missing_pct,
            "uniqueCount": unique_count,
            "sampleValues": sample_values
        }
        columns_summary.append(col_info)

        missing_value_summary.append({
            "column": str(col),
            "missingCount": missing_count,
            "missingPercentage": missing_pct,
            "nonNullCount": non_null_count
        })

    # Overall dataset health score (0 to 100)
    total_cells = total_rows * total_cols
    total_missing = sum(c["missingCount"] for c in columns_summary)
    missing_ratio = (total_missing / total_cells) if total_cells > 0 else 0
    dup_ratio = (duplicate_rows / total_rows) if total_rows > 0 else 0
    health_score = max(0, min(100, int(100 - (missing_ratio * 50) - (dup_ratio * 30))))

    # Detect repeated ID keys separately from full duplicate rows
    id_cols = [c for c in df.columns if "id" in str(c).lower() or str(c).lower().endswith("_key") or str(c).lower() == "key"]
    primary_id_col = str(id_cols[0]) if id_cols else None
    repeated_ids = int(df.duplicated(subset=[primary_id_col]).sum()) if primary_id_col else 0

    return {
        "rowCount": total_rows,
        "columnCount": total_cols,
        "duplicateRows": duplicate_rows,
        "repeatedIds": repeated_ids,
        "primaryIdColumn": primary_id_col,
        "healthScore": health_score,
        "typeCounts": type_counts,
        "columns": columns_summary,
        "missingValues": missing_value_summary
    }


def get_paginated_preview(
    df: pd.DataFrame,
    page: int = 1,
    page_size: int = 20,
    search: str = ""
) -> Dict[str, Any]:
    """
    Return bounded, search-filtered, and paginated rows.
    """
    filtered_df = df
    if search and search.strip():
        term = search.strip().lower()
        mask = df.astype(str).apply(lambda row: row.str.lower().str.contains(term, regex=False).any(), axis=1)
        filtered_df = df[mask]

    total_filtered = len(filtered_df)
    total_pages = max(1, (total_filtered + page_size - 1) // page_size) if total_filtered > 0 else 1
    safe_page = max(1, min(page, total_pages))

    start_idx = (safe_page - 1) * page_size
    end_idx = start_idx + page_size
    page_slice = filtered_df.iloc[start_idx:end_idx]

    # Convert safely to native Python types for JSON serialization
    rows = []
    for _, row in page_slice.iterrows():
        row_dict = {}
        for col in df.columns:
            val = row[col]
            if pd.isna(val):
                row_dict[str(col)] = None
            elif hasattr(val, "item"):
                row_dict[str(col)] = val.item()
            elif isinstance(val, (pd.Timestamp, np.datetime64)):
                row_dict[str(col)] = str(val)
            else:
                row_dict[str(col)] = val
        rows.append(row_dict)

    return {
        "page": safe_page,
        "pageSize": page_size,
        "totalRows": total_filtered,
        "totalPages": total_pages,
        "columns": [str(c) for c in df.columns],
        "rows": rows
    }
