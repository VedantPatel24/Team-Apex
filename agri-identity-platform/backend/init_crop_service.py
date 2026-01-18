import psycopg2
import os
from dotenv import load_dotenv

# Load env from .env file
load_dotenv() 

DB_SERVER = os.getenv("POSTGRES_SERVER", "localhost")
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "vedant4433")
DB_NAME = os.getenv("POSTGRES_DB", "agri_identity_db")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")

def init_crop_service():
    print("🌱 Initializing Crop Advisory Service...")
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

        # 1. Update Farmer Table (Add location if missing)
        print("🔹 Updating Schema: Farmer Table...")
        try:
            cursor.execute("ALTER TABLE farmer ADD COLUMN IF NOT EXISTS location VARCHAR;")
            print("   ✅ info: Added 'location' column to Farmer.")
        except Exception as e:
            print(f"   ⚠️ info: {e}")

        # 2. Create Crop Advisory Table
        # We can use raw SQL to be sure, matching the SQLAlchemy model
        print("🔹 Updating Schema: Creating crop_advisory table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS crop_advisory (
                id SERIAL PRIMARY KEY,
                farmer_id INTEGER REFERENCES farmer(id),
                service_id INTEGER REFERENCES service(id),
                location VARCHAR NOT NULL,
                crop_name VARCHAR NOT NULL,
                season VARCHAR NOT NULL,
                irrigation_type VARCHAR,
                last_yield VARCHAR,
                soil_health_doc_id INTEGER REFERENCES document(id),
                status VARCHAR DEFAULT 'PENDING',
                recommendation TEXT,
                fertilizer_plan TEXT,
                sowing_schedule TEXT,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc'),
                updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc')
            );
        """)
        print("   ✅ crop_advisory table verified.")

        # 3. Seed Service
        print("🔹 Seeding Service Data...")
        client_id = "CROP_ADVISORY_001"
        cursor.execute("SELECT id FROM service WHERE client_id = %s", (client_id,))
        existing_service = cursor.fetchone()
        
        service_id = None
        if existing_service:
            service_id = existing_service[0]
            print(f"   ℹ️ Service {client_id} already exists (ID: {service_id}).")
        else:
            cursor.execute("""
                INSERT INTO service (name, description, client_id, client_secret, allowed_scopes, redirect_uri)
                VALUES (
                    'Crop Advisory Service', 
                    'Get expert crop recommendations based on location and season.',
                    %s,
                    'crop_secret_secure_123',
                    '["location", "crop_data"]',
                    'http://localhost:5173/advisory-callback'
                ) RETURNING id;
            """, (client_id,))
            service_id = cursor.fetchone()[0]
            print(f"   ✅ Created Service {client_id} (ID: {service_id}).")

        # 4. Seed Admin
        print("🔹 Seeding Admin Data...")
        admin_username = "AGRI_ADVISOR_001"
        cursor.execute("SELECT id FROM admin WHERE username = %s", (admin_username,))
        existing_admin = cursor.fetchone()
        
        if existing_admin:
            print(f"   ℹ️ Admin {admin_username} already exists.")
        else:
            cursor.execute("""
                INSERT INTO admin (username, password, service_id)
                VALUES (%s, 'admin123', %s);
            """, (admin_username, service_id))
            print(f"   ✅ Created Admin {admin_username}.")

        cursor.close()
        conn.close()
        print("🌱 Initialization Complete!")
        
    except Exception as e:
        print(f"❌ Initialization Failed: {e}")

if __name__ == "__main__":
    init_crop_service()
