-- ============================================================================
-- Migracion 07: defaults de id + columnas de documentos del conductor
-- APLICADA el 2026-06-10 via MCP (migracion: id_defaults_y_columnas_docs_conductor).
-- ============================================================================

-- Defaults de id: el esquema Prisma no definia gen_random_uuid(), por lo que
-- los inserts desde supabase-js (sin id explicito) fallaban. Prisma sigue
-- funcionando porque manda ids explicitos.
ALTER TABLE public."Trip" ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public."Booking" ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public."Vehicle" ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public."Wallet" ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Documentos del registro de conductor (antes en tablas 'conductores'/'vehiculos')
ALTER TABLE public."Vehicle" ADD COLUMN IF NOT EXISTS capacity INT NOT NULL DEFAULT 4;
ALTER TABLE public."Vehicle" ADD COLUMN IF NOT EXISTS registration_doc_url TEXT;
ALTER TABLE public."User" ADD COLUMN IF NOT EXISTS license_url TEXT;
ALTER TABLE public."User" ADD COLUMN IF NOT EXISTS cv_url TEXT;
