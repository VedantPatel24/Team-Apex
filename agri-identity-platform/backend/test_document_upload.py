
import requests
import time
import random

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_document_upload():
    print("Testing Authenticated Document Upload...")
    
    # Use unique data to avoid conflicts
    unique_id = int(time.time())
    phone = f"9{random.randint(100000000, 999999999)}"
    
    print(f"Creating user with phone: {phone}")
    
    # 1. Register
    register_payload = {
        "full_name": f"Test Farmer {unique_id}",
        "phone_number": phone,
        "email": f"test{unique_id}@example.com",
        "password": "securepassword123", 
        "aadhaar_number": f"1234-5678-{random.randint(1000,9999)}",
        "land_record_id": f"LR-{unique_id}"
    }
    
    try:
        reg_res = requests.post(f"{BASE_URL}/auth/register", json=register_payload)
        if reg_res.status_code != 200:
             # Just in case registration failed for other reasons, try login directly
             print(f"Registration status: {reg_res.status_code}. Trying login...")
        
        # 2. Login
        login_payload = {
            "username": phone,
            "password": "securepassword123"
        }
        login_res = requests.post(f"{BASE_URL}/auth/login", data=login_payload)
        
        if login_res.status_code != 200:
            print("❌ Login Failed. Response:", login_res.text)
            return

        token = login_res.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}
        
        # 3. Upload Document
        files = {'file': ('test_doc.txt', 'This is a test document content', 'text/plain')}
        data = {
            'title': 'Test Sensitive Doc',
            'is_sensitive': 'true'
        }
        
        upload_res = requests.post(f"{BASE_URL}/documents/upload", headers=headers, files=files, data=data)
        
        if upload_res.status_code == 200:
            doc = upload_res.json()
            if doc['title'] == 'Test Sensitive Doc' and doc['is_sensitive'] == True:
                print("✅ Document Upload Successful with correct metadata!")
                print(doc)
            else:
                print("❌ Upload Successful but metadata mismatch:", doc)
        else:
            print(f"❌ Upload Failed: {upload_res.status_code} {upload_res.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_document_upload()
