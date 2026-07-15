#!/usr/bin/env python3
"""
Debug the verify endpoint to see what's causing 404 errors.
"""

import requests
import database
import models
from sqlalchemy.orm import sessionmaker

def debug_verify_endpoint():
    """Debug the verify endpoint."""
    
    print("🔍 DEBUGGING VERIFY ENDPOINT")
    print("=" * 50)
    
    # Get some certificate IDs from database
    Session = sessionmaker(bind=database.engine)
    db = Session()
    
    certs = db.query(models.Certificate).limit(3).all()
    print("Available certificates:")
    for cert in certs:
        print(f"  {cert.id} - {cert.student_name}")
    
    db.close()
    
    if not certs:
        print("❌ No certificates found in database")
        return
    
    # Test with valid certificate ID
    test_cert_id = certs[0].id
    print(f"\n🧪 Testing with valid cert ID: {test_cert_id}")
    
    try:
        response = requests.post('http://localhost:8000/api/verify', 
                               json={'certificate_id': test_cert_id})
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ SUCCESS - Valid: {result['summary']['all']}")
        else:
            print(f"❌ ERROR: {response.text}")
            
    except Exception as e:
        print(f"❌ EXCEPTION: {e}")
    
    # Test with invalid certificate ID
    print(f"\n🧪 Testing with invalid cert ID: 'invalid-id'")
    
    try:
        response = requests.post('http://localhost:8000/api/verify', 
                               json={'certificate_id': 'invalid-id'})
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
    except Exception as e:
        print(f"❌ EXCEPTION: {e}")
    
    # Test with short ID (8 characters)
    short_id = test_cert_id[:8]
    print(f"\n🧪 Testing with short cert ID: {short_id}")
    
    try:
        response = requests.post('http://localhost:8000/api/verify', 
                               json={'certificate_id': short_id})
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ SUCCESS - Valid: {result['summary']['all']}")
        else:
            print(f"❌ ERROR: {response.text}")
            
    except Exception as e:
        print(f"❌ EXCEPTION: {e}")

if __name__ == "__main__":
    debug_verify_endpoint()