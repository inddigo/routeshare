-- ============================================================================
-- Migracion 01: PIN seguro (problema #2 y #3)
-- Ejecutar en el SQL Editor de Supabase.
-- ============================================================================

-- 1. Columna para contar intentos fallidos de validacion de PIN.
ALTER TABLE public.reservas
  ADD COLUMN IF NOT EXISTS pin_intentos INT NOT NULL DEFAULT 0;

-- 2. Funcion RPC que valida el PIN en el servidor SIN exponer la columna.
--    SECURITY DEFINER permite leer el pin aunque el rol del usuario no tenga
--    acceso directo de SELECT a esa columna.
--    Incluye limite de intentos (5) para frenar fuerza bruta.
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
  -- Solo el conductor del viaje asociado puede validar el PIN.
  SELECT v.conductor_id INTO v_conductor
  FROM public.reservas r
  JOIN public.viajes v ON v.id = r.viaje_id
  WHERE r.id = p_reserva_id;

  IF v_conductor IS NULL OR v_conductor <> auth.uid() THEN
    RAISE EXCEPTION 'No autorizado para validar esta reserva';
  END IF;

  SELECT pin, pin_intentos INTO v_pin, v_intentos
  FROM public.reservas
  WHERE id = p_reserva_id;

  -- Bloqueo por exceso de intentos.
  IF v_intentos >= 5 THEN
    RAISE EXCEPTION 'Demasiados intentos fallidos. PIN bloqueado.';
  END IF;

  IF v_pin = p_pin THEN
    RETURN TRUE;
  ELSE
    UPDATE public.reservas
    SET pin_intentos = pin_intentos + 1
    WHERE id = p_reserva_id;
    RETURN FALSE;
  END IF;
END;
$$;

-- 3. Restringir el acceso directo a la columna pin.
REVOKE SELECT ON public.reservas FROM authenticated;
GRANT SELECT (id, viaje_id, pasajero_id, estado, monto, estado_pago)
  ON public.reservas TO authenticated;

-- Permitir ejecutar la funcion a usuarios autenticados.
GRANT EXECUTE ON FUNCTION public.validar_pin(UUID, TEXT) TO authenticated;
