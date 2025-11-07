-- Migration: Add Journal Entries and Progress Tracking
-- Created: 2025-01-07
-- Description: Adds tables for journal entries, progress metrics, user goals, and milestones

-- =============================================
-- 1. JOURNAL ENTRIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES therapy_sessions(id) ON DELETE SET NULL,
  title TEXT,
  content TEXT NOT NULL,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for journal_entries
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX idx_journal_entries_session_id ON journal_entries(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_journal_entries_tags ON journal_entries USING GIN(tags);

-- Row Level Security for journal_entries
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own journal entries"
  ON journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own journal entries"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
  ON journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
  ON journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_journal_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_journal_entries_updated_at();

-- =============================================
-- 2. PROGRESS METRICS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS progress_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL, -- 'mood', 'anxiety', 'sleep', 'energy', etc.
  value NUMERIC NOT NULL,
  notes TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for progress_metrics
CREATE INDEX idx_progress_metrics_user_id ON progress_metrics(user_id);
CREATE INDEX idx_progress_metrics_recorded_at ON progress_metrics(recorded_at DESC);
CREATE INDEX idx_progress_metrics_type ON progress_metrics(metric_type);
CREATE INDEX idx_progress_metrics_user_type ON progress_metrics(user_id, metric_type, recorded_at DESC);

-- Row Level Security for progress_metrics
ALTER TABLE progress_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress metrics"
  ON progress_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress metrics"
  ON progress_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress metrics"
  ON progress_metrics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress metrics"
  ON progress_metrics FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 3. USER GOALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL, -- 'journal_frequency', 'session_frequency', 'mood_average', etc.
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for user_goals
CREATE INDEX idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX idx_user_goals_status ON user_goals(status);
CREATE INDEX idx_user_goals_end_date ON user_goals(end_date);

-- Row Level Security for user_goals
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goals"
  ON user_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
  ON user_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON user_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON user_goals FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE TRIGGER user_goals_updated_at
  BEFORE UPDATE ON user_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_journal_entries_updated_at();

-- =============================================
-- 4. USER MILESTONES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL, -- 'session_count', 'journal_streak', 'time_based', 'mood_improvement', etc.
  title TEXT NOT NULL,
  description TEXT,
  value NUMERIC, -- e.g., 10 for "10 sessions completed"
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  is_acknowledged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for user_milestones
CREATE INDEX idx_user_milestones_user_id ON user_milestones(user_id);
CREATE INDEX idx_user_milestones_achieved_at ON user_milestones(achieved_at DESC);
CREATE INDEX idx_user_milestones_is_acknowledged ON user_milestones(is_acknowledged);

-- Row Level Security for user_milestones
ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own milestones"
  ON user_milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own milestones"
  ON user_milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own milestones"
  ON user_milestones FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own milestones"
  ON user_milestones FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 5. ENHANCE EXISTING TABLES
-- =============================================

-- Add mood_score to session_summaries if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'session_summaries'
    AND column_name = 'mood_score'
  ) THEN
    ALTER TABLE session_summaries
    ADD COLUMN mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10);
  END IF;
END $$;

-- =============================================
-- 6. HELPER FUNCTIONS
-- =============================================

-- Function to calculate journal streak for a user
CREATE OR REPLACE FUNCTION get_journal_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak_count INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  has_entry BOOLEAN;
BEGIN
  LOOP
    -- Check if there's a journal entry for this date
    SELECT EXISTS (
      SELECT 1 FROM journal_entries
      WHERE user_id = p_user_id
      AND DATE(created_at) = check_date
    ) INTO has_entry;

    -- If no entry found, break the loop
    IF NOT has_entry THEN
      EXIT;
    END IF;

    -- Increment streak and check previous day
    streak_count := streak_count + 1;
    check_date := check_date - INTERVAL '1 day';
  END LOOP;

  RETURN streak_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get mood statistics for a user
CREATE OR REPLACE FUNCTION get_mood_stats(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  avg_mood NUMERIC,
  min_mood INTEGER,
  max_mood INTEGER,
  total_entries BIGINT,
  mood_trend TEXT
) AS $$
DECLARE
  recent_avg NUMERIC;
  older_avg NUMERIC;
BEGIN
  -- Get average mood from journal entries in the specified period
  SELECT
    ROUND(AVG(mood_score)::NUMERIC, 2),
    MIN(mood_score),
    MAX(mood_score),
    COUNT(*)
  INTO avg_mood, min_mood, max_mood, total_entries
  FROM journal_entries
  WHERE user_id = p_user_id
    AND mood_score IS NOT NULL
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL;

  -- Calculate trend by comparing recent half vs older half
  SELECT AVG(mood_score) INTO recent_avg
  FROM journal_entries
  WHERE user_id = p_user_id
    AND mood_score IS NOT NULL
    AND created_at >= NOW() - (p_days/2 || ' days')::INTERVAL;

  SELECT AVG(mood_score) INTO older_avg
  FROM journal_entries
  WHERE user_id = p_user_id
    AND mood_score IS NOT NULL
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL
    AND created_at < NOW() - (p_days/2 || ' days')::INTERVAL;

  -- Determine trend
  IF recent_avg IS NULL OR older_avg IS NULL THEN
    mood_trend := 'insufficient_data';
  ELSIF recent_avg > older_avg + 0.5 THEN
    mood_trend := 'improving';
  ELSIF recent_avg < older_avg - 0.5 THEN
    mood_trend := 'declining';
  ELSE
    mood_trend := 'stable';
  END IF;

  RETURN QUERY SELECT avg_mood, min_mood, max_mood, total_entries, mood_trend;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate weekly goals
CREATE OR REPLACE FUNCTION create_weekly_goals(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  avg_journal_entries NUMERIC;
  avg_sessions NUMERIC;
BEGIN
  -- Calculate averages from past 4 weeks
  SELECT AVG(weekly_count) INTO avg_journal_entries
  FROM (
    SELECT COUNT(*) as weekly_count
    FROM journal_entries
    WHERE user_id = p_user_id
      AND created_at >= NOW() - INTERVAL '4 weeks'
    GROUP BY DATE_TRUNC('week', created_at)
  ) subquery;

  SELECT AVG(weekly_count) INTO avg_sessions
  FROM (
    SELECT COUNT(*) as weekly_count
    FROM therapy_sessions
    WHERE user_id = p_user_id
      AND status = 'completed'
      AND started_at >= NOW() - INTERVAL '4 weeks'
    GROUP BY DATE_TRUNC('week', started_at)
  ) subquery;

  -- Create journal goal (slightly higher than average)
  IF avg_journal_entries IS NOT NULL AND avg_journal_entries > 0 THEN
    INSERT INTO user_goals (user_id, goal_type, title, target_value, start_date, end_date)
    VALUES (
      p_user_id,
      'journal_frequency',
      'Weekly Journal Goal',
      LEAST(CEIL(avg_journal_entries * 1.1), 7), -- Max 7 (daily)
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '7 days'
    );
  END IF;

  -- Create session goal
  IF avg_sessions IS NOT NULL AND avg_sessions > 0 THEN
    INSERT INTO user_goals (user_id, goal_type, title, target_value, start_date, end_date)
    VALUES (
      p_user_id,
      'session_frequency',
      'Weekly Session Goal',
      LEAST(CEIL(avg_sessions * 1.1), 7),
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '7 days'
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 7. AUDIT LOGGING INTEGRATION
-- =============================================

-- Add audit events for journal entries
CREATE OR REPLACE FUNCTION audit_journal_entry()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO privacy_audit (user_id, event, details)
    VALUES (NEW.user_id, 'journal_entry_created', jsonb_build_object('entry_id', NEW.id));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO privacy_audit (user_id, event, details)
    VALUES (OLD.user_id, 'journal_entry_deleted', jsonb_build_object('entry_id', OLD.id));
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_journal_entry_trigger
  AFTER INSERT OR DELETE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION audit_journal_entry();

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
