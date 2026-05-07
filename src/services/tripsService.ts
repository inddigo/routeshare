// src/services/tripsService.ts
import { supabase } from './supabase';
import { Ruta, Viaje } from '../types/database';

export const createRouteAndTrip = async (
  conductorId: string,
  origenLat: number,
  origenLng: number,
  destinoLat: number,
  destinoLng: number,
  esSedePucv: boolean,
  asientosDisponibles: number,
  fechaHoraSalida: string
) => {
  try {
    // 1. Insertar la ruta
    const { data: rutaData, error: rutaError } = await supabase
      .from('rutas')
      .insert([
        {
          conductor_id: conductorId,
          origen_lat: origenLat,
          origen_lng: origenLng,
          destino_lat: destinoLat,
          destino_lng: destinoLng,
          es_sede_pucv: esSedePucv,
        },
      ])
      .select()
      .single();

    if (rutaError) throw new Error(`Error creando ruta: ${rutaError.message}`);
    
    // 2. Insertar el viaje
    const { data: viajeData, error: viajeError } = await supabase
      .from('viajes')
      .insert([
        {
          ruta_id: rutaData.id,
          conductor_id: conductorId,
          estado: 'programado',
          asientos_disponibles: asientosDisponibles,
          fecha_hora: fechaHoraSalida,
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
