
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_class import Base

class Admin(Base):
    __tablename__ = "admin"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False) # Plaintext for hackathon
    service_id = Column(Integer, ForeignKey("service.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    service = relationship("Service")
