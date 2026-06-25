-- ============================================================================
-- Migracion 08: RPCs de escrow sobre Wallet + Booking.payment_status
-- APLICADA el 2026-06-10 via MCP (migracion: escrow_rpcs_wallet).
-- Reemplaza la antigua tabla 'pagos' (que nunca existio en la BD real).
-- El cliente no puede escribir Wallet ni payment_status directamente
-- (RLS/grants); todo movimiento de dinero pasa por estas funciones
-- SECURITY DEFINER que validan identidad con auth.uid() y usan el precio
-- server-side del viaje (Trip.suggested_price_clp).
-- ============================================================================

-- Retener pago: pasajero -> escrow (al crear/confirmar la reserva).
CREATE OR REPLACE FUNCTION public.retener_pago(p_reserva_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pasajero UUID;
  v_trip UUID;
  v_estado_pago "PaymentStatus";
  v_precio INT;
  v_afectados INT;
BEGIN
  SELECT b.passenger_id, b.trip_id, b.payment_status
  INTO v_pasajero, v_trip, v_estado_pago
  FROM public."Booking" b
  WHERE b.id = p_reserva_id;

  IF v_pasajero IS NULL THEN
    RAISE EXCEPTION 'Reserva no encontrada';
  END IF;
  IF v_pasajero <> auth.uid() THEN
    RAISE EXCEPTION 'Solo el pasajero puede pagar su reserva';
  END IF;
  IF v_estado_pago <> 'PENDING' THEN
    RAISE EXCEPTION 'El pago ya fue procesado (estado: %)', v_estado_pago;
  END IF;

  SELECT suggested_price_clp INTO v_precio FROM public."Trip" WHERE id = v_trip;

  UPDATE public."Wallet"
  SET available_balance = available_balance - v_precio,
      escrow_balance = escrow_balance + v_precio
  WHERE user_id = v_pasajero
    AND available_balance >= v_precio;

  GET DIAGNOSTICS v_afectados = ROW_COUNT;
  IF v_afectados = 0 THEN
    RAISE EXCEPTION 'Saldo insuficiente en la billetera';
  END IF;

  UPDATE public."Booking" SET payment_status = 'ESCROW' WHERE id = p_reserva_id;
END;
$$;

-- Reembolsar: escrow -> pasajero (cancelacion, rechazo, no-show).
-- Si no hay nada retenido, es no-op (los flujos de cancelacion no fallan).
CREATE OR REPLACE FUNCTION public.reembolsar_pago(p_reserva_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pasajero UUID;
  v_trip UUID;
  v_conductor UUID;
  v_estado_pago "PaymentStatus";
  v_precio INT;
BEGIN
  SELECT b.passenger_id, b.trip_id, b.payment_status
  INTO v_pasajero, v_trip, v_estado_pago
  FROM public."Booking" b
  WHERE b.id = p_reserva_id;

  IF v_pasajero IS NULL THEN
    RAISE EXCEPTION 'Reserva no encontrada';
  END IF;

  SELECT driver_id, suggested_price_clp INTO v_conductor, v_precio
  FROM public."Trip" WHERE id = v_trip;

  IF auth.uid() <> v_pasajero AND auth.uid() <> v_conductor THEN
    RAISE EXCEPTION 'No autorizado para reembolsar esta reserva';
  END IF;

  IF v_estado_pago <> 'ESCROW' THEN
    RETURN;
  END IF;

  UPDATE public."Wallet"
  SET escrow_balance = escrow_balance - v_precio,
      available_balance = available_balance + v_precio
  WHERE user_id = v_pasajero;

  UPDATE public."Booking" SET payment_status = 'PENDING' WHERE id = p_reserva_id;
END;
$$;

-- Liberar pagos de un viaje: escrow de cada pasajero -> conductor (menos 7%).
-- Solo el conductor, y solo con el viaje COMPLETED.
CREATE OR REPLACE FUNCTION public.liberar_pagos_viaje(p_viaje_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conductor UUID;
  v_precio INT;
  v_estado "TripStatus";
  v_neto INT;
  v_liberados INT := 0;
  r RECORD;
BEGIN
  SELECT driver_id, suggested_price_clp, status
  INTO v_conductor, v_precio, v_estado
  FROM public."Trip" WHERE id = p_viaje_id;

  IF v_conductor IS NULL THEN
    RAISE EXCEPTION 'Viaje no encontrado';
  END IF;
  IF v_conductor <> auth.uid() THEN
    RAISE EXCEPTION 'Solo el conductor puede liberar los pagos';
  END IF;
  IF v_estado <> 'COMPLETED' THEN
    RAISE EXCEPTION 'Solo se liberan pagos de un viaje completado';
  END IF;

  -- Comision 7%; CLP es entero, sin decimales.
  v_neto := ROUND(v_precio * 0.93);

  -- Asegurar billetera del conductor.
  INSERT INTO public."Wallet" (id, user_id)
  SELECT gen_random_uuid(), v_conductor
  WHERE NOT EXISTS (SELECT 1 FROM public."Wallet" WHERE user_id = v_conductor);

  FOR r IN
    SELECT id, passenger_id FROM public."Booking"
    WHERE trip_id = p_viaje_id AND status = 'CONFIRMED' AND payment_status = 'ESCROW'
    FOR UPDATE
  LOOP
    UPDATE public."Wallet"
    SET escrow_balance = escrow_balance - v_precio
    WHERE user_id = r.passenger_id;

    UPDATE public."Wallet"
    SET available_balance = available_balance + v_neto
    WHERE user_id = v_conductor;

    UPDATE public."Booking" SET payment_status = 'RELEASED' WHERE id = r.id;
    v_liberados := v_liberados + 1;
  END LOOP;

  RETURN v_liberados;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.retener_pago(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.retener_pago(UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.reembolsar_pago(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reembolsar_pago(UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.liberar_pagos_viaje(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.liberar_pagos_viaje(UUID) TO authenticated;
