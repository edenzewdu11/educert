#!/usr/bin/env python3
"""
Get some valid certificate IDs for testing the verification system.
"""

import database
import models
from sqlalchemy.orm import sessionmaker

def get_test_certificate_ids():
    """Get valid certificate IDs for testing."""
    
    print("📋 VALID CERTIFICATE IDs FOR TESTING")
    print("=" * 60)
    
    Session = sessionmaker(bind=database.engine)
    db = Session()
    
    try:
        # Get certificates with rendered PDFs (these are the ones that can be verified)
        certs = db.query(models.Certificate).filter(
            models.Certificate.rendered_pdf_path.isnot(None)
        ).limit(10).all()
        
        if not certs:
            print("❌ No certificates with rendered PDFs found")
            return
        
        print(f"Found {len(certs)} certificates with PDFs:")
        print()
        
        for i, cert in enumerate(certs, 1):
            print(f"{i:2d}. Certificate ID: {cert.id}")
            print(f"    Student: {cert.student_name}")
            print(f"    Course: {cert.course_name}")
            print(f"    Short ID: {cert.id[:8]}")
            print(f"    Status: {cert.signing_status}")
            print()
        
        print("🧪 HOW TO TEST:")
        print("-" * 40)
        print("1. Copy any full Certificate ID above")
        print("2. Go to your verification page")
        print("3. Paste the ID in the 'By ID' tab")
        print("4. Click 'Verify Authenticity'")
        print("5. Should show as VERIFIED")
        print()
        print("📝 You can also use the short ID (first 8 characters)")
        
    finally:
        db.close()

if __name__ == "__main__":
    get_test_certificate_ids()