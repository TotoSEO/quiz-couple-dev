-- Create messages table for contact form submissions
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  last_name text NOT NULL,
  first_name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  message text NOT NULL,
  lang text DEFAULT 'fr',
  ip text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Only service role can insert/read/update/delete (edge functions use service role key)
CREATE POLICY "Service role full access" ON public.messages
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Index for admin queries
CREATE INDEX idx_messages_status ON public.messages (status);
CREATE INDEX idx_messages_created_at ON public.messages (created_at DESC);
