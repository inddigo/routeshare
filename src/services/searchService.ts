// src/services/searchService.ts
import { supabase } from './supabase';

export interface SearchFilters {
  origen?: string;
  destino?: string;
  fecha?: string;
  horaInicio?: string;
  horaFin?: string;
}

export const COMMON_DESTINATIONS = [
  'Viña Centro',
  'Valparaíso Centro',
  'Quilpué',
  'Reñaca',
  'Casa Central PUCV',
  'Campus Curauma',
  'Facultad de Ingeniería'
];

export const searchService = {
  getAvailableDestinations: () => COMMON_DESTINATIONS,

  searchTrips: async (filters: SearchFilters) => {
    try {
      let query = supabase
        .from('viajes')
        .select(`
          id, 
          estado, 
          asientos_disponibles, 
          fecha_hora,
          rutas (origen_lat, origen_lng, destino_lat, destino_lng),
          usuarios!viajes_conductor_id_fkey (nombre, apellido_paterno, reputacion_promedio)
        `)
        .eq('estado', 'programado')
        .gt('asientos_disponibles', 0);

      // Si hay fecha, filtramos por la fecha exacta (ignorando la hora)
      if (filters.fecha) {
        const startDate = new Date(filters.fecha);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(filters.fecha);
        endDate.setHours(23, 59, 59, 999);
        
        query = query
          .gte('fecha_hora', startDate.toISOString())
          .lte('fecha_hora', endDate.toISOString());
      } else {
        // Por defecto, mostrar viajes futuros
        query = query.gte('fecha_hora', new Date().toISOString());
      }

      // TODO: Filtros geoespaciales por origen y destino (requiere PostGIS configurado en BD)
      // Por ahora, traemos todos los programados y filtramos en cliente si es necesario

      const { data, error } = await query;

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Error buscando viajes:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
};
