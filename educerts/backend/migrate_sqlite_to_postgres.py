"""
Migrate data from SQLite to PostgreSQL.
Run this AFTER Docker is running to copy your local data to the Docker database.
"""
import sqlite3
from database import SessionLocal, engine
from models import Base, User, Certificate, DocumentRegistry, DigitalSignatureRecord
from passlib.context import CryptContext
from datetime import datetime

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def migrate():
    # Connect to SQLite
    sqlite_conn = sqlite3.connect('educerts.db')
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cursor = sqlite_conn.cursor()
    
    # Connect to PostgreSQL
    pg_db = SessionLocal()
    
    try:
        # Migrate users
        print("Migrating users...")
        sqlite_cursor.execute('SELECT * FROM users')
        for row in sqlite_cursor.fetchall():
            user_data = dict(row)
            existing = pg_db.query(User).filter(User.email == user_data['email']).first()
            if not existing:
                pg_user = User(
                    name=user_data['name'],
                    email=user_data['email'],
                    hashed_password=user_data['hashed_password'],
                    is_admin=bool(user_data['is_admin'])
                )
                pg_db.add(pg_user)
                print(f"  Added user: {user_data['name']} ({user_data['email']})")
            else:
                print(f"  Skipped existing user: {user_data['email']}")
        
        pg_db.commit()
        
        # Migrate certificates
        print("\nMigrating certificates...")
        sqlite_cursor.execute('SELECT * FROM certificates')
        for row in sqlite_cursor.fetchall():
            cert_data = dict(row)
            existing = pg_db.query(Certificate).filter(Certificate.id == cert_data['id']).first()
            if not existing:
                pg_cert = Certificate(
                    id=cert_data['id'],
                    recipient_name=cert_data['recipient_name'],
                    certificate_title=cert_data['certificate_title'],
                    issue_date=datetime.fromisoformat(cert_data['issue_date']) if cert_data.get('issue_date') else None,
                    issuer_name=cert_data.get('issuer_name'),
                    issuer_signature=cert_data.get('issuer_signature'),
                    certificate_hash=cert_data.get('certificate_hash'),
                    pdf_path=cert_data.get('pdf_path'),
                    status=cert_data.get('status', 'issued')
                )
                pg_db.add(pg_cert)
                print(f"  Added certificate: {cert_data['recipient_name']} - {cert_data['certificate_title']}")
            else:
                print(f"  Skipped existing certificate ID: {cert_data['id']}")
        
        pg_db.commit()
        
        # Migrate document_registry
        print("\nMigrating document registry...")
        sqlite_cursor.execute('SELECT * FROM document_registry')
        for row in sqlite_cursor.fetchall():
            reg_data = dict(row)
            existing = pg_db.query(DocumentRegistry).filter(DocumentRegistry.certificate_id == reg_data['certificate_id']).first()
            if not existing:
                pg_reg = DocumentRegistry(
                    certificate_id=reg_data['certificate_id'],
                    document_hash=reg_data['document_hash'],
                    registration_timestamp=datetime.fromisoformat(reg_data['registration_timestamp']) if reg_data.get('registration_timestamp') else None
                )
                pg_db.add(pg_reg)
                print(f"  Added registry entry for cert ID: {reg_data['certificate_id']}")
        
        pg_db.commit()
        
        # Migrate digital_signature_records
        print("\nMigrating signature records...")
        sqlite_cursor.execute('SELECT * FROM digital_signature_records')
        for row in sqlite_cursor.fetchall():
            sig_data = dict(row)
            existing = pg_db.query(DigitalSignatureRecord).filter(DigitalSignatureRecord.certificate_id == sig_data['certificate_id']).first()
            if not existing:
                pg_sig = DigitalSignatureRecord(
                    certificate_id=sig_data['certificate_id'],
                    signature=sig_data['signature'],
                    signed_at=datetime.fromisoformat(sig_data['signed_at']) if sig_data.get('signed_at') else None
                )
                pg_db.add(pg_sig)
                print(f"  Added signature record for cert ID: {sig_data['certificate_id']}")
        
        pg_db.commit()
        
        print("\n✅ Migration complete!")
        
        # Show summary
        print("\nPostgreSQL summary:")
        print(f"  Users: {pg_db.query(User).count()}")
        print(f"  Certificates: {pg_db.query(Certificate).count()}")
        print(f"  Document registry entries: {pg_db.query(DocumentRegistry).count()}")
        print(f"  Signature records: {pg_db.query(DigitalSignatureRecord).count()}")
        
    except Exception as e:
        print(f"\n❌ Error during migration: {e}")
        pg_db.rollback()
        raise
    finally:
        sqlite_conn.close()
        pg_db.close()

if __name__ == "__main__":
    migrate()
