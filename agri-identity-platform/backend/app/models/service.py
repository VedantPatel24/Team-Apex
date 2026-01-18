from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_class import Base

class Service(Base):
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(String, unique=True, index=True, nullable=False)
    client_secret = Column(String, nullable=False)
    name = Column(String, index=True)
    description = Column(String)
    redirect_uri = Column(String)
    
    # Scopes this service is allowed to request
    # e.g., ["profile", "land_records", "bank_details"]
    allowed_scopes = Column(JSONB, default=[])

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    consents = relationship("Consent", back_populates="service")
    access_logs = relationship("AccessLog", back_populates="service")
