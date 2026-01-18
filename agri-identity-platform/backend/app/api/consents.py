from fastapi import APIRouter, Depends, HTTPException, Header, Body
from sqlalchemy.orm import Session
from typing import List
from app.db.session import SessionLocal
from app.repositories import service_repo, consent_repo
from app.schemas.all import AuthorizationRequest, AuthorizationResponse, ConsentResponse, ActiveConsentResponse
from app.core.security import create_access_token
from app.models.consent import Consent
from app.models.service import Service
from app.api.data_access import get_current_user_and_scopes
import uuid

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/authorize", response_model=AuthorizationResponse)
def authorize_request(
    request: AuthorizationRequest, 
    db: Session = Depends(get_db)
):
    # 1. Verify Client ID
    service = service_repo.verify_client(db, request.client_id)
    if not service:
        raise HTTPException(status_code=400, detail="Invalid Client ID")
        
    # 2. Validate Scopes (Check if requested scopes are allowed for this service)
    requested_scopes = request.scope.split(" ")
    allowed = set(service.allowed_scopes)
    for s in requested_scopes:
        if s not in allowed:
            # In a strict mode, we might fail. For now, we just warn or filter?
            # Let's fail for security.
            raise HTTPException(status_code=400, detail=f"Scope '{s}' not allowed for this client")

    # 3. Generate a Request ID (In real flow, this would be a session or temp token)
    # We return details so Frontend can render "Service X wants access to Y"
    return {
        "auth_request_id": f"REQ-{uuid.uuid4().hex[:8]}", # Mock ID
        "service_name": service.name,
        "service_id": service.id,
        "requested_scopes": requested_scopes
    }

@router.post("/grant")
def grant_consent(
    request_id: str = Body(..., embed=True),
    farmer_id: int = Body(..., embed=True), # In real app, get from current logged-in user
    service_id: int = Body(..., embed=True),
    approved_scopes: List[str] = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    # 1. Save Consent
    consent = consent_repo.create_consent(db, farmer_id, service_id, approved_scopes)
    
    # 2. Generate Access Token immediately (Implicit-ish flow for simplicity)
    # This token is SPECIFIC to this interaction
    access_token = create_access_token(
        subject=farmer_id, 
        claims={
            "scope": " ".join(approved_scopes),
            "azp": str(service_id) # Authorized Party
        }
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "scope": " ".join(approved_scopes),
        "consent_id": consent.id
    }

@router.get("/active", response_model=List[ActiveConsentResponse])
def get_active_consents(
    context: dict = Depends(get_current_user_and_scopes),
    db: Session = Depends(get_db)
):
    farmer_id = context["user_id"]
    consents = db.query(Consent).join(Service).filter(
        Consent.farmer_id == farmer_id,
        Consent.is_active == True
    ).all()
    
    return [
        ActiveConsentResponse(
            id=c.id,
            service_name=c.service.name,
            granted_scopes=c.granted_scopes,
            created_at=c.created_at,
            service_id=c.service_id # Helper for frontend revocation
        ) for c in consents
    ]

@router.post("/revoke")
def revoke_consent_endpoint(
    service_id: int = Body(..., embed=True),
    context: dict = Depends(get_current_user_and_scopes),
    db: Session = Depends(get_db)
):
    farmer_id = context["user_id"]
    success = consent_repo.revoke_consent(db, farmer_id, service_id)
    if not success:
         raise HTTPException(status_code=404, detail="Consent not found or already revoked")
    
    # --- AUTO-REJECT LOGIC ---
    from app.models.loan_application import LoanApplication
    # Calculate how many rows updated
    updated_rows = db.query(LoanApplication).filter(
        LoanApplication.farmer_id == farmer_id,
        LoanApplication.service_id == service_id,
        LoanApplication.status.in_(["PENDING", "REQUEST_DOC"])
    ).update({
        "status": "REJECTED", 
        "admin_notes": "Automatically rejected due to consent revocation by user."
    }, synchronize_session=False)
    
    if updated_rows > 0:
        db.commit()
        print(f"Auto-rejected {updated_rows} loans for Farmer {farmer_id}")
    # -------------------------

    return {"message": "Access revoked successfully"}
