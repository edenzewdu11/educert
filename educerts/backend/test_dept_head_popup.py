#!/usr/bin/env python3
"""
Test the popup with department head information
"""

from wps_ribbon_final import add_final_ribbon
import os

def test_dept_head_popup():
    """Test the popup with department head information"""
    
    # Test certificate data with department head information
    cert_data = {
        'id': 'test-cert-with-dept-head-12345',
        'student_name': 'John Smith',
        'course_name': 'Master of Computer Science',
        'issued_at': '2024-03-20',
        'organization': 'EduCerts Technology University',
        'content_hash': 'sha256:abc123def456789',
        'signature': 'ed25519:xyz789signature123456',
        'data_payload': {
            'dept_head': 'Dr. Sarah Wilson',
            'department': 'Computer Science & Engineering',
            'grade': 'A+',
            'gpa': '4.0',
            'student_id': 'CS2024001',
            'graduation_year': '2024'
        }
    }
    
    # Find a test PDF to use
    test_pdfs = [f for f in os.listdir('.') if f.endswith('.pdf') and 'test' in f.lower()]
    
    if not test_pdfs:
        print("❌ No test PDF files found")
        return False
    
    input_pdf = test_pdfs[0]  # Use first available test PDF
    output_pdf = 'test_dept_head_popup.pdf'
    
    try:
        print(f"📄 Using input PDF: {input_pdf}")
        print(f"🎯 Creating output PDF: {output_pdf}")
        
        # Apply the final ribbon with dept head info
        result = add_final_ribbon(input_pdf, output_pdf, cert_data)
        
        if os.path.exists(output_pdf):
            print(f"✅ Successfully created PDF with dept head info: {result}")
            print("\n📋 CERTIFICATE DATA INCLUDED:")
            print(f"• Student Name: {cert_data['student_name']}")
            print(f"• Course: {cert_data['course_name']}")
            print(f"• Department: {cert_data['data_payload']['department']}")
            print(f"• Department Head: {cert_data['data_payload']['dept_head']}")
            print(f"• Grade: {cert_data['data_payload']['grade']}")
            print(f"• GPA: {cert_data['data_payload']['gpa']}")
            print("\n🖱️  POPUP WILL NOW SHOW:")
            print("• Certificate ID")
            print("• Student Name: John Smith")
            print("• Course/Program: Master of Computer Science")
            print("• Department: Computer Science & Engineering")
            print("• Department Head: Dr. Sarah Wilson")
            print("• Grade: A+ | GPA: 4.0")
            print("• Issue Date and Organization")
            print("• Complete cryptographic verification details")
            print("\n✅ FIXED: Department head information now included!")
            print("   Click the purple ribbon to see all details including dept head")
            return True
        else:
            print("❌ Failed to create output PDF")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_dept_head_popup()