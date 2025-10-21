-- Migration: Consent & Data Management
-- Description: Adds tables and policies for consent management, data exports, and account deletion
-- Version: 1.0
-- Date: 2025-01-21

-- ============================================================================
-- 1. CONSENT RECORDS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_version TEXT NOT NULL,                  -- e.g. "v1.0"
  consent_text_hash TEXT NOT NULL,                -- sha256 of the copy shown
  acknowledged_ai_limitations BOOLEAN NOT NULL,
  confirmed_not_emergency BOOLEAN NOT NULL,
  confirmed_age_over_18 BOOLEAN NOT NULL,
  accepted_terms_privacy BOOLEAN NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en-GB',
  ip_inet INET,                                   -- optional, for audit
  user_agent TEXT,                                -- optional, for audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX idx_user_consents_created_at ON user_consents(created_at DESC);

-- RLS policies for user_consents
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own consent records"
  ON user_consents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consent records"
  ON user_consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only system/admin can update or delete (users create new records instead)


-- ============================================================================
-- 2. USER SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  has_active_consent BOOLEAN NOT NULL DEFAULT FALSE,
  consent_version TEXT,
  data_retention_days INTEGER NOT NULL DEFAULT 365,
  allow_data_export BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS policies for user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================================
-- 3. DATA EXPORTS TABLE
-- ============================================================================
CREATE TYPE export_status AS ENUM ('queued','processing','ready','failed');

CREATE TABLE IF NOT EXISTS data_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status export_status NOT NULL DEFAULT 'queued',
  file_path TEXT,                    -- path in storage bucket
  error TEXT,
  expires_at TIMESTAMPTZ,            -- when download link expires (24h)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_data_exports_user_id ON data_exports(user_id);
CREATE INDEX idx_data_exports_status ON data_exports(status);
CREATE INDEX idx_data_exports_created_at ON data_exports(created_at DESC);

-- RLS policies for data_exports
ALTER TABLE data_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own export requests"
  ON data_exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own export requests"
  ON data_exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only system can update export status (via service role)


-- ============================================================================
-- 4. DELETION REQUESTS TABLE
-- ============================================================================
CREATE TYPE delete_status AS ENUM ('queued','processing','completed','failed','canceled');

CREATE TABLE IF NOT EXISTS deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status delete_status NOT NULL DEFAULT 'queued',
  reason TEXT,
  confirmation_phrase TEXT,          -- the typed "DELETE" confirmation
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_deletion_requests_user_id ON deletion_requests(user_id);
CREATE INDEX idx_deletion_requests_status ON deletion_requests(status);
CREATE INDEX idx_deletion_requests_created_at ON deletion_requests(created_at DESC);

-- RLS policies for deletion_requests
ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own deletion requests"
  ON deletion_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deletion requests"
  ON deletion_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only system can update deletion status


-- ============================================================================
-- 5. PRIVACY AUDIT TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS privacy_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event TEXT NOT NULL,                 -- e.g. "consent.accepted", "export.requested"
  details JSONB,                       -- metadata (no message content)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_privacy_audit_user_id ON privacy_audit(user_id);
CREATE INDEX idx_privacy_audit_event ON privacy_audit(event);
CREATE INDEX idx_privacy_audit_created_at ON privacy_audit(created_at DESC);

-- RLS policies for privacy_audit
ALTER TABLE privacy_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs"
  ON privacy_audit FOR SELECT
  USING (auth.uid() = user_id);

-- Only system can insert audit logs (via service role)


-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_exports_updated_at
  BEFORE UPDATE ON data_exports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deletion_requests_updated_at
  BEFORE UPDATE ON deletion_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- 7. INITIAL DATA / SEED
-- ============================================================================

-- Create user_settings for existing users (if any)
-- This should be run carefully in production with proper user consent
-- INSERT INTO user_settings (user_id, has_active_consent)
-- SELECT id, false FROM auth.users
-- WHERE NOT EXISTS (SELECT 1 FROM user_settings WHERE user_id = auth.users.id);


-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. RLS is enabled on all tables with owner-only access
-- 2. System operations (background jobs) should use service_role key
-- 3. Consider adding rate limiting at application layer for exports/deletions
-- 4. Remember to set up storage bucket policies for export files
-- 5. Cascade deletes are configured to clean up when user is deleted
