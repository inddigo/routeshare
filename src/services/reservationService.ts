// src/services/reservationService.ts
import { supabase } from './supabase';
import { escrowService } from './escrowService';

export const reservationService = {
  createReservation: async (viajeId: string, pasajeroId: string, monto: number) => {
    try {
      // 1. Verificar disponibilidad nuevamente
      const { data: viaje } = await supabase
        .from('viajes')
        .select('asientos_disponibles')
        .eq('id', viajeId)
        .single();
        
      if (!viaje || viaje.asientos_disponibles <= 0) {
        throw new Error('No hay asientos disponibles');
      }

      // 2. Generar PIN aleatorio de 3 dígitos (100-999)
      const pin = Math.floor(100 + Math.random() * 900).toString();

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

      if (reservaError) throw reservaError;

      // 4. Procesar pago en escrow (simulado)
      await escrowService.retenerPago(reserva.id, monto);

      // 5. Decrementar asientos
      await supabase
        .from('viajes')
        .update({ asientos_disponibles: viaje.asientos_disponibles - 1 })
        .eq('id', viajeId);

      return { success: true, data: reserva };
    } catch (error: any) {
      console.error('Error creando reserva:', error);
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
      console.error('Error obteniendo reservas:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  cancelReservation: async (reservaId: string) => {
    try {
      // Obtener el viaje_id para restaurar asientos
      const { data: reserva } = await supabase
        .from('reservas')
        .select('viaje_id')
        .eq('id', reservaId)
        .single();

      if (reserva) {
        const { data: viaje } = await supabase
          .from('viajes')
          .select('asientos_disponibles')
          .eq('id', reserva.viaje_id)
          .single();

        if (viaje) {
          await supabase
            .from('viajes')
            .update({ asientos_disponibles: viaje.asientos_disponibles + 1 })
            .eq('id', reserva.viaje_id);
        }
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
      console.error('Error cancelando reserva:', error);
      return { success: false, error: error.message };
    }
  }
};
