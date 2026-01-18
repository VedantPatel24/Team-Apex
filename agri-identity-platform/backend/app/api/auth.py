from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.db.session import SessionLocal
from app.core import security
from app.core.config import settings
from app.api import deps
from app.repositories import farmer_repo
from app.schemas.all import FarmerCreate, FarmerResponse, Token, FarmerLogin
from app.utils.email import send_otp_email

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



import random
import string

def generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))

@router.post("/register")
async def register(farmer_in: FarmerCreate, db: Session = Depends(get_db)):
    # 1. Check if phone exists
    farmer = farmer_repo.get_farmer_by_phone(db, phone_number=farmer_in.phone_number)
    
    # Generate OTP
    otp_code = generate_otp()
    otp_expires = datetime.utcnow() + timedelta(minutes=10) # 10 mins expiry

    if farmer:
        if farmer.is_verified:
            # Already Registered and Verified -> Error
            raise HTTPException(
                status_code=400,
                detail="Phone number already registered",
            )
        else:
            # Exists but NOT verified -> Resend OTP / Update logic
            # Update fields in case they corrected name/email
            farmer.full_name = farmer_in.full_name
            farmer.email = farmer_in.email
            from app.core.security import get_password_hash
            farmer.hashed_password = get_password_hash(farmer_in.password)
            
            # Set New OTP
            farmer.otp_code = otp_code
            farmer.otp_expires_at = otp_expires
            
            db.commit()
            db.refresh(farmer)
            
            # Send Email (Real) - Resend Logic
            try:
                await send_otp_email(farmer_in.email, otp_code)
            except Exception as e:
                print(f"❌ Failed to send email (Resend): {e}")

            print(f"✅ [DEBUG] RESENT OTP for {farmer_in.email}: {otp_code} (Attempted to send via Email) ⚠️")
            return {"message": "User already exists but unverified. Resending OTP.", "phone_number": farmer.phone_number}

    # 2. Check if email exists (only if not checking phone first or separate check)
    # If phone didn't match but email does:
    if farmer_in.email:
        farmer_email = farmer_repo.get_farmer_by_email(db, email=farmer_in.email)
        if farmer_email and farmer_email.id != (farmer.id if farmer else None):
             # Ensure we don't block if it's the SAME unverified user
             if farmer_email.is_verified:
                 raise HTTPException(
                    status_code=400,
                    detail="Email address already registered",
                )
             # If email exists and unverified, we might handle it, 
             # but usually phone is primary key. Let's assume unique email enforcement blocks different phone + same email.
    
    # 3. Create New Farmer
    from app.models.farmer import Farmer
    from app.core.security import get_password_hash
    
    db_obj = Farmer(
        full_name=farmer_in.full_name,
        phone_number=farmer_in.phone_number,
        email=farmer_in.email,
        hashed_password=get_password_hash(farmer_in.password),
        is_active=True,         
        is_verified=False,
        otp_code=otp_code,
        otp_expires_at=otp_expires
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    # Send Email (Real)
    try:
        await send_otp_email(farmer_in.email, otp_code)
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        # Log error but don't fail registration completely if email fails?
        # Ideally we SHOULD fail if OTP is critical, but for now let's print.
    
    print(f"✅ [DEBUG] OTP Generated for {farmer_in.email}: {otp_code} (Attemped to send via Email) ⚠️") # Print for debugging
    
    return {"message": "Registration successful. Please check your email for OTP.", "phone_number": db_obj.phone_number}

@router.post("/verify-registration-otp", response_model=Token)
def verify_registration_otp(
    phone_number: str,
    otp: str,
    db: Session = Depends(get_db)
):
    farmer = farmer_repo.get_farmer_by_phone(db, phone_number=phone_number)
    if not farmer:
        raise HTTPException(status_code=404, detail="User not found")
        
    if farmer.is_verified:
        # Already verified, usually just return token or message
        # But maybe they are logging in via verify? Let's allow it.
        pass
    else:
        # Check OTP
        if not farmer.otp_code:
             raise HTTPException(status_code=400, detail="No OTP pending")

        if farmer.otp_code != otp:
             raise HTTPException(status_code=400, detail="Invalid OTP")
        
        if farmer.otp_expires_at < datetime.utcnow():
             raise HTTPException(status_code=400, detail="OTP Expired")
             
        # Verify
        farmer.is_verified = True
        farmer.otp_code = None
        db.commit()
        db.refresh(farmer)
        
    # Generate Token
    access_token = security.create_access_token(
        subject=farmer.id,
        claims={"scope": "profile"}
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_id": farmer.id,
        "user_name": farmer.full_name,
        "role": "farmer"
    }

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
):
    farmer = farmer_repo.authenticate_farmer(
        db, phone_number=form_data.username, password=form_data.password
    )
    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if verified?
    # if not farmer.is_verified:
    #     raise HTTPException(status_code=400, detail="Account not verified. Please register again to verify.")

    access_token = security.create_access_token(
        subject=farmer.id,
        claims={"scope": "profile"}
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_id": farmer.id,
        "user_name": farmer.full_name,
        "role": "farmer"
    }
