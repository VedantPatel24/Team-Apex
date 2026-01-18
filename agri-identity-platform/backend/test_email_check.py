
import requests
import time
import random

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_duplicate_email():
    print("Testing Duplicate Email Check...")
    
    unique_id = int(time.time())
    email = f"dup{unique_id}@example.com"
    
    # 1. Register First User
    payload1 = {
        "full_name": "User One",
        "phone_number": f"9{random.randint(100000000, 999999999)}",
        "email": email,
        "password": "pass"
    }
    
    res1 = requests.post(f"{BASE_URL}/auth/register", json=payload1)
    if res1.status_code != 200:
        print("❌ Setup Failed: First registration failed", res1.text)
        return

    print("✅ First User registered.")

    # 2. Register Second User (Same Email, Diff Phone)
    payload2 = {
        "full_name": "User Two",
        "phone_number": f"8{random.randint(100000000, 999999999)}", # Diff phone
        "email": email, # SAME EMAIL
        "password": "pass"
    }

    res2 = requests.post(f"{BASE_URL}/auth/register", json=payload2)
    
    if res2.status_code == 400:
        detail = res2.json().get('detail')
        if detail == "Email address already registered":
            print("✅ Success! Got expected error:", detail)
        else:
            print("❌ Correct Status, Wrong Message:", detail)
    else:
        print("❌ Failure: Expected 400, got", res2.status_code, res2.text)

if __name__ == "__main__":
    test_duplicate_email()
