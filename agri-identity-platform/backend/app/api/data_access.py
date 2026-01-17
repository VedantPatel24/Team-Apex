from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.repositories import farmer_repo
from app.core.security import decrypt_data
from app.core.config import settings
from jose import jwt, JWTError

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user_and_scopes(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        scopes = payload.get("scope", "").split(" ")
        service_id = payload.get("azp")
        
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        return {
            "user_id": user_id,
            "scopes": scopes,
            "service_id": service_id
        }
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

@router.get("/data")
def get_farmer_data(
    context: dict = Depends(get_current_user_and_scopes),
    db: Session = Depends(get_db)
):
    farmer_id = context["user_id"]
    scopes = set(context["scopes"])
    
    farmer = farmer_repo.get_farmer_by_phone(db, phone_number="") # Wait, repo uses phone, but we have ID
    # We need a get_by_id in repo.
    # Let's verify if get_farmer_by_id exists. It doesn't.
    # We'll just query directly here or update repo. Direct query is faster for now.
    from app.models.farmer import Farmer
    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    
    if not farmer:
        raise HTTPException(status_code=404, detail="User not found")

    # Build Response based on Scopes
    response_data = {}
    
    # 1. Basic Profile (Usually always allowed if authenticated, or require 'profile')
    if "profile" in scopes:
        response_data["full_name"] = farmer.full_name
        response_data["email"] = farmer.email
        response_data["phone_number"] = farmer.phone_number
        response_data["profile_photo"] = farmer.profile_photo
        # Public attributes
        response_data["attributes"] = farmer.attributes

    # 2. Sensitive Data - Aadhaar
    if "aadhaar" in scopes:
        # Decrypt on the fly
        response_data["aadhaar_number"] = decrypt_data(farmer.aadhaar_enc)
    
    # 3. Land Records
    if "land_records" in scopes:
         response_data["land_record_id"] = decrypt_data(farmer.land_record_id_enc)
         # In a real app, might fetch external details using this ID

    # 4. Audit Log (Log this access!)
    from app.models.access_log import AccessLog
    log = AccessLog(
        farmer_id=farmer.id,
        service_id=context.get("service_id"), # Might be None if it's the Farmer Portal itself
        action="DATA_ACCESS",
        resource=f"Scopes: {', '.join(scopes)}",
        status="SUCCESS",
        ip_address="127.0.0.1" # Mock IP
    )
    db.add(log)
    db.commit()

    return response_data

from typing import List, Optional
from app.schemas.all import AccessLogResponse
from app.models.access_log import AccessLog
from app.models.service import Service

@router.get("/logs", response_model=List[AccessLogResponse])
def get_access_logs(
    context: dict = Depends(get_current_user_and_scopes),
    db: Session = Depends(get_db)
):
    farmer_id = context["user_id"]
    # Join mainly to get Service Name if available
    logs = db.query(AccessLog).outerjoin(Service).filter(
        AccessLog.farmer_id == farmer_id
    ).order_by(AccessLog.timestamp.desc()).limit(50).all()
    
    return [
        AccessLogResponse(
            id=log.id,
            service_name=log.service.name if log.service else "Direct/Portal",
            action=log.action,
            resource=log.resource,
            timestamp=log.timestamp,
            ip_address=log.ip_address
        ) for log in logs
    ]
