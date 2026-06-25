-- ============================================================================
-- Migracion 16: Pago "tarjeta-en-archivo" estilo Uber con Mercado Pago.
--
-- Modelo nuevo: el pasajero guarda una tarjeta (token en MP, sin cobro) y la
-- tarjeta se cobra automaticamente al INICIAR el viaje (no al reservar).
--
-- Esta migracion es ADITIVA: no elimina el wallet ni los RPC de escrow, para
-- que el flujo actual siga funcionando hasta hacer el corte definitivo una vez
-- probado el cobro real con credenciales de Mercado Pago.
--
-- Aplicar con la CLI/MCP de Supabase.
-- ============================================================================

-- 1) Nuevos estados de pago para el cobro a tarjeta.
--    (ALTER TYPE ADD VALUE es idempotente con IF NOT EXISTS en PG12+.)
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'PAID';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'REFUNDED';

-- 2) Identificador de cliente de Mercado Pago por usuario. Agrupa las tarjetas
--    guardadas del usuario en MP.
ALTER TABLE public."User" ADD COLUMN IF NOT EXISTS mp_customer_id TEXT;

-- 3) Tarjetas guardadas del usuario. NO guardamos datos sensibles de la tarjeta
--    (PAN/CVV): solo el id de tarjeta tokenizada en MP y metadatos para mostrar.
CREATE TABLE IF NOT EXISTS public."PaymentMethod" (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
  mp_card_id      TEXT NOT NULL,
  brand           TEXT,
  last_four       TEXT,
  cardholder_name TEXT,
  is_default      BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, mp_card_id)
);

CREATE INDEX IF NOT EXISTS idx_paymentmethod_user ON public."PaymentMethod"(user_id);

-- 4) Trazabilidad del cobro en la reserva.
ALTER TABLE public."Booking" ADD COLUMN IF NOT EXISTS mp_payment_id TEXT;
ALTER TABLE public."Booking" ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- 5) RLS de PaymentMethod: el usuario ve/borra solo sus tarjetas. La INSERCION
--    la hace exclusivamente la Edge Function (service role), nunca el cliente,
--    porque el alta requiere validar el token contra la API de Mercado Pago.
ALTER TABLE public."PaymentMethod" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pm_select_own" ON public."PaymentMethod";
DROP POLICY IF EXISTS "pm_delete_own" ON public."PaymentMethod";

CREATE POLICY "pm_select_own" ON public."PaymentMethod"
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "pm_delete_own" ON public."PaymentMethod"
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- (Sin policy de INSERT/UPDATE para authenticated: solo el service role escribe.)
