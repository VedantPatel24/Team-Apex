
from app.schemas.all import FarmerCreate
import json

print("Fields in FarmerCreate:")
print(FarmerCreate.model_fields.keys())

# Try to validate a simplified payload
try:
    obj = FarmerCreate(
        full_name="Test",
        phone_number="1234567890",
        email="test@test.com",
        password="pass"
    )
    print("✅ Validation Successful:", obj)
except Exception as e:
    print("❌ Validation Failed:", e)
