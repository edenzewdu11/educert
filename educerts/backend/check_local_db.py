import sqlite3

conn = sqlite3.connect('educerts.db')
cursor = conn.cursor()

# List tables
cursor.execute('SELECT name FROM sqlite_master WHERE type="table"')
tables = [row[0] for row in cursor.fetchall()]
print('Tables:', tables)

# Count certificates
if 'certificates' in tables:
    cursor.execute('SELECT COUNT(*) FROM certificates')
    cert_count = cursor.fetchone()[0]
    print(f'Certificates count: {cert_count}')
    
    if cert_count > 0:
        cursor.execute('SELECT id, recipient_name, certificate_title FROM certificates LIMIT 5')
        print('Sample certificates:')
        for row in cursor.fetchall():
            print(f'  ID: {row[0]}, Recipient: {row[1]}, Title: {row[2]}')

# Count users
if 'users' in tables:
    cursor.execute('SELECT COUNT(*) FROM users')
    user_count = cursor.fetchone()[0]
    print(f'Users count: {user_count}')
    
    cursor.execute('SELECT id, name, email, is_admin FROM users')
    print('Users:')
    for row in cursor.fetchall():
        print(f'  ID: {row[0]}, Name: {row[1]}, Email: {row[2]}, Admin: {row[3]}')

conn.close()
