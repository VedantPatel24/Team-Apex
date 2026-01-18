from app.db.session import SessionLocal
import app.db.base # Register all models
from app.models.admin import Admin
from app.models.service import Service

def verify():
    db = SessionLocal()
    print("--- CHECKING ADMIN DATA ---")
    admin = db.query(Admin).filter(Admin.username == "LOAN_ADMIN_001").first()
    if admin:
        print(f"✅ Admin Found: {admin.username} (ID: {admin.id})")
        if admin.service:
            print(f"   Linked Service: {admin.service.name} (ID: {admin.service.id})")
        else:
            print("   ❌ No Linked Service found!")
            
        # Verify permissions/scope logic if possible
        print("   Admin is ready for login.")
    else:
        print("❌ Admin 'LOAN_ADMIN_001' NOT FOUND. Seeding failed?")
    db.close()

if __name__ == "__main__":
    verify()
