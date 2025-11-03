-- Migration: Add Text Therapy Sessions Support
-- Description: Adds text session support and subscription tier management
-- Version: 1.0
-- Date: 2025-01-03

-- ============================================================================
-- 1. ADD SESSION TYPE TO THERAPY_SESSIONS
-- ============================================================================
-- Add session_type column to existing therapy_sessions table
ALTER TABLE therapy_sessions
ADD COLUMN IF NOT EXISTS session_type TEXT DEFAULT 'voice' CHECK (session_type IN ('voice', 'text'));

-- Create index for filtering by session type
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_session_type ON therapy_sessions(session_type);

-- ============================================================================
-- 2. ADD SUBSCRIPTION TIER TO USER_SETTINGS
-- ============================================================================
-- Add subscription tier and session tracking to user_settings
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
ADD COLUMN IF NOT EXISTS weekly_text_sessions_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_session_reset_date DATE DEFAULT CURRENT_DATE;

-- Create index for efficient tier lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_subscription_tier ON user_settings(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_user_settings_reset_date ON user_settings(last_session_reset_date);

-- ============================================================================
-- 3. FUNCTION TO RESET WEEKLY SESSION COUNTS
-- ============================================================================
-- Function to check and reset weekly session counts if a week has passed
CREATE OR REPLACE FUNCTION reset_weekly_sessions_if_needed(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_last_reset DATE;
  v_days_since_reset INTEGER;
BEGIN
  -- Get the last reset date for the user
  SELECT last_session_reset_date INTO v_last_reset
  FROM user_settings
  WHERE user_id = p_user_id;

  -- If no settings exist yet, create them
  IF v_last_reset IS NULL THEN
    INSERT INTO user_settings (user_id, weekly_text_sessions_count, last_session_reset_date)
    VALUES (p_user_id, 0, CURRENT_DATE)
    ON CONFLICT (user_id) DO UPDATE
    SET weekly_text_sessions_count = 0,
        last_session_reset_date = CURRENT_DATE;
    RETURN;
  END IF;

  -- Calculate days since last reset
  v_days_since_reset := CURRENT_DATE - v_last_reset;

  -- If 7 or more days have passed, reset the counter
  IF v_days_since_reset >= 7 THEN
    UPDATE user_settings
    SET weekly_text_sessions_count = 0,
        last_session_reset_date = CURRENT_DATE
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. FUNCTION TO CHECK SESSION LIMIT
-- ============================================================================
-- Function to check if user can start a new text session
CREATE OR REPLACE FUNCTION can_start_text_session(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier TEXT;
  v_count INTEGER;
BEGIN
  -- Reset counter if needed
  PERFORM reset_weekly_sessions_if_needed(p_user_id);

  -- Get user's subscription tier and session count
  SELECT subscription_tier, weekly_text_sessions_count
  INTO v_tier, v_count
  FROM user_settings
  WHERE user_id = p_user_id;

  -- If no settings exist, create default (free tier, 0 sessions)
  IF v_tier IS NULL THEN
    INSERT INTO user_settings (user_id, subscription_tier, weekly_text_sessions_count, last_session_reset_date)
    VALUES (p_user_id, 'free', 0, CURRENT_DATE)
    ON CONFLICT (user_id) DO NOTHING;

    v_tier := 'free';
    v_count := 0;
  END IF;

  -- Premium users have unlimited sessions
  IF v_tier = 'premium' THEN
    RETURN TRUE;
  END IF;

  -- Free users are limited to 3 sessions per week
  RETURN (v_count < 3);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. FUNCTION TO INCREMENT SESSION COUNT
-- ============================================================================
-- Function to increment the weekly text session count
CREATE OR REPLACE FUNCTION increment_text_session_count(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Reset counter if needed
  PERFORM reset_weekly_sessions_if_needed(p_user_id);

  -- Increment the counter
  UPDATE user_settings
  SET weekly_text_sessions_count = weekly_text_sessions_count + 1
  WHERE user_id = p_user_id;

  -- If no row was updated, create the settings entry
  IF NOT FOUND THEN
    INSERT INTO user_settings (user_id, weekly_text_sessions_count, last_session_reset_date)
    VALUES (p_user_id, 1, CURRENT_DATE)
    ON CONFLICT (user_id) DO UPDATE
    SET weekly_text_sessions_count = user_settings.weekly_text_sessions_count + 1;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. ADD PRIVACY AUDIT LOGGING FOR TEXT SESSIONS
-- ============================================================================
-- Ensure text sessions are tracked in privacy audit
-- (Privacy audit table already exists from previous migration)

-- ============================================================================
-- 7. UPDATE RLS POLICIES (if needed)
-- ============================================================================
-- The existing RLS policies on therapy_sessions should work for both types
-- Users can only access their own sessions regardless of type

-- ============================================================================
-- 8. ADD COMMENT DOCUMENTATION
-- ============================================================================
COMMENT ON COLUMN therapy_sessions.session_type IS 'Type of therapy session: voice (ElevenLabs) or text (OpenAI chat)';
COMMENT ON COLUMN user_settings.subscription_tier IS 'User subscription tier: free (3 text sessions/week + no voice) or premium (unlimited text + voice)';
COMMENT ON COLUMN user_settings.weekly_text_sessions_count IS 'Number of text therapy sessions started this week (resets every 7 days)';
COMMENT ON COLUMN user_settings.last_session_reset_date IS 'Date when the weekly session counter was last reset';
