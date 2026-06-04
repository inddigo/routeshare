// src/services/reservationService.ts
import { supabase } from './supabase';
import { escrowService } from './escrowService';
import { generatePin } from './validationService';
import { logger } from './logger';

export const reservationService = {
  createReservation: async (viajeId: string, pasajeroId: string, monto: number) => {
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
        .from('reservas')
        .insert([{
          viaje_id: viajeId,
          pasajero_id: pasajeroId,
          monto,
          pin,
          estado: 'pendiente',
          estado_pago: 'pendiente'
        }])
        .select()
        .single();

      // Si falla la creacion de la reserva, devolver el asiento.
      if (reservaError) {
        await supabase.rpc('liberar_asiento', { p_viaje_id: viajeId });
        throw reservaError;
      }

      // 4. Procesar pago en escrow (simulado)
      await escrowService.retenerPago(reserva.id, monto);

      return { success: true, data: reserva };
    } catch (error: any) {
      logger.error('Error creando reserva', error);
      return { success: false, error: error.message };
    }
  },

  getMyReservations: async (pasajeroId: string) => {
    try {
      const { data, error } = await supabase
        .from('reservas')
        .select(`
          *,
          viajes (*, rutas (*)),
          usuarios!reservas_pasajero_id_fkey (nombre, reputacion_promedio)
        `)
        .eq('pasajero_id', pasajeroId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      logger.error('Error obteniendo reservas', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  cancelReservation: async (reservaId: string) => {
    try {
      // Obtener el viaje_id para restaurar el asiento
      const { data: reserva } = await supabase
        .from('reservas')
        .select('viaje_id')
        .eq('id', reservaId)
        .single();

      if (reserva) {
        await supabase.rpc('liberar_asiento', { p_viaje_id: reserva.viaje_id });
      }

      // Reembolsar dinero
      await escrowService.reembolsarPago(reservaId);

      // Cancelar reserva
      const { error } = await supabase
        .from('reservas')
        .update({ estado: 'cancelada' })
        .eq('id', reservaId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      logger.error('Error cancelando reserva', error);
      return { success: false, error: error.message };
    }
  }
};
