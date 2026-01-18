
import sys
import os

# Add backend to path
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.models.admin import Admin

def reset_passwords():
    db = SessionLocal()
    try:
        # Reset Loan Admin
        loan_admin = db.query(Admin).filter(Admin.username == "loan_admin").first()
        if loan_admin:
            loan_admin.password = "admin123"
            print(f"Reset password for {loan_admin.username} to 'admin123'")
        
        # Reset Advisory Admin
        advisory_admin = db.query(Admin).filter(Admin.username == "AGRI_ADVISOR").first()
        if advisory_admin:
            advisory_admin.password = "admin123"
            print(f"Reset password for {advisory_admin.username} to 'admin123'")
        else:
            print("User AGRI_ADVISOR not found!")
            
        db.commit()
        print("Passwords updated successfully.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_passwords()
