-- ============================================================================
-- Migracion 10: Integracion de Webhooks de Mercado Pago
-- Crea tabla para idempotencia y funcion RPC segura.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public."TopupTransaction" (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL,
    amount INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en TopupTransaction para evitar accesos directos desde cliente
ALTER TABLE public."TopupTransaction" ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.process_external_payment(
    p_payment_id TEXT,
    p_user_id UUID,
    p_amount INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    -- Verificar si el pago ya fue procesado
    SELECT EXISTS(SELECT 1 FROM public."TopupTransaction" WHERE id = p_payment_id) INTO v_exists;
    
    IF v_exists THEN
        -- El pago ya se procesó, retornamos false para indicar que fue ignorado (idempotencia)
        RETURN FALSE;
    END IF;

    -- Registrar la transaccion
    INSERT INTO public."TopupTransaction" (id, user_id, amount)
    VALUES (p_payment_id, p_user_id, p_amount);

    -- Asegurar que exista la billetera
    INSERT INTO public."Wallet" (id, user_id, available_balance, escrow_balance)
    SELECT gen_random_uuid(), p_user_id, 0, 0
    WHERE NOT EXISTS (SELECT 1 FROM public."Wallet" WHERE user_id = p_user_id);

    -- Sumar el saldo real a la billetera
    UPDATE public."Wallet"
    SET available_balance = available_balance + p_amount
    WHERE user_id = p_user_id;

    RETURN TRUE;
END;
$$;

-- Solo permitir su ejecución a roles del servidor o supabase_admin (no expuesto a authenticated)
REVOKE EXECUTE ON FUNCTION public.process_external_payment(TEXT, UUID, INT) FROM PUBLIC, anon, authenticated;
