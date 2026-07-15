-- 013_enable_rls_requirements.sql
-- Enable RLS and add policies for requirements-related tables

BEGIN;

-- Enable RLS on tables currently without it
ALTER TABLE public.requirement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirement_subitems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;

-- Remove existing permissive policies on these tables (avoid duplicates/conflicts)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'requirement_items', 'requirement_subitems', 'client_vehicles', 'client_drivers', 'client_documents'
      )
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I;', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Common role check: authenticated users whose profiles.role is admin or developer
-- Requirement Items
CREATE POLICY requirement_items_select
ON public.requirement_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin','developer')
  )
);

CREATE POLICY requirement_items_insert
ON public.requirement_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin','developer')
  )
);

CREATE POLICY requirement_items_update
ON public.requirement_items
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

CREATE POLICY requirement_items_delete
ON public.requirement_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin','developer')
  )
);

-- Requirement Subitems
CREATE POLICY requirement_subitems_select
ON public.requirement_subitems
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin','developer')
  )
);

CREATE POLICY requirement_subitems_insert
ON public.requirement_subitems
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin','developer')
  )
);

CREATE POLICY requirement_subitems_update
ON public.requirement_subitems
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

CREATE POLICY requirement_subitems_delete
ON public.requirement_subitems
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin','developer')
  )
);

-- Client Vehicles
CREATE POLICY client_vehicles_select
ON public.client_vehicles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin','developer')
  )
);

CREATE POLICY client_vehicles_insert
ON public.client_vehicles
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin','developer')
  )
);

CREATE POLICY client_vehicles_update
ON public.client_vehicles
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

CREATE POLICY client_vehicles_delete
ON public.client_vehicles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin','developer')
  )
);

-- Client Drivers
CREATE POLICY client_drivers_select
ON public.client_drivers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin','developer')
  )
);

CREATE POLICY client_drivers_insert
ON public.client_drivers
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin','developer')
  )
);

CREATE POLICY client_drivers_update
ON public.client_drivers
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

CREATE POLICY client_drivers_delete
ON public.client_drivers
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin','developer')
  )
);

-- Client Documents
CREATE POLICY client_documents_select
ON public.client_documents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin','developer')
  )
);

CREATE POLICY client_documents_insert
ON public.client_documents
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin','developer')
  )
);

CREATE POLICY client_documents_update
ON public.client_documents
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

CREATE POLICY client_documents_delete
ON public.client_documents
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
