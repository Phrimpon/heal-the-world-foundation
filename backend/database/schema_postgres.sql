-- PostgreSQL Schema for Heal The World Foundation (Advanced Option)

-- Create User Role Type
CREATE TYPE user_role AS ENUM ('Administrator', 'Donor', 'Volunteer', 'Member', 'Executive');
CREATE TYPE announcement_priority AS ENUM ('low', 'medium', 'high');

-- 1. User Accounts Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'Member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    amount_owed NUMERIC(12, 2) DEFAULT 0.00
);

-- 2. Personal Info Table
CREATE TABLE IF NOT EXISTS personal_info (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    bio TEXT,
    date_of_birth DATE
);

-- 3. Donations Table
CREATE TABLE IF NOT EXISTS donations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'GHS',
    status VARCHAR(50) DEFAULT 'Completed',
    donated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority announcement_priority DEFAULT 'medium',
    author VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Foundation Goals Table
CREATE TABLE IF NOT EXISTS foundation_goals (
    id SERIAL PRIMARY KEY,
    goal_title VARCHAR(255) NOT NULL,
    target_value NUMERIC(15, 2),
    current_value NUMERIC(15, 2) DEFAULT 0.00,
    category VARCHAR(100) DEFAULT 'General',
    deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Uploaded Images Table (Admin Only Restriction)
CREATE TABLE IF NOT EXISTS uploaded_images (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size INTEGER,
    uploaded_by_email VARCHAR(150) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Login Sessions Table
CREATE TABLE IF NOT EXISTS login_sessions (
    id VARCHAR(60) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(150) NOT NULL,
    username VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP WITH TIME ZONE,
    ip_address VARCHAR(45),
    device VARCHAR(100),
    browser VARCHAR(100),
    os VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Active',
    session_duration VARCHAR(30)
);

CREATE INDEX IF NOT EXISTS idx_sessions_email ON login_sessions(email);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON login_sessions(status);

-- 8. Invite Codes Table
CREATE TABLE IF NOT EXISTS invite_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indices for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_donations_user ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);
