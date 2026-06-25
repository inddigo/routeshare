// Edge Function: mp-charge-trip
// Cobra la tarjeta guardada del pasajero al INICIAR el viaje (modelo Uber).
// La invoca el conductor al validar el abordaje. Verifica que quien llama sea
// el conductor del viaje, cobra el precio del viaje a la tarjeta predeterminada
// del pasajero y marca la reserva como PAID.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MP_API = "https://api.mercadopago.com";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");
    if (!ACCESS_TOKEN) throw new Error("MP_ACCESS_TOKEN no configurado");

    const { booking_id } = await req.json();
    if (!booking_id) throw new Error("Falta booking_id");

    // Quien llama debe ser el conductor (autenticado).
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } },
    );
    const { data: { user }, error: userErr } = await authClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Reserva + viaje.
    const { data: booking, error: bErr } = await admin
      .from("Booking")
      .select("id, passenger_id, trip_id, payment_status, mp_payment_id")
      .eq("id", booking_id).single();
    if (bErr || !booking) throw new Error("Reserva no encontrada");

    // Idempotencia: si ya está pagada, no recobrar.
    if (booking.payment_status === "PAID") {
      return new Response(JSON.stringify({ success: true, already_paid: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
      });
    }

    const { data: trip, error: tErr } = await admin
      .from("Trip").select("id, driver_id, suggested_price_clp").eq("id", booking.trip_id).single();
    if (tErr || !trip) throw new Error("Viaje no encontrado");

    if (trip.driver_id !== user.id) {
      return new Response(JSON.stringify({ error: "Solo el conductor puede cobrar este viaje" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amount = Number(trip.suggested_price_clp) || 0;
    if (amount <= 0) throw new Error("Precio del viaje inválido");

    // Tarjeta predeterminada del pasajero + su customer en MP.
    const { data: pm, error: pmErr } = await admin
      .from("PaymentMethod")
      .select("mp_card_id")
      .eq("user_id", booking.passenger_id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1).maybeSingle();
    if (pmErr) throw new Error(`Error leyendo tarjeta: ${pmErr.message}`);
    if (!pm) throw new Error("El pasajero no tiene una tarjeta guardada");

    const { data: passenger } = await admin
      .from("User").select("mp_customer_id, email").eq("id", booking.passenger_id).single();
    if (!passenger?.mp_customer_id) throw new Error("El pasajero no tiene cliente de pago");

    // 1) Generar un card_token de un solo uso a partir de la tarjeta guardada.
    const tokenRes = await fetch(`${MP_API}/v1/card_tokens`, {
      method: "POST",
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ card_id: pm.mp_card_id }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(`MP token error: ${JSON.stringify(tokenData)}`);

    // 2) Crear el pago (cobro real). Clave de idempotencia = booking_id para
    //    evitar cobros duplicados ante reintentos.
    const payRes = await fetch(`${MP_API}/v1/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `trip-${booking_id}`,
      },
      body: JSON.stringify({
        transaction_amount: amount,
        token: tokenData.id,
        description: "Viaje RouteShare",
        installments: 1,
        payment_method_id: tokenData.payment_method_id,
        payer: { type: "customer", id: passenger.mp_customer_id, email: passenger.email },
      }),
    });
    const payment = await payRes.json();

    if (!payRes.ok || payment.status === "rejected") {
      const detail = payment.status_detail || JSON.stringify(payment);
      throw new Error(`Cobro rechazado: ${detail}`);
    }

    // 3) Marcar la reserva como pagada.
    await admin.from("Booking").update({
      payment_status: "PAID",
      mp_payment_id: String(payment.id),
      paid_at: new Date().toISOString(),
    }).eq("id", booking_id);

    return new Response(JSON.stringify({
      success: true, payment_id: payment.id, status: payment.status,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
    });
  }
});
