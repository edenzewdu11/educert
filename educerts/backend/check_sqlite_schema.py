import sqlite3

conn = sqlite3.connect('educerts.db')
cursor = conn.cursor()

print("Users table columns:")
cursor.execute('PRAGMA table_info(users)')
for row in cursor.fetchall():
    print(f'  {row[1]} ({row[2]})')

print("\nCertificates table columns:")
cursor.execute('PRAGMA table_info(certificates)')
for row in cursor.fetchall():
    print(f'  {row[1]} ({row[2]})')

print("\nDocument registry table columns:")
cursor.execute('PRAGMA table_info(document_registry)')
for row in cursor.fetchall():
    print(f'  {row[1]} ({row[2]})')

print("\nDigital signature records table columns:")
cursor.execute('PRAGMA table_info(digital_signature_records)')
for row in cursor.fetchall():
    print(f'  {row[1]} ({row[2]})')

conn.close()
