from app.db.session import SessionLocal
import app.db.base
from app.models.farmer import Farmer
from app.models.loan_application import LoanApplication

def debug_data():
    db = SessionLocal()
    print("\n=== DEBUG USERS & LOANS ===")
    
    farmers = db.query(Farmer).all()
    print(f"Total Farmers: {len(farmers)}")
    for f in farmers:
        loans = db.query(LoanApplication).filter(LoanApplication.farmer_id == f.id).all()
        print(f"User: {f.full_name} | ID: {f.id} | Phone: {f.phone_number} | Loans: {len(loans)}")
        for l in loans:
            print(f"  -> Loan ID: {l.id} | Status: {l.status} | ServiceID: {l.service_id}")
            
    print("===========================\n")
    db.close()

if __name__ == "__main__":
    debug_data()
