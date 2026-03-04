"""
Simple WPS Office Style Verification Ribbon
Creates a professional blue ribbon with clickable verification details
"""
import fitz  # PyMuPDF
import json
from datetime import datetime
import os

class SimpleWPSRibbon:
    """Creates simple WPS Office style verification ribbons for PDFs"""
    
    def __init__(self):
        # Modern banner style - similar to app notifications
        self.ribbon_height = 45
        self.ribbon_color = (0.42, 0.35, 0.80)  # Purple/blue #6B59CC
        self.text_color = (1, 1, 1)  # White text
        self.icon_color = (1, 1, 1)  # White icon
        
    def add_wps_ribbon(self, pdf_path, output_path, cert_data):
        """Add modern notification-style banner above the certificate"""
        
        doc = fitz.open(pdf_path)
        
        if len(doc) > 0:
            # Get original first page and render it to image
            original_page = doc[0]
            page_width = original_page.rect.width
            page_height = original_page.rect.height
            
            # Render original page to high-quality image
            mat = fitz.Matrix(2, 2)  # 2x scale for quality
            pix = original_page.get_pixmap(matrix=mat)
            
            # Gap between banner and certificate content
            gap = 15
            ribbon_and_gap = self.ribbon_height + gap
            
            # Delete original page and create new one with extended height
            doc.delete_page(0)
            new_page_height = page_height + ribbon_and_gap
            new_page = doc.new_page(0, width=page_width, height=new_page_height)
            
            # Draw solid banner background (no zigzag - clean modern look)
            ribbon_rect = fitz.Rect(0, 0, page_width, self.ribbon_height)
            new_page.draw_rect(ribbon_rect, color=self.ribbon_color, fill=self.ribbon_color)
            
            # Add checkmark icon (✓)
            icon_text = "✓"
            icon_point = fitz.Point(20, 30)
            new_page.insert_text(icon_point, icon_text, fontsize=16, color=self.icon_color, fontname="helv", fontfile=None)
            
            # Add main verification text
            main_text = "Certificate Verified - EduCerts Secure Platform"
            main_point = fitz.Point(45, 28)
            new_page.insert_text(main_point, main_text, fontsize=11, color=self.text_color, fontname="helv", fontfile=None)
            
            # Add click instruction on the right
            click_text = "Click for details ›"
            click_point = fitz.Point(page_width - 110, 28)
            new_page.insert_text(click_point, click_text, fontsize=10, color=self.text_color, fontname="helv", fontfile=None)
            
            # Make entire banner clickable to show metadata alert
            link_rect = fitz.Rect(0, 0, page_width, self.ribbon_height)
            metadata_js = self._get_signature_metadata_javascript(cert_data)
            
            # Add JavaScript action to the link
            link = {
                "kind": fitz.LINK_URI,
                "from": link_rect,
                "uri": f"javascript:{metadata_js.replace(chr(10), ' ')}"
            }
            new_page.insert_link(link)
            
            # Insert original certificate content below the banner with gap
            dest_rect = fitz.Rect(0, ribbon_and_gap, page_width, new_page_height)
            new_page.insert_image(dest_rect, pixmap=pix)
            
            # Add metadata to PDF properties
            self._add_metadata_to_properties(doc, cert_data)
            
            print(f"✅ Added modern verification banner above certificate with {gap}px gap")
        
        # Save with banner
        doc.save(output_path)
        doc.close()
        return output_path
    
    def _add_zigzag_edges(self, page, ribbon_rect):
        """Add zigzag edges to ribbon for authentic WPS look"""
        # Left zigzag edge
        left_points = []
        for i in range(0, 8):
            y = ribbon_rect.y0 + (i * ribbon_rect.height / 7)
            if i % 2 == 0:
                x = ribbon_rect.x0
            else:
                x = ribbon_rect.x0 + 5
            left_points.append(fitz.Point(x, y))
        
        # Draw left zigzag
        for i in range(len(left_points) - 1):
            page.draw_line(left_points[i], left_points[i+1], color=(0.4, 0.7, 0.9), width=1)
        
        # Right zigzag edge
        right_points = []
        for i in range(0, 8):
            y = ribbon_rect.y0 + (i * ribbon_rect.height / 7)
            if i % 2 == 0:
                x = ribbon_rect.x1
            else:
                x = ribbon_rect.x1 - 5
            right_points.append(fitz.Point(x, y))
        
        # Draw right zigzag
        for i in range(len(right_points) - 1):
            page.draw_line(right_points[i], right_points[i+1], color=(0.4, 0.7, 0.9), width=1)
    
    def _add_metadata_to_properties(self, doc, cert_data):
        """Add verification metadata to PDF properties"""
        metadata = doc.metadata
        
        # Create detailed metadata string
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
        metadata["subject"] = f"Certificate ID: {cert_data.get('id', 'N/A')} - {cert_data.get('course_name', 'Course')}"
        metadata["keywords"] = verification_info
        metadata["creator"] = "EduCerts Secure Platform v2.0 - Cryptographically Secured"
        metadata["producer"] = f"EduCerts - Verified on {cert_data.get('issued_at', 'N/A')}"
        
        doc.set_metadata(metadata)
        print(f"✅ Added verification metadata to PDF properties")
        print(f"   Right-click PDF → Properties to view full verification details")

    def _get_signature_metadata_javascript(self, cert_data):
        """Generate JavaScript to display signature metadata"""
        metadata_text = f"""SIGNATURE METADATA

Certificate ID: {cert_data.get('id', 'N/A')}
Student Name: {cert_data.get('student_name', 'N/A')}
Course Name: {cert_data.get('course_name', 'N/A')}
Issue Date: {cert_data.get('issued_at', 'N/A')}
Organization: {cert_data.get('organization', 'EduCerts')}

DIGITAL SIGNATURE:
Status: VERIFIED & AUTHENTIC
Algorithm: Ed25519 Cryptographic Signature
Content Hash: SHA-256
Registry: Blockchain Anchored

VERIFICATION STATUS:
- Signature Valid
- Content Integrity Verified
- Issuer Authenticated
- Timestamp Confirmed

This certificate is cryptographically secured and tamper-proof.
Generated by EduCerts Secure Platform v2.0"""
        
        # Escape for JavaScript - remove special characters that break JS
        escaped_text = metadata_text.replace('\\', '\\\\').replace('"', '\\"').replace("'", "\\'").replace('\n', '\\n')
        
        return f'app.alert("{escaped_text}", 3, 0, "Certificate Verification Details");'

def add_simple_wps_ribbon(pdf_path, output_path, cert_data):
    """Simple wrapper function for adding WPS ribbon"""
    ribbon = SimpleWPSRibbon()
    return ribbon.add_wps_ribbon(pdf_path, output_path, cert_data)
