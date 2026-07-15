#!/usr/bin/env python3
"""
Comprehensive test to verify tamper detection works for all types of PDF modifications.
"""

import fitz
import pdf_hash_utils
import requests
import os
from datetime import datetime

def test_all_tamper_types():
    """Test different types of PDF tampering to ensure detection works."""
    
    print("🔍 COMPREHENSIVE TAMPER DETECTION TEST")
    print("=" * 60)
    print(f"Timestamp: {datetime.now().isoformat()}")
    print()
    
    if not os.path.exists('VALID_CERTIFICATE.pdf'):
        print("❌ VALID_CERTIFICATE.pdf not found")
        return
    
    # Get original hash
    original_hash = pdf_hash_utils.compute_pdf_content_hash('VALID_CERTIFICATE.pdf')
    print(f"Original hash: {original_hash[:16]}...")
    
    # Extract original text for analysis
    doc = fitz.open('VALID_CERTIFICATE.pdf')
    original_text = ""
    for page in doc:
        original_text += page.get_text()
    doc.close()
    
    print(f"Original text ({len(original_text)} chars):")
    print("-" * 40)
    print(original_text)
    print("-" * 40)
    print()
    
    # Test different types of tampering
    tamper_tests = [
        ("add_text", "Add new text"),
        ("replace_text", "Replace existing text"),
        ("delete_text", "Delete some text"),
        ("change_case", "Change text case"),
        ("add_spaces", "Add extra spaces"),
        ("invisible_text", "Add invisible text")
    ]
    
    for test_type, description in tamper_tests:
        print(f"🧪 Test: {description} ({test_type})")
        print("-" * 30)
        
        # Create tampered version
        doc = fitz.open('VALID_CERTIFICATE.pdf')
        page = doc[0]
        
        if test_type == "add_text":
            # Add visible text
            point = fitz.Point(100, 100)
            page.insert_text(point, "TAMPERED", fontsize=12, color=(1, 0, 0))
            
        elif test_type == "replace_text":
            # Find and replace text
            text_instances = page.search_for("Manual Test Head")
            if text_instances:
                rect = text_instances[0]
                # Cover with white rectangle
                page.draw_rect(rect, color=(1, 1, 1), fill=(1, 1, 1))
                # Add new text
                point = fitz.Point(rect.x0, rect.y1)
                page.insert_text(point, "REPLACED HEAD", fontsize=10, color=(0, 0, 0))
            else:
                # Fallback: add text anyway
                point = fitz.Point(200, 200)
                page.insert_text(point, "REPLACED", fontsize=10, color=(0, 0, 0))
                
        elif test_type == "delete_text":
            # Cover existing text with white rectangle
            text_instances = page.search_for("Manual")
            if text_instances:
                rect = text_instances[0]
                page.draw_rect(rect, color=(1, 1, 1), fill=(1, 1, 1))
            
        elif test_type == "change_case":
            # Replace text with different case
            text_instances = page.search_for("Manual Test Head")
            if text_instances:
                rect = text_instances[0]
                page.draw_rect(rect, color=(1, 1, 1), fill=(1, 1, 1))
                point = fitz.Point(rect.x0, rect.y1)
                page.insert_text(point, "MANUAL TEST HEAD", fontsize=10, color=(0, 0, 0))
                
        elif test_type == "add_spaces":
            # Add text with extra spaces
            point = fitz.Point(150, 150)
            page.insert_text(point, "   EXTRA   SPACES   ", fontsize=8, color=(0, 0, 0))
            
        elif test_type == "invisible_text":
            # Add white text on white background (invisible)
            point = fitz.Point(300, 300)
            page.insert_text(point, "INVISIBLE", fontsize=1, color=(1, 1, 1))
        
        # Save tampered version
        tampered_file = f"tamper_test_{test_type}.pdf"
        doc.save(tampered_file)
        doc.close()
        
        # Test hash detection
        tampered_hash = pdf_hash_utils.compute_pdf_content_hash(tampered_file)
        hash_changed = (original_hash != tampered_hash)
        
        print(f"   Hash changed: {hash_changed}")
        print(f"   New hash: {tampered_hash[:16]}...")
        
        # Test with API
        try:
            with open(tampered_file, 'rb') as f:
                files = {'file': f}
                response = requests.post('http://localhost:8000/api/verify/pdf', files=files)
            
            if response.status_code == 200:
                result = response.json()
                api_valid = result['summary']['all']
                content_integrity = result['summary'].get('contentIntegrity')
                
                print(f"   API valid: {api_valid}")
                print(f"   Content integrity: {content_integrity}")
                
                if not api_valid and not content_integrity:
                    print("   ✅ CORRECTLY DETECTED AS TAMPERED")
                else:
                    print("   ❌ FAILED TO DETECT TAMPERING!")
            else:
                print(f"   API Error: {response.status_code}")
                
        except Exception as e:
            print(f"   API Exception: {e}")
        
        print()
    
    print("=" * 60)
    print("🎯 CONCLUSION:")
    print("=" * 60)
    
    # Count tampered files
    tampered_files = [f for f in os.listdir('.') if f.startswith('tamper_test_')]
    print(f"Created {len(tampered_files)} test files:")
    for f in tampered_files:
        print(f"  - {f}")
    
    print()
    print("All these files should show as UNVERIFIED in the frontend.")
    print("If any show as VERIFIED, there's a browser caching issue.")
    print()
    print("🔧 NEXT STEPS:")
    print("1. Clear browser cache completely (Ctrl+Shift+R)")
    print("2. Test with test_verification.html (bypasses React)")
    print("3. Check browser console for errors")
    print("4. Try incognito/private browsing mode")

if __name__ == "__main__":
    test_all_tamper_types()