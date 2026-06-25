-- ============================================================================
-- Migracion 13: notificaciones push (DeviceToken + trigger de Booking)
-- APLICADA el 2026-06-10 via MCP (migracion: device_tokens_y_trigger_push).
-- El secreto compartido vive en Vault como 'push_webhook_secret' (creado por
-- separado con vault.create_secret; NO se versiona aqui). El mismo valor debe
-- configurarse como secret PUSH_WEBHOOK_SECRET de la Edge Function.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE TABLE IF NOT EXISTS public."DeviceToken" (
  token TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'android',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public."DeviceToken" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS devicetoken_select_propio ON public."DeviceToken";
CREATE POLICY devicetoken_select_propio ON public."DeviceToken"
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS devicetoken_insert_propio ON public."DeviceToken";
CREATE POLICY devicetoken_insert_propio ON public."DeviceToken"
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS devicetoken_update_propio ON public."DeviceToken";
CREATE POLICY devicetoken_update_propio ON public."DeviceToken"
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS devicetoken_delete_propio ON public."DeviceToken";
CREATE POLICY devicetoken_delete_propio ON public."DeviceToken"
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Trigger: al crear una reserva o cancelarla, notifica a la Edge Function
-- push-booking (async via pg_net, no bloquea la transaccion).
CREATE OR REPLACE FUNCTION public.notificar_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_secret TEXT;
  v_evento TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_evento := 'nueva_reserva';
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'CANCELLED' AND OLD.status IS DISTINCT FROM 'CANCELLED' THEN
    v_evento := 'reserva_cancelada';
  ELSE
    RETURN NEW;
  END IF;

  SELECT decrypted_secret INTO v_secret
  FROM vault.decrypted_secrets
  WHERE name = 'push_webhook_secret'
  LIMIT 1;

  PERFORM net.http_post(
    url := 'https://jsutuayzayjrkmlidjav.supabase.co/functions/v1/push-booking',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', COALESCE(v_secret, '')
    ),
    body := jsonb_build_object(
      'evento', v_evento,
      'booking_id', NEW.id,
      'trip_id', NEW.trip_id,
      'passenger_id', NEW.passenger_id
    )
  );

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.notificar_booking() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_notificar_booking ON public."Booking";
CREATE TRIGGER trg_notificar_booking
  AFTER INSERT OR UPDATE ON public."Booking"
  FOR EACH ROW EXECUTE FUNCTION public.notificar_booking();
