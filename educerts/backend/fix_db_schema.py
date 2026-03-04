import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

# Get database URL
db_url = os.getenv("DATABASE_URL")
# Parse connection string
# postgresql://postgres:eden111310@localhost:5432/educerts

conn = psycopg2.connect(db_url)
cursor = conn.cursor()

# Add missing column
try:
    cursor.execute("ALTER TABLE certificates ADD COLUMN IF NOT EXISTS content_hash TEXT;")
    conn.commit()
    print("Added content_hash column successfully!")
except Exception as e:
    print(f"Error: {e}")
    conn.rollback()

cursor.close()
conn.close()
