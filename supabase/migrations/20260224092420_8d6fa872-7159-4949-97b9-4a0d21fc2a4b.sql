
-- Create table for teen quiz multiplayer sessions
CREATE TABLE public.quiz_ado_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
  question_indices INTEGER[] NOT NULL,
  player1_name TEXT NOT NULL,
  player1_answers JSONB DEFAULT '[]'::jsonb,
  player2_name TEXT,
  player2_answers JSONB DEFAULT '[]'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 minutes')
);

-- Enable RLS
ALTER TABLE public.quiz_ado_sessions ENABLE ROW LEVEL SECURITY;

-- Anyone can read sessions (needed for joining and realtime)
CREATE POLICY "Anyone can read sessions by code"
  ON public.quiz_ado_sessions FOR SELECT USING (true);

-- Anyone can create sessions
CREATE POLICY "Anyone can create sessions"
  ON public.quiz_ado_sessions FOR INSERT WITH CHECK (true);

-- Anyone can update sessions (for submitting answers)
CREATE POLICY "Anyone can update sessions"
  ON public.quiz_ado_sessions FOR UPDATE USING (true);

-- Index on code for fast lookups
CREATE INDEX idx_quiz_ado_sessions_code ON public.quiz_ado_sessions (code);

-- Index on expires_at for cleanup
CREATE INDEX idx_quiz_ado_sessions_expires ON public.quiz_ado_sessions (expires_at);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_quiz_ado_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_quiz_ado_sessions_updated_at
  BEFORE UPDATE ON public.quiz_ado_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_quiz_ado_updated_at();

-- Enable realtime for live sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_ado_sessions;
