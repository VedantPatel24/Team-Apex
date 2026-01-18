from sqlalchemy import create_engine, text

# Hardcoded connection string for debugging
DATABASE_URL = "postgresql://postgres:vedant4433@localhost:5432/agri_identity_db"

def debug_db():
    print("--- SHORT DEBUG ---")
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as connection:
            print("Farmers:")
            result = connection.execute(text("SELECT id, full_name FROM farmer"))
            for f in result:
                print(f"F: {f[0]} {f[1]}")
            
            print("\nLoans:")
            result = connection.execute(text("SELECT id, farmer_id, status FROM loan_application"))
            for l in result:
                print(f"L: {l[0]} u={l[1]} s={l[2]}")

    except Exception as e:
        print(f"Err: {e}")

if __name__ == "__main__":
    debug_db()
