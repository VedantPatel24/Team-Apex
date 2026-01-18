
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DB_SERVER = os.getenv("POSTGRES_SERVER", "localhost")
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "vedant4433")
DB_NAME = os.getenv("POSTGRES_DB", "agri_identity_db")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")

def reset_database():
    print("⚠️  STARTING DATABASE RESET & SEED ⚠️")
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_SERVER,
            port=DB_PORT
        )
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Read init.sql
        print("Reading init.sql...")
        with open("backend/init.sql", "r") as f:
            sql_script = f.read()
            
        print("Executing init.sql...")
        cursor.execute(sql_script)
        
        # Seed Data
        print("Seeding Agricultural Loan Service...")
        
        # 1. Create Service
        # Client ID/Secret are mock placeholders
        cursor.execute("""
            INSERT INTO service (name, description, client_id, client_secret, allowed_scopes, redirect_uri)
            VALUES (
                'Agricultural Loan Service', 
                'Apply for crop loans with automated document verification.',
                'loan_service_client_id',
                'infy_loan_secret_123',
                '["profile", "documents"]',
                'http://localhost:5173/callback'
            ) RETURNING id;
        """)
        service_id = cursor.fetchone()[0]
        
        # 2. Create Admin for this Service
        cursor.execute("""
            INSERT INTO admin (username, password, service_id)
            VALUES ('loan_admin', 'admin123', %s);
        """, (service_id,))
        
        print(f"✅ Database reset and seeded! Loan Service ID: {service_id}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Database Reset Failed: {e}")

if __name__ == "__main__":
    reset_database()
