from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from datetime import datetime
from app.db.base_class import Base
from sqlalchemy.orm import relationship

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("loan_application.id"))
    admin_id = Column(Integer, ForeignKey("admin.id")) # Assuming Admin model exists
    decision = Column(String) # APPROVED, REJECTED, REQUEST_DOC
    feedback_message = Column(Text, nullable=False) # Mandatory
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    application = relationship("LoanApplication")
    # admin = relationship("Admin") # Uncomment if Admin model logic requires back-populating
