# 🌾 Agri Privacy-Centric Digital Identity & Consent Platform

## Ingenious Hackathon 7.0 – Problem Statement 2

**Privacy-Centric Digital Identity and Trust Management Platform**

---

## 📌 Project Overview

This project implements a **privacy-first digital identity and consent management platform for the agriculture domain**. The system empowers farmers to **own, control, and transparently share their identity and land-related data** with agricultural service portals such as subsidy systems, loan providers, and crop advisory platforms.

Instead of centralized data sharing, the platform acts as a **trust layer** that enforces **explicit consent, data minimization, secure authorization, and full auditability**.

---

## 🎯 Problem Alignment

This solution is built in direct alignment with **Problem Statement 2** of Ingenious Hackathon 7.0, focusing on:

* Privacy-centric digital identity
* User-controlled data sharing
* Trust establishment without direct data exposure
* Security-first system architecture

> **Domain Focus:** Agriculture (as per mentor clarification – depth over breadth)

---

## 🧩 Key Features

### 👨‍🌾 Farmer-Owned Digital Identity

* Secure farmer registration & authentication (PIN + OTP)
* Encrypted storage of identity attributes
* Attribute-level data management

### 🤝 Consent-Based Data Sharing

* Services must request explicit consent
* Farmers approve/reject requested attributes
* Time-bound and revocable consent

### 🛂 Secure Authorization

* OAuth2-style authorization
* JWT tokens with scoped permissions
* Principle of least privilege enforced

### 📜 Transparency & Auditability

* Every data access is logged
* Farmers can view:

  * Which service accessed data
  * What attributes were accessed
  * When and for what purpose

### 🌾 Demo Agricultural Service Portals

* Subsidy Portal (verification use case)
* Loan / Bank Portal (credit eligibility use case)
* Crop Advisory Portal (non-personal data use case)

> These are **mock/demo portals** built to simulate real-world integrations.

---

## 🏗️ System Architecture (High Level)

```
Farmer UI  →  Identity Platform  →  Agri Service Portals
              (Auth + Consent + Vault)
```

The Identity Platform acts as a **central trust layer**. Service portals never directly access farmer databases.

---

## 🔁 Core Use Case Flow (Subsidy Verification)

1. Farmer logs in using mobile number + OTP
2. Subsidy Portal requests access to specific attributes
3. Farmer reviews and approves consent
4. Identity Platform issues a scoped access token
5. Subsidy Portal fetches only approved data
6. Access is logged and visible to the farmer

---

## 🧠 Tech Stack

### Backend

* **Language:** Python
* **Framework:** FastAPI
* **Auth:** OAuth2 (simplified) + JWT
* **Security:** bcrypt, AES-256 encryption
* **Database:** PostgreSQL
* **Caching:** Redis

### Frontend

* **Framework:** React
* **UI Library:** Material UI / Ant Design
* **API Calls:** Axios

### Infrastructure

* Docker & Docker Compose
* REST APIs with OpenAPI (Swagger)

---

## 🗂️ Repository Structure (Simplified)

```
agri-identity-platform/
├── backend/        # FastAPI backend
├── frontend/       # Farmer & service portals (React)
├── docs/           # Architecture, ER, Sequence diagrams
├── docker-compose.yml
└── README.md
```

---

## 🔐 Security & Privacy Principles

* Data minimization by default
* Explicit, informed consent
* Attribute-level authorization
* Encrypted data at rest
* Full audit trail for trust & transparency

---

## 🧪 AI / ML (Planned Extension)

After implementing core functionalities, the platform can be extended with AI features such as:

* Fraud risk scoring for subsidy access
* Anomaly detection in data access patterns
* Smart consent recommendations

*(AI is intentionally layered after core security and privacy are ensured.)*

---

## 🚀 How to Run (Local – High Level)

```bash
# Clone repository
git clone <repo-url>
cd agri-identity-platform

# Configure environment
cp .env.example .env

# Run using Docker
docker-compose up --build
```

Backend API docs will be available at:

```
http://localhost:8000/docs
```

---

## 🧑‍⚖️ Evaluation Readiness

This project demonstrates:

* Strong system architecture
* Privacy-by-design implementation
* Secure authentication & authorization
* Clear real-world applicability
* Transparency and user trust

---

## 👥 Team & Contribution

Built as part of **Ingenious Hackathon 7.0**.

Each module follows a clean **repository & service-layer pattern** to ensure scalability and maintainability.

---

## 📄 License

