from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.schemas.all import ServiceCreate, ServiceResponse
from app.repositories import service_repo

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=ServiceResponse)
def register_service(service: ServiceCreate, db: Session = Depends(get_db)):
    # In a real app, this would be Admin only
    return service_repo.create_service(db, service)

@router.get("/", response_model=list[ServiceResponse])
def get_services(db: Session = Depends(get_db)):
    from app.models.service import Service
    return db.query(Service).all()
