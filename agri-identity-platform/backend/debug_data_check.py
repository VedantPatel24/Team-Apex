
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DB_SERVER = os.getenv("POSTGRES_SERVER", "localhost")
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "vedant4433")
DB_NAME = os.getenv("POSTGRES_DB", "agri_identity_db")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")

def check_data():
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_SERVER,
            port=DB_PORT
        )
        cur = conn.cursor()
        
        print("--- CHECKING DATA ---")

        # 1. Check Service
        cur.execute("SELECT id, name FROM service WHERE id = 1;")
        service = cur.fetchone()
        if service:
            print(f"✅ Service ID 1 Found: {service[1]}")
        else:
            print("❌ Service ID 1 NOT Found!")
            cur.execute("SELECT id, name FROM service;")
            all_services = cur.fetchall()
            print(f"   Available Services: {all_services}")

        # 2. Check Farmers
        cur.execute("SELECT id, phone_number, full_name FROM farmer;")
        farmers = cur.fetchall()
        print(f"✅ Farmers Found ({len(farmers)}):")
        for f in farmers:
            print(f"   - ID: {f[0]}, Name: {f[2]}, Phone: {f[1]}")

        # 3. Check Documents
        cur.execute("SELECT id, farmer_id, title, doc_type FROM document;")
        docs = cur.fetchall()
        print(f"✅ Documents Found ({len(docs)}):")
        for d in docs:
            print(f"   - ID: {d[0]}, Farmer: {d[1]}, Type: '{d[3]}', Title: {d[2]}")

        # 4. Check Loan Applications
        cur.execute("SELECT id, farmer_id, status FROM loan_application;")
        apps = cur.fetchall()
        if apps:
            print(f"✅ Loan Applications Found ({len(apps)}): {apps}")
        else:
            print("ℹ️  No Loan Applications yet.")

        conn.close()
    except Exception as e:
        print(f"Error checking data: {e}")

if __name__ == "__main__":
    check_data()
