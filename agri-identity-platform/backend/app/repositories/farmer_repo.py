from sqlalchemy.orm import Session
from app.models.farmer import Farmer
from app.schemas.all import FarmerCreate
from app.core.security import get_password_hash, encrypt_data

def get_farmer_by_phone(db: Session, phone_number: str):
    return db.query(Farmer).filter(Farmer.phone_number == phone_number).first()

def create_farmer(db: Session, farmer: FarmerCreate):
    db_farmer = Farmer(
        full_name=farmer.full_name,
        phone_number=farmer.phone_number,
        email=farmer.email,
        hashed_password=get_password_hash(farmer.password),
        aadhaar_enc=encrypt_data(farmer.aadhaar_number),
        land_record_id_enc=encrypt_data(farmer.land_record_id),
        attributes=farmer.attributes
    )
    db.add(db_farmer)
    db.commit()
    db.refresh(db_farmer)
    return db_farmer

def authenticate_farmer(db: Session, phone_number: str, password: str):
    from app.core.security import verify_password
    farmer = get_farmer_by_phone(db, phone_number)
    if not farmer:
        return None
    if not verify_password(password, farmer.hashed_password):
        return None
    return farmer
