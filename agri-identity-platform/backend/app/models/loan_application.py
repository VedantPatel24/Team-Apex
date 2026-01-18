
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_class import Base

class LoanApplication(Base):
    __tablename__ = "loan_application"
    
    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmer.id"))
    service_id = Column(Integer, ForeignKey("service.id"))
    status = Column(String, default="PENDING") # PENDING, APPROVED, REJECTED
    documents_snapshot = Column(JSONB, default=[]) # List of doc IDs
    admin_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    farmer = relationship("Farmer")
    service = relationship("Service")
