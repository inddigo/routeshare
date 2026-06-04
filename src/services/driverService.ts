// src/services/driverService.ts
import { supabase } from './supabase';
import { escrowService } from './escrowService';

export const driverService = {
  registerDriver: async (userId: string, licenciaUrl: string, hojaVidaUrl: string) => {
    try {
      const { data, error } = await supabase
        .from('conductores')
        .insert([{
          usuario_id: userId,
          licencia_url: licenciaUrl,
          hoja_vida_url: hojaVidaUrl,
          estado_aprobacion: 'pendiente'
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Error registrando conductor:', error);
      return { success: false, error: error.message };
    }
  },

  registerVehicle: async (conductorId: string, patente: string, modelo: string, capacidad: number, padronUrl: string) => {
    try {
      const { data, error } = await supabase
        .from('vehiculos')
        .insert([{
          conductor_id: conductorId,
          patente,
          modelo,
          capacidad,
          padron_url: padronUrl
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Error registrando vehículo:', error);
      return { success: false, error: error.message };
    }
  },

  getDriverStatus: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('conductores')
        .select('*')
        .eq('usuario_id', userId)
        .single();
      
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  getDriverReservations: async (conductorId: string) => {
    try {
      // Necesitamos unir reservas -> viajes -> conductores
      const { data: viajes, error: viajesError } = await supabase
        .from('viajes')
        .select('id')
        .eq('conductor_id', conductorId);

      if (viajesError) throw viajesError;
      if (!viajes || viajes.length === 0) return { success: true, data: [] };

      const viajeIds = viajes.map(v => v.id);

      const { data, error } = await supabase
        .from('reservas')
        .select(`
          *,
          usuarios!reservas_pasajero_id_fkey (nombre, apellido_paterno, reputacion_promedio),
          viajes (*, rutas (*))
        `)
        .in('viaje_id', viajeIds)
        .in('estado', ['pendiente', 'confirmada'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Error obteniendo reservas del conductor:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  acceptReservation: async (reservaId: string) => {
    try {
      const { error } = await supabase
        .from('reservas')
        .update({ estado: 'confirmada' })
        .eq('id', reservaId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  rejectReservation: async (reservaId: string) => {
    try {
      // Obtener el viaje_id para restaurar el asiento
      const { data: reserva } = await supabase
        .from('reservas')
        .select('viaje_id')
        .eq('id', reservaId)
        .single();

      // Restaurar el asiento de forma atomica
      if (reserva) {
        await supabase.rpc('liberar_asiento', { p_viaje_id: reserva.viaje_id });
      }

      // Actualizar reserva y reembolsar pago
      await escrowService.reembolsarPago(reservaId);
      await supabase
        .from('reservas')
        .update({ estado: 'rechazada' })
        .eq('id', reservaId);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  validatePin: async (reservaId: string, pin: string) => {
    try {
      // La validación ocurre en el servidor (RPC SECURITY DEFINER) para no
      // exponer el PIN al cliente y aplicar el límite de intentos. Ver
      // database/migrations/01_pin_seguro.sql
      const { data, error } = await supabase.rpc('validar_pin', {
        p_reserva_id: reservaId,
        p_pin: pin,
      });

      if (error) throw error;

      return { success: true, isValid: data === true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  startTrip: async (viajeId: string) => {
    try {
      const { error } = await supabase
        .from('viajes')
        .update({ estado: 'activo' })
        .eq('id', viajeId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  finishTrip: async (viajeId: string) => {
    try {
      const { error } = await supabase
        .from('viajes')
        .update({ estado: 'completado' })
        .eq('id', viajeId);

      if (error) throw error;

      // Liberar todos los pagos en escrow
      await escrowService.liberarPagosViaje(viajeId);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};
