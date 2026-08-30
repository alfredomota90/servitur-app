-- 017_client_status.sql
-- Add status column to clients table (active/inactive)

BEGIN;

-- 1. Add status column with default 'active'
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'inactive'));

-- 2. Ensure all existing clients are marked as active
UPDATE public.clients SET status = 'active' WHERE status IS NULL;

COMMIT;
