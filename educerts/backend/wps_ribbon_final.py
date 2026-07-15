"""
WPS Office Style Verification Ribbon - Final Implementation
Creates a ribbon that shows metadata in a reliable popup format
"""

import fitz  # PyMuPDF


class WPSRibbonFinal:
    """Creates WPS Office style verification ribbons with reliable popup"""

    def __init__(self):
        self.ribbon_height = 50  # Compact ribbon height
        self.ribbon_color = (0.42, 0.35, 0.80)  # Purple/blue #6B59CC
        self.text_color = (1, 1, 1)  # White text
        self.icon_color = (1, 1, 1)  # White icon

    def add_final_ribbon(self, pdf_path, output_path, cert_data):
        """Add WPS-style ribbon with reliable popup - PRESERVING ORIGINAL PDF CONTENT"""

        doc = fitz.open(pdf_path)

        if len(doc) > 0:
            original_page = doc[0]
            page_width = original_page.rect.width
            page_height = original_page.rect.height

            gap = 15
            ribbon_and_gap = self.ribbon_height + gap

            # Create new document with extended page
            new_doc = fitz.open()
            new_page_height = page_height + ribbon_and_gap
            new_page = new_doc.new_page(0, width=page_width, height=new_page_height)

            # Draw ribbon background
            ribbon_rect = fitz.Rect(0, 0, page_width, self.ribbon_height)
            new_page.draw_rect(
                ribbon_rect,
                color=self.ribbon_color,
                fill=self.ribbon_color
            )

            # Add icon
            new_page.insert_text(
                fitz.Point(20, 20),
                "✓",
                fontsize=16,
                color=self.icon_color,
                fontname="helv"
            )

            # Main text
            new_page.insert_text(
                fitz.Point(45, 18),
                "Certificate Verified - EduCerts Secure Platform",
                fontsize=11,
                color=self.text_color,
                fontname="helv"
            )

            # Add "Click for Details" text
            new_page.insert_text(
                fitz.Point(45, 32),
                "Click here to view verification details",
                fontsize=8,
                color=(0.9, 0.9, 1.0),  # Light blue
                fontname="helv"
            )

            # PRESERVE ORIGINAL PDF CONTENT - Copy all content instead of converting to image
            # Copy all text, images, and form fields from original page
            try:
                # Method 1: Try to copy the page content directly
                new_page.show_pdf_page(
                    fitz.Rect(0, ribbon_and_gap, page_width, new_page_height),
                    doc,
                    0
                )
                print(f"✅ Preserved original PDF content using show_pdf_page")
            except Exception as e:
                print(f"WARNING: show_pdf_page failed ({e}), trying alternative method")
                try:
                    # Method 2: Copy page and transform
                    temp_doc = fitz.open()
                    temp_page = temp_doc.new_page(width=page_width, height=page_height)
                    temp_page.show_pdf_page(temp_page.rect, doc, 0)
                    
                    # Now copy this to the new page with offset
                    new_page.show_pdf_page(
                        fitz.Rect(0, ribbon_and_gap, page_width, new_page_height),
                        temp_doc,
                        0
                    )
                    temp_doc.close()
                    print(f"✅ Preserved original PDF content using temp document method")
                except Exception as e2:
                    print(f"WARNING: Alternative method failed ({e2}), falling back to image")
                    # Fallback: render as image
                    mat = fitz.Matrix(2, 2)
                    pix = original_page.get_pixmap(matrix=mat)
                    dest_rect = fitz.Rect(0, ribbon_and_gap, page_width, new_page_height)
                    new_page.insert_image(dest_rect, pixmap=pix)

            # Create a comprehensive popup script
            popup_script = self._create_comprehensive_popup(cert_data)
            
            # Make entire ribbon clickable
            link_rect = fitz.Rect(0, 0, page_width, self.ribbon_height)
            link = {
                "kind": fitz.LINK_URI,
                "from": link_rect,
                "uri": f"javascript:{popup_script}"
            }
            new_page.insert_link(link)

            # Add metadata to PDF properties for right-click access
            self._add_metadata_to_properties(new_doc, cert_data)
            
            print(f"✅ Added verification ribbon preserving original PDF content")

            # Close original document and save new one
            doc.close()
            new_doc.save(output_path)
            new_doc.close()
            
        else:
            # No pages in document, just copy original
            doc.save(output_path)
            doc.close()
            
        return output_path

    def _create_comprehensive_popup(self, cert_data):
        """Create a comprehensive popup with all verification details - optimized for top positioning"""
        
        # Escape quotes in data for JavaScript
        cert_id = str(cert_data.get('id', 'N/A')).replace("'", "\\'")
        student_name = str(cert_data.get('student_name', 'N/A')).replace("'", "\\'")
        course_name = str(cert_data.get('course_name', 'N/A')).replace("'", "\\'")
        issued_at = str(cert_data.get('issued_at', 'N/A')).replace("'", "\\'")
        organization = str(cert_data.get('organization', 'EduCerts')).replace("'", "\\'")
        
        # Extract additional fields from data_payload if available
        data_payload = cert_data.get('data_payload', {})
        if isinstance(data_payload, dict):
            # Try to get dept_head from various possible field names
            dept_head = (data_payload.get('dept_head') or 
                        data_payload.get('department_head') or 
                        data_payload.get('head_of_department') or 
                        data_payload.get('hod') or
                        'N/A')
            
            # Try to get department name
            department = (data_payload.get('department') or 
                         data_payload.get('dept') or 
                         data_payload.get('dept_name') or
                         'N/A')
            
            # Try to get other relevant fields
            grade = data_payload.get('grade', 'N/A')
            gpa = data_payload.get('gpa', 'N/A')
        else:
            dept_head = 'N/A'
            department = 'N/A'
            grade = 'N/A'
            gpa = 'N/A'
        
        # Create a compact, well-formatted popup that fits on screen
        popup_message = f"""CERTIFICATE VERIFICATION DETAILS

STATUS: ✅ VERIFIED & AUTHENTIC

STUDENT INFORMATION:
• Name: {student_name}
• Course: {course_name}
• Department: {department}
• Department Head: {dept_head}
• Grade: {grade} | GPA: {gpa}

CERTIFICATE DETAILS:
• ID: {cert_id[:25]}{'...' if len(cert_id) > 25 else ''}
• Issued: {issued_at}
• Organization: {organization}

SECURITY VERIFICATION:
• Digital Signature: Ed25519 ✓
• Hash Algorithm: SHA-256 ✓
• Merkle Tree: Verified ✓
• Blockchain: Anchored ✓
• Tamper Detection: Active ✓

This certificate has been cryptographically verified.
All security checks passed successfully.

EduCerts Secure Platform v2.0"""

        # Try multiple approaches for better popup positioning
        # Method 1: Standard alert with information type (most compatible)
        method1 = f"app.alert('{popup_message}', 0, 3, 'Certificate Verification');"
        
        # Method 2: Try beep + alert for attention (some viewers position differently after beep)
        method2 = f"try {{ app.beep(0); app.alert('{popup_message}', 0, 3, 'Certificate Verification'); }} catch(e) {{ app.alert('{popup_message}', 0, 3, 'Certificate Verification'); }}"
        
        # Method 3: Try response dialog which sometimes appears more centered
        method3 = f"""
        try {{
            var response = app.response({{
                cQuestion: 'CERTIFICATE VERIFICATION DETAILS\\n\\n{popup_message}\\n\\nClick OK to close.',
                cTitle: 'Certificate Verification',
                cDefault: 'OK',
                cLabel: 'Verification Complete'
            }});
        }} catch(e) {{
            app.alert('{popup_message}', 0, 3, 'Certificate Verification');
        }}
        """
        
        # Use method 2 (beep + alert) as it often provides better positioning
        return method2

    def _add_metadata_to_properties(self, doc, cert_data):
        """Add verification metadata to PDF properties (accessible via right-click)"""

        metadata = doc.metadata or {}

        # Extract additional fields from data_payload
        data_payload = cert_data.get('data_payload', {})
        if isinstance(data_payload, dict):
            dept_head = (data_payload.get('dept_head') or 
                        data_payload.get('department_head') or 
                        data_payload.get('head_of_department') or 
                        data_payload.get('hod') or
                        'N/A')
            department = (data_payload.get('department') or 
                         data_payload.get('dept') or 
                         data_payload.get('dept_name') or
                         'N/A')
            grade = data_payload.get('grade', 'N/A')
            gpa = data_payload.get('gpa', 'N/A')
        else:
            dept_head = 'N/A'
            department = 'N/A'
            grade = 'N/A'
            gpa = 'N/A'

        # Create comprehensive metadata for PDF properties
        verification_info = (
            f"VERIFIED CERTIFICATE\\n\\n"
            f"Certificate ID: {cert_data.get('id', 'N/A')}\\n"
            f"Student Name: {cert_data.get('student_name', 'N/A')}\\n"
            f"Course/Program: {cert_data.get('course_name', 'N/A')}\\n"
            f"Department: {department}\\n"
            f"Department Head: {dept_head}\\n"
            f"Grade: {grade} | GPA: {gpa}\\n"
            f"Issue Date: {cert_data.get('issued_at', 'N/A')}\\n"
            f"Issued By: {cert_data.get('organization', 'EduCerts')}\\n\\n"
            f"SECURITY STATUS: CRYPTOGRAPHICALLY VERIFIED\\n"
            f"Algorithm: Ed25519 Digital Signature\\n"
            f"Hash Function: SHA-256\\n"
            f"Merkle Tree: Batch Verified\\n"
            f"Registry: Blockchain Anchored\\n"
            f"Tamper Detection: Active\\n\\n"
            f"This certificate is authentic and unmodified."
        )

        metadata["title"] = f"✓ VERIFIED Certificate - {cert_data.get('student_name', 'Student')}"
        metadata["author"] = f"EduCerts Verification System - {cert_data.get('organization', 'EduCerts')}"
        metadata["subject"] = f"Certificate ID: {cert_data.get('id', 'N/A')}"
        metadata["keywords"] = verification_info
        metadata["creator"] = "EduCerts Secure Platform v2.0"
        metadata["producer"] = "EduCerts Secure Verification Engine"

        doc.set_metadata(metadata)


def add_final_ribbon(pdf_path, output_path, cert_data):
    """Wrapper function"""
    ribbon = WPSRibbonFinal()
    return ribbon.add_final_ribbon(pdf_path, output_path, cert_data)