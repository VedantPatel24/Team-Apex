-- Database Schema for Agri-Identity Platform
-- Target: PostgreSQL

-- 0. Cleanup (Reset)
-- DROP TABLE IF EXISTS loan_application CASCADE;
-- DROP TABLE IF EXISTS admin CASCADE;
-- DROP TABLE IF EXISTS document CASCADE;
-- DROP TABLE IF EXISTS accesslog CASCADE;
-- DROP TABLE IF EXISTS consent CASCADE;
-- DROP TABLE IF EXISTS service CASCADE;
-- DROP TABLE IF EXISTS farmer CASCADE;

-- 1. Farmers Table (Identity Vault)
CREATE TABLE IF NOT EXISTS farmer (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    otp_code VARCHAR(10),
    otp_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Services Table (Relying Parties / Apps)
CREATE TABLE IF NOT EXISTS service (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR(255) UNIQUE NOT NULL,
    client_secret VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    redirect_uri VARCHAR(255),
    allowed_scopes JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Consents Table (User Permissions)
CREATE TABLE IF NOT EXISTS consent (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES farmer(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES service(id) ON DELETE CASCADE,
    granted_scopes JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    revoked_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- 4. Access Logs Table (Audit Trail)
CREATE TABLE IF NOT EXISTS accesslog (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES farmer(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES service(id) ON DELETE CASCADE,
    action VARCHAR(255),
    resource TEXT,
    ip_address VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50),
    details TEXT
);

-- 5. Documents Table (Secure Vault)
CREATE TABLE IF NOT EXISTS document (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES farmer(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    doc_type VARCHAR(50) DEFAULT 'OTHER', -- IDENTITY, LAND_RECORD, CROP_DETAILS, BANK_STATEMENT, etc.
    filename VARCHAR(255) NOT NULL,
    storage_path VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    is_sensitive BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Admin Table (Service Providers)
CREATE TABLE IF NOT EXISTS admin (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Plaintext for hackathon demo
    service_id INTEGER REFERENCES service(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Loan Applications Table
CREATE TABLE IF NOT EXISTS loan_application (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES farmer(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES service(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, MORE_INFO
    documents_snapshot JSONB DEFAULT '[]', -- List of doc IDs shared at time of application
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_farmer_phone ON farmer(phone_number);
CREATE INDEX IF NOT EXISTS idx_service_client_id ON service(client_id);
CREATE INDEX IF NOT EXISTS idx_consent_farmer ON consent(farmer_id);
CREATE INDEX IF NOT EXISTS idx_accesslog_farmer ON accesslog(farmer_id);
