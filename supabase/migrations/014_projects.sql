-- 014_projects.sql
-- Add projects table and project_id foreign keys to related tables

BEGIN;

-- 1. Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  name text NOT NULL,
  description text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_client_id_fkey FOREIGN KEY (client_id)
    REFERENCES public.clients(id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);

-- 2. Add project_id to invoices
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'invoices') THEN
    ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS project_id uuid NULL;
    ALTER TABLE public.invoices ADD CONSTRAINT invoices_project_id_fkey FOREIGN KEY (project_id)
      REFERENCES public.projects(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_invoices_project_id ON public.invoices(project_id);
  END IF;
END $$;

-- 3. Add project_id to client_vehicles
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'client_vehicles') THEN
    ALTER TABLE public.client_vehicles ADD COLUMN IF NOT EXISTS project_id uuid NULL;
    ALTER TABLE public.client_vehicles ADD CONSTRAINT client_vehicles_project_id_fkey FOREIGN KEY (project_id)
      REFERENCES public.projects(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_client_vehicles_project_id ON public.client_vehicles(project_id);
  END IF;
END $$;

-- 4. Add project_id to client_drivers
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'client_drivers') THEN
    ALTER TABLE public.client_drivers ADD COLUMN IF NOT EXISTS project_id uuid NULL;
    ALTER TABLE public.client_drivers ADD CONSTRAINT client_drivers_project_id_fkey FOREIGN KEY (project_id)
      REFERENCES public.projects(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_client_drivers_project_id ON public.client_drivers(project_id);
  END IF;
END $$;

-- 5. Add project_id to client_documents
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'client_documents') THEN
    ALTER TABLE public.client_documents ADD COLUMN IF NOT EXISTS project_id uuid NULL;
    ALTER TABLE public.client_documents ADD CONSTRAINT client_documents_project_id_fkey FOREIGN KEY (project_id)
      REFERENCES public.projects(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_client_documents_project_id ON public.client_documents(project_id);
  END IF;
END $$;

-- 6. Add project_id to client_item_overrides
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'client_item_overrides') THEN
    ALTER TABLE public.client_item_overrides ADD COLUMN IF NOT EXISTS project_id uuid NULL;
    ALTER TABLE public.client_item_overrides ADD CONSTRAINT client_item_overrides_project_id_fkey FOREIGN KEY (project_id)
      REFERENCES public.projects(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_client_item_overrides_project_id ON public.client_item_overrides(project_id);
  END IF;
END $$;

-- 7. Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Projects policies (same pattern as other tables)
CREATE POLICY projects_select
ON public.projects
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin','developer')
  )
);

CREATE POLICY projects_insert
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin','developer')
  )
);

CREATE POLICY projects_update
ON public.projects
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin','developer')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin','developer')
  )
);

CREATE POLICY projects_delete
ON public.projects
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin','developer')
  )
);

COMMIT;
