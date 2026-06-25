import { createClient } from "npm:@supabase/supabase-js@2";

// Webhook de Mercado Pago. IMPORTANTE: se despliega con verify_jwt = false
// porque MP no envía JWT de Supabase. La seguridad viene de que el monto y el
// estado se consultan directamente a la API de MP con nuestro token (no se
// confía en el payload recibido) y de la idempotencia en process_external_payment.

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200 });
  }

  try {
    const url = new URL(req.url);
    let body: { type?: string; data?: { id?: string | number } } = {};
    try {
      body = await req.json();
    } catch {
      // Notificación sin body JSON (formato IPN): los datos vienen en la URL.
    }

    // Mercado Pago notifica en dos formatos:
    //  - Webhook: ?type=payment&data.id=123  (y body { type, data: { id } })
    //  - IPN:     ?topic=payment&id=123      (o topic=merchant_order, que ignoramos)
    const type =
      url.searchParams.get("type") ??
      url.searchParams.get("topic") ??
      body.type;
    const dataId =
      url.searchParams.get("data.id") ??
      url.searchParams.get("id") ??
      body.data?.id;

    // Solo procesamos eventos de tipo 'payment'; 200 para que MP no reintente el resto.
    if (type !== "payment" || !dataId) {
      return new Response(JSON.stringify({ received: true, ignored: true }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");
    if (!MP_ACCESS_TOKEN) throw new Error("Missing MP_ACCESS_TOKEN");

    // Consultar el estado real del pago a la API de Mercado Pago (fuente de verdad).
    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${dataId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
      },
    );

    if (!paymentResponse.ok) {
      console.error(`Error fetching payment ${dataId}`, await paymentResponse.text());
      return new Response("Error fetching payment from MP", { status: 500 });
    }

    const paymentData = await paymentResponse.json();

    if (paymentData.status === "approved") {
      const external_reference = paymentData.external_reference; // user_id de Supabase
      const transaction_amount = paymentData.transaction_amount;

      if (!external_reference) {
        console.error("Payment approved but no external_reference (user_id) found.");
        // 200 igual para que MP no reintente un pago que no podemos atribuir.
        return new Response("Missing external_reference", { status: 200 });
      }

      // Service Role (bypass RLS) para ejecutar el RPC de acreditación.
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );

      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "process_external_payment",
        {
          p_payment_id: paymentData.id.toString(),
          p_user_id: external_reference,
          p_amount: Math.round(Number(transaction_amount)),
        },
      );

      if (rpcError) {
        console.error("Error executing RPC process_external_payment:", rpcError);
        return new Response("Error processing payment in database", { status: 500 });
      }

      if (rpcData === false) {
        console.log(`Payment ${paymentData.id} already processed (idempotent).`);
      } else {
        console.log(
          `Payment ${paymentData.id} processed for user ${external_reference}. Amount: ${transaction_amount}`,
        );
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    const message = error instanceof Error ? error.message : String(error);
    // Distinto de 200 => MP reintentará la notificación.
    return new Response(JSON.stringify({ error: message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
