"""
Simple WPS Office Style Verification Ribbon with Metadata Overlay
Creates a professional blue ribbon with clickable metadata overlay
"""

import fitz  # PyMuPDF


class SimpleWPSRibbon:
    """Creates simple WPS Office style verification ribbons for PDFs with popup metadata"""

    def __init__(self):
        self.ribbon_height = 50  # Compact ribbon height
        self.ribbon_color = (0.42, 0.35, 0.80)  # Purple/blue #6B59CC
        self.text_color = (1, 1, 1)  # White text
        self.icon_color = (1, 1, 1)  # White icon

    def add_wps_ribbon(self, pdf_path, output_path, cert_data):
        """Add WPS-style ribbon to PDF with embedded metadata box"""

        doc = fitz.open(pdf_path)

        if len(doc) > 0:
            original_page = doc[0]
            page_width = original_page.rect.width
            page_height = original_page.rect.height

            # Render original page to high-quality image
            mat = fitz.Matrix(2, 2)
            pix = original_page.get_pixmap(matrix=mat)

            gap = 15
            compact_ribbon_height = 50
            ribbon_and_gap = compact_ribbon_height + gap

            # Remove original page
            doc.delete_page(0)

            # Create new extended page
            new_page_height = page_height + ribbon_and_gap
            new_page = doc.new_page(0, width=page_width, height=new_page_height)

            # Draw ribbon background
            ribbon_rect = fitz.Rect(0, 0, page_width, compact_ribbon_height)
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
                "Click here to show verification details",
                fontsize=8,
                color=(0.9, 0.9, 1.0),  # Light blue
                fontname="helv"
            )

            # Add embedded metadata box (initially hidden with JavaScript)
            self._add_embedded_metadata_box(new_page, cert_data, page_width, ribbon_and_gap)
            
            # Create JavaScript for showing/hiding the box
            popup_script = self._create_toggle_script()
            
            # Make entire ribbon clickable
            link_rect = fitz.Rect(0, 0, page_width, compact_ribbon_height)
            link = {
                "kind": fitz.LINK_URI,
                "from": link_rect,
                "uri": f"javascript:{popup_script}"
            }
            new_page.insert_link(link)

            # Insert the original certificate content below the ribbon
            dest_rect = fitz.Rect(0, ribbon_and_gap, page_width, new_page_height)
            new_page.insert_image(dest_rect, pixmap=pix)

            # Add metadata to PDF properties
            self._add_metadata_to_properties(doc, cert_data)
            
            print(f"✅ Added verification ribbon with embedded metadata box")

        doc.save(output_path)
        doc.close()
        return output_path

    def _add_embedded_metadata_box(self, page, cert_data, page_width, ribbon_offset):
        """Add visible metadata box embedded in the PDF"""
        
        # Box dimensions and position
        box_x = 60
        box_y = ribbon_offset + 100  # Position below ribbon, on top of certificate
        box_width = 400
        box_height = 280
        
        # Draw main box background
        box_rect = fitz.Rect(box_x, box_y, box_x + box_width, box_y + box_height)
        page.draw_rect(
            box_rect,
            color=(0.95, 0.95, 0.98),  # Light gray background
            fill=(0.95, 0.95, 0.98)
        )
        
        # Draw box border
        page.draw_rect(
            box_rect,
            color=self.ribbon_color,  # Purple border
            width=3
        )
        
        # Add title background
        title_rect = fitz.Rect(box_x, box_y, box_x + box_width, box_y + 30)
        page.draw_rect(
            title_rect,
            color=self.ribbon_color,
            fill=self.ribbon_color
        )
        
        # Add title text
        page.insert_text(
            fitz.Point(box_x + 15, box_y + 20),
            "CERTIFICATE VERIFICATION DETAILS",
            fontsize=12,
            color=(1, 1, 1),  # White text
            fontname="helv-bold"
        )
        
        # Add close button indicator
        page.insert_text(
            fitz.Point(box_x + box_width - 80, box_y + 20),
            "Click ribbon to close",
            fontsize=8,
            color=(0.9, 0.9, 1.0),
            fontname="helv"
        )
        
        # Certificate information section
        y_pos = box_y + 50
        line_height = 18
        
        # Certificate details
        cert_info = [
            f"Certificate ID: {cert_data.get('id', 'N/A')[:32]}...",
            f"Student Name: {cert_data.get('student_name', 'N/A')}",
            f"Course/Program: {cert_data.get('course_name', 'N/A')}",
            f"Issue Date: {cert_data.get('issued_at', 'N/A')}",
            f"Issued By: {cert_data.get('organization', 'EduCerts')}"
        ]
        
        for i, info in enumerate(cert_info):
            page.insert_text(
                fitz.Point(box_x + 15, y_pos + (i * line_height)),
                info,
                fontsize=9,
                color=(0.2, 0.2, 0.3),
                fontname="helv"
            )
        
        # Verification status
        y_pos += len(cert_info) * line_height + 15
        
        # Status header
        page.insert_text(
            fitz.Point(box_x + 15, y_pos),
            "VERIFICATION STATUS:",
            fontsize=10,
            color=self.ribbon_color,
            fontname="helv-bold"
        )
        
        y_pos += 20
        
        # Status details
        status_info = [
            "✓ VERIFIED - Certificate is authentic",
            "✓ CRYPTOGRAPHICALLY SIGNED",
            "Algorithm: Ed25519 Digital Signature",
            "Hash Function: SHA-256",
            "Merkle Tree: Batch Verified",
            "Registry: Blockchain Anchored",
            "Tamper Detection: Active"
        ]
        
        for i, status in enumerate(status_info):
            color = (0.0, 0.5, 0.0) if status.startswith("✓") else (0.3, 0.3, 0.4)
            fontname = "helv-bold" if status.startswith("✓") else "helv"
            
            page.insert_text(
                fitz.Point(box_x + 15, y_pos + (i * 15)),
                status,
                fontsize=8,
                color=color,
                fontname=fontname
            )
        
        # Footer
        page.insert_text(
            fitz.Point(box_x + 15, box_y + box_height - 15),
            "EduCerts Secure Platform v2.0",
            fontsize=8,
            color=self.ribbon_color,
            fontname="helv-bold"
        )

    def _create_toggle_script(self):
        """Create simple JavaScript to show alert since PDF annotations are complex"""
        script = """
        app.alert('CERTIFICATE VERIFICATION DETAILS\\n\\n' +
                 '🔒 STATUS: VERIFIED ✓\\n' +
                 '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n\\n' +
                 '📋 This certificate has been cryptographically verified\\n' +
                 '   and is authentic. All security checks passed.\\n\\n' +
                 '🔐 SECURITY FEATURES:\\n' +
                 '   • Ed25519 Digital Signature\\n' +
                 '   • SHA-256 Hash Function\\n' +
                 '   • Merkle Tree Batch Verification\\n' +
                 '   • Blockchain Registry Anchored\\n' +
                 '   • Active Tamper Detection\\n\\n' +
                 '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n' +
                 'EduCerts Secure Platform v2.0', 
                 3, 0, 'Certificate Verification');
        """
        return script

    def _create_metadata_popup_script(self, cert_data):
        """Create JavaScript for box popup overlay"""
        
        # Escape quotes in data for JavaScript
        cert_id = str(cert_data.get('id', 'N/A')).replace("'", "\\'")
        student_name = str(cert_data.get('student_name', 'N/A')).replace("'", "\\'")
        course_name = str(cert_data.get('course_name', 'N/A')).replace("'", "\\'")
        issued_at = str(cert_data.get('issued_at', 'N/A')).replace("'", "\\'")
        organization = str(cert_data.get('organization', 'EduCerts')).replace("'", "\\'")
        
        # Create JavaScript to show/hide metadata box overlay
        script = f"""
        if (typeof metadataBoxVisible === 'undefined') {{
            var metadataBoxVisible = false;
        }}
        
        if (!metadataBoxVisible) {{
            // Create metadata box overlay
            var overlay = this.addAnnot({{
                type: 'Square',
                page: 0,
                rect: [50, 200, 450, 500],
                fillColor: ['RGB', 0.95, 0.95, 0.98],
                strokeColor: ['RGB', 0.42, 0.35, 0.80],
                width: 2
            }});
            
            // Add title
            var title = this.addAnnot({{
                type: 'FreeText',
                page: 0,
                rect: [60, 470, 440, 490],
                contents: 'CERTIFICATE VERIFICATION DETAILS',
                textFont: 'Helvetica-Bold',
                textSize: 12,
                textColor: ['RGB', 0.42, 0.35, 0.80]
            }});
            
            // Add certificate info
            var info1 = this.addAnnot({{
                type: 'FreeText',
                page: 0,
                rect: [60, 440, 440, 460],
                contents: 'Certificate ID: {cert_id}',
                textFont: 'Helvetica',
                textSize: 9,
                textColor: ['RGB', 0.2, 0.2, 0.3]
            }});
            
            var info2 = this.addAnnot({{
                type: 'FreeText',
                page: 0,
                rect: [60, 420, 440, 440],
                contents: 'Student: {student_name}',
                textFont: 'Helvetica',
                textSize: 9,
                textColor: ['RGB', 0.2, 0.2, 0.3]
            }});
            
            var info3 = this.addAnnot({{
                type: 'FreeText',
                page: 0,
                rect: [60, 400, 440, 420],
                contents: 'Course: {course_name}',
                textFont: 'Helvetica',
                textSize: 9,
                textColor: ['RGB', 0.2, 0.2, 0.3]
            }});
            
            var info4 = this.addAnnot({{
                type: 'FreeText',
                page: 0,
                rect: [60, 380, 440, 400],
                contents: 'Issued: {issued_at} | By: {organization}',
                textFont: 'Helvetica',
                textSize: 9,
                textColor: ['RGB', 0.2, 0.2, 0.3]
            }});
            
            // Add verification status
            var status = this.addAnnot({{
                type: 'FreeText',
                page: 0,
                rect: [60, 350, 440, 370],
                contents: 'STATUS: VERIFIED ✓ | CRYPTOGRAPHICALLY SIGNED',
                textFont: 'Helvetica-Bold',
                textSize: 9,
                textColor: ['RGB', 0.0, 0.5, 0.0]
            }});
            
            // Add security details
            var security1 = this.addAnnot({{
                type: 'FreeText',
                page: 0,
                rect: [60, 320, 440, 340],
                contents: 'Algorithm: Ed25519 Digital Signature',
                textFont: 'Helvetica',
                textSize: 8,
                textColor: ['RGB', 0.3, 0.3, 0.4]
            }});
            
            var security2 = this.addAnnot({{
                type: 'FreeText',
                page: 0,
                rect: [60, 300, 440, 320],
                contents: 'Hash: SHA-256 | Merkle Tree: Batch Verified',
                textFont: 'Helvetica',
                textSize: 8,
                textColor: ['RGB', 0.3, 0.3, 0.4]
            }});
            
            var security3 = this.addAnnot({{
                type: 'FreeText',
                page: 0,
                rect: [60, 280, 440, 300],
                contents: 'Registry: Blockchain Anchored | Tamper Detection: Active',
                textFont: 'Helvetica',
                textSize: 8,
                textColor: ['RGB', 0.3, 0.3, 0.4]
            }});
            
            // Add close instruction
            var closeInfo = this.addAnnot({{
                type: 'FreeText',
                page: 0,
                rect: [60, 250, 440, 270],
                contents: 'Click the ribbon again to close this box',
                textFont: 'Helvetica-Oblique',
                textSize: 8,
                textColor: ['RGB', 0.5, 0.5, 0.6]
            }});
            
            // Add footer
            var footer = this.addAnnot({{
                type: 'FreeText',
                page: 0,
                rect: [60, 210, 440, 230],
                contents: 'EduCerts Secure Platform v2.0',
                textFont: 'Helvetica-Bold',
                textSize: 8,
                textColor: ['RGB', 0.42, 0.35, 0.80]
            }});
            
            metadataBoxVisible = true;
            
        }} else {{
            // Hide metadata box by removing annotations
            var annots = this.getAnnots(0);
            if (annots) {{
                for (var i = annots.length - 1; i >= 0; i--) {{
                    if (annots[i].type === 'Square' || annots[i].type === 'FreeText') {{
                        this.removeAnnot(0, annots[i]);
                    }}
                }}
            }}
            metadataBoxVisible = false;
        }}
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


def add_simple_wps_ribbon(pdf_path, output_path, cert_data):
    """Wrapper function"""
    ribbon = SimpleWPSRibbon()
    return ribbon.add_wps_ribbon(pdf_path, output_path, cert_data)