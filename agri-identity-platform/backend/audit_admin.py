
import sys
import os
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.db.base import Base
from app.models.admin import Admin
from app.models.service import Service

def audit_sys():
    db = SessionLocal()
    try:
        print("======== SERVICES ========")
        services = db.query(Service).all()
        for s in services:
            print(f"ID: {s.id} | Name: {s.name}")

        print("\n======== ADMINS ========")
        admins = db.query(Admin).all()
        for a in admins:
            print(f"ID: {a.id} | User: {a.username} | ServiceID: {a.service_id}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    audit_sys()
