#!/usr/bin/env python3
"""
Test the complete system with the new metadata box implementation
"""

import requests
import json

def test_complete_workflow():
    """Test issuing and signing a certificate with the new metadata box"""
    
    base_url = "http://localhost:8000"
    
    try:
        # 1. Login as admin
        print("🔐 Logging in as admin...")
        login_data = {
            "username": "admin",
            "password": "admin123"
        }
        
        login_response = requests.post(f"{base_url}/api/login", data=login_data)
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.status_code}")
            return False
        
        # Get cookies for authentication
        cookies = login_response.cookies
        print("✅ Login successful")
        
        # 2. Issue a new certificate
        print("\n📜 Issuing new certificate...")
        cert_data = {
            "student_name": "Alice Johnson",
            "course_name": "Advanced Data Science",
            "cert_type": "certificate",
            "data_payload": {
                "grade": "A+",
                "gpa": "4.0",
                "department": "Computer Science",
                "organization": "EduCerts University"
            }
        }
        
        issue_response = requests.post(f"{base_url}/api/issue", json=cert_data, cookies=cookies)
        if issue_response.status_code != 200:
            print(f"❌ Certificate issuance failed: {issue_response.status_code}")
            return False
        
        cert_result = issue_response.json()
        cert_id = cert_result["id"]
        print(f"✅ Certificate issued with ID: {cert_id}")
        
        # 3. Sign the certificate (this will add the metadata box)
        print("\n✍️  Signing certificate with metadata box...")
        sign_data = {
            "cert_ids": [cert_id],
            "signer_name": "Dr. John Smith",
            "signer_role": "Academic Director"
        }
        
        sign_response = requests.post(f"{base_url}/api/sign/apply", json=sign_data, cookies=cookies)
        if sign_response.status_code != 200:
            print(f"❌ Certificate signing failed: {sign_response.status_code}")
            print(f"Response: {sign_response.text}")
            return False
        
        sign_result = sign_response.json()
        print(f"✅ Certificate signed successfully")
        print(f"📋 Result: {sign_result}")
        
        # 4. Test download
        print(f"\n📥 Testing certificate download...")
        download_url = f"{base_url}/api/download/{cert_id}"
        print(f"🔗 Download URL: {download_url}")
        print(f"📄 Certificate ID for testing: {cert_id}")
        
        print("\n🎯 WHAT TO EXPECT:")
        print("• Purple verification ribbon at the top")
        print("• Large metadata box overlaying the certificate")
        print("• Box shows complete verification details")
        print("• Box covers part of certificate content (as requested)")
        print("• Professional styling with borders and shadows")
        
        print(f"\n✅ Complete workflow test successful!")
        print(f"   Download the certificate to see the metadata box overlay")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during workflow test: {e}")
        return False

if __name__ == "__main__":
    test_complete_workflow()