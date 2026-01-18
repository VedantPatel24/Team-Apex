from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
import app.db.base # Register models
from app.api import auth, services, consents, data_access, documents, loan, crop_advisory

app = FastAPI(title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json")

# CORS Configuration
origins = [
    "http://localhost:5173", # Vite Frontend
    "http://localhost:3000", # Example external Service
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Uploads for Static Access (Local Dev Only)
from fastapi.staticfiles import StaticFiles
import os
os.makedirs("uploads", exist_ok=True) # Ensure dir exists
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(services.router, prefix=f"{settings.API_V1_STR}/services", tags=["services"])
app.include_router(consents.router, prefix=f"{settings.API_V1_STR}/oauth", tags=["oauth"])
app.include_router(data_access.router, prefix=f"{settings.API_V1_STR}/user", tags=["user"])
app.include_router(documents.router, prefix=f"{settings.API_V1_STR}/documents", tags=["documents"])
app.include_router(loan.router, prefix=f"{settings.API_V1_STR}/loan", tags=["loan"])
app.include_router(crop_advisory.router, prefix=f"{settings.API_V1_STR}/crop-advisory", tags=["crop-advisory"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Agri Identity Platform API"}
