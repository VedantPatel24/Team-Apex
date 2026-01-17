from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_class import Base

class Consent(Base):
    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmer.id"))
    service_id = Column(Integer, ForeignKey("service.id"))
    
    # The actual permissions granted by the user
    # e.g., ["profile", "land_records"] (Might be a subset of what was requested)
    granted_scopes = Column(JSONB, default=[])
    
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True) # Consent can be time-bound
    revoked_at = Column(DateTime, nullable=True) # If user manually revokes
    is_active = Column(Boolean, default=True)

    farmer = relationship("Farmer", back_populates="consents")
    service = relationship("Service", back_populates="consents")
