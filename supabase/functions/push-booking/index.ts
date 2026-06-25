import { createClient } from "npm:@supabase/supabase-js@2";

// Envía notificaciones push (FCM HTTP v1) al conductor cuando un pasajero
// reserva o cancela un cupo. La invoca el trigger notificar_booking (pg_net)
// con un secreto compartido; se despliega con verify_jwt = false.
//
// Secrets requeridos (supabase secrets set):
//   FCM_SERVICE_ACCOUNT  -> JSON del service account de Firebase (Project
//                           Settings -> Service accounts -> Generate new private key)
//   PUSH_WEBHOOK_SECRET  -> mismo valor que vault 'push_webhook_secret'

interface ServiceAccount {
  project_id: string;
  client_email: string;
  private_key: string;
}

function base64url(data: Uint8Array | string): string {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// OAuth2 con JWT firmado RS256 (scope de FCM) usando crypto.subtle.
async function getFcmAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(JSON.stringify({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claims}`;

  const pem = sa.private_key
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const keyData = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "pkcs8",
    keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned),
  );
  const jwt = `${unsigned}.${base64url(new Uint8Array(signature))}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`OAuth token error: ${await res.text()}`);
  const json = await res.json();
  return json.access_token;
}

Deno.serve(async (req: Request) => {
  try {
    // Autenticación del webhook interno (trigger de Postgres).
    const expected = Deno.env.get("PUSH_WEBHOOK_SECRET");
    if (expected && req.headers.get("x-webhook-secret") !== expected) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { evento, trip_id, passenger_id } = await req.json();
    if (!evento || !trip_id) {
      return new Response("Missing evento/trip_id", { status: 400 });
    }

    const saRaw = Deno.env.get("FCM_SERVICE_ACCOUNT");
    if (!saRaw) {
      console.error("FCM_SERVICE_ACCOUNT no está configurado; notificación omitida.");
      return new Response(JSON.stringify({ sent: 0, reason: "missing FCM_SERVICE_ACCOUNT" }), { status: 200 });
    }
    const sa: ServiceAccount = JSON.parse(saRaw);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Contexto: viaje, conductor y pasajero.
    const { data: trip, error: tripError } = await supabase
      .from("Trip")
      .select("driver_id, origin_name, destination_name")
      .eq("id", trip_id)
      .single();
    if (tripError || !trip) throw new Error(`Trip no encontrado: ${tripError?.message}`);

    const { data: passenger } = await supabase
      .from("User")
      .select("full_name")
      .eq("id", passenger_id)
      .single();
    const passengerName = passenger?.full_name || "Un pasajero";

    const { data: tokens } = await supabase
      .from("DeviceToken")
      .select("token")
      .eq("user_id", trip.driver_id);

    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: "driver sin tokens" }), { status: 200 });
    }

    const ruta = `${trip.origin_name} → ${trip.destination_name}`;
    const notification = evento === "nueva_reserva"
      ? { title: "Nueva reserva 🚗", body: `${passengerName} reservó un cupo en tu viaje ${ruta}` }
      : { title: "Reserva cancelada", body: `${passengerName} canceló su cupo en ${ruta}` };

    const accessToken = await getFcmAccessToken(sa);

    let sent = 0;
    for (const { token } of tokens) {
      const fcmRes = await fetch(
        `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: {
              token,
              notification,
              data: { evento, trip_id: String(trip_id) },
              android: { priority: "high" },
            },
          }),
        },
      );

      if (fcmRes.ok) {
        sent++;
      } else {
        const errText = await fcmRes.text();
        console.error(`FCM error para token ${token.slice(0, 12)}…:`, errText);
        // Token inválido/expirado: se elimina para no reintentar.
        if (errText.includes("UNREGISTERED") || errText.includes("INVALID_ARGUMENT")) {
          await supabase.from("DeviceToken").delete().eq("token", token);
        }
      }
    }

    return new Response(JSON.stringify({ sent, total: tokens.length }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("push-booking error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
