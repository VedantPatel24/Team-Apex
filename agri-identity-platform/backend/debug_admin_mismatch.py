
import sys
import os
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.models.admin import Admin
from app.models.service import Service

def check_mismatch():
    db = SessionLocal()
    try:
        print("--- ADMINS ---")
        admins = db.query(Admin).all()
        for a in admins:
            print(f"User: {a.username}, ServiceID: {a.service_id}")
            
        print("\n--- SERVICES ---")
        services = db.query(Service).all()
        for s in services:
            print(f"ID: {s.id}, Name: {s.name}")
            
    finally:
        db.close()

if __name__ == "__main__":
    check_mismatch()
