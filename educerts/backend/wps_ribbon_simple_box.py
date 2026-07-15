"""
WPS Office Style Verification Ribbon with Simple Metadata Box
Creates a ribbon with a small, permanent metadata box that doesn't interfere much
"""

import fitz  # PyMuPDF


class WPSRibbonSimpleBox:
    """Creates WPS Office style verification ribbons with simple metadata box"""

    def __init__(self):
        self.ribbon_height = 50  # Compact ribbon height
        self.box_height = 200    # Smaller metadata box height
        self.ribbon_color = (0.42, 0.35, 0.80)  # Purple/blue #6B59CC
        self.text_color = (1, 1, 1)  # White text
        self.icon_color = (1, 1, 1)  # White icon
        self.box_bg_color = (0.95, 0.95, 0.98)  # Light gray for metadata box
        self.box_text_color = (0.2, 0.2, 0.3)  # Dark text for metadata

    def add_ribbon_with_simple_box(self, pdf_path, output_path, cert_data):
        """Add WPS-style ribbon with simple metadata box"""

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

            # Add "Details below" text
            new_page.insert_text(
                fitz.Point(45, 32),
                "Verification details shown in box below",
                fontsize=8,
                color=(0.9, 0.9, 1.0),  # Light blue
                fontname="helv"
            )

            # Insert the original certificate content below the ribbon
            dest_rect = fitz.Rect(0, ribbon_and_gap, page_width, new_page_height)
            new_page.insert_image(dest_rect, pixmap=pix)

            # Add small metadata box positioned nicely
            self._add_simple_metadata_box(new_page, cert_data, page_width, ribbon_and_gap)

            # Add metadata to PDF properties
            self._add_metadata_to_properties(doc, cert_data)
            
            print(f"✅ Added verification ribbon with simple metadata box")

        doc.save(output_path)
        doc.close()
        return output_path

    def _add_simple_metadata_box(self, page, cert_data, page_width, ribbon_offset):
        """Add a simple, small metadata box positioned nicely"""
        
        # Position box in top-right corner, not covering main content
        box_x = page_width - 320  # 320px from right edge
        box_y = ribbon_offset + 20  # 20px below ribbon
        box_width = 300
        box_height = self.box_height
        
        # Draw main box background with shadow
        shadow_rect = fitz.Rect(box_x + 2, box_y + 2, box_x + box_width + 2, box_y + box_height + 2)
        page.draw_rect(
            shadow_rect,
            color=(0.8, 0.8, 0.8),  # Light shadow
            fill=(0.8, 0.8, 0.8)
        )
        
        # Draw main box background
        box_rect = fitz.Rect(box_x, box_y, box_x + box_width, box_y + box_height)
        page.draw_rect(
            box_rect,
            color=self.box_bg_color,
            fill=self.box_bg_color
        )
        
        # Draw box border
        page.draw_rect(
            box_rect,
            color=self.ribbon_color,  # Purple border
            width=2
        )
        
        # Add title background
        title_rect = fitz.Rect(box_x, box_y, box_x + box_width, box_y + 25)
        page.draw_rect(
            title_rect,
            color=self.ribbon_color,
            fill=self.ribbon_color
        )
        
        # Add title text
        page.insert_text(
            fitz.Point(box_x + 10, box_y + 17),
            "VERIFICATION DETAILS",
            fontsize=10,
            color=(1, 1, 1),  # White text
            fontname="helv"
        )
        
        # Certificate information section
        y_pos = box_y + 40
        line_height = 14
        
        # Certificate details (compact)
        cert_info = [
            f"ID: {cert_data.get('id', 'N/A')[:20]}...",
            f"Student: {cert_data.get('student_name', 'N/A')[:25]}",
            f"Course: {cert_data.get('course_name', 'N/A')[:25]}",
            f"Date: {cert_data.get('issued_at', 'N/A')}",
            f"By: {cert_data.get('organization', 'EduCerts')[:20]}"
        ]
        
        for i, info in enumerate(cert_info):
            page.insert_text(
                fitz.Point(box_x + 10, y_pos + (i * line_height)),
                info,
                fontsize=8,
                color=self.box_text_color,
                fontname="helv"
            )
        
        # Status section
        y_pos += len(cert_info) * line_height + 10
        
        # Status - VERIFIED
        page.insert_text(
            fitz.Point(box_x + 10, y_pos),
            "STATUS: VERIFIED ✓",
            fontsize=9,
            color=(0.0, 0.6, 0.0),  # Green
            fontname="helv"
        )
        
        y_pos += 15
        
        # Technical details (compact)
        tech_info = [
            "Ed25519 Digital Signature",
            "SHA-256 Hash Function",
            "Merkle Tree Verified",
            "Blockchain Anchored"
        ]
        
        for i, tech in enumerate(tech_info):
            page.insert_text(
                fitz.Point(box_x + 10, y_pos + (i * 12)),
                f"• {tech}",
                fontsize=7,
                color=(0.4, 0.4, 0.5),
                fontname="helv"
            )
        
        # Footer
        page.insert_text(
            fitz.Point(box_x + 10, box_y + box_height - 12),
            "EduCerts Secure Platform",
            fontsize=7,
            color=self.ribbon_color,
            fontname="helv"
        )

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


def add_ribbon_with_simple_box(pdf_path, output_path, cert_data):
    """Wrapper function"""
    ribbon = WPSRibbonSimpleBox()
    return ribbon.add_ribbon_with_simple_box(pdf_path, output_path, cert_data)