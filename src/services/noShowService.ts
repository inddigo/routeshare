// src/services/noShowService.ts
// Servicio de No-Show: gestiona la lógica de inasistencia del conductor (10 min)
import { supabase } from './supabase';
import { escrowService } from './escrowService';

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

  // Procesar No-Show automático: cancelar reserva y reembolsar
  processNoShow: async (reservaId: string, viajeId: string) => {
    try {
      // 1. Reembolsar el pago
      await escrowService.reembolsarPago(reservaId);

      // 2. Actualizar la reserva
      await supabase
        .from('reservas')
        .update({ estado: 'cancelada', estado_pago: 'reembolsado' })
        .eq('id', reservaId);

      // 3. Incrementar asientos disponibles
      const { data: viaje } = await supabase
        .from('viajes')
        .select('asientos_disponibles')
        .eq('id', viajeId)
        .single();

      if (viaje) {
        await supabase
          .from('viajes')
          .update({ asientos_disponibles: viaje.asientos_disponibles + 1 })
          .eq('id', viajeId);
      }

      // 4. Crear reporte automático
      const { data: reserva } = await supabase
        .from('reservas')
        .select('pasajero_id')
        .eq('id', reservaId)
        .single();

      if (reserva) {
        await supabase
          .from('reportes')
          .insert([{
            usuario_id: reserva.pasajero_id,
            viaje_id: viajeId,
            tipo: 'no_show',
            descripcion: 'Cancelación automática por inasistencia del conductor (10 minutos).',
            estado: 'pendiente',
          }]);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error procesando No-Show:', error);
      return { success: false, error: error.message };
    }
  },

  // Reportar no-show de un pasajero (desde el conductor)
  reportPassengerNoShow: async (reservaId: string, viajeId: string, conductorId: string) => {
    try {
      // 1. Cancelar la reserva
      await supabase
        .from('reservas')
        .update({ estado: 'cancelada' })
        .eq('id', reservaId);

      // 2. Reembolsar el pago
      await escrowService.reembolsarPago(reservaId);

      // 3. Incrementar asientos
      const { data: viaje } = await supabase
        .from('viajes')
        .select('asientos_disponibles')
        .eq('id', viajeId)
        .single();

      if (viaje) {
        await supabase
          .from('viajes')
          .update({ asientos_disponibles: viaje.asientos_disponibles + 1 })
          .eq('id', viajeId);
      }

      // 4. Crear reporte
      await supabase
        .from('reportes')
        .insert([{
          usuario_id: conductorId,
          viaje_id: viajeId,
          tipo: 'no_show',
          descripcion: 'Pasajero no se presentó en el punto de encuentro.',
          estado: 'pendiente',
        }]);

      return { success: true };
    } catch (error: any) {
      console.error('Error reportando no-show de pasajero:', error);
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
