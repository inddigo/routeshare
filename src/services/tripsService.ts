// src/services/tripsService.ts
import { supabase } from './supabase';

export const createRouteAndTrip = async (
  conductorId: string,
  origenNombre: string,
  destinoNombre: string,
  origenLat: number,
  origenLng: number,
  destinoLat: number,
  destinoLng: number,
  asientosDisponibles: number,
  precioSugerido: number,
  fechaHoraSalida: string
) => {
  try {
    const { data: viajeData, error: viajeError } = await supabase
      .from('Trip')
      .insert([
        {
          driver_id: conductorId,
          origin_name: origenNombre,
          destination_name: destinoNombre,
          origin_lat: origenLat,
          origin_lng: origenLng,
          destination_lat: destinoLat,
          destination_lng: destinoLng,
          available_seats: asientosDisponibles,
          suggested_price_clp: precioSugerido,
          departure_datetime: fechaHoraSalida,
          status: 'SCHEDULED'
        },
      ])
      .select()
      .single();

    if (viajeError) throw new Error(`Error creando viaje: ${viajeError.message}`);

    return { success: true, viaje: viajeData };
  } catch (error: any) {
    console.error('Error in createRouteAndTrip:', error);
    return { success: false, error: error.message };
  }
};

// Viajes donde el usuario es el conductor.
export const getDriverTrips = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('Trip')
      .select('*')
      .eq('driver_id', userId);

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching driver trips:', error);
    return { success: false, error: error.message, data: [] };
  }
};

export const getUserTrips = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('Booking')
      .select(`
        id,
        status,
        Trip (
          id,
          departure_datetime,
          status,
          origin_lat, origin_lng, destination_lat, destination_lng,
          origin_name, destination_name
        )
      `)
      .eq('passenger_id', userId);

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching user trips:', error);
    return { success: false, error: error.message, data: [] };
  }
};
