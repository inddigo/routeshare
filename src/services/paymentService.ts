// src/services/paymentService.ts
// Pago "tarjeta-en-archivo" estilo Uber con Mercado Pago.
//  - tokenizeCard: convierte los datos de la tarjeta en un token de un solo uso
//    usando la PUBLIC KEY de MP (el PAN/CVV nunca llegan a nuestro servidor).
//  - saveCard: envía el token a la Edge Function mp-save-card (la asocia al
//    customer de MP y la guarda en PaymentMethod, SIN cobrar).
//  - listCards / deleteCard: gestión de las tarjetas guardadas.
//  - chargeTrip: cobra la tarjeta al iniciar el viaje (Edge Function mp-charge-trip).
import { supabase } from './supabase';
import { handleServiceCall } from './serviceHelpers';
import { logger } from './logger';
import { MP_PUBLIC_KEY } from '@env';

const MP_API = 'https://api.mercadopago.com';

export interface CardInput {
  number: string; // puede venir con espacios
  holderName: string;
  expiry: string; // "MM/AA" o "MM/AAAA"
  cvv: string;
  rut: string; // identificación requerida por MP Chile
}

export interface SavedCard {
  id: string;
  brand: string | null;
  last_four: string | null;
  is_default: boolean;
}

// Tokeniza la tarjeta directamente contra MP con la public key.
const tokenizeCard = async (card: CardInput): Promise<string> => {
  if (!MP_PUBLIC_KEY || MP_PUBLIC_KEY.includes('xxxx')) {
    throw new Error('Falta configurar MP_PUBLIC_KEY en el .env');
  }
  const [mmRaw, yyRaw] = card.expiry.split('/').map((s) => s.trim());
  const month = parseInt(mmRaw, 10);
  const year = yyRaw?.length === 2 ? 2000 + parseInt(yyRaw, 10) : parseInt(yyRaw, 10);
  if (!month || !year) throw new Error('Fecha de expiración inválida (usa MM/AA)');

  const res = await fetch(`${MP_API}/v1/card_tokens?public_key=${encodeURIComponent(MP_PUBLIC_KEY)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      card_number: card.number.replace(/\s/g, ''),
      security_code: card.cvv,
      expiration_month: month,
      expiration_year: year,
      cardholder: {
        name: card.holderName,
        identification: { type: 'RUT', number: card.rut.replace(/[.-]/g, '') },
      },
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.id) {
    const cause = data?.cause?.[0]?.description || data?.message || JSON.stringify(data);
    throw new Error(`No se pudo validar la tarjeta: ${cause}`);
  }
  return data.id as string;
};

export const paymentService = {
  // Tokeniza y guarda la tarjeta (sin cobro).
  saveCard: (card: CardInput) =>
    handleServiceCall(async () => {
      const token = await tokenizeCard(card);
      const { data, error } = await supabase.functions.invoke('mp-save-card', {
        body: { card_token: token },
      });
      if (error) throw new Error(await readFnError(error));
      if (data?.error) throw new Error(data.error);
      return data.card as SavedCard;
    }, 'paymentService.saveCard'),

  // Lista las tarjetas guardadas del usuario (RLS: solo las propias).
  listCards: () =>
    handleServiceCall(async () => {
      const { data, error } = await supabase
        .from('PaymentMethod')
        .select('id, brand, last_four, is_default')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as SavedCard[];
    }, 'paymentService.listCards'),

  // Elimina una tarjeta guardada (la fila; el cobro siempre lee de aquí).
  deleteCard: (id: string) =>
    handleServiceCall(async () => {
      const { error } = await supabase.from('PaymentMethod').delete().eq('id', id);
      if (error) throw error;
      return true;
    }, 'paymentService.deleteCard'),

  // Cobra la tarjeta del pasajero al iniciar el viaje (lo invoca el conductor).
  chargeTrip: (bookingId: string) =>
    handleServiceCall(async () => {
      const { data, error } = await supabase.functions.invoke('mp-charge-trip', {
        body: { booking_id: bookingId },
      });
      if (error) throw new Error(await readFnError(error));
      if (data?.error) throw new Error(data.error);
      return data as { success: boolean; payment_id?: string; already_paid?: boolean };
    }, 'paymentService.chargeTrip'),
};

// Extrae el mensaje real de un error de supabase.functions.invoke.
async function readFnError(error: any): Promise<string> {
  try {
    if (error?.context) {
      const body = await error.context.json();
      return body.error || body.message || error.message;
    }
  } catch {
    logger.warn('No se pudo parsear el error de la función');
  }
  return error?.message || 'Error procesando el pago';
}
