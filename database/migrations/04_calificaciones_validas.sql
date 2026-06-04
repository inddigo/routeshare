-- ============================================================================
-- Migracion 04: Calificaciones validas (problema #7)
-- Ejecutar en el SQL Editor de Supabase.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.verificar_participacion_calificacion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_completado BOOLEAN;
  v_evaluador_ok BOOLEAN;
  v_evaluado_ok BOOLEAN;
BEGIN
  SELECT (estado = 'completado') INTO v_completado
  FROM public.viajes WHERE id = NEW.viaje_id;

  IF NOT COALESCE(v_completado, FALSE) THEN
    RAISE EXCEPTION 'Solo se puede calificar un viaje completado';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.viajes v WHERE v.id = NEW.viaje_id AND v.conductor_id = NEW.evaluador_id
  ) OR EXISTS (
    SELECT 1 FROM public.reservas r
    WHERE r.viaje_id = NEW.viaje_id AND r.pasajero_id = NEW.evaluador_id AND r.estado = 'confirmada'
  ) INTO v_evaluador_ok;

  SELECT EXISTS (
    SELECT 1 FROM public.viajes v WHERE v.id = NEW.viaje_id AND v.conductor_id = NEW.evaluado_id
  ) OR EXISTS (
    SELECT 1 FROM public.reservas r
    WHERE r.viaje_id = NEW.viaje_id AND r.pasajero_id = NEW.evaluado_id AND r.estado = 'confirmada'
  ) INTO v_evaluado_ok;

  IF NOT v_evaluador_ok OR NOT v_evaluado_ok THEN
    RAISE EXCEPTION 'Evaluador y evaluado deben haber participado en el viaje';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_verificar_participacion ON public.calificaciones;
CREATE TRIGGER trg_verificar_participacion
  BEFORE INSERT ON public.calificaciones
  FOR EACH ROW EXECUTE FUNCTION public.verificar_participacion_calificacion();
