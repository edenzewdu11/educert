#!/usr/bin/env python3
"""
Minimal startup test to identify the exact import issue
"""

print("Starting import test...")

try:
    print("1. Testing basic imports...")
    import os
    from dotenv import load_dotenv
    print("   ✓ Basic imports successful")
    
    print("2. Loading environment...")
    load_dotenv()
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///educerts.db")
    print(f"   ✓ Database URL: {DATABASE_URL}")
    
    print("3. Testing database imports...")
    import database
    print("   ✓ Database import successful")
    
    print("4. Testing models...")
    import models
    print("   ✓ Models import successful")
    
    print("5. Testing FastAPI...")
    from fastapi import FastAPI
    app = FastAPI(title="Test API")
    print("   ✓ FastAPI app creation successful")
    
    print("6. Testing other imports...")
    import crypto_utils
    import auth_utils
    import schemas
    print("   ✓ Additional imports successful")
    
    print("7. Testing main module...")
    import main
    print("   ✓ Main module import successful")
    
    print("✅ All imports successful!")
    
except Exception as e:
    print(f"❌ Import failed at step: {e}")
    import traceback
    traceback.print_exc()