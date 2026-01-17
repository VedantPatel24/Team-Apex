import requests
import json
import secrets

BASE_URL = "http://127.0.0.1:8000/api/v1"

# Global Storage
SERVICE_ID = None
CLIENT_ID = None
FARMER_TOKEN = None
FARMER_ID = None

def register_service():
    global SERVICE_ID, CLIENT_ID
    print("\n1️⃣  Registering 'Agri Subsidy Portal'...")
    payload = {
        "name": "Agri Subsidy Portal",
        "description": "Government portal for fertilizer subsidies",
        "redirect_uri": "http://localhost:3000/callback",
        "allowed_scopes": ["profile", "land_records", "aadhaar"]
    }
    res = requests.post(f"{BASE_URL}/services/register", json=payload)
    if res.status_code == 200:
        data = res.json()
        SERVICE_ID = data['id']
        CLIENT_ID = data['client_id']
        print(f"✅ Service Registered! ID: {SERVICE_ID}, ClientID: {CLIENT_ID}")
    else:
        print("❌ Service Reg Failed:", res.text)

def register_farmer():
    print("\n1️⃣.5️⃣  Registering Farmer (Ramesh)...")
    payload = {
        "full_name": "Ramesh Kumar",
        "phone_number": "9876543210", # Demo number for auto-verify
        "email": "ramesh@example.com",
        "password": "securepassword123",
        "aadhaar_number": "123412341234",
        "land_record_id": "LR-999888777",
         "attributes": {
            "village": "Guntur", 
            "farm_size": "2.5 Acres"
        }
    }
    # We use the new Register endpoint which triggers OTP/Demo-Bypass
    res = requests.post(f"{BASE_URL}/auth/register", json=payload)
    if res.status_code == 200:
         print("✅ Farmer Registered (or already exists).")
    elif res.status_code == 400 and "already registered" in res.text:
         print("✅ Farmer already registered.")
    else:
         print("❌ Farmer Registration Failed:", res.text)

def login_farmer():
    global FARMER_TOKEN, FARMER_ID
    print("\n2️⃣  Logging in Farmer (Ramesh)...")
    # Using OAuth2PasswordRequestForm compatible fields (username=phone)
    payload = {"username": "9876543210", "password": "securepassword123"}
    # Use 'data' for Form encoding, not 'json'
    res = requests.post(f"{BASE_URL}/auth/login", data=payload)
    if res.status_code == 200:
        FARMER_TOKEN = res.json()["access_token"]
        
        # Decode Token to get accurate Farmer ID (Fixing hardcoded ID=1 issue)
        try:
            # Simple manual decode to avoid importing jose/jwt in this script
            import base64
            # JWT is header.payload.signature
            payload_part = FARMER_TOKEN.split('.')[1]
            # Fix padding
            payload_part += '=' * (-len(payload_part) % 4)
            payload_data = json.loads(base64.urlsafe_b64decode(payload_part).decode())
            FARMER_ID = int(payload_data["sub"])
            print(f"✅ Farmer Logged In! ID: {FARMER_ID}, Token: {FARMER_TOKEN[:10]}...")
        except Exception as e:
            print(f"⚠️ Could not decode token: {e}. Defaulting to ID=1")
            FARMER_ID = 1
    else:
        print("❌ Login Failed. status:", res.status_code, res.text)

def test_consent_flow():
    print("\n3️⃣  Testing Consolidated Consent Flow...")
    
    # Step A: Authorize Check
    print("   -> Service requests access...")
    auth_payload = {
        "client_id": CLIENT_ID, 
        "redirect_uri": "http://localhost:3000/callback", 
        "scope": "profile land_records" 
    }
    res = requests.post(f"{BASE_URL}/oauth/authorize", json=auth_payload)
    if res.status_code != 200:
        print("❌ Authorize Failed:", res.text)
        return
    
    req_id = res.json()["auth_request_id"]
    print("   ✅ Service Verified. Request ID:", req_id)

    # Step B: Grant Partial Access (Profile ONLY, Deny Land Records)
    print("   -> Farmer approves ONLY 'profile' (Denies 'land_records')...")
    grant_payload = {
        "request_id": req_id,
        "farmer_id": FARMER_ID,
        "service_id": SERVICE_ID,
        "approved_scopes": ["profile"] # <--- ONLY PROFILE
    }
    # Headers needed? No, this is public API but usually protected. 
    # In api/consents.py I didn't verify Farmer Token on /grant for simplicity, 
    # passed farmer_id in body. In real app, must check Bearer token match farmer_id.
    
    res = requests.post(f"{BASE_URL}/oauth/grant", json=grant_payload)
    if res.status_code != 200:
        print("❌ Grant Failed:", res.text)
        return
    
    data = res.json()
    scoped_token = data["access_token"]
    print("   ✅ Consent Granted! Got Scoped Token.")

    # Step C: Verify Privacy (Access Data)
    print("\n4️⃣  Verifying Data Privacy...")
    headers = {"Authorization": f"Bearer {scoped_token}"}
    res = requests.get(f"{BASE_URL}/user/data", headers=headers)
    
    
    user_data = res.json()
    print("   -> Fetched User Data Keys:", user_data.keys() if user_data else "None")
    
    if "full_name" in user_data and "land_record_id" not in user_data:
        print("   ✅ SUCCESS: 'full_name' is present, 'land_record_id' is HIDDEN.")
    else:
        print("   ❌ FAILURE: Privacy check failed!", user_data)

    # Step D: Grant Full Access
    print("\n5️⃣  Retrying with FULL Connect...")
    grant_payload["approved_scopes"] = ["profile", "land_records"]
    res = requests.post(f"{BASE_URL}/oauth/grant", json=grant_payload)
    full_token = res.json()["access_token"]
    
    res = requests.get(f"{BASE_URL}/user/data", headers={"Authorization": f"Bearer {full_token}"})
    user_data = res.json()
    
    if "land_record_id" in user_data:
         print("   ✅ SUCCESS: 'land_record_id' is now visible after consent.")
    else:
        print("   ❌ FAILURE: Still hidden?", user_data)

if __name__ == "__main__":
    register_service()
    register_farmer() # Ensure user exists
    login_farmer()
    if SERVICE_ID and FARMER_TOKEN:
        test_consent_flow()
