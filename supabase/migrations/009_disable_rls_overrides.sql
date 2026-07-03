-- Disable RLS on client_item_overrides so the upsert works
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'client_item_overrides') THEN
    ALTER TABLE client_item_overrides DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;
