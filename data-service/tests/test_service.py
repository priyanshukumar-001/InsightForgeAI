"""
Standard library unittest suite for InsightForge AI data service.
Runs without requiring external pytest installation.
"""

import unittest
import pandas as pd
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


class TestDataAnalyticsService(unittest.TestCase):
    def setUp(self):
        self.df = pd.DataFrame({
            "Category": ["Electronics", "Electronics", "Furniture", "Furniture", "Office"],
            "Sales": [100.0, 200.0, 150.0, 300.0, 50.0],
            "Quantity": [1, 2, 1, 3, 1],
            "City": ["Delhi", "Mumbai", "Delhi", "Bengaluru", "Mumbai"]
        })

    def test_profiling(self):
        profile = profile_dataframe(self.df)
        self.assertEqual(profile["rowCount"], 5)
        self.assertEqual(profile["columnCount"], 4)
        self.assertEqual(profile["duplicateRows"], 0)
        self.assertEqual(len(profile["columns"]), 4)

    def test_numeric_summary(self):
        summary = calculate_numeric_summary(self.df)
        cols = [s["column"] for s in summary]
        self.assertIn("Sales", cols)
        self.assertIn("Quantity", cols)
        sales_stat = next(s for s in summary if s["column"] == "Sales")
        self.assertEqual(sales_stat["sum"], 800.0)
        self.assertEqual(sales_stat["mean"], 160.0)

    def test_categorical_summary(self):
        summary = calculate_categorical_summary(self.df)
        cols = [s["column"] for s in summary]
        self.assertIn("Category", cols)
        cat_stat = next(s for s in summary if s["column"] == "Category")
        self.assertEqual(cat_stat["uniqueCount"], 3)

    def test_correlations(self):
        corr = calculate_correlations(self.df)
        self.assertIn("columns", corr)
        self.assertIn("Sales", corr["columns"])

    def test_cleaning_duplicates(self):
        df_dups = pd.DataFrame({"A": [1, 2, 2], "B": ["x", "y", "y"]})
        ops = [{"type": "drop_duplicates"}]
        cleaned, audit = apply_cleaning_pipeline(df_dups, ops)
        self.assertEqual(len(cleaned), 2)
        self.assertEqual(audit["rowsRemoved"], 1)

    def test_charts(self):
        res = generate_bar_chart_data(self.df, "Category", "Sales", agg="sum")
        self.assertEqual(res["chartType"], "bar")
        self.assertGreater(len(res["data"]), 0)


if __name__ == "__main__":
    unittest.main()
