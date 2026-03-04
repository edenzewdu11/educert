"""
Simple WPS Office Style Verification Ribbon with Metadata Overlay
Creates a professional blue ribbon with clickable metadata overlay
"""

import fitz  # PyMuPDF


class SimpleWPSRibbon:
    """Creates simple WPS Office style verification ribbons for PDFs"""

    def __init__(self):
        self.ribbon_height = 45
        self.ribbon_color = (0.42, 0.35, 0.80)  # Purple/blue #6B59CC
        self.text_color = (1, 1, 1)  # White text
        self.icon_color = (1, 1, 1)  # White icon

    def add_wps_ribbon(self, pdf_path, output_path, cert_data):
        """Add WPS-style ribbon to PDF as visible overlay"""

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
                fitz.Point(20, 30),
                "✓",
                fontsize=16,
                color=self.icon_color,
                fontname="helv"
            )

            # Main text
            new_page.insert_text(
                fitz.Point(45, 28),
                "Certificate Verified - EduCerts Secure Platform",
                fontsize=11,
                color=self.text_color,
                fontname="helv"
            )

            # Right text
            new_page.insert_text(
                fitz.Point(page_width - 140, 28),
                "Click for details ›",
                fontsize=10,
                color=self.text_color,
                fontname="helv"
            )

            # Make ribbon clickable (opens properties in supported viewers)
            link_rect = fitz.Rect(0, 0, page_width, self.ribbon_height)
            link = {
                "kind": fitz.LINK_URI,
                "from": link_rect,
                "uri": "javascript:this.execMenuItem('ShowProperties');"
            }
            new_page.insert_link(link)

            # Add metadata
            self._add_metadata_to_properties(doc, cert_data)

        doc.save(output_path)
        doc.close()
        return output_path

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


def add_simple_wps_ribbon(pdf_path, output_path, cert_data):
    """Wrapper function"""
    ribbon = SimpleWPSRibbon()
    return ribbon.add_wps_ribbon(pdf_path, output_path, cert_data)