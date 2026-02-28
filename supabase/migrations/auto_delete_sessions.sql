-- Auto-delete quiz sessions 1 hour after creation
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor)

-- 1. Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Create sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_code text NOT NULL UNIQUE,
  player1_name text,
  player2_name text,
  game_mode text DEFAULT 'online',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '1 hour')
);

-- 3. Create index on expires_at for efficient cleanup
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_expires_at ON quiz_sessions (expires_at);

-- 4. RLS policies
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert sessions
CREATE POLICY IF NOT EXISTS "Anyone can create sessions"
  ON quiz_sessions FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read sessions (needed to join)
CREATE POLICY IF NOT EXISTS "Anyone can read sessions"
  ON quiz_sessions FOR SELECT
  USING (true);

-- 5. Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM quiz_sessions WHERE expires_at < now();
END;
$$;

-- 6. Schedule cleanup every 15 minutes via pg_cron
-- (will delete sessions older than 1 hour)
SELECT cron.schedule(
  'cleanup-expired-sessions',
  '*/15 * * * *',
  'SELECT cleanup_expired_sessions()'
);

-- 7. Also auto-delete reviews that are very old and not approved (anti-spam cleanup)
-- This deletes non-approved reviews older than 30 days
CREATE OR REPLACE FUNCTION cleanup_old_unapproved_reviews()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM reviews
  WHERE is_approved = false
  AND created_at < now() - interval '30 days';
END;
$$;

-- Schedule daily cleanup of old unapproved reviews
SELECT cron.schedule(
  'cleanup-old-reviews',
  '0 3 * * *',
  'SELECT cleanup_old_unapproved_reviews()'
);
