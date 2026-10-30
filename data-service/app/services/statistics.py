"""
InsightForge AI - Statistics Service
Calculates descriptive statistics, category distributions, correlation matrices,
group comparisons, and IQR-based anomaly detection.
"""

from typing import Any, Dict, List, Optional
import pandas as pd
import numpy as np


def calculate_numeric_summary(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Calculate descriptive statistics for all numeric columns.
    """
    numeric_df = df.select_dtypes(include=[np.number])
    if numeric_df.empty:
        return []

    summary: List[Dict[str, Any]] = []
    for col in numeric_df.columns:
        series = numeric_df[col].dropna()
        if series.empty:
            continue

        q1 = float(series.quantile(0.25))
        median = float(series.median())
        q3 = float(series.quantile(0.75))
        iqr = q3 - q1

        summary.append({
            "column": str(col),
            "count": int(series.count()),
            "mean": round(float(series.mean()), 4),
            "std": round(float(series.std()), 4) if len(series) > 1 else 0.0,
            "min": round(float(series.min()), 4),
            "q25": round(q1, 4),
            "median": round(median, 4),
            "q75": round(q3, 4),
            "max": round(float(series.max()), 4),
            "sum": round(float(series.sum()), 4),
            "iqr": round(iqr, 4),
            "skewness": round(float(series.skew()), 4) if len(series) > 2 else 0.0
        })

    return summary


def calculate_categorical_summary(df: pd.DataFrame, max_categories: int = 10) -> List[Dict[str, Any]]:
    """
    Calculate frequency distributions for non-numeric columns.
    """
    # Select object, category, string, or boolean columns
    cat_df = df.select_dtypes(exclude=[np.number, "datetime64"])
    if cat_df.empty:
        return []

    summaries: List[Dict[str, Any]] = []
    for col in cat_df.columns:
        series = cat_df[col].dropna()
        total_non_null = len(series)
        if total_non_null == 0:
            continue

        value_counts = series.value_counts().head(max_categories)
        distribution = [
            {
                "label": str(idx),
                "count": int(count),
                "percentage": round((count / total_non_null * 100), 2)
            }
            for idx, count in value_counts.items()
        ]

        summaries.append({
            "column": str(col),
            "uniqueCount": int(series.nunique()),
            "topCategory": str(value_counts.index[0]) if not value_counts.empty else None,
            "topCategoryCount": int(value_counts.iloc[0]) if not value_counts.empty else 0,
            "distribution": distribution
        })

    return summaries


def calculate_correlations(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Calculate Pearson correlation matrix between numeric columns.
    """
    numeric_df = df.select_dtypes(include=[np.number])
    if numeric_df.shape[1] < 2:
        return {
            "columns": list(numeric_df.columns),
            "matrix": [],
            "significantPairs": []
        }

    corr_matrix = numeric_df.corr(method="pearson").round(4)
    columns = [str(c) for c in corr_matrix.columns]

    matrix_rows = []
    significant_pairs = []

    for i, col_i in enumerate(columns):
        row_vals = []
        for j, col_j in enumerate(columns):
            val = corr_matrix.iloc[i, j]
            safe_val = 0.0 if (pd.isna(val) or np.isinf(val)) else float(val)
            row_vals.append(safe_val)

            if i < j and not pd.isna(val) and abs(safe_val) >= 0.5:
                significant_pairs.append({
                    "columnA": col_i,
                    "columnB": col_j,
                    "correlation": safe_val,
                    "strength": "strong" if abs(safe_val) >= 0.7 else "moderate",
                    "direction": "positive" if safe_val > 0 else "negative"
                })

        matrix_rows.append({"column": col_i, "values": row_vals})

    # Sort significant pairs by absolute correlation descending
    significant_pairs.sort(key=lambda x: abs(x["correlation"]), reverse=True)

    return {
        "columns": columns,
        "matrix": matrix_rows,
        "significantPairs": significant_pairs
    }


def compare_groups(
    df: pd.DataFrame,
    group_by_col: str,
    metric_col: str,
    aggregation: str = "mean"
) -> Dict[str, Any]:
    """
    Compare numeric metric aggregated across category groups.
    """
    if group_by_col not in df.columns or metric_col not in df.columns:
        raise ValueError(f"Columns '{group_by_col}' or '{metric_col}' not found in dataset.")

    grouped = df.groupby(group_by_col)[metric_col]
    if aggregation == "sum":
        agg_series = grouped.sum()
    elif aggregation == "count":
        agg_series = grouped.count()
    elif aggregation == "min":
        agg_series = grouped.min()
    elif aggregation == "max":
        agg_series = grouped.max()
    else:
        agg_series = grouped.mean()

    results = [
        {
            "group": str(k),
            "value": round(float(v), 2) if not pd.isna(v) else 0.0,
            "sampleCount": int(df[df[group_by_col] == k][metric_col].count())
        }
        for k, v in agg_series.items()
    ]
    results.sort(key=lambda x: x["value"], reverse=True)

    return {
        "groupBy": group_by_col,
        "metric": metric_col,
        "aggregation": aggregation,
        "data": results
    }


def detect_anomalies_iqr(
    df: pd.DataFrame,
    column: str,
    multiplier: float = 1.5
) -> Dict[str, Any]:
    """
    Detect statistical outliers using the interquartile range (IQR) method.
    Outlier condition: x < Q1 - multiplier*IQR or x > Q3 + multiplier*IQR
    """
    if column not in df.columns:
        raise ValueError(f"Column '{column}' not found.")

    series = pd.to_numeric(df[column], errors="coerce").dropna()
    if len(series) < 4:
        return {
            "column": column,
            "outlierCount": 0,
            "lowerBound": None,
            "upperBound": None,
            "outliers": []
        }

    q1 = float(series.quantile(0.25))
    q3 = float(series.quantile(0.75))
    iqr = q3 - q1
    lower_bound = round(q1 - (multiplier * iqr), 4)
    upper_bound = round(q3 + (multiplier * iqr), 4)

    outliers_mask = (df[column] < lower_bound) | (df[column] > upper_bound)
    outlier_rows = df[outliers_mask].head(20)

    outlier_list = []
    for idx, row in outlier_rows.iterrows():
        val = row[column]
        outlier_list.append({
            "rowIndex": int(idx),
            "value": float(val) if not pd.isna(val) else None,
            "direction": "high" if val > upper_bound else "low",
            "deviation": round(float(val - upper_bound if val > upper_bound else lower_bound - val), 2)
        })

    return {
        "column": column,
        "outlierCount": int(outliers_mask.sum()),
        "outlierPercentage": round(int(outliers_mask.sum()) / len(df) * 100, 2),
        "q1": round(q1, 4),
        "q3": round(q3, 4),
        "iqr": round(iqr, 4),
        "lowerBound": lower_bound,
        "upperBound": upper_bound,
        "outliers": outlier_list
    }
