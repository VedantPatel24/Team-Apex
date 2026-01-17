import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_register():
    print("Testing Registration...")
    payload = {
        "full_name": "Ramesh Kumar",
        "phone_number": "9876543210",
        "email": "ramesh@example.com",
        "password": "securepassword123", # Secure password!
        "aadhaar_number": "1234-5678-9012",
        "land_record_id": "LR-AP-2023-001",
        "attributes": {
            "farm_size": "2.5 Acres",
            "village": "Guntur"
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=payload)
        if response.status_code == 200:
            print("✅ Registration Successful:", response.json())
        elif response.status_code == 400 and "already registered" in response.text:
             print("⚠️  User already exists (Expected if re-running)")
        else:
            print("❌ Registration Failed:", response.status_code, response.text)
    except Exception as e:
        print(f"❌ Connection Error: {e}")

def test_login():
    print("\nTesting Login...")
    payload = {
        "phone_number": "9876543210",
        "password": "securepassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=payload)
        if response.status_code == 200:
            token = response.json()["access_token"]
            print(f"✅ Login Successful! Token: {token[:15]}...")
        else:
            print("❌ Login Failed:", response.status_code, response.text)
    except Exception as e:
        print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    test_register()
    test_login()
