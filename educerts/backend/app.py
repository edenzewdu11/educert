#!/usr/bin/env python3
"""
Simple entry point for the FastAPI app
"""

import sys
import os

# Ensure we're in the right directory
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Now import the main app
try:
    from main import app
except ImportError as e:
    print(f"Import error: {e}")
    print(f"Current directory: {current_dir}")
    print(f"Python path: {sys.path}")
    raise

# Export the app for uvicorn
__all__ = ["app"]