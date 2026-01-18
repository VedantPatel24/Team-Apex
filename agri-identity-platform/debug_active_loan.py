
import sys
import os
from datetime import datetime, timedelta

# Add backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.api import deps
from app.models.farmer import Farmer
from app.models.service import Service
from app.models.document import Document
from app.models.consent import Consent
from app.models.loan_application import LoanApplication
from app.core.config import settings

# Setup DB
engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def debug_loan_flow():
    print("--- STARTING DEBUG ---")
    
    # 1. Get Farmer
    farmer = db.query(Farmer).first()
    if not farmer:
        print("❌ No Farmer found. Please register one first.")
        return
    print(f"✅ Found Farmer ID: {farmer.id} ({farmer.phone_number})")
    
    # 2. Get Service
    service = db.query(Service).filter(Service.id == 1).first()
    if not service:
        print("❌ Service ID 1 not found.")
        # Print all services
        services = db.query(Service).all()
        print(f"Available Services: {[(s.id, s.name) for s in services]}")
        return
    print(f"✅ Found Service ID: {service.id} ({service.name})")

    # 3. Get Documents (Fake selection)
    docs = db.query(Document).filter(Document.farmer_id == farmer.id).all()
    if not docs:
        print("❌ No documents for this farmer.")
        return
    
    doc_ids = [d.id for d in docs]
    print(f"✅ Found Documents: {doc_ids}")

    # 4. Try Consent Creation
    print("Attempting to create/update Consent...")
    try:
        new_consent = Consent(
            farmer_id=farmer.id,
            service_id=service.id,
            granted_scopes=["documents"],
            expires_at=datetime.utcnow() + timedelta(days=30),
            is_active=True
        )
        db.add(new_consent)
        db.commit()
        print(f"✅ Consent Created! ID: {new_consent.id}")
    except Exception as e:
        print(f"❌ Consent Creation Failed: {e}")
        db.rollback()
        return

    # 5. Try Loan Application Creation
    print("Attempting to create Loan Application...")
    try:
        # Check snapshot format
        print(f"Snapshotting docs: {doc_ids}")
        
        loan_app = LoanApplication(
            farmer_id=farmer.id,
            service_id=service.id,
            status="PENDING",
            documents_snapshot=doc_ids # List[int]
        )
        db.add(loan_app)
        db.commit()
        print(f"✅ Loan Application Created! ID: {loan_app.id}")
    except Exception as e:
        print(f"❌ Loan Application Creation Failed: {e}")
        db.rollback()

    db.close()

if __name__ == "__main__":
    debug_loan_flow()
