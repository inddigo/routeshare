-- ============================================================================
-- Migracion 06: RLS + politicas base (advisor critico de Supabase)
-- APLICADA el 2026-06-10 via MCP (migracion: rls_politicas_base).
-- El backend con service_role no se ve afectado (bypassa RLS).
-- ============================================================================

ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Vehicle" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Trip" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Wallet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Rating" ENABLE ROW LEVEL SECURITY;

-- ===== User: perfiles visibles entre autenticados; cada uno edita el suyo =====
DROP POLICY IF EXISTS user_select ON public."User";
CREATE POLICY user_select ON public."User"
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS user_insert_propio ON public."User";
CREATE POLICY user_insert_propio ON public."User"
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS user_update_propio ON public."User";
CREATE POLICY user_update_propio ON public."User"
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- ===== Vehicle: visible para autenticados; el conductor gestiona el suyo =====
DROP POLICY IF EXISTS vehicle_select ON public."Vehicle";
CREATE POLICY vehicle_select ON public."Vehicle"
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS vehicle_insert_propio ON public."Vehicle";
CREATE POLICY vehicle_insert_propio ON public."Vehicle"
  FOR INSERT TO authenticated WITH CHECK (driver_id = auth.uid());

DROP POLICY IF EXISTS vehicle_update_propio ON public."Vehicle";
CREATE POLICY vehicle_update_propio ON public."Vehicle"
  FOR UPDATE TO authenticated USING (driver_id = auth.uid()) WITH CHECK (driver_id = auth.uid());

DROP POLICY IF EXISTS vehicle_delete_propio ON public."Vehicle";
CREATE POLICY vehicle_delete_propio ON public."Vehicle"
  FOR DELETE TO authenticated USING (driver_id = auth.uid());

-- ===== Trip: busqueda abierta a autenticados; el conductor gestiona los suyos =====
DROP POLICY IF EXISTS trip_select ON public."Trip";
CREATE POLICY trip_select ON public."Trip"
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS trip_insert_conductor ON public."Trip";
CREATE POLICY trip_insert_conductor ON public."Trip"
  FOR INSERT TO authenticated WITH CHECK (driver_id = auth.uid());

DROP POLICY IF EXISTS trip_update_conductor ON public."Trip";
CREATE POLICY trip_update_conductor ON public."Trip"
  FOR UPDATE TO authenticated USING (driver_id = auth.uid()) WITH CHECK (driver_id = auth.uid());

DROP POLICY IF EXISTS trip_delete_conductor ON public."Trip";
CREATE POLICY trip_delete_conductor ON public."Trip"
  FOR DELETE TO authenticated USING (driver_id = auth.uid());

-- ===== Booking: visible para el pasajero o el conductor del viaje =====
DROP POLICY IF EXISTS booking_select_participantes ON public."Booking";
CREATE POLICY booking_select_participantes ON public."Booking"
  FOR SELECT TO authenticated USING (
    passenger_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public."Trip" t WHERE t.id = trip_id AND t.driver_id = auth.uid())
  );

DROP POLICY IF EXISTS booking_insert_pasajero ON public."Booking";
CREATE POLICY booking_insert_pasajero ON public."Booking"
  FOR INSERT TO authenticated WITH CHECK (passenger_id = auth.uid());

DROP POLICY IF EXISTS booking_update_participantes ON public."Booking";
CREATE POLICY booking_update_participantes ON public."Booking"
  FOR UPDATE TO authenticated USING (
    passenger_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public."Trip" t WHERE t.id = trip_id AND t.driver_id = auth.uid())
  );

-- ===== Wallet: cada usuario solo lee su billetera; escrituras solo backend =====
DROP POLICY IF EXISTS wallet_select_propio ON public."Wallet";
CREATE POLICY wallet_select_propio ON public."Wallet"
  FOR SELECT TO authenticated USING (user_id = auth.uid());

REVOKE INSERT, UPDATE, DELETE ON public."Wallet" FROM anon, authenticated;

-- ===== Rating: lectura abierta a autenticados; insertar solo como evaluador =====
DROP POLICY IF EXISTS rating_select ON public."Rating";
CREATE POLICY rating_select ON public."Rating"
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS rating_insert_evaluador ON public."Rating";
CREATE POLICY rating_insert_evaluador ON public."Rating"
  FOR INSERT TO authenticated WITH CHECK (rater_id = auth.uid());
