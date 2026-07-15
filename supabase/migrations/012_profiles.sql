-- 012_profiles.sql
-- Track profiles table in migrations (already exists in production DB)

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  email text NOT NULL,
  role text NULL DEFAULT 'admin'::text,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
) TABLESPACE pg_default;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid duplicates on re-run
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.profiles;', r.policyname);
  END LOOP;
END $$;

-- Allow authenticated users to read profiles (needed by RLS policies on other tables)
CREATE POLICY profiles_select
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Trigger: auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Backfill: create profiles for existing auth users that lack one
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
