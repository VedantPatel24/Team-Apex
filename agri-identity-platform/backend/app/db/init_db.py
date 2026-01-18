import logging
from app.db.session import engine
from app.db.base import Base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from sqlalchemy.orm import Session
from app.models.service import Service
from app.models.admin import Admin

def init_db():
    logger.info("Creating initial database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully.")
    
    db = Session(bind=engine)
    
    # 1. Seed Service
    service_id_str = "AGRI_LOAN_001"
    service = db.query(Service).filter(Service.client_id == service_id_str).first()
    if not service:
        logger.info(f"Seeding Service: {service_id_str}")
        service = Service(
            client_id=service_id_str,
            client_secret="secret_loan_service",
            name="Agricultural Loan Service",
            description="Allows farmers to apply for crop-based loans using a privacy-centric, document-level consent system.",
            redirect_uri="http://localhost:5173/loan/callback", # Placeholder
            allowed_scopes=["documents"],
            is_active=True
        )
        db.add(service)
        db.commit()
        db.refresh(service)
    else:
        logger.info(f"Service {service_id_str} already exists.")
        
    # 2. Seed Admin
    admin_username = "LOAN_ADMIN_001"
    admin = db.query(Admin).filter(Admin.username == admin_username).first()
    if not admin:
        logger.info(f"Seeding Admin: {admin_username}")
        admin = Admin(
            username=admin_username,
            password="password123", # Plaintext as per model
            service_id=service.id
        )
        db.add(admin)
        db.commit()
    else:
         logger.info(f"Admin {admin_username} already exists.")
         
    db.close()

if __name__ == "__main__":
    init_db()
