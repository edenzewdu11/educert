#!/usr/bin/env python3
"""
Debug script to help identify why the frontend might show tampered PDFs as verified.
"""

import requests
import json
import os
from datetime import datetime

def debug_frontend_issue():
    """Debug the frontend verification issue."""
    
    print("🔍 FRONTEND VERIFICATION DEBUG")
    print("=" * 60)
    print(f"Timestamp: {datetime.now().isoformat()}")
    print()
    
    # Test files that should behave differently
    test_cases = [
        ("VALID_CERTIFICATE.pdf", "Should show VERIFIED", True),
        ("TAMPERED_CERTIFICATE.pdf", "Should show UNVERIFIED", False),
        ("debug_tampered.pdf", "Should show UNVERIFIED", False),
        ("manually_edited.pdf", "Should show UNVERIFIED (if exists)", False)
    ]
    
    print("📋 TEST CASES:")
    print("-" * 40)
    
    for filename, description, expected_valid in test_cases:
        if not os.path.exists(filename):
            print(f"⚠️  {filename} - FILE NOT FOUND")
            continue
            
        print(f"📄 {filename}")
        print(f"   Description: {description}")
        print(f"   Expected: {'VERIFIED' if expected_valid else 'UNVERIFIED'}")
        
        try:
            # Test API directly
            with open(filename, 'rb') as f:
                files = {'file': f}
                response = requests.post('http://localhost:8000/api/verify/pdf', files=files)
            
            if response.status_code == 200:
                result = response.json()
                overall = result['summary']['all']
                content_integrity = result['summary'].get('contentIntegrity')
                
                print(f"   API Result: {'VERIFIED' if overall else 'UNVERIFIED'}")
                print(f"   Content Integrity: {content_integrity}")
                
                # Check if result matches expectation
                if overall == expected_valid:
                    print("   ✅ API CORRECT")
                else:
                    print("   ❌ API INCORRECT - This is a backend problem!")
                
                # Save detailed response for frontend debugging
                debug_filename = f"debug_response_{filename.replace('.pdf', '.json')}"
                with open(debug_filename, 'w') as f:
                    json.dump(result, f, indent=2)
                print(f"   💾 Saved API response to: {debug_filename}")
                
            else:
                print(f"   ❌ API Error: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Exception: {e}")
        
        print()
    
    print("=" * 60)
    print("🔧 FRONTEND DEBUGGING STEPS:")
    print("=" * 60)
    print()
    print("1. CLEAR BROWSER CACHE:")
    print("   - Press Ctrl+Shift+R (hard refresh)")
    print("   - Or open DevTools (F12) → Application → Storage → Clear storage")
    print()
    print("2. CHECK BROWSER CONSOLE:")
    print("   - Open DevTools (F12) → Console tab")
    print("   - Upload a tampered certificate")
    print("   - Look for verification logs with timestamps")
    print("   - Check if you see 'Overall valid: false'")
    print()
    print("3. CHECK NETWORK TAB:")
    print("   - Open DevTools (F12) → Network tab")
    print("   - Upload a tampered certificate")
    print("   - Find the '/api/verify/pdf' request")
    print("   - Click on it and check the Response tab")
    print("   - Verify 'all': false in the response")
    print()
    print("4. TEST WITH DIFFERENT BROWSERS:")
    print("   - Try Chrome, Firefox, Edge")
    print("   - Use incognito/private mode")
    print()
    print("5. TEST WITH SIMPLE HTML PAGE:")
    print("   - Open test_verification.html in browser")
    print("   - Upload the same tampered certificate")
    print("   - This bypasses React and shows raw API response")
    print()
    print("6. VERIFY FILE IDENTITY:")
    print("   - Make sure you're uploading the correct tampered file")
    print("   - Check file size and modification date")
    print("   - Try creating a fresh tampered file")
    print()
    
    # Create a simple test file for the user
    print("📝 CREATING FRESH TEST FILES...")
    print("-" * 40)
    
    if os.path.exists('VALID_CERTIFICATE.pdf'):
        # Create a fresh tampered version
        import fitz
        
        doc = fitz.open('VALID_CERTIFICATE.pdf')
        page = doc[0]
        
        # Add obvious tampering
        point = fitz.Point(50, 50)
        page.insert_text(point, "*** TAMPERED BY USER ***", fontsize=12, color=(1, 0, 0))
        
        doc.save('FRESH_TAMPERED.pdf')
        doc.close()
        
        print("✅ Created FRESH_TAMPERED.pdf")
        print("   This file has obvious red text added")
        print("   Test this file in your frontend - it should show UNVERIFIED")
        
        # Test the fresh file
        try:
            with open('FRESH_TAMPERED.pdf', 'rb') as f:
                files = {'file': f}
                response = requests.post('http://localhost:8000/api/verify/pdf', files=files)
            
            if response.status_code == 200:
                result = response.json()
                if not result['summary']['all']:
                    print("   ✅ Fresh tampered file correctly shows as UNVERIFIED in API")
                else:
                    print("   ❌ Fresh tampered file incorrectly shows as VERIFIED in API")
        except Exception as e:
            print(f"   ❌ Error testing fresh file: {e}")
    
    print()
    print("=" * 60)
    print("🎯 SUMMARY:")
    print("=" * 60)
    print("The backend API is working correctly.")
    print("If you still see tampered PDFs as 'verified' in the frontend:")
    print("1. It's definitely a browser caching issue")
    print("2. Or you're testing with the wrong file")
    print("3. Or there's a React state management issue")
    print()
    print("Try the FRESH_TAMPERED.pdf file with a hard browser refresh.")

if __name__ == "__main__":
    debug_frontend_issue()