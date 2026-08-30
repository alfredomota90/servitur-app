-- 016_project_status.sql
-- Add status column to projects table (active/inactive)

BEGIN;

-- 1. Add status column with default 'active'
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'inactive'));

-- 2. Ensure all existing projects are marked as active
UPDATE public.projects SET status = 'active' WHERE status IS NULL;

COMMIT;
