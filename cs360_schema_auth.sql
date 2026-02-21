-- Migration: Add password_hash to users table for JWT auth
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Seed an admin user (password: admin123) - hash generated with bcrypt 12 rounds
-- You can also register via the API: POST /api/auth/register
INSERT INTO users (email, name, role, password_hash)
VALUES ('admin@cs360.local', 'Admin', 'admin', '$2a$12$JAA2M4FTPQRwIWMWytHTFOVWiqMZKmWog7kZMdmYT9OPlVq7OhMG.')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;
