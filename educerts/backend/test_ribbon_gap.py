from wps_ribbon_simple import add_simple_wps_ribbon
import os

# Find a test PDF
test_pdfs = [f for f in os.listdir("generated_certs") if f.endswith("_base.pdf")]

if test_pdfs:
    test_pdf = f"generated_certs/{test_pdfs[0]}"
    output_pdf = "test_ribbon_with_gap.pdf"
    
    cert_data = {
        "id": "test-123",
        "student_name": "Test Student",
        "course_name": "Test Course",
        "issued_at": "2024-01-01",
        "organization": "EduCerts Academy"
    }
    
    print(f"Testing ribbon on: {test_pdf}")
    result = add_simple_wps_ribbon(test_pdf, output_pdf, cert_data)
    print(f"Output saved to: {result}")
    print("Open the PDF and check:")
    print("1. Ribbon should be ABOVE certificate with gap")
    print("2. Click the ribbon to see metadata popup")
else:
    print("No test PDFs found in generated_certs/")
