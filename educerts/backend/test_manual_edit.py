#!/usr/bin/env python3
"""
Test script to simulate manual PDF editing and verify hash detection.
"""

import fitz
import pdf_hash_utils
import os
import requests

def test_manual_pdf_edit():
    """Test what happens when we manually edit PDF text like the user did."""
    
    print("🔍 Testing Manual PDF Edit Detection")
    print("=" * 50)
    
    if not os.path.exists('VALID_CERTIFICATE.pdf'):
        print("❌ VALID_CERTIFICATE.pdf not found")
        return
    
    # Step 1: Get original hash and text
    original_hash = pdf_hash_utils.compute_pdf_content_hash('VALID_CERTIFICATE.pdf')
    print(f"Original hash: {original_hash[:16]}...")
    
    # Extract all text to see what's in the PDF
    doc = fitz.open('VALID_CERTIFICATE.pdf')
    original_text = ""
    for page_num in range(len(doc)):
        page = doc[page_num]
        page_text = page.get_text()
        original_text += page_text
        print(f"\nPage {page_num + 1} text:")
        print("-" * 30)
        print(page_text)
    doc.close()
    
    print(f"\nTotal original text length: {len(original_text)} characters")
    
    # Step 2: Create a manually edited version
    # Simulate what the user did - change department head name
    doc = fitz.open('VALID_CERTIFICATE.pdf')
    page = doc[0]
    
    # Find text that looks like department head
    text_instances = page.search_for("head")
    dept_instances = page.search_for("dept")
    
    print(f"\nFound {len(text_instances)} instances of 'head'")
    print(f"Found {len(dept_instances)} instances of 'dept'")
    
    # Try to find and replace specific text
    # This simulates manual editing
    if text_instances or dept_instances:
        # Get text blocks to find department head
        blocks = page.get_text("dict")
        
        print("\nAnalyzing text blocks for department head...")
        for block in blocks.get("blocks", []):
            if "lines" in block:
                for line in block["lines"]:
                    for span in line.get("spans", []):
                        text = span.get("text", "")
                        if "dept" in text.lower() or "head" in text.lower():
                            print(f"Found potential dept head text: '{text}'")
                            
                            # Get the rectangle for this text
                            bbox = span["bbox"]
                            
                            # Add a white rectangle to cover the original text
                            rect = fitz.Rect(bbox)
                            page.draw_rect(rect, color=(1, 1, 1), fill=(1, 1, 1))
                            
                            # Insert new text in the same position
                            point = fitz.Point(bbox[0], bbox[3])
                            new_text = text.replace("Head", "MODIFIED_HEAD").replace("head", "MODIFIED_head")
                            page.insert_text(point, new_text, fontsize=span["size"], color=(0, 0, 0))
                            
                            print(f"Replaced with: '{new_text}'")
    
    # Save the manually edited version
    doc.save('manually_edited.pdf')
    doc.close()
    
    # Step 3: Compute hash of edited version
    edited_hash = pdf_hash_utils.compute_pdf_content_hash('manually_edited.pdf')
    print(f"\nEdited hash: {edited_hash[:16]}...")
    
    # Extract edited text
    doc = fitz.open('manually_edited.pdf')
    edited_text = ""
    for page in doc:
        edited_text += page.get_text()
    doc.close()
    
    print(f"Edited text length: {len(edited_text)} characters")
    print(f"Text length difference: {len(edited_text) - len(original_text)} characters")
    
    # Step 4: Compare hashes
    if original_hash != edited_hash:
        print("\n✅ SUCCESS: Hash correctly detected the manual edit!")
        print("The verification system should show this as UNVERIFIED")
    else:
        print("\n❌ PROBLEM: Hash did NOT change after manual edit!")
        print("This explains why tampered PDFs show as verified")
    
    # Step 5: Test with API
    print("\n" + "=" * 50)
    print("Testing with API...")
    
    try:
        with open('manually_edited.pdf', 'rb') as f:
            files = {'file': f}
            response = requests.post('http://localhost:8000/api/verify/pdf', files=files)
            
        if response.status_code == 200:
            result = response.json()
            print(f"API Response - Overall valid: {result['summary']['all']}")
            print(f"API Response - Content integrity: {result['summary'].get('contentIntegrity')}")
            
            if not result['summary']['all']:
                print("✅ API correctly identified manually edited PDF as UNVERIFIED")
            else:
                print("❌ API incorrectly shows manually edited PDF as VERIFIED")
        else:
            print(f"API Error: {response.status_code}")
            
    except Exception as e:
        print(f"API Test failed: {e}")
    
    # Clean up
    if os.path.exists('manually_edited.pdf'):
        print(f"\nManually edited PDF saved as: manually_edited.pdf")
        print("You can test this file in the frontend to see if it shows as UNVERIFIED")

if __name__ == "__main__":
    test_manual_pdf_edit()