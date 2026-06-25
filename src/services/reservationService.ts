// src/services/reservationService.ts
import { supabase } from './supabase';
import { escrowService } from './escrowService';
import { generatePin } from './validationService';
import { logger } from './logger';

// Columnas de Booking legibles por el cliente (boarding_pin y pin_attempts
// están restringidas por grants; el pasajero consulta su PIN con el RPC
// obtener_pin_abordaje).
const BOOKING_COLS = 'id, trip_id, passenger_id, status, payment_status';

export const reservationService = {
  createReservation: async (viajeId: string, pasajeroId: string) => {
    try {
      // 1. Reservar asiento de forma atomica (evita condicion de carrera).
      const { data: reservado, error: asientoError } = await supabase.rpc(
        'reservar_asiento',
        { p_viaje_id: viajeId },
      );
      if (asientoError) throw asientoError;
      if (reservado !== true) {
        throw new Error('No hay asientos disponibles');
      }

      // 2. Generar PIN aleatorio (generador centralizado, 4 dígitos)
      const pin = generatePin();

      // 3. Crear reserva
      const { data: reserva, error: reservaError } = await supabase
        .from('Booking')
        .insert([{
          trip_id: viajeId,
          passenger_id: pasajeroId,
          boarding_pin: pin,
          status: 'REQUESTED',
          payment_status: 'PENDING',
        }])
        .select(BOOKING_COLS)
        .single();

      // Si falla la creacion de la reserva, devolver el asiento.
      if (reservaError) {
        await supabase.rpc('liberar_asiento', { p_viaje_id: viajeId });
        throw reservaError;
      }

      // Modelo "tarjeta-en-archivo" (estilo Uber): la reserva NO cobra nada.
      // El cobro a la tarjeta del pasajero ocurre al iniciar el viaje, cuando el
      // conductor valida el PIN de abordaje (Edge Function mp-charge-trip).
      // La reserva queda con payment_status = 'PENDING'.
      return { success: true, data: reserva };
    } catch (error: any) {
      logger.error('Error creando reserva', error);
      return { success: false, error: error.message };
    }
  },

  getMyReservations: async (pasajeroId: string) => {
    try {
      const { data, error } = await supabase
        .from('Booking')
        .select(`${BOOKING_COLS}, Trip (*)`)
        .eq('passenger_id', pasajeroId);

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      logger.error('Error obteniendo reservas', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  cancelReservation: async (reservaId: string) => {
    try {
      // Obtener el trip_id para restaurar el asiento
      const { data: reserva } = await supabase
        .from('Booking')
        .select('trip_id')
        .eq('id', reservaId)
        .single();

      if (reserva) {
        await supabase.rpc('liberar_asiento', { p_viaje_id: reserva.trip_id });
      }

      // Reembolsar dinero (no-op si no había retención)
      await escrowService.reembolsarPago(reservaId);

      // Cancelar reserva
      const { error } = await supabase
        .from('Booking')
        .update({ status: 'CANCELLED' })
        .eq('id', reservaId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      logger.error('Error cancelando reserva', error);
      return { success: false, error: error.message };
    }
  },
};
