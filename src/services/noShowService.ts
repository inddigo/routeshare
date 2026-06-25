// src/services/noShowService.ts
// Servicio de No-Show: gestiona la lógica de inasistencia del conductor (10 min)
import { supabase } from './supabase';
import { escrowService } from './escrowService';
import { logger } from './logger';

const NO_SHOW_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutos en milisegundos

export const noShowService = {
  // Verificar si el conductor ha superado el tiempo de espera
  checkNoShow: (fechaHoraViaje: string): { isNoShow: boolean; elapsedMs: number; remainingMs: number } => {
    const scheduled = new Date(fechaHoraViaje).getTime();
    const now = Date.now();
    const elapsedMs = now - scheduled;
    const remainingMs = Math.max(0, NO_SHOW_TIMEOUT_MS - elapsedMs);

    return {
      isNoShow: elapsedMs >= NO_SHOW_TIMEOUT_MS,
      elapsedMs: Math.max(0, elapsedMs),
      remainingMs,
    };
  },

  // Procesar No-Show automático del conductor: cancelar reserva y reembolsar
  processNoShow: async (reservaId: string, viajeId: string) => {
    try {
      // 1. Reembolsar el pago (escrow -> pasajero; el RPC actualiza payment_status)
      await escrowService.reembolsarPago(reservaId);

      // 2. Cancelar la reserva
      await supabase
        .from('Booking')
        .update({ status: 'CANCELLED' })
        .eq('id', reservaId);

      // 3. Incrementar asientos disponibles (atomico)
      await supabase.rpc('liberar_asiento', { p_viaje_id: viajeId });

      // 4. Crear reporte automático: el pasajero reporta al conductor
      const { data: reserva } = await supabase
        .from('Booking')
        .select('passenger_id')
        .eq('id', reservaId)
        .single();

      const { data: viaje } = await supabase
        .from('Trip')
        .select('driver_id')
        .eq('id', viajeId)
        .single();

      if (reserva && viaje) {
        await supabase
          .from('Report')
          .insert([{
            trip_id: viajeId,
            reporter_id: reserva.passenger_id,
            reported_user_id: viaje.driver_id,
            type: 'no_show',
            description: 'Cancelación automática por inasistencia del conductor (10 minutos).',
          }]);
      }

      return { success: true };
    } catch (error: any) {
      logger.error('Error procesando No-Show', error);
      return { success: false, error: error.message };
    }
  },

  // Reportar no-show de un pasajero (desde el conductor)
  reportPassengerNoShow: async (reservaId: string, viajeId: string, conductorId: string) => {
    try {
      // 1. Obtener el pasajero antes de tocar la reserva
      const { data: reserva } = await supabase
        .from('Booking')
        .select('passenger_id')
        .eq('id', reservaId)
        .single();

      // 2. Cancelar la reserva
      await supabase
        .from('Booking')
        .update({ status: 'CANCELLED' })
        .eq('id', reservaId);

      // 3. Reembolsar el pago (no-op si no había retención)
      await escrowService.reembolsarPago(reservaId);

      // 4. Incrementar asientos (atomico)
      await supabase.rpc('liberar_asiento', { p_viaje_id: viajeId });

      // 5. Crear reporte: el conductor reporta al pasajero
      if (reserva) {
        await supabase
          .from('Report')
          .insert([{
            trip_id: viajeId,
            reporter_id: conductorId,
            reported_user_id: reserva.passenger_id,
            type: 'no_show',
            description: 'Pasajero no se presentó en el punto de encuentro.',
          }]);
      }

      return { success: true };
    } catch (error: any) {
      logger.error('Error reportando no-show de pasajero', error);
      return { success: false, error: error.message };
    }
  },

  // Formatear tiempo restante para UI
  formatTimeRemaining: (remainingMs: number): string => {
    if (remainingMs <= 0) return '00:00';
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  },
};
