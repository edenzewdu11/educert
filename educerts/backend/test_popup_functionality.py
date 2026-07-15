#!/usr/bin/env python3
"""
Test the popup metadata functionality in WPS ribbon
"""

from wps_ribbon_simple import add_simple_wps_ribbon
import os

def test_popup_ribbon():
    """Test the popup ribbon functionality"""
    
    # Test certificate data
    cert_data = {
        'id': 'f3ebc531-3bde-4f9e-a865-cc6350482f8d',
        'student_name': 'John Doe',
        'course_name': 'Advanced Computer Science',
        'issued_at': '2024-03-15',
        'organization': 'EduCerts Academy',
        'content_hash': 'abc123def456789',
        'signature': 'xyz789signature123'
    }
    
    # Find a test PDF to use
    test_pdfs = [f for f in os.listdir('.') if f.endswith('.pdf') and 'test' in f.lower()]
    
    if not test_pdfs:
        print("❌ No test PDF files found")
        return False
    
    input_pdf = test_pdfs[0]  # Use first available test PDF
    output_pdf = 'test_popup_ribbon_new.pdf'
    
    try:
        print(f"📄 Using input PDF: {input_pdf}")
        print(f"🎯 Creating output PDF: {output_pdf}")
        
        # Apply the popup ribbon
        result = add_simple_wps_ribbon(input_pdf, output_pdf, cert_data)
        
        if os.path.exists(output_pdf):
            print(f"✅ Successfully created popup ribbon PDF: {result}")
            print("\n📋 FEATURES:")
            print("• Compact ribbon design (50px height)")
            print("• 'Click for Details' instruction text")
            print("• JavaScript popup with full metadata")
            print("• Certificate content preserved below ribbon")
            print("\n🖱️  USAGE:")
            print("• Open the PDF in Adobe Reader or similar")
            print("• Click anywhere on the purple ribbon")
            print("• Popup will show detailed verification information")
            return True
        else:
            print("❌ Failed to create output PDF")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_popup_ribbon()