
import requests
import sys
import os

# Add backend to path for DB access
sys.path.append(os.path.join(os.getcwd(), 'backend'))
# API Only Verification - No DB imports needed

# Configuration
BASE_URL = "http://localhost:8000/api/v1"
FARMER_PHONE = "9876543210" # Default from seed/debug methods
PASSWORD = "password123"

def run_verification():
    print("--- 0. Register Test User ---")
    import random
    phone = f"99{random.randint(10000000, 99999999)}"
    password = "password123"
    register_payload = {
        "full_name": "Test Farmer",
        "phone_number": phone,
        "password": password
    }
    try:
        # Register (URL is /register, not /signup)
        resp = requests.post(f"{BASE_URL}/auth/register", json=register_payload)
        if resp.status_code != 200:
             print(f"❌ Signup Failed: {resp.text}")
             return
        print(f"✅ Signed up user: {phone}")
        
    except Exception as e:
        print(f"❌ Signup Error: {e}")
        return

    print("--- 1. Login Farmer ---")
    # OAuth2PasswordRequestForm expects form data with 'username' and 'password'
    login_data = {"username": phone, "password": password}
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", data=login_data)
        if resp.status_code != 200:
            print(f"❌ Login Failed: {resp.text}")
            return
        data = resp.json()
        token = data["access_token"]
        print(f"✅ Login Success. User ID: {data.get('user_id')}")
        headers = {"Authorization": f"Bearer {token}"}
    
    except Exception as e:
        print(f"❌ Login Request Error: {e}")
        return

    # SEED DOCUMENTS via API
    print("--- 1.5 Uploading All Mandatory Documents ---")
    
    doc_ids = []
    mandatory_types = ["IDENTITY", "LAND_RECORD", "CROP_DETAILS"]
    
    for dtype in mandatory_types:
        try:
            files = {'file': (f'test_{dtype}.pdf', b'%PDF-1.4 empty content', 'application/pdf')}
            data_upload = {'title': f'Test {dtype}', 'doc_type': dtype, 'is_sensitive': 'true'}
            
            resp = requests.post(f"{BASE_URL}/documents/upload", headers=headers, files=files, data=data_upload)
            if resp.status_code != 200:
                 print(f"❌ Upload Failed for {dtype}: {resp.text}")
                 return
            
            doc_data = resp.json()
            print(f"✅ Uploaded {dtype} ID: {doc_data['id']}")
            doc_ids.append(doc_data['id'])
        except Exception as e:
            print(f"❌ Upload Request Error: {e}")
            return


    print("\n--- 2. Check Existing Loans (Table Data Verification) ---")
    resp = requests.get(f"{BASE_URL}/loan/my-applications", headers=headers)
    if resp.status_code == 200:
        loans = resp.json()
        print(f"✅ Fetched {len(loans)} applications.")
        if isinstance(loans, list):
             print("✅ Correct Data Type: List (Array)")
             for loan in loans:
                 print(f"   - Loan #{loan['id']} Status: {loan['status']}")
        else:
             print(f"❌ INCORRECT Data Type: {type(loans)}")
    else:
        print(f"❌ Failed to fetch loans: {resp.text}")

    print("\n--- 3. Attempt Duplicate Application (Block Check) ---")
    
    # 3a. First Application (Should Succeed)
    payload = {
        "service_id": 1,
        "document_ids": doc_ids 
    }
    print("Attempting First Application...")
    resp = requests.post(f"{BASE_URL}/loan/apply", json=payload, headers=headers)
    if resp.status_code == 200:
        loan_data = resp.json()
        print(f"✅ First Application Created Successfully. ID: {loan_data.get('id')}, Status: '{loan_data.get('status')}'")
    else:
        print(f"❌ First Application Failed: {resp.text}")
        # Dont return, try to list again to see if it shows up in table now
    
    # Check List AGAIN to verify it appears
    print("\n--- 3.5 Re-Check Loan List (Should have 1 loan) ---")
    resp = requests.get(f"{BASE_URL}/loan/my-applications", headers=headers)
    loans = resp.json()
    print(f"✅ Fetched {len(loans)} applications after creation. Data: {loans}")

    # 3b. Second Application (Should Fail)
    print("\nAttempting Second (Duplicate) Application...")
    resp = requests.post(f"{BASE_URL}/loan/apply", json=payload, headers=headers)
    
    if resp.status_code == 400 and "pending loan application" in resp.text:
        print("✅ SUCCESS: Duplicate application blocked.")
        print(f"   Response: {resp.json()['detail']}")
    elif resp.status_code == 200:
        print("❌ FAILED: Application went through! (Should have been blocked if one exists)")
    else:
         print(f"ℹ️ Other Result: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    run_verification()
