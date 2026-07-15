#!/usr/bin/env python3
"""
Debug field mapping between CSV and PDF template
"""

import os
import pdf_utils

def debug_field_mapping():
    """Debug what fields are in the PDF template and how they're being mapped"""
    
    pdf_template_path = "user_templates/template.pdf"
    
    if not os.path.exists(pdf_template_path):
        print("❌ No PDF template found at user_templates/template.pdf")
        return
    
    try:
        # Extract fields from PDF template
        print("🔍 EXTRACTING FIELDS FROM PDF TEMPLATE...")
        placeholder_map = pdf_utils.extract_pdf_placeholders(pdf_template_path)
        template_fields = set(placeholder_map.keys())
        
        print(f"\n📋 FIELDS FOUND IN PDF TEMPLATE ({len(template_fields)} total):")
        for i, field in enumerate(sorted(template_fields), 1):
            print(f"  {i:2d}. {field}")
        
        # Check for department head related fields
        dept_fields = [f for f in template_fields if 'dept' in f.lower() or 'head' in f.lower()]
        print(f"\n🏢 DEPARTMENT/HEAD RELATED FIELDS ({len(dept_fields)} found):")
        if dept_fields:
            for field in dept_fields:
                print(f"  • {field}")
        else:
            print("  ❌ No department or head fields found in template!")
        
        # Check for recipient related fields
        recipient_fields = [f for f in template_fields if 'recipient' in f.lower() or 'name' in f.lower()]
        print(f"\n👤 RECIPIENT/NAME RELATED FIELDS ({len(recipient_fields)} found):")
        for field in recipient_fields:
            print(f"  • {field}")
        
        print(f"\n💡 FIELD MAPPING EXPLANATION:")
        print("When you upload a CSV file, the system tries to map CSV column names")
        print("to the PDF template field names. For example:")
        print("  • CSV column 'Student Name' → PDF field 'student_name'")
        print("  • CSV column 'Department Head' → PDF field 'dept_head'")
        print("  • CSV column 'Course' → PDF field 'course_name'")
        
        print(f"\n🔧 TO FIX THE DEPARTMENT HEAD ISSUE:")
        print("1. Make sure your CSV has a column for department head")
        print("2. Name it one of these (case insensitive):")
        print("   - 'dept_head' or 'department_head'")
        print("   - 'head_of_department' or 'hod'")
        print("   - Or match exactly with the PDF field name")
        
        if dept_fields:
            print(f"\n3. Your PDF template expects these department fields:")
            for field in dept_fields:
                print(f"   - CSV should have column matching: '{field}'")
        
        return True
        
    except Exception as e:
        print(f"❌ Error analyzing template: {e}")
        return False

if __name__ == "__main__":
    debug_field_mapping()