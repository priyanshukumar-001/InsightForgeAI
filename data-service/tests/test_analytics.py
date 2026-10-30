"""
Unit tests for InsightForge AI Python data service using unittest.
"""

import unittest
import pandas as pd
import numpy as np
from app.services.profiling import profile_dataframe, get_paginated_preview
from app.services.statistics import (
    calculate_numeric_summary,
    calculate_categorical_summary,
    calculate_correlations,
    compare_groups,
    detect_anomalies_iqr
)
from app.services.cleaning import apply_cleaning_pipeline
from app.services.charts import generate_bar_chart_data, generate_scatter_chart_data


class TestDataAnalytics(unittest.TestCase):
    def setUp(self):
        self.sample_df = pd.DataFrame({
            "order_id": ["ORD-1", "ORD-2", "ORD-3", "ORD-4", "ORD-5"],
            "Category": ["Electronics", "Electronics", "Furniture", "Furniture", "Office"],
            "Sales": [100.0, 200.0, 150.0, 300.0, 50.0],
            "Quantity": [1, 2, 1, 3, 1],
            "City": ["Delhi", "Mumbai", "Delhi", "Bengaluru", "Mumbai"]
        })

    def test_profiling(self):
        profile = profile_dataframe(self.sample_df)
        self.assertEqual(profile["rowCount"], 5)
        self.assertEqual(profile["columnCount"], 5)
        self.assertEqual(profile["duplicateRows"], 0)
        self.assertEqual(profile["repeatedIds"], 0)
        self.assertEqual(len(profile["columns"]), 5)

    def test_exact_duplicates_vs_repeated_ids(self):
        # A dataset where order_id has repeated keys, but rows have different products
        df = pd.DataFrame({
            "order_id": ["ORD-100", "ORD-100", "ORD-101", "ORD-102"],
            "product": ["Phone", "Charger", "Laptop", "Mouse"],
            "amount": [800.0, 30.0, 1200.0, 25.0]
        })
        profile = profile_dataframe(df)
        # Exact duplicate rows must be 0 because phone vs charger are distinct items
        self.assertEqual(profile["duplicateRows"], 0)
        # But repeated order_ids is 1 (ORD-100 appears twice)
        self.assertEqual(profile["repeatedIds"], 1)

    def test_numeric_summary(self):
        summary = calculate_numeric_summary(self.sample_df)
        cols = [s["column"] for s in summary]
        self.assertIn("Sales", cols)
        self.assertIn("Quantity", cols)
        sales_stat = next(s for s in summary if s["column"] == "Sales")
        self.assertEqual(sales_stat["sum"], 800.0)
        self.assertEqual(sales_stat["mean"], 160.0)

    def test_categorical_summary(self):
        summary = calculate_categorical_summary(self.sample_df)
        cols = [s["column"] for s in summary]
        self.assertIn("Category", cols)
        cat_stat = next(s for s in summary if s["column"] == "Category")
        self.assertEqual(cat_stat["uniqueCount"], 3)

    def test_correlations(self):
        corr = calculate_correlations(self.sample_df)
        self.assertIn("columns", corr)
        self.assertIn("Sales", corr["columns"])
        self.assertIn("Quantity", corr["columns"])

    def test_cleaning_duplicates(self):
        df_with_dups = pd.DataFrame({
            "A": [1, 2, 2, 3],
            "B": ["x", "y", "y", "z"]
        })
        ops = [{"type": "drop_duplicates"}]
        cleaned, audit = apply_cleaning_pipeline(df_with_dups, ops)
        self.assertEqual(len(cleaned), 3)
        self.assertEqual(audit["rowsRemoved"], 1)

    def test_charts_generation(self):
        bar_chart = generate_bar_chart_data(self.sample_df, "Category", "Sales", agg="sum")
        self.assertEqual(bar_chart["chartType"], "bar")
        self.assertGreater(len(bar_chart["data"]), 0)

        scatter_chart = generate_scatter_chart_data(self.sample_df, "Sales", "Quantity")
        self.assertEqual(scatter_chart["chartType"], "scatter")
        self.assertEqual(len(scatter_chart["data"]), 5)

    def test_scatter_valid_data(self):
        res = generate_scatter_chart_data(self.sample_df, "Sales", "Quantity", category_col="Category")
        self.assertEqual(res["chartType"], "scatter")
        self.assertEqual(res["totalValidPoints"], 5)
        self.assertEqual(res["filteredPoints"], 0)
        self.assertIn("correlation", res)
        self.assertIn("xMin", res)
        self.assertIn("xMax", res)
        self.assertIn("yMin", res)
        self.assertIn("yMax", res)
        self.assertEqual(len(res["categories"]), 3)

    def test_scatter_missing_x(self):
        df = pd.DataFrame({
            "x": [10.0, None, 30.0, np.nan, 50.0],
            "y": [1.0, 2.0, 3.0, 4.0, 5.0]
        })
        res = generate_scatter_chart_data(df, "x", "y")
        self.assertEqual(res["totalValidPoints"], 3)
        self.assertEqual(res["filteredPoints"], 2)
        self.assertEqual(len(res["data"]), 3)

    def test_scatter_missing_y(self):
        df = pd.DataFrame({
            "x": [10.0, 20.0, 30.0, 40.0, 50.0],
            "y": [1.0, None, 3.0, np.nan, 5.0]
        })
        res = generate_scatter_chart_data(df, "x", "y")
        self.assertEqual(res["totalValidPoints"], 3)
        self.assertEqual(res["filteredPoints"], 2)
        self.assertEqual(len(res["data"]), 3)

    def test_scatter_invalid_numeric_strings(self):
        df = pd.DataFrame({
            "price": ["100", "invalid", "300", "N/A", "500"],
            "profit": ["10", "20", "corrupt_val", "40", "50"]
        })
        res = generate_scatter_chart_data(df, "price", "profit")
        # Only rows 0 and 4 are valid numbers in both columns
        self.assertEqual(res["totalValidPoints"], 2)
        self.assertEqual(res["filteredPoints"], 3)
        self.assertEqual(res["data"][0]["x"], 100.0)
        self.assertEqual(res["data"][0]["y"], 10.0)

    def test_scatter_constant_values(self):
        df = pd.DataFrame({
            "const_x": [10.0, 10.0, 10.0, 10.0],
            "const_y": [5.0, 5.0, 5.0, 5.0]
        })
        res = generate_scatter_chart_data(df, "const_x", "const_y")
        self.assertEqual(res["totalValidPoints"], 4)
        self.assertEqual(res["correlation"], 0.0)
        self.assertFalse(np.isnan(res["correlation"]))

    def test_scatter_empty_dataset(self):
        df = pd.DataFrame({"x": [], "y": []})
        res = generate_scatter_chart_data(df, "x", "y")
        self.assertEqual(res["totalValidPoints"], 0)
        self.assertEqual(len(res["data"]), 0)
        self.assertEqual(res["correlation"], 0.0)

    def test_scatter_incompatible_columns(self):
        with self.assertRaises(ValueError):
            generate_scatter_chart_data(self.sample_df, "NonExistentCol", "Sales")
        with self.assertRaises(ValueError):
            generate_scatter_chart_data(self.sample_df, "Sales", "NonExistentCol")


if __name__ == "__main__":
    unittest.main()
