"""
InsightForge AI - Chart Data Generation Service
Transforms raw datasets into strictly validated, bounded, chart-ready datasets
compatible with Recharts.
"""

from typing import Any, Dict, List, Optional
import pandas as pd
import numpy as np


def generate_bar_chart_data(
    df: pd.DataFrame,
    x_col: str,
    y_col: str,
    agg: str = "sum",
    limit: int = 15
) -> Dict[str, Any]:
    """
    Generate bar chart data aggregating y_col by category x_col.
    """
    if x_col not in df.columns or y_col not in df.columns:
        raise ValueError(f"Columns '{x_col}' or '{y_col}' do not exist.")

    valid_df = df.dropna(subset=[x_col])
    grouped = valid_df.groupby(x_col)[y_col]

    if agg == "mean":
        agg_res = grouped.mean()
    elif agg == "count":
        agg_res = grouped.count()
    elif agg == "max":
        agg_res = grouped.max()
    elif agg == "min":
        agg_res = grouped.min()
    else:
        agg_res = grouped.sum()

    sorted_res = agg_res.sort_values(ascending=False).head(limit)

    data = [
        {"name": str(idx), "value": round(float(val), 2) if not pd.isna(val) else 0.0}
        for idx, val in sorted_res.items()
    ]

    return {
        "chartType": "bar",
        "xAxis": x_col,
        "yAxis": y_col,
        "aggregation": agg,
        "data": data
    }


def generate_line_chart_data(
    df: pd.DataFrame,
    date_col: str,
    value_col: str,
    agg: str = "sum"
) -> Dict[str, Any]:
    """
    Generate time series line chart aggregating by date/time.
    """
    if date_col not in df.columns or value_col not in df.columns:
        raise ValueError(f"Columns '{date_col}' or '{value_col}' do not exist.")

    temp_df = df.dropna(subset=[date_col, value_col]).copy()
    temp_df["parsed_date"] = pd.to_datetime(temp_df[date_col], errors="coerce")
    temp_df = temp_df.dropna(subset=["parsed_date"]).sort_values("parsed_date")

    if temp_df.empty:
        # Fallback to direct string sorting if not parseable
        temp_df = df.dropna(subset=[date_col, value_col]).sort_values(date_col)
        date_series = temp_df[date_col].astype(str)
    else:
        date_series = temp_df["parsed_date"].dt.strftime("%Y-%m-%d")

    temp_df["formatted_date"] = date_series
    grouped = temp_df.groupby("formatted_date")[value_col]

    if agg == "mean":
        res = grouped.mean()
    else:
        res = grouped.sum()

    data = [
        {"date": str(d), "value": round(float(v), 2) if not pd.isna(v) else 0.0}
        for d, v in res.items()
    ]

    return {
        "chartType": "line",
        "xAxis": date_col,
        "yAxis": value_col,
        "aggregation": agg,
        "data": data
    }


def generate_scatter_chart_data(
    df: pd.DataFrame,
    x_col: str,
    y_col: str,
    category_col: Optional[str] = None,
    limit: int = 500
) -> Dict[str, Any]:
    """
    Generate validated scatter plot points between two numeric columns.
    Enforces strict numeric coercion, non-finite/NaN filtering, sampling,
    correlation calculation, domain metrics, and category grouping.
    """
    if x_col not in df.columns:
        raise ValueError(f"X-Axis column '{x_col}' does not exist.")
    if y_col not in df.columns:
        raise ValueError(f"Y-Axis column '{y_col}' does not exist.")

    # Convert to numeric with coercion
    x_numeric = pd.to_numeric(df[x_col], errors="coerce")
    y_numeric = pd.to_numeric(df[y_col], errors="coerce")

    # Strict finite filter (excludes NaN, Inf, -Inf)
    valid_mask = x_numeric.notna() & y_numeric.notna() & np.isfinite(x_numeric) & np.isfinite(y_numeric)
    valid_count = int(valid_mask.sum())
    filtered_count = int(len(df) - valid_count)

    if valid_count == 0:
        return {
            "chartType": "scatter",
            "xAxis": x_col,
            "yAxis": y_col,
            "category": category_col,
            "data": [],
            "correlation": 0.0,
            "correlationLabel": "No valid numeric points found",
            "totalValidPoints": 0,
            "filteredPoints": filtered_count,
            "xMin": 0.0,
            "xMax": 0.0,
            "yMin": 0.0,
            "yMax": 0.0,
            "insights": ["Selected columns do not contain valid numeric pairs."]
        }

    valid_x = x_numeric[valid_mask]
    valid_y = y_numeric[valid_mask]

    # Calculate Pearson correlation coefficient
    if valid_count > 1 and valid_x.std() > 0 and valid_y.std() > 0:
        r = float(valid_x.corr(valid_y))
        if pd.isna(r) or not np.isfinite(r):
            r = 0.0
    else:
        r = 0.0
    r_rounded = round(r, 3)

    if abs(r) >= 0.7:
        corr_label = f"Strong {'positive' if r > 0 else 'negative'} correlation (r = {r_rounded})"
    elif abs(r) >= 0.4:
        corr_label = f"Moderate {'positive' if r > 0 else 'negative'} correlation (r = {r_rounded})"
    elif abs(r) >= 0.15:
        corr_label = f"Weak {'positive' if r > 0 else 'negative'} correlation (r = {r_rounded})"
    else:
        corr_label = f"No linear correlation (r = {r_rounded})"

    # Prepare DataFrame for sampling
    plot_df = pd.DataFrame({
        "x": valid_x,
        "y": valid_y
    })

    has_category = bool(category_col and category_col in df.columns)
    if has_category:
        plot_df["category"] = df[category_col][valid_mask].fillna("Uncategorized").astype(str)

    # Sample if greater than limit (preserving category balance if present)
    if len(plot_df) > limit:
        if has_category and plot_df["category"].nunique() > 1:
            try:
                sampled_df = plot_df.groupby("category", group_keys=False).apply(
                    lambda g: g.sample(min(len(g), max(1, limit // plot_df["category"].nunique())), random_state=42),
                    include_groups=False
                ).head(limit)
            except Exception:
                sampled_df = plot_df.sample(limit, random_state=42)
        else:
            sampled_df = plot_df.sample(limit, random_state=42)
    else:
        sampled_df = plot_df

    data = []
    categories_found = set()
    for _, row in sampled_df.iterrows():
        pt: Dict[str, Any] = {
            "x": round(float(row["x"]), 2),
            "y": round(float(row["y"]), 2)
        }
        if has_category:
            cat_name = str(row["category"])
            pt["category"] = cat_name
            categories_found.add(cat_name)
        data.append(pt)

    x_min = round(float(valid_x.min()), 2)
    x_max = round(float(valid_x.max()), 2)
    y_min = round(float(valid_y.min()), 2)
    y_max = round(float(valid_y.max()), 2)
    x_mean = round(float(valid_x.mean()), 2)
    y_mean = round(float(valid_y.mean()), 2)

    insights = [
        corr_label,
        f"{x_col} ranges from {x_min:,.2f} to {x_max:,.2f} (mean: {x_mean:,.2f}).",
        f"{y_col} ranges from {y_min:,.2f} to {y_max:,.2f} (mean: {y_mean:,.2f}).",
        f"Plotting {len(data):,} representative coordinate pairs ({valid_count:,} total valid points)."
    ]
    if y_min < 0:
        insights.append(f"Negative values detected in {y_col} (min: {y_min:,.2f}).")
    if has_category:
        insights.append(f"Segmented across {len(categories_found)} distinct categories in '{category_col}'.")

    return {
        "chartType": "scatter",
        "xAxis": x_col,
        "yAxis": y_col,
        "category": category_col,
        "data": data,
        "categories": sorted(list(categories_found)),
        "correlation": r_rounded,
        "correlationLabel": corr_label,
        "totalValidPoints": valid_count,
        "filteredPoints": filtered_count,
        "xMin": x_min,
        "xMax": x_max,
        "yMin": y_min,
        "yMax": y_max,
        "insights": insights
    }


def generate_histogram_data(
    df: pd.DataFrame,
    column: str,
    bins: int = 10
) -> Dict[str, Any]:
    """
    Generate frequency distribution histogram bins for a numeric column.
    """
    if column not in df.columns:
        raise ValueError(f"Column '{column}' does not exist.")

    series = pd.to_numeric(df[column], errors="coerce").dropna()
    if series.empty:
        return {"chartType": "histogram", "column": column, "data": []}

    counts, bin_edges = np.histogram(series, bins=bins)
    data = []
    for i in range(len(counts)):
        bin_start = round(float(bin_edges[i]), 2)
        bin_end = round(float(bin_edges[i + 1]), 2)
        data.append({
            "bin": f"{bin_start} - {bin_end}",
            "rangeStart": bin_start,
            "rangeEnd": bin_end,
            "count": int(counts[i])
        })

    return {
        "chartType": "histogram",
        "column": column,
        "data": data
    }


def generate_pie_chart_data(
    df: pd.DataFrame,
    category_col: str,
    limit: int = 6
) -> Dict[str, Any]:
    """
    Generate pie/donut chart data with an automatic 'Other' rollup.
    """
    if category_col not in df.columns:
        raise ValueError(f"Column '{category_col}' does not exist.")

    series = df[category_col].dropna().astype(str)
    counts = series.value_counts()
    top_counts = counts.head(limit)
    other_count = int(counts.iloc[limit:].sum()) if len(counts) > limit else 0

    data = [
        {"name": str(idx), "value": int(val)}
        for idx, val in top_counts.items()
    ]
    if other_count > 0:
        data.append({"name": "Other", "value": other_count})

    return {
        "chartType": "pie",
        "category": category_col,
        "data": data
    }


def generate_area_chart_data(
    df: pd.DataFrame,
    x_col: str,
    y_col: str,
    agg: str = "sum"
) -> Dict[str, Any]:
    """
    Generate area chart time-series or sequence data.
    """
    line_res = generate_line_chart_data(df, x_col, y_col, agg=agg)
    return {
        "chartType": "area",
        "xAxis": x_col,
        "yAxis": y_col,
        "aggregation": agg,
        "data": line_res["data"]
    }


def generate_box_plot_data(
    df: pd.DataFrame,
    column: str,
    group_by: Optional[str] = None,
    limit: int = 6
) -> Dict[str, Any]:
    """
    Generate box plot five-number summary (min, q1, median, q3, max).
    """
    if column not in df.columns:
        raise ValueError(f"Column '{column}' does not exist.")

    def calc_box(series: pd.Series, label: str):
        s = pd.to_numeric(series, errors="coerce").dropna()
        if s.empty:
            return None
        q1 = float(s.quantile(0.25))
        med = float(s.median())
        q3 = float(s.quantile(0.75))
        iqr = q3 - q1
        low_bound = q1 - 1.5 * iqr
        high_bound = q3 + 1.5 * iqr
        inliers = s[(s >= low_bound) & (s <= high_bound)]
        outliers = s[(s < low_bound) | (s > high_bound)].tolist()
        return {
            "group": label,
            "min": round(float(inliers.min()) if not inliers.empty else float(s.min()), 2),
            "q1": round(q1, 2),
            "median": round(med, 2),
            "q3": round(q3, 2),
            "max": round(float(inliers.max()) if not inliers.empty else float(s.max()), 2),
            "outlierCount": len(outliers),
            "count": len(s)
        }

    data = []
    if group_by and group_by in df.columns:
        top_groups = df[group_by].dropna().value_counts().head(limit).index
        for g in top_groups:
            box = calc_box(df[df[group_by] == g][column], str(g))
            if box:
                data.append(box)
    else:
        box = calc_box(df[column], column)
        if box:
            data.append(box)

    return {
        "chartType": "boxplot",
        "column": column,
        "groupBy": group_by,
        "data": data
    }
