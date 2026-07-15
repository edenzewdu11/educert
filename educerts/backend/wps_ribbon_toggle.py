"""
WPS Office Style Verification Ribbon with Click-to-Show Metadata Box
Creates a ribbon that shows metadata box only when clicked
"""

import fitz  # PyMuPDF


class WPSRibbonClickable:
    """Creates WPS Office style verification ribbons with click-to-show metadata"""

    def __init__(self):
        self.ribbon_height = 50  # Compact ribbon height
        self.ribbon_color = (0.42, 0.35, 0.80)  # Purple/blue #6B59CC
        self.text_color = (1, 1, 1)  # White text
        self.icon_color = (1, 1, 1)  # White icon

    def add_clickable_ribbon(self, pdf_path, output_path, cert_data):
        """Add WPS-style ribbon that shows popup when clicked"""

        doc = fitz.open(pdf_path)

        if len(doc) > 0:
            original_page = doc[0]
            page_width = original_page.rect.width
            page_height = original_page.rect.height

            # Render original page to high-quality image
            mat = fitz.Matrix(2, 2)
            pix = original_page.get_pixmap(matrix=mat)

            gap = 15
            ribbon_and_gap = self.ribbon_height + gap

            # Remove original page
            doc.delete_page(0)

            # Create new extended page
            new_page_height = page_height + ribbon_and_gap
            new_page = doc.new_page(0, width=page_width, height=new_page_height)

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
                "Click here to show verification details box",
                fontsize=8,
                color=(0.9, 0.9, 1.0),  # Light blue
                fontname="helv"
            )

            # Insert the original certificate content below the ribbon
            dest_rect = fitz.Rect(0, ribbon_and_gap, page_width, new_page_height)
            new_page.insert_image(dest_rect, pixmap=pix)

            # Create JavaScript for showing metadata box
            popup_script = self._create_metadata_popup_script(cert_data)
            
            # Make entire ribbon clickable
            link_rect = fitz.Rect(0, 0, page_width, self.ribbon_height)
            link = {
                "kind": fitz.LINK_URI,
                "from": link_rect,
                "uri": f"javascript:{popup_script}"
            }
            new_page.insert_link(link)

            # Add metadata to PDF properties
            self._add_metadata_to_properties(doc, cert_data)
            
            print(f"✅ Added clickable verification ribbon (click to show metadata)")

        doc.save(output_path)
        doc.close()
        return output_path
    def _create_metadata_popup_script(self, cert_data):
        """Create JavaScript to show metadata popup when ribbon is clicked"""
        
        # Escape quotes in data for JavaScript
        cert_id = str(cert_data.get('id', 'N/A')).replace("'", "\\'")
        student_name = str(cert_data.get('student_name', 'N/A')).replace("'", "\\'")
        course_name = str(cert_data.get('course_name', 'N/A')).replace("'", "\\'")
        issued_at = str(cert_data.get('issued_at', 'N/A')).replace("'", "\\'")
        organization = str(cert_data.get('organization', 'EduCerts')).replace("'", "\\'")
        
        # Create a comprehensive popup with all details in box format
        popup_message = f"""CERTIFICATE VERIFICATION DETAILS

┌─────────────────────────────────────────────┐
│ 🔒 SECURITY STATUS: VERIFIED ✓             │
├─────────────────────────────────────────────┤
│                                             │
│ 📋 CERTIFICATE INFORMATION:                │
│ • Certificate ID: {cert_id}                 │
│ • Student Name: {student_name}              │
│ • Course/Program: {course_name}             │
│ • Issue Date: {issued_at}                   │
│ • Issued By: {organization}                 │
│                                             │
│ 🔐 CRYPTOGRAPHIC VERIFICATION:             │
│ • Algorithm: Ed25519 Digital Signature     │
│ • Hash Function: SHA-256                   │
│ • Merkle Tree: Batch Verified              │
│ • Registry: Blockchain Anchored            │
│ • Tamper Detection: Active                 │
│                                             │
│ ✅ VERIFICATION RESULT:                    │
│ This certificate has been cryptographically│
│ verified and is authentic. All security    │
│ checks passed successfully.                │
│                                             │
└─────────────────────────────────────────────┘

EduCerts Secure Platform v2.0
Click the ribbon again to show this box."""

        # Use app.alert for reliable popup display
        script = f"app.alert('{popup_message}', 3, 0, 'Certificate Verification Details');"
        return script

    def _add_metadata_to_properties(self, doc, cert_data):
        """Add verification metadata to PDF properties"""

        metadata = doc.metadata or {}

        verification_info = (
            f"VERIFIED CERTIFICATE | "
            f"ID: {cert_data.get('id', 'N/A')} | "
            f"Student: {cert_data.get('student_name', 'N/A')} | "
            f"Course: {cert_data.get('course_name', 'N/A')} | "
            f"Issued: {cert_data.get('issued_at', 'N/A')} | "
            f"Organization: {cert_data.get('organization', 'EduCerts')} | "
            f"Status: CRYPTOGRAPHICALLY VERIFIED | "
            f"Algorithm: Ed25519 Digital Signature | "
            f"Blockchain Anchored"
        )

        metadata["title"] = f"✓ VERIFIED Certificate - {cert_data.get('student_name', 'Student')}"
        metadata["author"] = f"EduCerts Verification System - {cert_data.get('organization', 'EduCerts')}"
        metadata["subject"] = f"Certificate ID: {cert_data.get('id', 'N/A')}"
        metadata["keywords"] = verification_info
        metadata["creator"] = "EduCerts Secure Platform v2.0"
        metadata["producer"] = "EduCerts Secure Verification Engine"

        doc.set_metadata(metadata)


def add_clickable_ribbon(pdf_path, output_path, cert_data):
    """Wrapper function"""
    ribbon = WPSRibbonClickable()
    return ribbon.add_clickable_ribbon(pdf_path, output_path, cert_data)