-- ============================================================================
-- Migracion 01: PIN seguro (problema #2 y #3)
-- APLICADA el 2026-06-10 via MCP (migracion: pin_seguro_rpc_validar_pin).
-- Adaptada al esquema real de la BD (tablas en ingles: Booking, Trip).
-- ============================================================================

-- 1. Columna para contar intentos fallidos de validacion de PIN.
ALTER TABLE public."Booking"
  ADD COLUMN IF NOT EXISTS pin_attempts INT NOT NULL DEFAULT 0;

-- 2. Funcion RPC que valida el PIN en el servidor SIN exponer la columna.
--    Solo el conductor del viaje puede validar; limite de 5 intentos.
CREATE OR REPLACE FUNCTION public.validar_pin(p_reserva_id UUID, p_pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pin TEXT;
  v_intentos INT;
  v_conductor UUID;
BEGIN
  SELECT t.driver_id INTO v_conductor
  FROM public."Booking" b
  JOIN public."Trip" t ON t.id = b.trip_id
  WHERE b.id = p_reserva_id;

  IF v_conductor IS NULL OR v_conductor <> auth.uid() THEN
    RAISE EXCEPTION 'No autorizado para validar esta reserva';
  END IF;

  SELECT boarding_pin, pin_attempts INTO v_pin, v_intentos
  FROM public."Booking"
  WHERE id = p_reserva_id;

  IF v_intentos >= 5 THEN
    RAISE EXCEPTION 'Demasiados intentos fallidos. PIN bloqueado.';
  END IF;

  IF v_pin = p_pin THEN
    UPDATE public."Booking" SET pin_attempts = 0 WHERE id = p_reserva_id;
    RETURN TRUE;
  ELSE
    UPDATE public."Booking" SET pin_attempts = pin_attempts + 1 WHERE id = p_reserva_id;
    RETURN FALSE;
  END IF;
END;
$$;

-- 3. RPC para que el pasajero consulte SU propio PIN (el acceso directo a la
--    columna queda revocado).
CREATE OR REPLACE FUNCTION public.obtener_pin_abordaje(p_reserva_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pin TEXT;
BEGIN
  SELECT boarding_pin INTO v_pin
  FROM public."Booking"
  WHERE id = p_reserva_id AND passenger_id = auth.uid();

  IF v_pin IS NULL THEN
    RAISE EXCEPTION 'Reserva no encontrada o no autorizada';
  END IF;
  RETURN v_pin;
END;
$$;

-- 4. Privilegios por columna: el cliente nunca lee boarding_pin ni pin_attempts.
REVOKE SELECT ON public."Booking" FROM anon, authenticated;
GRANT SELECT (id, trip_id, passenger_id, status, payment_status)
  ON public."Booking" TO authenticated;
REVOKE UPDATE ON public."Booking" FROM anon, authenticated;
GRANT UPDATE (status) ON public."Booking" TO authenticated;

-- 5. Solo usuarios autenticados ejecutan las funciones.
REVOKE EXECUTE ON FUNCTION public.validar_pin(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.validar_pin(UUID, TEXT) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.obtener_pin_abordaje(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.obtener_pin_abordaje(UUID) TO authenticated;
