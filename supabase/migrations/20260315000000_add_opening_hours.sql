-- Add opening_hours JSONB column to annuaire_professionals
-- Format: { "monday": { "morning_start": "09:00", "morning_end": "12:00", "afternoon_start": "14:00", "afternoon_end": "18:00", "closed": false }, ... }
-- If a day has no lunch break, only morning_start and afternoon_end are used.
-- If closed is true, the day is skipped.

ALTER TABLE public.annuaire_professionals
  ADD COLUMN IF NOT EXISTS opening_hours JSONB DEFAULT NULL;

COMMENT ON COLUMN public.annuaire_professionals.opening_hours IS 'Weekly schedule as JSON: keys are monday-sunday, each with morning_start, morning_end, afternoon_start, afternoon_end, closed';
