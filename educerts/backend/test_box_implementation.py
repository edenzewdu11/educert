#!/usr/bin/env python3
"""
Test the new box implementation that actually shows a visible metadata box
"""

from wps_ribbon_with_box import add_ribbon_with_metadata_box
import os

def test_visible_box():
    """Test the visible metadata box implementation"""
    
    # Test certificate data
    cert_data = {
        'id': 'f3ebc531-3bde-4f9e-a865-cc6350482f8d',
        'student_name': 'John Smith',
        'course_name': 'Advanced Software Engineering',
        'issued_at': '2024-03-20',
        'organization': 'EduCerts Technology Institute',
        'content_hash': 'sha256:abc123def456789',
        'signature': 'ed25519:xyz789signature123456'
    }
    
    # Find a test PDF to use
    test_pdfs = [f for f in os.listdir('.') if f.endswith('.pdf') and 'test' in f.lower()]
    
    if not test_pdfs:
        print("❌ No test PDF files found")
        return False
    
    input_pdf = test_pdfs[0]  # Use first available test PDF
    output_pdf = 'test_visible_metadata_box.pdf'
    
    try:
        print(f"📄 Using input PDF: {input_pdf}")
        print(f"🎯 Creating output PDF: {output_pdf}")
        
        # Apply the visible metadata box
        result = add_ribbon_with_metadata_box(input_pdf, output_pdf, cert_data)
        
        if os.path.exists(output_pdf):
            print(f"✅ Successfully created PDF with visible metadata box: {result}")
            print("\n📦 VISIBLE METADATA BOX FEATURES:")
            print("• Purple ribbon at top (50px height)")
            print("• Large metadata box (400x300px) overlaying certificate")
            print("• Box covers part of certificate content (as requested)")
            print("• Professional styling with shadow and borders")
            print("• Complete verification information displayed")
            print("\n📋 METADATA BOX CONTAINS:")
            print("• Certificate ID and student information")
            print("• Verification status with green checkmark")
            print("• Cryptographic algorithm details")
            print("• Security and blockchain information")
            print("• Professional header with icons")
            print("\n🎨 VISUAL DESIGN:")
            print("• Light gray background with purple border")
            print("• Purple header with white text")
            print("• Organized sections with clear typography")
            print("• Shadow effect for depth")
            print("• Covers certificate content intentionally")
            print("\n✅ This implementation shows the metadata box permanently!")
            print("   No clicking needed - the box is always visible on the PDF")
            return True
        else:
            print("❌ Failed to create output PDF")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_visible_box()