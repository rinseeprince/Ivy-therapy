-- Migration: Remove redundant users table and reference auth.users directly
-- Description: Fixes schema to use Supabase's built-in auth.users instead of custom users table
-- Version: 1.3
-- Date: 2025-01-22

-- 1. Drop RLS policy on custom users table
DROP POLICY IF EXISTS "Users can view their own data" ON users;

-- 2. Disable RLS on users table before dropping
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;

-- 3. Drop the foreign key constraint on therapy_sessions that references public.users
ALTER TABLE therapy_sessions
DROP CONSTRAINT IF EXISTS therapy_sessions_user_id_fkey;

-- 4. Add new foreign key to auth.users instead
ALTER TABLE therapy_sessions
ADD CONSTRAINT therapy_sessions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. Drop the redundant public.users table
DROP TABLE IF EXISTS users;

-- Note: therapy_sessions RLS policy already uses auth.uid() correctly, no changes needed
-- Note: session_summaries references therapy_sessions, so it works correctly via the chain

COMMENT ON TABLE therapy_sessions IS 'Therapy sessions - user_id now references auth.users(id) directly';
