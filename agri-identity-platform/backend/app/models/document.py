from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_class import Base

class Document(Base):
    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmer.id"))
    
    title = Column(String, nullable=False) # User friendly name "My Land Deed"
    filename = Column(String, nullable=False) # original.pdf
    storage_path = Column(String, nullable=False) # uploads/enc_1234.bin
    mime_type = Column(String, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    farmer = relationship("Farmer", back_populates="documents")
