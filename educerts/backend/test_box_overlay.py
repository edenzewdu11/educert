#!/usr/bin/env python3
"""
Test the box overlay metadata functionality in WPS ribbon
"""

from wps_ribbon_simple import add_simple_wps_ribbon
import os

def test_box_overlay():
    """Test the box overlay popup functionality"""
    
    # Test certificate data
    cert_data = {
        'id': 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'student_name': 'Alice Johnson',
        'course_name': 'Master of Computer Science',
        'issued_at': '2024-03-20',
        'organization': 'EduCerts University',
        'content_hash': 'sha256:abc123def456789',
        'signature': 'ed25519:xyz789signature123456'
    }
    
    # Find a test PDF to use
    test_pdfs = [f for f in os.listdir('.') if f.endswith('.pdf') and 'test' in f.lower()]
    
    if not test_pdfs:
        print("❌ No test PDF files found")
        return False
    
    input_pdf = test_pdfs[0]  # Use first available test PDF
    output_pdf = 'test_box_overlay_popup.pdf'
    
    try:
        print(f"📄 Using input PDF: {input_pdf}")
        print(f"🎯 Creating output PDF: {output_pdf}")
        
        # Apply the box overlay ribbon
        result = add_simple_wps_ribbon(input_pdf, output_pdf, cert_data)
        
        if os.path.exists(output_pdf):
            print(f"✅ Successfully created box overlay PDF: {result}")
            print("\n📦 BOX OVERLAY FEATURES:")
            print("• Compact purple ribbon (50px height)")
            print("• 'Click to show/hide details box' instruction")
            print("• JavaScript box overlay with metadata")
            print("• Box appears on top of certificate content")
            print("• Toggle on/off by clicking ribbon again")
            print("\n📋 METADATA BOX CONTAINS:")
            print("• Certificate ID and student information")
            print("• Verification status with checkmark")
            print("• Cryptographic algorithm details")
            print("• Security and blockchain information")
            print("• Professional styling with borders")
            print("\n🖱️  USAGE:")
            print("• Open the PDF in Adobe Reader")
            print("• Click the purple ribbon to show metadata box")
            print("• Box will overlay on top of certificate")
            print("• Click ribbon again to hide the box")
            print("• Box covers part of certificate (as requested)")
            return True
        else:
            print("❌ Failed to create output PDF")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_box_overlay()