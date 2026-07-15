#!/usr/bin/env python3
"""
Test script to verify that the tamper detection system is working correctly.
This script tests both valid and tampered certificates against the API.
"""

import requests
import os
import json
from datetime import datetime

def test_verification_api():
    """Test the verification API with both valid and tampered certificates."""
    
    print("=" * 60)
    print("🔍 TESTING VERIFICATION SYSTEM")
    print("=" * 60)
    print(f"Timestamp: {datetime.now().isoformat()}")
    print()
    
    base_url = "http://localhost:8000"
    
    # Test files
    test_files = [
        ("VALID_CERTIFICATE.pdf", "Valid Certificate", True),
        ("TAMPERED_CERTIFICATE.pdf", "Tampered Certificate", False)
    ]
    
    for filename, description, expected_valid in test_files:
        print(f"📄 Testing: {description} ({filename})")
        print("-" * 40)
        
        if not os.path.exists(filename):
            print(f"❌ File not found: {filename}")
            print()
            continue
        
        try:
            # Test PDF verification endpoint
            with open(filename, 'rb') as f:
                files = {'file': f}
                response = requests.post(f'{base_url}/api/verify/pdf', files=files)
            
            if response.status_code != 200:
                print(f"❌ API Error: {response.status_code}")
                print(f"   Response: {response.text}")
                print()
                continue
            
            result = response.json()
            
            # Extract key verification results
            overall_valid = result['summary']['all']
            content_integrity = result['summary'].get('contentIntegrity')
            document_integrity = result['summary'].get('documentIntegrity')
            
            # Find content integrity details
            content_details = None
            for item in result['data']:
                if item['type'] == 'CONTENT_INTEGRITY':
                    content_details = item
                    break
            
            # Print results
            print(f"   Overall Valid: {overall_valid}")
            print(f"   Content Integrity: {content_integrity}")
            print(f"   Document Integrity: {document_integrity}")
            
            if content_details:
                print(f"   Content Hash Status: {content_details['status']}")
                if 'data' in content_details and isinstance(content_details['data'], dict):
                    data = content_details['data']
                    print(f"   Hash Match: {data.get('match', 'Unknown')}")
                    if 'expected' in data and 'computed' in data:
                        expected = data['expected'][:16] + "..." if data['expected'] else "None"
                        computed = data['computed'][:16] + "..." if data['computed'] else "None"
                        print(f"   Expected Hash: {expected}")
                        print(f"   Computed Hash: {computed}")
            
            # Verify expectation
            if overall_valid == expected_valid:
                print(f"✅ CORRECT: Certificate correctly identified as {'VALID' if expected_valid else 'INVALID'}")
            else:
                print(f"❌ INCORRECT: Expected {expected_valid}, got {overall_valid}")
                print(f"   This indicates a problem with the verification system!")
            
        except Exception as e:
            print(f"❌ Error testing {filename}: {e}")
        
        print()
    
    print("=" * 60)
    print("🔧 TROUBLESHOOTING TIPS:")
    print("=" * 60)
    print("If tampered certificates show as 'valid':")
    print("1. Clear browser cache (Ctrl+Shift+R)")
    print("2. Check browser developer console for errors")
    print("3. Verify you're testing with the correct files")
    print("4. Make sure backend server is running on port 8000")
    print("5. Check that content_hash column exists in database")
    print()
    print("Expected behavior:")
    print("- VALID_CERTIFICATE.pdf should show: all=True, contentIntegrity=True")
    print("- TAMPERED_CERTIFICATE.pdf should show: all=False, contentIntegrity=False")
    print()

if __name__ == "__main__":
    test_verification_api()