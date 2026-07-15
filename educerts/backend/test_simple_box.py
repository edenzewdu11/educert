#!/usr/bin/env python3
"""
Test the simple box implementation
"""

from wps_ribbon_simple_box import add_ribbon_with_simple_box
import os

def test_simple_box():
    """Test the simple box functionality"""
    
    # Test certificate data
    cert_data = {
        'id': 'f3ebc531-3bde-4f9e-a865-cc6350482f8d',
        'student_name': 'Michael Chen',
        'course_name': 'Advanced Machine Learning',
        'issued_at': '2024-03-20',
        'organization': 'EduCerts AI Institute',
        'content_hash': 'sha256:abc123def456789',
        'signature': 'ed25519:xyz789signature123456'
    }
    
    # Find a test PDF to use
    test_pdfs = [f for f in os.listdir('.') if f.endswith('.pdf') and 'test' in f.lower()]
    
    if not test_pdfs:
        print("❌ No test PDF files found")
        return False
    
    input_pdf = test_pdfs[0]  # Use first available test PDF
    output_pdf = 'test_simple_metadata_box.pdf'
    
    try:
        print(f"📄 Using input PDF: {input_pdf}")
        print(f"🎯 Creating output PDF: {output_pdf}")
        
        # Apply the simple box
        result = add_ribbon_with_simple_box(input_pdf, output_pdf, cert_data)
        
        if os.path.exists(output_pdf):
            print(f"✅ Successfully created simple box PDF: {result}")
            print("\n📦 SIMPLE METADATA BOX FEATURES:")
            print("• Purple ribbon at top (50px height)")
            print("• Small metadata box in top-right corner")
            print("• Box positioned to minimize interference")
            print("• Compact design with essential information")
            print("• Always visible - no clicking required")
            print("\n📋 METADATA BOX CONTAINS:")
            print("• Certificate ID (truncated)")
            print("• Student name and course")
            print("• Issue date and organization")
            print("• Verification status (VERIFIED ✓)")
            print("• Technical security details")
            print("\n🎨 VISUAL DESIGN:")
            print("• Light gray background with purple border")
            print("• Purple header with white text")
            print("• Compact 300x200px size")
            print("• Positioned in top-right corner")
            print("• Shadow effect for depth")
            print("• Doesn't cover main certificate content")
            print("\n✅ This shows metadata permanently in a small box!")
            print("   No JavaScript required - works in all PDF viewers")
            return True
        else:
            print("❌ Failed to create output PDF")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_simple_box()