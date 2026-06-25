const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { amount, title, user_id } = await req.json();

    if (!user_id) {
      throw new Error("Missing user_id in request body");
    }

    // Token de Mercado Pago: configurar con `supabase secrets set MP_ACCESS_TOKEN=...`
    const ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");
    if (!ACCESS_TOKEN) {
      throw new Error("MP_ACCESS_TOKEN no está configurado en los secrets de la función");
    }

    // We create the preference via the MP API
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: title || "Carga de Saldo - RouteShare",
            quantity: 1,
            currency_id: "CLP",
            unit_price: amount || 5000,
          },
        ],
        external_reference: user_id,
        notification_url: "https://jsutuayzayjrkmlidjav.supabase.co/functions/v1/mercadopago-webhook",
        back_urls: {
          success: "https://routeshare.success",
          failure: "https://routeshare.failure",
          pending: "https://routeshare.pending"
        },
        auto_return: "approved"
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Mercado Pago API error: ${JSON.stringify(data)}`);
    }

    return new Response(
      JSON.stringify({ 
        init_point: data.init_point, 
        sandbox_init_point: data.sandbox_init_point,
        preference_id: data.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
