-- ============================================================================
-- Migracion 02: Asientos atomicos (problema #4)
-- Ejecutar en el SQL Editor de Supabase.
-- ============================================================================

-- Decremento atomico: solo descuenta si hay asientos disponibles.
CREATE OR REPLACE FUNCTION public.reservar_asiento(p_viaje_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_afectados INT;
BEGIN
  UPDATE public.viajes
  SET asientos_disponibles = asientos_disponibles - 1
  WHERE id = p_viaje_id
    AND asientos_disponibles > 0;

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
  UPDATE public.viajes
  SET asientos_disponibles = asientos_disponibles + 1
  WHERE id = p_viaje_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reservar_asiento(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.liberar_asiento(UUID) TO authenticated;
