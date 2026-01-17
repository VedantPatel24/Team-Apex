from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_class import Base

class AccessLog(Base):
    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmer.id"))
    service_id = Column(Integer, ForeignKey("service.id"))
    
    action = Column(String) # e.g., "READ_PROFILE", "READ_LAND_RECORD"
    resource = Column(String) # Specific resource accessed
    ip_address = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    status = Column(String) # "SUCCESS", "DENIED"
    details = Column(String, nullable=True)

    farmer = relationship("Farmer", back_populates="access_logs")
    service = relationship("Service", back_populates="access_logs")
