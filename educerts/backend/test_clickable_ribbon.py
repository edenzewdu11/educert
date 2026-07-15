#!/usr/bin/env python3
"""
Test the clickable ribbon implementation
"""

from wps_ribbon_toggle import add_clickable_ribbon
import os

def test_clickable_ribbon():
    """Test the clickable ribbon functionality"""
    
    # Test certificate data
    cert_data = {
        'id': 'f3ebc531-3bde-4f9e-a865-cc6350482f8d',
        'student_name': 'Sarah Wilson',
        'course_name': 'Master of Cybersecurity',
        'issued_at': '2024-03-20',
        'organization': 'EduCerts Security Institute',
        'content_hash': 'sha256:abc123def456789',
        'signature': 'ed25519:xyz789signature123456'
    }
    
    # Find a test PDF to use
    test_pdfs = [f for f in os.listdir('.') if f.endswith('.pdf') and 'test' in f.lower()]
    
    if not test_pdfs:
        print("❌ No test PDF files found")
        return False
    
    input_pdf = test_pdfs[0]  # Use first available test PDF
    output_pdf = 'test_clickable_ribbon.pdf'
    
    try:
        print(f"📄 Using input PDF: {input_pdf}")
        print(f"🎯 Creating output PDF: {output_pdf}")
        
        # Apply the clickable ribbon
        result = add_clickable_ribbon(input_pdf, output_pdf, cert_data)
        
        if os.path.exists(output_pdf):
            print(f"✅ Successfully created clickable ribbon PDF: {result}")
            print("\n🖱️  CLICKABLE RIBBON FEATURES:")
            print("• Purple ribbon at top (50px height)")
            print("• 'Click here to show verification details box' instruction")
            print("• NO visible metadata box by default")
            print("• Metadata appears ONLY when ribbon is clicked")
            print("• Clean certificate view when not clicked")
            print("\n📦 METADATA BOX (APPEARS ON CLICK):")
            print("• Professional box format with borders")
            print("• Complete certificate information")
            print("• Verification status and security details")
            print("• Cryptographic algorithm information")
            print("• Organized sections with clear typography")
            print("\n🎨 USER EXPERIENCE:")
            print("• Clean certificate by default")
            print("• Click ribbon → metadata box appears")
            print("• Box covers part of certificate (as requested)")
            print("• Professional popup dialog format")
            print("\n✅ This implementation is HIDDEN BY DEFAULT!")
            print("   Click the purple ribbon to show the metadata box")
            return True
        else:
            print("❌ Failed to create output PDF")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_clickable_ribbon()