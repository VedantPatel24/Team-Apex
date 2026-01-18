
import requests
import time
import random

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_simple_register():
    print("Testing Simplified Registration...")
    
    unique_id = int(time.time())
    phone = f"9{random.randint(100000000, 999999999)}"
    
    payload = {
        "full_name": f"Simple Farmer {unique_id}",
        "phone_number": phone,
        "email": f"simple{unique_id}@example.com",
        "password": "securepassword123"
        # No aadhaar or land record
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=payload)
        if response.status_code == 200:
            print("✅ Simple Registration Successful:", response.json())
        else:
            print("❌ Registration Failed:", response.status_code, response.text)
    except Exception as e:
        print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    test_simple_register()
