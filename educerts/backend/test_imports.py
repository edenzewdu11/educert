#!/usr/bin/env python3
"""
Test script to verify all critical imports work
"""

print("Testing imports...")

try:
    import pymupdf as fitz
    print("✓ PyMuPDF import successful")
except ImportError as e:
    print(f"✗ PyMuPDF import failed: {e}")

try:
    import psycopg2
    print("✓ psycopg2 import successful")
except ImportError as e:
    print(f"✗ psycopg2 import failed: {e}")

try:
    from sqlalchemy import create_engine
    print("✓ SQLAlchemy import successful")
except ImportError as e:
    print(f"✗ SQLAlchemy import failed: {e}")

try:
    import fastapi
    print("✓ FastAPI import successful")
except ImportError as e:
    print(f"✗ FastAPI import failed: {e}")

print("Import test completed.")