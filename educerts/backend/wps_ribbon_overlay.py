"""
WPS Office Style Verification Ribbon with Overlay Box
Creates a ribbon with a metadata overlay box that appears when clicked
"""

import fitz  # PyMuPDF


class WPSRibbonOverlay:
    """Creates WPS Office style verification ribbons with overlay metadata box"""

    def __init__(self):
        self.ribbon_height = 50  # Compact ribbon height
        self.box_height = 300    # Metadata box height
        self.ribbon_color = (0.42, 0.35, 0.80)  # Purple/blue #6B59CC
        self.text_color = (1, 1, 1)  # White text
        self.icon_color = (1, 1, 1)  # White icon
        self.box_bg_color = (0.95, 0.95, 0.98)  # Light gray for metadata box
        self.box_text_color = (0.2, 0.2, 0.3)  # Dark text for metadata

    def add_ribbon_with_overlay(self, pdf_path, output_path, cert_data):
        """Add WPS-style ribbon with overlay metadata box"""

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

            # Add metadata box as annotation that can be toggled
            self._add_toggleable_metadata_box(new_page, cert_data, page_width, ribbon_and_gap)

            # Create JavaScript for toggling the annotation
            toggle_script = self._create_annotation_toggle_script()
            
            # Make entire ribbon clickable
            link_rect = fitz.Rect(0, 0, page_width, self.ribbon_height)
            link = {
                "kind": fitz.LINK_URI,
                "from": link_rect,
                "uri": f"javascript:{toggle_script}"
            }
            new_page.insert_link(link)

            # Add metadata to PDF properties
            self._add_metadata_to_properties(doc, cert_data)
            
            print(f"✅ Added verification ribbon with toggleable overlay box")

        doc.save(output_path)
        doc.close()
        return output_path
    def _add_toggleable_metadata_box(self, page, cert_data, page_width, ribbon_offset):
        """Add metadata box as a toggleable annotation"""
        
        # Box position - positioned to cover part of the certificate
        box_x = 60
        box_y = ribbon_offset + 80  # Start 80px below ribbon, covering certificate
        box_width = 400
        box_height = self.box_height
        
        # Create a text annotation with the metadata
        metadata_text = self._format_metadata_text(cert_data)
        
        # Add a square annotation for the box background
        box_annot = page.add_rect_annot(fitz.Rect(box_x, box_y, box_x + box_width, box_y + box_height))
        box_annot.set_info(
            title="Certificate Verification Details",
            content=metadata_text
        )
        box_annot.set_colors(stroke=self.ribbon_color, fill=self.box_bg_color)
        box_annot.set_border(width=3)
        box_annot.set_flags(fitz.PDF_ANNOT_HIDDEN)  # Start hidden
        box_annot.update()
        
        # Add a text annotation with the formatted content
        text_annot = page.add_text_annot(fitz.Point(box_x + 10, box_y + 10), metadata_text)
        text_annot.set_info(
            title="Verification Details",
            content=metadata_text
        )
        text_annot.set_flags(fitz.PDF_ANNOT_HIDDEN)  # Start hidden
        text_annot.update()

    def _format_metadata_text(self, cert_data):
        """Format metadata as readable text"""
        
        text = f"""CERTIFICATE VERIFICATION DETAILS

SECURITY STATUS: VERIFIED ✓

CERTIFICATE INFORMATION:
• Certificate ID: {cert_data.get('id', 'N/A')}
• Student Name: {cert_data.get('student_name', 'N/A')}
• Course/Program: {cert_data.get('course_name', 'N/A')}
• Issue Date: {cert_data.get('issued_at', 'N/A')}
• Issued By: {cert_data.get('organization', 'EduCerts')}

CRYPTOGRAPHIC VERIFICATION:
• Algorithm: Ed25519 Digital Signature
• Hash Function: SHA-256
• Merkle Tree: Batch Verified
• Registry: Blockchain Anchored
• Tamper Detection: Active

VERIFICATION RESULT:
This certificate has been cryptographically verified 
and is authentic. All security checks passed.

EduCerts Secure Platform v2.0
Click the ribbon again to hide this box."""

        return text

    def _create_annotation_toggle_script(self):
        """Create JavaScript to toggle annotation visibility"""
        
        script = """
        var annots = this.getAnnots(0);
        if (annots) {
            for (var i = 0; i < annots.length; i++) {
                if (annots[i].type === 'Square' || annots[i].type === 'Text') {
                    if (annots[i].hidden) {
                        annots[i].hidden = false;
                    } else {
                        annots[i].hidden = true;
                    }
                }
            }
        }
        """
        
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


def add_ribbon_with_overlay_box(pdf_path, output_path, cert_data):
    """Wrapper function"""
    ribbon = WPSRibbonOverlay()
    return ribbon.add_ribbon_with_overlay(pdf_path, output_path, cert_data)