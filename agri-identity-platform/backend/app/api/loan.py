
from typing import List, Dict
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.auth import get_db
from app.api import deps
from app.models.loan_application import LoanApplication
from app.models.service import Service
from app.models.farmer import Farmer
from app.models.document import Document
from app.models.admin import Admin
from app.models.consent import Consent
from app.schemas.all import LoanApplicationCreate, LoanApplicationResponse, ServiceResponse, AdminLogin
from app.core.security import create_access_token

router = APIRouter()

# --- Configuration ---
MANDATORY_DOCS = ["IDENTITY", "LAND_RECORD", "CROP_DETAILS"]
OPTIONAL_DOCS = ["BANK_STATEMENT", "LOAN_HISTORY", "SOIL_CARD"]

# --- Public / Farmer Endpoints ---

@router.get("/services", response_model=List[ServiceResponse])
def list_services(db: Session = Depends(get_db)):
    """List all available services"""
    return db.query(Service).filter(Service.is_active == True).all()

@router.get("/requirements")
def get_loan_requirements():
    """Return mandatory and optional document types"""
    return {
        "mandatory": MANDATORY_DOCS,
        "optional": OPTIONAL_DOCS
    }

@router.post("/apply", response_model=LoanApplicationResponse)
def apply_for_loan(
    application: LoanApplicationCreate,
    db: Session = Depends(get_db),
    current_farmer_id: int = Depends(deps.get_current_user_id) 
):
    # 1. Verify Service Exists
    service = db.query(Service).filter(Service.id == application.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    # 2. Fetch Selected Documents
    documents = db.query(Document).filter(
        Document.id.in_(application.document_ids),
        Document.farmer_id == current_farmer_id
    ).all()

    if len(documents) != len(application.document_ids):
         raise HTTPException(status_code=400, detail="Some documents were not found or do not belong to you.")

    # 3. Check Mandatory Requirements
    uploaded_types = {doc.doc_type for doc in documents}
    missing_mandatory = [dtype for dtype in MANDATORY_DOCS if dtype not in uploaded_types]
    
    if missing_mandatory:
        raise HTTPException(
            status_code=400, 
            detail=f"Missing mandatory documents: {', '.join(missing_mandatory)}"
        )

    # 4. Create Consent (30 Days Expiry)
    # Check if active consent exists, if so update it, else create new
    existing_consent = db.query(Consent).filter(
        Consent.farmer_id == current_farmer_id,
        Consent.service_id == application.service_id,
        Consent.is_active == True
    ).first()

    if existing_consent:
        # Extend expiry? Or just leave it? Let's refresh it.
        existing_consent.expires_at = datetime.utcnow() + timedelta(days=30)
    else:
        new_consent = Consent(
            farmer_id=current_farmer_id,
            service_id=application.service_id,
            granted_scopes=["documents"], # Broad scope, but app logic restricts to snapshot
            expires_at=datetime.utcnow() + timedelta(days=30),
            is_active=True
        )
        db.add(new_consent)
    
    # 5. Create Application
    try:
        db_application = LoanApplication(
            farmer_id=current_farmer_id,
            service_id=application.service_id,
            status="PENDING",
            documents_snapshot=application.document_ids
        )
        db.add(db_application)
        db.commit()
        db.refresh(db_application)
        return db_application
    except Exception as e:
        print(f"❌ ERROR Creating Loan Application: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database Error: {str(e)}")

@router.get("/my-applications", response_model=List[LoanApplicationResponse])
def my_applications(
    db: Session = Depends(get_db),
    current_farmer_id: int = Depends(deps.get_current_user_id)
):
    return db.query(LoanApplication).filter(LoanApplication.farmer_id == current_farmer_id).all()


@router.post("/revoke/{application_id}")
def revoke_document_access(
    application_id: int,
    doc_id: int,
    db: Session = Depends(get_db),
    current_farmer_id: int = Depends(deps.get_current_user_id)
):
    """
    Simulates revoking access to a specific document within an application.
    In a real system, we'd remove the ID from the `documents_snapshot` list 
    or have a fine-grained Consent-Document link table.
    
    For this implementation: We remove the doc_id from the application's snapshot.
    """
    app = db.query(LoanApplication).filter(
        LoanApplication.id == application_id, 
        LoanApplication.farmer_id == current_farmer_id
    ).first()
    
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    current_snapshot = list(app.documents_snapshot) # Copy
    if doc_id in current_snapshot:
        current_snapshot.remove(doc_id)
        app.documents_snapshot = current_snapshot
        
        # If mandatory doc is removed, maybe auto-reject?
        # For now, just change status to "PENDING - REVOKED" for admin awareness
        app.status = "PENDING_REVOKED" 
        
        db.commit()
        return {"message": "Access to document revoked successfully"}
    
    return {"message": "Document was not part of this application"}


# --- Admin Endpoints ---

@router.post("/admin/login")
def admin_login(login_data: AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.username == login_data.username).first()
    if not admin or admin.password != login_data.password:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    
    access_token = create_access_token(
        subject=admin.id,
        claims={"scope": "admin", "service_id": admin.service_id}
    )
    return {"access_token": access_token, "token_type": "bearer", "service_id": admin.service_id}

@router.get("/admin/applications", response_model=List[LoanApplicationResponse])
def list_all_applications(db: Session = Depends(get_db)):
    return db.query(LoanApplication).all()

@router.get("/admin/application/{application_id}/documents")
def get_application_documents(
    application_id: int,
    db: Session = Depends(get_db)
):
    """
    Admin View: Fetch documents for a specific application.
    MUST check if Consent is still valid!
    """
    app = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
    if not app:
         raise HTTPException(status_code=404, detail="Application not found")

    # Check Consent
    consent = db.query(Consent).filter(
        Consent.farmer_id == app.farmer_id,
        Consent.service_id == app.service_id,
        Consent.is_active == True,
        Consent.expires_at > datetime.utcnow()
    ).first()

    if not consent:
        raise HTTPException(status_code=403, detail="Consent expired or revoked by farmer")

    # Fetch Documents found in snapshot
    doc_ids = app.documents_snapshot
    documents = db.query(Document).filter(Document.id.in_(doc_ids)).all()
    
    return documents

@router.post("/admin/decide/{application_id}")
def decide_application(
    application_id: int,
    status: str, 
    db: Session = Depends(get_db)
):
    app = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    app.status = status
    db.commit()
    return {"message": f"Application {status}"}
