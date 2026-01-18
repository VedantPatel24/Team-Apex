
import sys
import os

# Add backend to path
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.models.admin import Admin
from app.models.service import Service
# Import Base to ensure mappers are registered if needed, though usually importing models is enough
from app.db.base import Base

def list_admins():
    db = SessionLocal()
    try:
        admins = db.query(Admin).all()
        print("--- ADMINS FOUND ---")
        for a in admins:
            print(f"Username: {a.username}, Service ID: {a.service_id}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    list_admins()
