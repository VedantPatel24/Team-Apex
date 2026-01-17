from sqlalchemy.orm import Session
from app.models.service import Service
from app.schemas.all import ServiceCreate
import secrets

def get_service_by_client_id(db: Session, client_id: str):
    return db.query(Service).filter(Service.client_id == client_id).first()

def create_service(db: Session, service: ServiceCreate):
    # Generate secure random Client ID and Secret
    client_id = secrets.token_urlsafe(16)
    client_secret = secrets.token_urlsafe(32)
    
    db_service = Service(
        name=service.name,
        description=service.description,
        redirect_uri=service.redirect_uri,
        allowed_scopes=service.allowed_scopes,
        client_id=client_id,
        client_secret=client_secret
    )
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

def verify_client(db: Session, client_id: str, client_secret: str = None) -> Service:
    service = get_service_by_client_id(db, client_id)
    if not service:
        return None
    # If secret is provided, check it (usually for token exchange)
    # For now we might just check ID for the initial authorize GET
    return service
