
from app.models.farmer import Farmer

print("Farmer Model Columns:")
for column in Farmer.__table__.columns:
    print(f"- {column.name}")
