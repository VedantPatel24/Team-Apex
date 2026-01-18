from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_class import Base

class CropAdvisory(Base):
    __tablename__ = "crop_advisory"
    
    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmer.id"))
    service_id = Column(Integer, ForeignKey("service.id"))
    
    # Snapshot Data (Immutable after submission)
    location = Column(String, nullable=False) # Village / Region
    crop_name = Column(String, nullable=False)
    season = Column(String, nullable=False)
    
    # Optional Data
    irrigation_type = Column(String, nullable=True)
    last_yield = Column(String, nullable=True)
    soil_health_doc_id = Column(Integer, ForeignKey("document.id"), nullable=True)
    
    status = Column(String, default="PENDING") # PENDING, ADVISED, REVOKED
    
    # Admin Output
    recommendation = Column(Text, nullable=True)
    fertilizer_plan = Column(Text, nullable=True)
    sowing_schedule = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    farmer = relationship("Farmer")
    service = relationship("Service")
    soil_doc = relationship("Document")
