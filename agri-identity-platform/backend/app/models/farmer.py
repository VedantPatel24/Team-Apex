from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_class import Base

class Farmer(Base):
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    phone_number = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    
    # Encrypted fields (stored as encrypted strings)
    aadhaar_hash = Column(String, nullable=True) # Searchable hash (blind index)
    aadhaar_enc = Column(String, nullable=True)  # Encrypted value
    land_record_id_enc = Column(String, nullable=True)
    
    # Profile & Status
    profile_photo = Column(String, nullable=True) # URL or Base64
    
    # OTP / Verification
    is_verified = Column(Boolean, default=False)
    otp_code = Column(String, nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Flexible Attributes (e.g., {"farm_size": "2 acres", "crop": "wheat"})
    attributes = Column(JSONB, default={})

    # Relationships
    consents = relationship("Consent", back_populates="farmer")
    access_logs = relationship("AccessLog", back_populates="farmer")
    documents = relationship("Document", back_populates="farmer")
