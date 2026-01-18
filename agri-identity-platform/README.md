
# 🌾 KhetiSahay (Agri-Identity Platform)
### Privacy-Centric Digital Identity & Consent Management for Agriculture

> **Ingenious Hackathon 7.0 - Problem Statement 2**
> *Privacy-Centric Digital Identity and Trust Management Platform*

---

## 📌 Overview
The **Agri-Identity Platform** is a secure, privacy-first ecosystem designed to give farmers full ownership and control over their digital data. It acts as a **Trust Layer** between Farmers and Agricultural Service Providers (Loans, Advisory, Subsidies), replacing direct data exposure with **Consent-Based Access**.

**Core Philosophy:**
*   **Data Minimization**: Services only see what they strictly need.
*   **Explicit Consent**: Farmers must approve every data access request.
*   **Revocability**: Farmers can revoke access at any time, instantly impacting the service (e.g., auto-canceling a loan application).

---

## 🚀 Key Features

### 👨‍🌾 1. Unified Farmer Portal
A modern, responsive dashboard where farmers manage their digital life.
*   **Identity Vault**: View secure attributes (Identity, Land Records).
*   **Document Vault**: Upload and categorize critical documents (Soil Health Cards, Land Deeds).
*   **Consent Manager**: View active consents, expire dates, and **Revoke Access** with one click.
*   **Activity Log**: Transparent audit trail of who accessed what data and when.

### 💰 2. Agricultural Loans Service (Live)
A fully digital lending flow integrated with the identity platform.
*   **Smart Application**: Automatically fetches Farmer Data (Name, Land Size) *after* consent is granted.
*   **Document Verification**: Enforces mandatory uploads (e.g., Land Record) before submission.
*   **Loan Admin Dashboard**:
    *   View Anonymized Applications (names hidden until necessary).
    *   Verify Documents securely.
    *   Approve/Reject applications.
*   **Dynamic Revocation**: If a farmer revokes consent while a loan is "Pending", the system **automatically rejects** the loan to preserve data integrity.

### 🌱 3. Crop Advisory Service (Live)
Expert layout support for crop health and yield optimization.
*   **Digital Requests**: Farmers submit crop details (Season, Irrigation) and get expert advice.
*   **Admin Advisory Dashboard**: Experts view requests and provide structured advice (Fertilizer Plan, Sowing Schedule).

---

## 🏗️ Technical Architecture

### Tech Stack
*   **Backend**: Python (**FastAPI**) - High performance, async support.
*   **Database**: PostgreSQL (**SQLAlchemy**) - Relational data integrity.
*   **Frontend**: React (**Vite** + **Material UI**) - Glassmorphism design & responsive UI.
*   **Security**: OAuth2 Scopes, JWT (JSON Web Tokens), Bcrypt Hashing.

### Security Model: Scope-Based Access Control (SBAC)
Instead of sharing the entire profile, we use "Scopes":
*   `profile`: Basic Name/Phone.
*   `documents`: Ability to view stored documents.
*   `land_data`: Access to Land Records.
*   `crop_data`: Access to cropping history.

**Example Flow**:
1.  Loan Service requests `profile` + `documents`.
2.  Farmer approves.
3.  System issues a **Time-Bound Token** valid for 7 days.
4.  Loan Service uses this token to fetch data.
5.  If Farmer revokes, the token is invalidated instantly.

---

## 🛠️ Setup & Installation

### Prerequisites
*   Python 3.9+
*   Node.js 16+
*   PostgreSQL (Local or Docker)

### 1. Backend Setup
```bash
cd backend
# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Environment Config
# (Ensure .env contains DATABASE_URL="postgresql://user:pass@localhost/agri_db")

# Initialize Database (Seed default Admin/Services)
python app/db/init_db.py

# Run Server
uvicorn app.main:app --reload
```
*Backend runs at: `http://localhost:8000`*

### 2. Frontend Setup
```bash
cd frontend/farmer-portal

# Install dependencies
npm install

# Run Dev Server
npm run dev
```
*Frontend runs at: `http://localhost:5173`*

---

## 📖 Usage Guide

### 🧑‍🌾 Farmer Login
*   **URL**: `http://localhost:5173/login`
*   **Credentials**:
    *   **Phone**: `9876543210`
    *   **Password**: `password123`
    *   *(Or Sign Up with a new account)*

### 👮 Admin Login
*   **URL**: `http://localhost:5173/login` (Select "Admin" Tab)
*   **Loan Admin**:
    *   **Domain**: Agricultural Loans
    *   **Password**: `admin123`
*   **Advisory Admin**:
    *   **Domain**: Crop Advisory Services
    *   **Password**: `admin123`



---

## 🔮 Future Roadmap
*   **Blockchain Integration**: Verifiable Credentials (W3C DID) for immutable trust.
*   **Marketplace**: Direct-to-Consumer selling with smart contracts.
*   **AI Diagnostics**: Image-based disease detection for Crop Advisory.
