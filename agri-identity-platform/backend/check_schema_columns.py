
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DB_SERVER = os.getenv("POSTGRES_SERVER", "localhost")
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "vedant4433")
DB_NAME = os.getenv("POSTGRES_DB", "agri_identity_db")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")

def check_schema():
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_SERVER,
            port=DB_PORT
        )
        cur = conn.cursor()
        
        # Get columns for document table
        cur.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'document';
        """)
        columns = cur.fetchall()
        
        print("Columns in 'document' table:")
        found_doc_type = False
        for col in columns:
            print(f"- {col[0]} ({col[1]})")
            if col[0] == 'doc_type':
                found_doc_type = True
                
        if found_doc_type:
            print("\n✅ 'doc_type' column EXISTS.")
        else:
            print("\n❌ 'doc_type' column MISSING!")

        conn.close()
    except Exception as e:
        print(f"Error checking schema: {e}")

if __name__ == "__main__":
    check_schema()
