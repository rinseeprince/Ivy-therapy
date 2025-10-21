-- Migration: Add Pending Deletion Flag
-- Description: Adds flag to immediately mark accounts for deletion while background job processes
-- Version: 1.1
-- Date: 2025-01-21

-- Add pending_deletion flag to user_settings
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS pending_deletion BOOLEAN NOT NULL DEFAULT FALSE;

-- Add index for quick lookup of pending deletions
CREATE INDEX IF NOT EXISTS idx_user_settings_pending_deletion
ON user_settings(pending_deletion)
WHERE pending_deletion = true;

-- Add timestamp for when deletion was initiated
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ;

COMMENT ON COLUMN user_settings.pending_deletion IS 'True when account is marked for deletion - user should be logged out immediately';
COMMENT ON COLUMN user_settings.deletion_requested_at IS 'Timestamp when user requested account deletion';
