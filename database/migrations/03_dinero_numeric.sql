-- ============================================================================
-- Migracion 03: Dinero con NUMERIC en vez de FLOAT (problema #6)
-- Ejecutar en el SQL Editor de Supabase.
-- ============================================================================

ALTER TABLE public.reservas
  ALTER COLUMN monto TYPE NUMERIC(10,2) USING monto::NUMERIC(10,2);

ALTER TABLE public.pagos
  ALTER COLUMN monto TYPE NUMERIC(10,2) USING monto::NUMERIC(10,2);

ALTER TABLE public.pagos
  ALTER COLUMN comision_porcentaje TYPE NUMERIC(5,4)
  USING comision_porcentaje::NUMERIC(5,4);
