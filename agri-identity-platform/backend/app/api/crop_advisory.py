from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.auth import get_db
from app.api import deps
from app.models.crop_advisory import CropAdvisory
from app.models.service import Service
from app.models.farmer import Farmer
from app.models.document import Document
from app.models.consent import Consent
from app.schemas.all import CropAdvisoryCreate, CropAdvisoryResponse, ServiceResponse
from pydantic import BaseModel

router = APIRouter()

# --- Configuration ---
SERVICE_ID_STR = "CROP_ADVISORY_001"

# --- Farmer Endpoints ---

@router.post("/apply", response_model=CropAdvisoryResponse)
def get_crop_advisory(
    application: CropAdvisoryCreate,
    db: Session = Depends(get_db),
    current_farmer_id: int = Depends(deps.get_current_user_id)
):
    # 1. Verify Service Exists
    service = db.query(Service).filter(Service.id == application.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    # 2. Check Farmer Profile (Mandatory Data: Location)
    farmer = db.query(Farmer).filter(Farmer.id == current_farmer_id).first()
    if not farmer or not farmer.location:
        raise HTTPException(
            status_code=400, 
            detail="Profile incomplete: Location (Village / Region) is required. Please update your profile."
        )

    # 3. Check for Existing Active Request (Optional but good practice)
    # Allow new request if previous is completed? Yes.
    existing = db.query(CropAdvisory).filter(
        CropAdvisory.farmer_id == current_farmer_id,
        CropAdvisory.service_id == application.service_id,
        CropAdvisory.status == "PENDING"
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="You already have a pending advisory request.")

    # 4. Create Consent (Short-lived, e.g., 7 Days as per prompt)
    # Check if active consent exists, else create
    existing_consent = db.query(Consent).filter(
        Consent.farmer_id == current_farmer_id,
        Consent.service_id == application.service_id,
        Consent.is_active == True
    ).first()

    if not existing_consent:
        new_consent = Consent(
            farmer_id=current_farmer_id,
            service_id=application.service_id,
            granted_scopes=["location", "crop_data"], 
            expires_at=datetime.utcnow() + timedelta(days=7),
            is_active=True
        )
        db.add(new_consent)

    # 5. Validate Optional Document (Soil Health)
    if application.soil_health_doc_id:
        doc = db.query(Document).filter(
            Document.id == application.soil_health_doc_id,
            Document.farmer_id == current_farmer_id
        ).first()
        if not doc:
            raise HTTPException(status_code=400, detail="Invalid Soil Health Document ID")

    # 6. Create Advisory Request
    new_advisory = CropAdvisory(
        farmer_id=current_farmer_id,
        service_id=application.service_id,
        location=farmer.location, # Snapshotting it
        crop_name=application.crop_name,
        season=application.season,
        irrigation_type=application.irrigation_type,
        last_yield=application.last_yield,
        soil_health_doc_id=application.soil_health_doc_id,
        status="PENDING"
    )
    db.add(new_advisory)
    db.commit()
    db.refresh(new_advisory)
    
    return new_advisory

@router.get("/my-requests", response_model=List[CropAdvisoryResponse])
def my_advisory_requests(
    db: Session = Depends(get_db),
    current_farmer_id: int = Depends(deps.get_current_user_id)
):
    return db.query(CropAdvisory).filter(CropAdvisory.farmer_id == current_farmer_id).all()

@router.post("/revoke/{request_id}")
def revoke_advisory_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_farmer_id: int = Depends(deps.get_current_user_id)
):
    req = db.query(CropAdvisory).filter(
        CropAdvisory.id == request_id,
        CropAdvisory.farmer_id == current_farmer_id
    ).first()
    
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    if req.status != "PENDING":
        raise HTTPException(status_code=400, detail="Cannot revoke a request that is already processed.")

    req.status = "WITHDRAWN"
    
    # Revoke consent
    consent = db.query(Consent).filter(
        Consent.farmer_id == current_farmer_id,
        Consent.service_id == req.service_id,
        Consent.is_active == True
    ).first()
    
    if consent:
        consent.is_active = False
        
    db.commit()
    return {"message": "Advisory request withdrawn successfully"}


# --- Admin Endpoints ---

class AdvisoryResponseInput(BaseModel):
    recommendation: str
    fertilizer_plan: str
    sowing_schedule: str

from sqlalchemy.orm import joinedload

@router.get("/admin/requests", response_model=List[CropAdvisoryResponse])
def list_all_requests(
    db: Session = Depends(get_db),
    admin: deps.AdminContext = Depends(deps.get_current_admin)
):
    # Enforce Domain Separation
    advisories = db.query(CropAdvisory).options(joinedload(CropAdvisory.farmer)).filter(CropAdvisory.service_id == admin.service_id).all()
    
    results = []
    for a in advisories:
        a_dict = CropAdvisoryResponse.from_orm(a)
        if a.farmer:
            a_dict.farmer_name = a.farmer.full_name
        results.append(a_dict)
    return results

@router.post("/admin/advise/{request_id}")
def provide_advisory(
    request_id: int,
    advice: AdvisoryResponseInput,
    db: Session = Depends(get_db),
    admin: deps.AdminContext = Depends(deps.get_current_admin)
):
    req = db.query(CropAdvisory).filter(CropAdvisory.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    if req.service_id != admin.service_id:
        raise HTTPException(status_code=403, detail="Access Denied: Domain mismatch")
        
    req.recommendation = advice.recommendation
    req.fertilizer_plan = advice.fertilizer_plan
    req.sowing_schedule = advice.sowing_schedule
    req.status = "ADVISED"
    
    # Log Access?
    
    db.commit()
    return {"message": "Advisory provided successfully"}

@router.get("/admin/document/{doc_id}")
def get_document_details(
    doc_id: int,
    db: Session = Depends(get_db),
    admin: deps.AdminContext = Depends(deps.get_current_admin)
):
    # 1. Fetch Document
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # 2. Get Service ID
    # 2. Check Service ID matches Admin Domain
    # The document itself doesn't have a service_id, but the context does.
    # However, to view a document, it must be related to a request in this domain.
    # OR the admin acts on behalf of the service.
    # Logic: Verify if ANY active consent exists for this farmer + this admin's service.
    
    # Check Active Consent for THIS service
    consent = db.query(Consent).filter(
        Consent.farmer_id == doc.farmer_id,
        Consent.service_id == admin.service_id, # Must match admin's service
        Consent.is_active == True
    ).first()

    if not consent:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access Denied: Farmer has revoked consent."
        )

    # 4. Check Expiry
    if consent.expires_at and consent.expires_at < datetime.utcnow():
         raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access Denied: Consent has expired."
        )
        
    return {
        "id": doc.id,
        "filename": doc.filename,
        "storage_path": doc.storage_path,
        "doc_type": doc.doc_type
    }
