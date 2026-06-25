-- ============================================================================
-- Migracion 04: Calificaciones validas (problema #7)
-- APLICADA el 2026-06-10 via MCP (migraciones: rating_tabla_y_trigger_participacion
-- y revocar_ejecucion_funcion_trigger).
-- La tabla de calificaciones no existia en la BD real: se crea Rating y el
-- trigger que exige viaje completado y participacion real de ambos usuarios.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public."Rating" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public."Trip"(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
  rated_id UUID NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
  score INT NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT rating_unico_por_viaje UNIQUE (trip_id, rater_id, rated_id),
  CONSTRAINT rating_no_autocalificacion CHECK (rater_id <> rated_id)
);

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
  SELECT (status = 'COMPLETED') INTO v_completado
  FROM public."Trip" WHERE id = NEW.trip_id;

  IF NOT COALESCE(v_completado, FALSE) THEN
    RAISE EXCEPTION 'Solo se puede calificar un viaje completado';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public."Trip" t WHERE t.id = NEW.trip_id AND t.driver_id = NEW.rater_id
  ) OR EXISTS (
    SELECT 1 FROM public."Booking" b
    WHERE b.trip_id = NEW.trip_id AND b.passenger_id = NEW.rater_id AND b.status = 'CONFIRMED'
  ) INTO v_evaluador_ok;

  SELECT EXISTS (
    SELECT 1 FROM public."Trip" t WHERE t.id = NEW.trip_id AND t.driver_id = NEW.rated_id
  ) OR EXISTS (
    SELECT 1 FROM public."Booking" b
    WHERE b.trip_id = NEW.trip_id AND b.passenger_id = NEW.rated_id AND b.status = 'CONFIRMED'
  ) INTO v_evaluado_ok;

  IF NOT v_evaluador_ok OR NOT v_evaluado_ok THEN
    RAISE EXCEPTION 'Evaluador y evaluado deben haber participado en el viaje';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_verificar_participacion ON public."Rating";
CREATE TRIGGER trg_verificar_participacion
  BEFORE INSERT ON public."Rating"
  FOR EACH ROW EXECUTE FUNCTION public.verificar_participacion_calificacion();

-- La funcion de trigger no debe ser invocable via API REST.
REVOKE EXECUTE ON FUNCTION public.verificar_participacion_calificacion() FROM PUBLIC, anon, authenticated;
