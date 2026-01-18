from sqlalchemy import create_engine, text

# Hardcoded connection string for debugging
DATABASE_URL = "postgresql://postgres:vedant4433@localhost:5432/agri_identity_db"

def debug_dupe():
    print("--- Debugging Loan Duplicates ---")
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as connection:
            # Check Loan Applications
            print("\nChecking all loan_application rows:")
            result = connection.execute(text("SELECT id, farmer_id, status, service_id FROM loan_application"))
            loans = result.fetchall()
            for l in loans:
                print(f"Loan: ID={l[0]}, FarmerID={l[1]}, Status='{l[2]}', ServiceID={l[3]}")
                
            # Simulate the check
            print("\nSimulating Check for Farmer 1, Service 1:")
            check_sql = """
            SELECT id, status FROM loan_application 
            WHERE farmer_id = 1 AND service_id = 1 
            AND status IN ('PENDING', 'REQUEST_DOC', 'APPROVED')
            """
            result = connection.execute(text(check_sql))
            blocking_loans = result.fetchall()
            if blocking_loans:
                print(f"!!! BLOCKING LOANS FOUND: {blocking_loans}")
            else:
                print("No blocking loans found (Query allows new application).")

    except Exception as e:
        print(f"Error connecting to database: {e}")

if __name__ == "__main__":
    debug_dupe()
