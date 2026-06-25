-- ============================================================================
-- Migracion 17: eliminar rastro de Stripe. El proyecto usa SOLO Mercado Pago
-- para el pago tarjeta-en-archivo (ver migracion 16 + Edge Functions mp-*).
-- La columna stripe_customer_id queda sin uso; el equivalente es mp_customer_id.
-- ============================================================================

ALTER TABLE public."User" DROP COLUMN IF EXISTS stripe_customer_id;
