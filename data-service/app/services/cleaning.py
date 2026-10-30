"""
InsightForge AI - Data Cleaning Service
Applies deterministic data transformations: duplicate removal, missing-value
handling, column renaming, type casting, and column removal.
Always tracks applied steps and returns before-and-after audit impact.
"""

from typing import Any, Dict, List, Optional, Tuple
import pandas as pd
import numpy as np


def apply_cleaning_pipeline(
    df: pd.DataFrame,
    operations: List[Dict[str, Any]]
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Apply a sequence of cleaning operations and return the cleaned DataFrame
    along with an audit trail and before/after metrics.
    """
    initial_rows = len(df)
    initial_cols = len(df.columns)
    initial_missing = int(df.isna().sum().sum())

    cleaned_df = df.copy()
    applied_operations: List[Dict[str, Any]] = []

    for op in operations:
        op_type = op.get("type")
        step_result = {"type": op_type, "status": "applied", "description": ""}

        try:
            if op_type == "drop_duplicates":
                cols = op.get("columns") or None
                before = len(cleaned_df)
                cleaned_df = cleaned_df.drop_duplicates(subset=cols, keep="first").reset_index(drop=True)
                removed = before - len(cleaned_df)
                step_result["description"] = f"Removed {removed} duplicate rows."
                step_result["rowsRemoved"] = removed

            elif op_type == "drop_missing":
                cols = op.get("columns") or None
                how = op.get("how", "any")  # 'any' or 'all'
                before = len(cleaned_df)
                cleaned_df = cleaned_df.dropna(subset=cols, how=how).reset_index(drop=True)
                removed = before - len(cleaned_df)
                step_result["description"] = f"Dropped {removed} rows with missing values in {cols or 'all columns'}."
                step_result["rowsRemoved"] = removed

            elif op_type == "fill_missing":
                col = op.get("column")
                strategy = op.get("strategy", "mean")  # 'mean', 'median', 'mode', 'constant'
                custom_value = op.get("value")

                if col in cleaned_df.columns:
                    missing_in_col = int(cleaned_df[col].isna().sum())
                    if strategy == "mean" and pd.api.types.is_numeric_dtype(cleaned_df[col]):
                        fill_val = cleaned_df[col].mean()
                        cleaned_df[col] = cleaned_df[col].fillna(fill_val)
                        step_result["description"] = f"Filled {missing_in_col} missing values in '{col}' with mean ({round(fill_val, 2)})."
                    elif strategy == "median" and pd.api.types.is_numeric_dtype(cleaned_df[col]):
                        fill_val = cleaned_df[col].median()
                        cleaned_df[col] = cleaned_df[col].fillna(fill_val)
                        step_result["description"] = f"Filled {missing_in_col} missing values in '{col}' with median ({round(fill_val, 2)})."
                    elif strategy == "mode":
                        mode_series = cleaned_df[col].mode()
                        fill_val = mode_series.iloc[0] if not mode_series.empty else ""
                        cleaned_df[col] = cleaned_df[col].fillna(fill_val)
                        step_result["description"] = f"Filled {missing_in_col} missing values in '{col}' with mode ('{fill_val}')."
                    elif strategy == "constant":
                        cleaned_df[col] = cleaned_df[col].fillna(custom_value)
                        step_result["description"] = f"Filled {missing_in_col} missing values in '{col}' with '{custom_value}'."
                    else:
                        cleaned_df[col] = cleaned_df[col].fillna("Unknown")
                        step_result["description"] = f"Filled missing values in '{col}' with default."

            elif op_type == "rename_columns":
                mapping = op.get("mapping", {})
                valid_mapping = {str(k): str(v) for k, v in mapping.items() if str(k) in cleaned_df.columns}
                cleaned_df = cleaned_df.rename(columns=valid_mapping)
                step_result["description"] = f"Renamed columns: {valid_mapping}."

            elif op_type == "drop_columns":
                cols_to_drop = [c for c in op.get("columns", []) if c in cleaned_df.columns]
                cleaned_df = cleaned_df.drop(columns=cols_to_drop)
                step_result["description"] = f"Dropped columns: {cols_to_drop}."

            elif op_type == "cast_type":
                col = op.get("column")
                target_type = op.get("targetType")  # 'numeric', 'datetime', 'string'
                if col in cleaned_df.columns:
                    if target_type == "numeric":
                        cleaned_df[col] = pd.to_numeric(cleaned_df[col], errors="coerce")
                    elif target_type == "datetime":
                        cleaned_df[col] = pd.to_datetime(cleaned_df[col], errors="coerce")
                    elif target_type == "string":
                        cleaned_df[col] = cleaned_df[col].astype(str)
                    step_result["description"] = f"Cast column '{col}' to {target_type}."

            applied_operations.append(step_result)

        except Exception as e:
            step_result["status"] = "failed"
            step_result["error"] = str(e)
            applied_operations.append(step_result)

    final_rows = len(cleaned_df)
    final_cols = len(cleaned_df.columns)
    final_missing = int(cleaned_df.isna().sum().sum())

    audit = {
        "initialRows": initial_rows,
        "finalRows": final_rows,
        "rowsRemoved": initial_rows - final_rows,
        "initialCols": initial_cols,
        "finalCols": final_cols,
        "initialMissingValues": initial_missing,
        "finalMissingValues": final_missing,
        "missingValuesResolved": max(0, initial_missing - final_missing),
        "operationsApplied": applied_operations
    }

    return cleaned_df, audit
