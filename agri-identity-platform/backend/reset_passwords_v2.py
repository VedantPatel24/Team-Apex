
import sys
import os

# Add backend to path
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
# Import Base to ensure all models are registered
from app.db.base import Base
from app.models.admin import Admin
from app.models.service import Service # Explicitly import related models

def reset_passwords():
    db = SessionLocal()
    try:
        # Reset Loan Admin
        loan_admin = db.query(Admin).filter(Admin.username == "loan_admin").first()
        if loan_admin:
            loan_admin.password = "admin123"
            print(f"Reset password for {loan_admin.username} to 'admin123'")
        
        # Reset Advice Admin
        # Try both variants just in case
        usernames = ["AGRI_ADVISOR", "AGRI_ADVISOR_001"]
        for u in usernames:
            admin = db.query(Admin).filter(Admin.username == u).first()
            if admin:
                admin.password = "admin123"
                print(f"Reset password for {u} to 'admin123'")
            else:
                print(f"User {u} not found.")
            
        db.commit()
        print("Passwords updated successfully.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_passwords()
