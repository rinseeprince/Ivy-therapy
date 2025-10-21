-- Migration: Fix Audit RLS Policy
-- Description: Allow service role to insert into privacy_audit table
-- Version: 1.2
-- Date: 2025-01-21

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Users can view their own audit logs" ON privacy_audit;

-- Recreate policy for users to view their own logs
CREATE POLICY "Users can view their own audit logs"
  ON privacy_audit FOR SELECT
  USING (auth.uid() = user_id);

-- Allow service role to insert audit logs (bypasses RLS)
-- This is needed because audit logs are written server-side
CREATE POLICY "Service role can insert audit logs"
  ON privacy_audit FOR INSERT
  WITH CHECK (true);

-- Note: The service role check happens at the authentication level,
-- not in the policy. Any request with service_role key can insert.
