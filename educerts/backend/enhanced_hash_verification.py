#!/usr/bin/env python3
"""
Enhanced hash-based verification system.
This system creates a comprehensive hash database of all certificates
and performs strict hash matching for tamper detection.
"""

import hashlib
import os
import fitz
import database
import models
from sqlalchemy.orm import sessionmaker
import pdf_hash_utils
import tempfile

def compute_comprehensive_hash(pdf_path):
    """
    Compute multiple types of hashes for comprehensive verification.
    Returns a dictionary with different hash types.
    """
    try:
        doc = fitz.open(pdf_path)
        
        # 1. Text content hash (existing method)
        text_content = ""
        for page in doc:
            text_content += page.get_text()
        
        text_hash = hashlib.sha256(text_content.encode('utf-8')).hexdigest()
        
        # 2. Raw binary hash (entire file)
        with open(pdf_path, 'rb') as f:
            binary_content = f.read()
        binary_hash = hashlib.sha256(binary_content).hexdigest()
        
        # 3. Normalized text hash (removes formatting differences)
        normalized_text = pdf_hash_utils.normalize_pdf_text(text_content)
        normalized_hash = hashlib.sha256(normalized_text.encode('utf-8')).hexdigest()
        
        # 4. Structure hash (page count, dimensions, etc.)
        structure_info = f"{len(doc)}|{doc[0].rect if len(doc) > 0 else 'empty'}"
        structure_hash = hashlib.sha256(structure_info.encode('utf-8')).hexdigest()
        
        doc.close()
        
        return {
            'text_hash': text_hash,
            'binary_hash': binary_hash,
            'normalized_hash': normalized_hash,
            'structure_hash': structure_hash,
            'text_content': text_content,
            'normalized_text': normalized_text
        }
        
    except Exception as e:
        print(f"Error computing comprehensive hash: {e}")
        return None

def build_certificate_hash_database():
    """
    Build a comprehensive hash database of all certificates.
    """
    print("🔨 Building Certificate Hash Database...")
    print("=" * 50)
    
    Session = sessionmaker(bind=database.engine)
    db = Session()
    
    try:
        # Get all certificates
        certificates = db.query(models.Certificate).all()
        print(f"Found {len(certificates)} certificates in database")
        
        hash_database = {}
        
        for cert in certificates:
            print(f"\nProcessing certificate: {cert.id}")
            
            # Check if PDF file exists
            if not cert.rendered_pdf_path or not os.path.exists(cert.rendered_pdf_path):
                print(f"  ❌ PDF file not found: {cert.rendered_pdf_path}")
                continue
            
            # Compute comprehensive hashes
            hashes = compute_comprehensive_hash(cert.rendered_pdf_path)
            if not hashes:
                print(f"  ❌ Failed to compute hashes")
                continue
            
            # Store in hash database
            hash_database[cert.id] = {
                'cert_id': cert.id,
                'student_name': cert.student_name,
                'course_name': cert.course_name,
                'pdf_path': cert.rendered_pdf_path,
                'hashes': hashes,
                'stored_content_hash': cert.content_hash
            }
            
            print(f"  ✅ Text hash: {hashes['text_hash'][:16]}...")
            print(f"  ✅ Binary hash: {hashes['binary_hash'][:16]}...")
            print(f"  ✅ Normalized hash: {hashes['normalized_hash'][:16]}...")
            
            # Update database with comprehensive hashes if needed
            if not cert.content_hash:
                cert.content_hash = hashes['normalized_hash']
                print(f"  📝 Updated content_hash in database")
        
        db.commit()
        
        print(f"\n✅ Hash database built with {len(hash_database)} certificates")
        return hash_database
        
    finally:
        db.close()

def verify_uploaded_certificate(uploaded_pdf_path, hash_database):
    """
    Verify an uploaded certificate against the hash database.
    Returns detailed verification results.
    """
    print(f"\n🔍 Verifying uploaded certificate: {uploaded_pdf_path}")
    print("-" * 40)
    
    # Compute hashes for uploaded file
    uploaded_hashes = compute_comprehensive_hash(uploaded_pdf_path)
    if not uploaded_hashes:
        return {
            'is_valid': False,
            'reason': 'Failed to compute hashes for uploaded file',
            'matches': []
        }
    
    print(f"Uploaded text hash: {uploaded_hashes['text_hash'][:16]}...")
    print(f"Uploaded binary hash: {uploaded_hashes['binary_hash'][:16]}...")
    print(f"Uploaded normalized hash: {uploaded_hashes['normalized_hash'][:16]}...")
    
    # Check against all certificates in database
    matches = []
    
    for cert_id, cert_data in hash_database.items():
        cert_hashes = cert_data['hashes']
        
        # Check different types of matches
        text_match = uploaded_hashes['text_hash'] == cert_hashes['text_hash']
        binary_match = uploaded_hashes['binary_hash'] == cert_hashes['binary_hash']
        normalized_match = uploaded_hashes['normalized_hash'] == cert_hashes['normalized_hash']
        
        if text_match or binary_match or normalized_match:
            match_info = {
                'cert_id': cert_id,
                'student_name': cert_data['student_name'],
                'course_name': cert_data['course_name'],
                'text_match': text_match,
                'binary_match': binary_match,
                'normalized_match': normalized_match,
                'match_type': []
            }
            
            if text_match:
                match_info['match_type'].append('text')
            if binary_match:
                match_info['match_type'].append('binary')
            if normalized_match:
                match_info['match_type'].append('normalized')
            
            matches.append(match_info)
            
            print(f"✅ MATCH FOUND: {cert_id}")
            print(f"   Student: {cert_data['student_name']}")
            print(f"   Course: {cert_data['course_name']}")
            print(f"   Match types: {', '.join(match_info['match_type'])}")
    
    if matches:
        # Certificate found in database - it's valid
        best_match = matches[0]  # Take first match
        return {
            'is_valid': True,
            'reason': 'Certificate found in database',
            'matches': matches,
            'cert_id': best_match['cert_id'],
            'student_name': best_match['student_name'],
            'course_name': best_match['course_name']
        }
    else:
        # No matches found - certificate is tampered or fake
        print("❌ NO MATCHES FOUND")
        print("This certificate is either:")
        print("1. Tampered/modified after issuance")
        print("2. Not issued by this system")
        print("3. Corrupted during transfer")
        
        return {
            'is_valid': False,
            'reason': 'Certificate not found in database - likely tampered or fake',
            'matches': [],
            'uploaded_hashes': uploaded_hashes
        }

def enhanced_verification_test():
    """
    Test the enhanced verification system.
    """
    print("🚀 ENHANCED HASH VERIFICATION TEST")
    print("=" * 60)
    
    # Step 1: Build hash database
    hash_db = build_certificate_hash_database()
    
    if not hash_db:
        print("❌ No certificates found in database")
        return
    
    # Step 2: Test with known files
    test_files = [
        'VALID_CERTIFICATE.pdf',
        'TAMPERED_CERTIFICATE.pdf',
        'FRESH_TAMPERED.pdf',
        'manually_edited.pdf'
    ]
    
    print(f"\n🧪 Testing {len(test_files)} files...")
    print("=" * 60)
    
    for test_file in test_files:
        if not os.path.exists(test_file):
            print(f"⚠️  {test_file} not found, skipping...")
            continue
        
        print(f"\n📄 Testing: {test_file}")
        result = verify_uploaded_certificate(test_file, hash_db)
        
        print(f"Result: {'✅ VALID' if result['is_valid'] else '❌ INVALID'}")
        print(f"Reason: {result['reason']}")
        
        if result['matches']:
            print(f"Matches: {len(result['matches'])}")
            for match in result['matches']:
                print(f"  - {match['cert_id']} ({', '.join(match['match_type'])} match)")
    
    # Step 3: Save hash database for future use
    import json
    with open('certificate_hash_database.json', 'w') as f:
        # Convert to JSON-serializable format
        json_db = {}
        for cert_id, data in hash_db.items():
            json_db[cert_id] = {
                'cert_id': data['cert_id'],
                'student_name': data['student_name'],
                'course_name': data['course_name'],
                'pdf_path': data['pdf_path'],
                'text_hash': data['hashes']['text_hash'],
                'binary_hash': data['hashes']['binary_hash'],
                'normalized_hash': data['hashes']['normalized_hash'],
                'structure_hash': data['hashes']['structure_hash']
            }
        json.dump(json_db, f, indent=2)
    
    print(f"\n💾 Hash database saved to: certificate_hash_database.json")
    print(f"📊 Database contains {len(hash_db)} certificates")

if __name__ == "__main__":
    enhanced_verification_test()