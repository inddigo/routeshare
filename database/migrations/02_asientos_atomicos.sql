-- ============================================================================
-- Migracion 02: Asientos atomicos (problema #4)
-- APLICADA el 2026-06-10 via MCP (migracion: asientos_atomicos_rpc).
-- Adaptada al esquema real de la BD (tabla Trip.available_seats).
-- Los nombres de funcion/parametro se mantienen porque el cliente ya los llama
-- (reservationService, driverService, noShowService).
-- ============================================================================

-- Decremento atomico: solo descuenta si hay asientos y el viaje sigue agendado.
CREATE OR REPLACE FUNCTION public.reservar_asiento(p_viaje_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_afectados INT;
BEGIN
  UPDATE public."Trip"
  SET available_seats = available_seats - 1
  WHERE id = p_viaje_id
    AND available_seats > 0
    AND status = 'SCHEDULED';

  GET DIAGNOSTICS v_afectados = ROW_COUNT;
  RETURN v_afectados > 0;
END;
$$;

-- Incremento atomico (cancelacion / rechazo / no-show).
CREATE OR REPLACE FUNCTION public.liberar_asiento(p_viaje_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public."Trip"
  SET available_seats = available_seats + 1
  WHERE id = p_viaje_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.reservar_asiento(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reservar_asiento(UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.liberar_asiento(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.liberar_asiento(UUID) TO authenticated;
