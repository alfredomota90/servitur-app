-- 015_invoices_cfdi_uuid_unique.sql
-- Add cfdi_uuid (folio fiscal / UUID del TimbreFiscalDigital) to invoices
-- as a globally unique key across all clients and projects.

BEGIN;

ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS cfdi_uuid text;

-- UNIQUE sobre cfdi_uuid garantiza que un folio fiscal no pueda repetirse
-- entre ningún cliente ni proyecto. Los NULL (facturas sin CFDI) no se bloquean.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'invoices_cfdi_uuid_key' AND conrelid = 'public.invoices'::regclass
  ) THEN
    ALTER TABLE public.invoices ADD CONSTRAINT invoices_cfdi_uuid_key UNIQUE (cfdi_uuid);
  END IF;
END $$;

COMMIT;
