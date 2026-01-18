
import psycopg2

def raw_update():
    try:
        conn = psycopg2.connect(
            dbname="agri_identity_db",
            user="postgres",
            password="vedant4433",
            host="localhost",
            port="5432"
        )
        cur = conn.cursor()
        print("Connected to DB.")
        
        cur.execute("ALTER TABLE document ADD COLUMN IF NOT EXISTS is_sensitive BOOLEAN DEFAULT FALSE;")
        conn.commit()
        print("Column added successfully (or already existed).")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    raw_update()
