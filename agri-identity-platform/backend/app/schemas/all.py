from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[str] = None

# --- Farmer Schemas ---
class FarmerBase(BaseModel):
    full_name: str
    phone_number: str
    email: Optional[EmailStr] = None

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
    created_at: Any
    
    class Config:
        from_attributes = True

class AdminLogin(BaseModel):
    username: str
    password: str
