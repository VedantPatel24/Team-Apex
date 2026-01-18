from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    user_name: str
    role: str = "farmer" # farmer or admin

class TokenData(BaseModel):
    id: Optional[str] = None

# --- Farmer Schemas ---
class FarmerBase(BaseModel):
    full_name: str
    phone_number: str
    email: Optional[EmailStr] = None
    location: Optional[str] = None

class FarmerCreate(FarmerBase):
    password: str

class FarmerLogin(BaseModel):
    phone_number: str
    password: str

class FarmerResponse(FarmerBase):
    id: int
    
    class Config:
        from_attributes = True

# --- Service/App Schemas ---
class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    redirect_uri: str
    allowed_scopes: List[str] = []

class ServiceCreate(ServiceBase):
    pass 

class ServiceResponse(ServiceBase):
    id: int
    client_id: str
    
    class Config:
        from_attributes = True

# --- Consent Schemas ---
class ConsentBase(BaseModel):
    service_id: int
    granted_scopes: List[str] = []

class ConsentCreate(ConsentBase):
    pass

class ConsentResponse(ConsentBase):
    id: int
    farmer_id: int
    created_at: Any
    
    class Config:
        from_attributes = True

class AuthorizationRequest(BaseModel):
    client_id: str
    redirect_uri: str
    response_type: str = "code"
    scope: str
    state: Optional[str] = None

class AuthorizationResponse(BaseModel):
    auth_request_id: str
    service_name: str
    requested_scopes: List[str]
    service_id: int

class AccessLogResponse(BaseModel):
    id: int
    service_name: Optional[str] = "Unknown"
    action: str
    resource: str
    timestamp: Any
    ip_address: str
    
    class Config:
        from_attributes = True

class ActiveConsentResponse(BaseModel):
    id: int
    service_name: str
    service_id: int
    granted_scopes: List[str]
    created_at: Any
    
    class Config:
        from_attributes = True

# --- Document Schemas ---
class DocumentResponse(BaseModel):
    id: int
    title: str
    doc_type: str
    filename: str
    storage_path: str # Added to allow accessing the actual file
    mime_type: str
    is_sensitive: bool
    created_at: Any
    
    class Config:
        from_attributes = True

# --- Loan Schemas ---
class LoanApplicationCreate(BaseModel):
    service_id: int
    document_ids: List[int]

class LoanApplicationResponse(BaseModel):
    id: int
    farmer_id: int
    service_id: int
    status: str
    admin_notes: Optional[str] = None
    created_at: Any
    
    class Config:
        from_attributes = True

class AdminLogin(BaseModel):
    username: str
    password: str

# --- Crop Advisory Schemas ---
class CropAdvisoryCreate(BaseModel):
    service_id: int
    crop_name: str
    season: str
    # Optional
    soil_health_doc_id: Optional[int] = None
    last_yield: Optional[str] = None
    irrigation_type: Optional[str] = None

class CropAdvisoryResponse(BaseModel):
    id: int
    farmer_id: int
    service_id: int
    
    # Inputs
    location: str # Snapshot from profile
    crop_name: str
    season: str
    irrigation_type: Optional[str] = None
    last_yield: Optional[str] = None
    soil_health_doc_id: Optional[int] = None
    
    status: str
    recommendation: Optional[str] = None
    fertilizer_plan: Optional[str] = None
    sowing_schedule: Optional[str] = None
    
    created_at: Any
    
    class Config:
        from_attributes = True
