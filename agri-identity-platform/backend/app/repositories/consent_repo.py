from sqlalchemy.orm import Session
from datetime import datetime
from app.models.consent import Consent

def create_consent(db: Session, farmer_id: int, service_id: int, scopes: list):
    # Check if exists, deactivate old one
    existing = get_active_consent(db, farmer_id, service_id)
    if existing:
        existing.is_active = False
        existing.revoked_at = datetime.utcnow()
    
    consent = Consent(
        farmer_id=farmer_id,
        service_id=service_id,
        granted_scopes=scopes,
        is_active=True
    )
    db.add(consent)
    db.commit()
    db.refresh(consent)
    return consent

def get_active_consent(db: Session, farmer_id: int, service_id: int):
    return db.query(Consent).filter(
        Consent.farmer_id == farmer_id,
        Consent.service_id == service_id,
        Consent.is_active == True
    ).first()

def revoke_consent(db: Session, farmer_id: int, service_id: int):
    consent = get_active_consent(db, farmer_id, service_id)
    if consent:
        consent.is_active = False
        consent.revoked_at = datetime.utcnow()
        db.commit()
        return True
    return False
