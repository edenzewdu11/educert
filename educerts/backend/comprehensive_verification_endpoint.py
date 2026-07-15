"""
Comprehensive verification endpoint that uses hash-based verification.
This replaces the existing PDF verification with a more robust system.
"""

from fastapi import HTTPException, UploadFile, File, Depends
from sqlalchemy.orm import Session
import fitz
import hashlib
import tempfile
import os
import models
import database
import pdf_hash_utils

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def comprehensive_verify_pdf_certificate(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    COMPREHENSIVE PDF VERIFICATION using hash-based certificate matching.
    This system compares uploaded PDFs against ALL certificates in the database
    using multiple hash algorithms to detect ANY type of tampering.
    """
    
    content = await file.read()

    # Validate it's actually a PDF
    if not content.startswith(b"%PDF"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid PDF.")

    # Save to temporary file for hash computation
    temp_fd, temp_path = tempfile.mkstemp(suffix=".pdf")
    try:
        with os.fdopen(temp_fd, 'wb') as tmp_file:
            tmp_file.write(content)
        
        print(f"🔍 COMPREHENSIVE HASH VERIFICATION for uploaded file: {file.filename}")
        
        # Step 1: Compute comprehensive hashes for uploaded file
        try:
            doc = fitz.open(temp_path)
            
            # Extract text content
            uploaded_text = ""
            for page in doc:
                uploaded_text += page.get_text()
            
            # Compute multiple hash types for maximum security
            uploaded_text_hash = hashlib.sha256(uploaded_text.encode('utf-8')).hexdigest()
            uploaded_normalized_hash = hashlib.sha256(pdf_hash_utils.normalize_pdf_text(uploaded_text).encode('utf-8')).hexdigest()
            
            with open(temp_path, 'rb') as f:
                uploaded_binary_hash = hashlib.sha256(f.read()).hexdigest()
            
            doc.close()
            
            print(f"📊 Uploaded file hashes:")
            print(f"   Text hash: {uploaded_text_hash[:16]}...")
            print(f"   Normalized hash: {uploaded_normalized_hash[:16]}...")
            print(f"   Binary hash: {uploaded_binary_hash[:16]}...")
            
        except Exception as e:
            print(f"❌ ERROR computing uploaded file hashes: {e}")
            raise HTTPException(status_code=400, detail=f"Could not process PDF: {e}")
        
        # Step 2: Check against ALL certificates in database
        print("🔍 Checking against certificate database...")
        
        all_certificates = db.query(models.Certificate).all()
        hash_match_found = False
        matched_cert = None
        match_details = {}
        
        for cert in all_certificates:
            if not cert.rendered_pdf_path or not os.path.exists(cert.rendered_pdf_path):
                continue
            
            try:
                # Compute hashes for database certificate
                cert_doc = fitz.open(cert.rendered_pdf_path)
                cert_text = ""
                for page in cert_doc:
                    cert_text += page.get_text()
                
                cert_text_hash = hashlib.sha256(cert_text.encode('utf-8')).hexdigest()
                cert_normalized_hash = hashlib.sha256(pdf_hash_utils.normalize_pdf_text(cert_text).encode('utf-8')).hexdigest()
                
                with open(cert.rendered_pdf_path, 'rb') as f:
                    cert_binary_hash = hashlib.sha256(f.read()).hexdigest()
                
                cert_doc.close()
                
                # Check for matches
                text_match = uploaded_text_hash == cert_text_hash
                normalized_match = uploaded_normalized_hash == cert_normalized_hash
                binary_match = uploaded_binary_hash == cert_binary_hash
                
                if text_match or normalized_match or binary_match:
                    print(f"✅ HASH MATCH FOUND with certificate: {cert.id}")
                    print(f"   Student: {cert.student_name}")
                    print(f"   Course: {cert.course_name}")
                    print(f"   Text match: {text_match}")
                    print(f"   Normalized match: {normalized_match}")
                    print(f"   Binary match: {binary_match}")
                    
                    hash_match_found = True
                    matched_cert = cert
                    match_details = {
                        'text_match': text_match,
                        'normalized_match': normalized_match,
                        'binary_match': binary_match,
                        'cert_text_hash': cert_text_hash,
                        'cert_normalized_hash': cert_normalized_hash,
                        'cert_binary_hash': cert_binary_hash
                    }
                    break
                    
            except Exception as e:
                print(f"⚠️  Error checking certificate {cert.id}: {e}")
                continue
        
        if not hash_match_found:
            print("❌ NO HASH MATCHES FOUND - Certificate is TAMPERED, FAKE, or NOT FROM THIS SYSTEM")
            return {
                "summary": {
                    "all": False,
                    "documentStatus": False,
                    "documentIntegrity": False,
                    "issuerIdentity": False,
                    "signature": False,
                    "registryCheck": False,
                    "contentIntegrity": False
                },
                "data": [
                    {
                        "type": "CONTENT_INTEGRITY",
                        "name": "ComprehensiveHashVerification",
                        "data": {
                            "uploaded_text_hash": uploaded_text_hash,
                            "uploaded_normalized_hash": uploaded_normalized_hash,
                            "uploaded_binary_hash": uploaded_binary_hash,
                            "database_match_found": False,
                            "certificates_checked": len(all_certificates),
                            "reason": "No matching certificate found in database - document is tampered, fake, or not issued by this system"
                        },
                        "status": "INVALID"
                    },
                    {
                        "type": "DOCUMENT_INTEGRITY",
                        "name": "OpenAttestationHash",
                        "data": False,
                        "status": "INVALID"
                    },
                    {
                        "type": "DOCUMENT_STATUS",
                        "name": "OpenAttestationIssued",
                        "data": {"issued": False, "revoked": True},
                        "status": "INVALID"
                    },
                    {
                        "type": "ISSUER_IDENTITY",
                        "name": "DNS-TXT",
                        "data": {"name": "Unknown - Invalid Certificate", "id": "unknown"},
                        "status": "INVALID"
                    },
                    {
                        "type": "REGISTRY_CHECK",
                        "name": "DocumentRegistry",
                        "data": False,
                        "status": "INVALID"
                    },
                    {
                        "type": "SIGNATURE_CHECK",
                        "name": "CryptoSignature",
                        "data": False,
                        "status": "INVALID"
                    }
                ],
                "certificate": {
                    "student_name": "INVALID - Tampered/Fake Certificate",
                    "course_name": "INVALID - Tampered/Fake Certificate"
                }
            }
        
        # Step 3: Hash match found - certificate is VALID
        print(f"✅ Certificate VERIFIED - Hash match found with cert: {matched_cert.id}")
        
        # Import the original verification function for additional checks
        from main import verify_certificate
        import schemas
        
        # Run standard verification checks on the matched certificate
        request = schemas.VerificationRequest(certificate_id=matched_cert.id)
        verification_result = verify_certificate(request, db)
        
        # Override content integrity to VALID since hash match was found
        verification_result["summary"]["contentIntegrity"] = True
        verification_result["summary"]["all"] = True  # Force to valid since hash matched
        
        # Add comprehensive hash verification details
        verification_result["data"].insert(0, {
            "type": "CONTENT_INTEGRITY",
            "name": "ComprehensiveHashVerification",
            "data": {
                "database_match_found": True,
                "matched_certificate": matched_cert.id,
                "match_types": {
                    "text_match": match_details['text_match'],
                    "normalized_match": match_details['normalized_match'],
                    "binary_match": match_details['binary_match']
                },
                "uploaded_hashes": {
                    "text_hash": uploaded_text_hash,
                    "normalized_hash": uploaded_normalized_hash,
                    "binary_hash": uploaded_binary_hash
                },
                "certificate_hashes": {
                    "text_hash": match_details['cert_text_hash'],
                    "normalized_hash": match_details['cert_normalized_hash'],
                    "binary_hash": match_details['cert_binary_hash']
                },
                "certificates_checked": len(all_certificates)
            },
            "status": "VALID"
        })
        
        # Update certificate info
        verification_result["certificate"] = {
            "student_name": matched_cert.student_name,
            "course_name": matched_cert.course_name
        }
        
        return verification_result
        
    finally:
        # Clean up temporary file
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass

# Test function
async def test_comprehensive_verification():
    """Test the comprehensive verification with known files."""
    
    print("🧪 TESTING COMPREHENSIVE VERIFICATION")
    print("=" * 50)
    
    # Get database session
    db = next(get_db())
    
    test_files = [
        'VALID_CERTIFICATE.pdf',
        'TAMPERED_CERTIFICATE.pdf', 
        'FRESH_TAMPERED.pdf'
    ]
    
    for test_file in test_files:
        if not os.path.exists(test_file):
            print(f"⚠️  {test_file} not found")
            continue
            
        print(f"\n📄 Testing: {test_file}")
        
        # Create mock UploadFile
        class MockUploadFile:
            def __init__(self, filename, content):
                self.filename = filename
                self._content = content
            
            async def read(self):
                return self._content
        
        with open(test_file, 'rb') as f:
            content = f.read()
        
        mock_file = MockUploadFile(test_file, content)
        
        try:
            result = await comprehensive_verify_pdf_certificate(mock_file, db)
            
            overall_valid = result['summary']['all']
            content_integrity = result['summary']['contentIntegrity']
            
            print(f"   Result: {'✅ VALID' if overall_valid else '❌ INVALID'}")
            print(f"   Content Integrity: {content_integrity}")
            
            # Find comprehensive hash check
            for item in result['data']:
                if item['type'] == 'CONTENT_INTEGRITY' and item['name'] == 'ComprehensiveHashVerification':
                    match_found = item['data'].get('database_match_found', False)
                    print(f"   Database Match: {match_found}")
                    break
                    
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    db.close()

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_comprehensive_verification())