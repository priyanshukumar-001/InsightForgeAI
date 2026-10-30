"""
InsightForge AI - Test runner for Python data service.
Cross-platform entrypoint that sets up sys.path and executes all unit tests.
"""

import os
import sys
import unittest

# Ensure data-service root is on python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

if __name__ == "__main__":
    loader = unittest.TestLoader()
    suite = loader.discover(start_dir=os.path.join(current_dir, "tests"), pattern="test_*.py")
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
