// src/services/driverService.ts
import { supabase } from './supabase';
import { escrowService } from './escrowService';

// Columnas de Booking legibles por el cliente (boarding_pin y pin_attempts
// están restringidas por grants; ver database/migrations/01_pin_seguro.sql).
const BOOKING_COLS = 'id, trip_id, passenger_id, status, payment_status';

export const driverService = {
  registerDriver: async (userId: string, licenciaUrl: string, hojaVidaUrl: string) => {
    try {
      const { data, error } = await supabase
        .from('User')
        .update({
          role: 'DRIVER',
          license_url: licenciaUrl,
          cv_url: hojaVidaUrl,
        })
        .eq('id', userId)
        .select('id, role, license_url, cv_url')
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
        .from('Vehicle')
        .insert([{
          driver_id: conductorId,
          license_plate: patente,
          make_model: modelo,
          capacity: capacidad,
          registration_doc_url: padronUrl,
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
      const { data } = await supabase
        .from('User')
        .select(`
          id, role, license_url, cv_url,
          Vehicle (id, license_plate, make_model, capacity, verification_status)
        `)
        .eq('id', userId)
        .single();

      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  getDriverReservations: async (conductorId: string) => {
    try {
      // Reservas de los viajes del conductor (join Booking -> Trip).
      const { data, error } = await supabase
        .from('Booking')
        .select(`
          ${BOOKING_COLS},
          Passenger:User!Booking_passenger_id_fkey (full_name, avatar_url),
          Trip!inner (*)
        `)
        .eq('Trip.driver_id', conductorId)
        .in('status', ['REQUESTED', 'CONFIRMED']);

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
        .from('Booking')
        .update({ status: 'CONFIRMED' })
        .eq('id', reservaId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  rejectReservation: async (reservaId: string) => {
    try {
      // Obtener el trip_id para restaurar el asiento
      const { data: reserva } = await supabase
        .from('Booking')
        .select('trip_id')
        .eq('id', reservaId)
        .single();

      // Restaurar el asiento de forma atomica
      if (reserva) {
        await supabase.rpc('liberar_asiento', { p_viaje_id: reserva.trip_id });
      }

      // Reembolsar pago y cancelar la reserva
      await escrowService.reembolsarPago(reservaId);
      await supabase
        .from('Booking')
        .update({ status: 'CANCELLED' })
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
        .from('Trip')
        .update({ status: 'IN_PROGRESS' })
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
        .from('Trip')
        .update({ status: 'COMPLETED' })
        .eq('id', viajeId);

      if (error) throw error;

      // Liberar todos los pagos en escrow (RPC valida que el viaje esté COMPLETED)
      await escrowService.liberarPagosViaje(viajeId);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};
