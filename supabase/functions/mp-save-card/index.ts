// Edge Function: mp-save-card
// Guarda una tarjeta del pasajero en Mercado Pago SIN cobrar nada.
// El cliente tokeniza la tarjeta (card_token de un solo uso) usando la public
// key de MP y envía ese token aquí. Esta función:
//   1) Asegura que el usuario tenga un Customer en MP (User.mp_customer_id).
//   2) Asocia la tarjeta al customer (POST /customers/{id}/cards).
//   3) Guarda los metadatos (brand, last_four, card_id) en PaymentMethod.
// Nunca recibe ni almacena el PAN/CVV: solo el token de un solo uso.
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

    const { card_token } = await req.json();
    if (!card_token) throw new Error("Falta card_token");

    // Usuario autenticado (desde el JWT del request).
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

    const { data: dbUser, error: dbErr } = await admin
      .from("User").select("mp_customer_id, email, full_name").eq("id", user.id).single();
    if (dbErr) throw new Error(`Error leyendo usuario: ${dbErr.message}`);

    // 1) Asegurar Customer en MP.
    let customerId = dbUser.mp_customer_id as string | null;
    if (!customerId) {
      // MP exige email; evitar duplicados buscando primero por email.
      const search = await fetch(
        `${MP_API}/v1/customers/search?email=${encodeURIComponent(dbUser.email)}`,
        { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } },
      );
      const searchData = await search.json();
      if (search.ok && Array.isArray(searchData.results) && searchData.results.length > 0) {
        customerId = searchData.results[0].id;
      } else {
        const created = await fetch(`${MP_API}/v1/customers`, {
          method: "POST",
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ email: dbUser.email, first_name: dbUser.full_name ?? undefined }),
        });
        const createdData = await created.json();
        if (!created.ok) throw new Error(`MP customer error: ${JSON.stringify(createdData)}`);
        customerId = createdData.id;
      }
      await admin.from("User").update({ mp_customer_id: customerId }).eq("id", user.id);
    }

    // 2) Asociar la tarjeta tokenizada al customer.
    const cardRes = await fetch(`${MP_API}/v1/customers/${customerId}/cards`, {
      method: "POST",
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ token: card_token }),
    });
    const card = await cardRes.json();
    if (!cardRes.ok) throw new Error(`MP card error: ${JSON.stringify(card)}`);

    const brand = card.payment_method?.name || card.payment_method?.id || null;
    const lastFour = card.last_four_digits || null;
    const holder = card.cardholder?.name || null;

    // 3) ¿Es la primera tarjeta? entonces es la predeterminada.
    const { count } = await admin
      .from("PaymentMethod").select("id", { count: "exact", head: true }).eq("user_id", user.id);
    const isDefault = (count ?? 0) === 0;

    const { data: saved, error: saveErr } = await admin
      .from("PaymentMethod")
      .upsert({
        user_id: user.id,
        mp_card_id: card.id,
        brand,
        last_four: lastFour,
        cardholder_name: holder,
        is_default: isDefault,
      }, { onConflict: "user_id,mp_card_id" })
      .select("id, brand, last_four, is_default")
      .single();
    if (saveErr) throw new Error(`Error guardando tarjeta: ${saveErr.message}`);

    return new Response(JSON.stringify({ success: true, card: saved }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
    });
  }
});
