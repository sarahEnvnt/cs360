-- Migration: Add permissions column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '["dashboard","accounts","surveys","reports"]';

-- Update existing admin users to have all permissions including user management
UPDATE users SET permissions = '["dashboard","accounts","surveys","reports","users"]' WHERE role = 'admin';

-- Ensure all other existing users have default permissions
UPDATE users SET permissions = '["dashboard","accounts","surveys","reports"]' WHERE permissions IS NULL;
