#!/usr/bin/env python3
"""
Test database connection
"""
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///educerts.db")
print(f"Database URL: {DATABASE_URL}")

# Fix postgres:// to postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    print(f"Fixed URL: {DATABASE_URL}")

try:
    from sqlalchemy import create_engine
    engine = create_engine(DATABASE_URL)
    print("✓ Database engine created successfully")
    
    # Test connection
    with engine.connect() as conn:
        print("✓ Database connection successful")
        
except Exception as e:
    print(f"✗ Database connection failed: {e}")
    print(f"Error type: {type(e)}")