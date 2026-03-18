-- Migration script for Timebox 8: User Management
-- Adds the `is_active` status column to the users table.

ALTER TABLE cs_users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
