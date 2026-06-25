// src/services/searchService.ts
import { supabase } from './supabase';

export interface SearchFilters {
  origen?: string;
  destino?: string;
  fecha?: string;
  horaInicio?: string;
  horaFin?: string;
  /** Coordenadas del pasajero para búsqueda geoespacial (PostGIS) */
  origenLat?: number;
  origenLng?: number;
  /** Radio de cercanía en metros (default 5000 en el RPC) */
  radioMetros?: number;
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
      const TRIP_COLUMNS = `
          id,
          status,
          available_seats,
          departure_datetime,
          origin_name,
          destination_name,
          origin_lat,
          origin_lng,
          destination_lat,
          destination_lng,
          suggested_price_clp,
          Driver:User!Trip_driver_id_fkey (full_name, avatar_url)
        `;

      // Búsqueda geoespacial (PostGIS): viajes cuyo origen está dentro del
      // radio indicado alrededor del pasajero. El RPC ya filtra estado,
      // asientos y viajes futuros; aquí se puede acotar además por fecha.
      const useGeo = filters.origenLat != null && filters.origenLng != null;

      let query = useGeo
        ? supabase
            .rpc('buscar_viajes_cercanos', {
              p_origen_lat: filters.origenLat,
              p_origen_lng: filters.origenLng,
              p_radio_metros: filters.radioMetros ?? 5000,
            })
            .select(TRIP_COLUMNS)
        : supabase
            .from('Trip')
            .select(TRIP_COLUMNS)
            .eq('status', 'SCHEDULED')
            .gt('available_seats', 0);

      // Filtro por texto: coincidencia parcial sobre los nombres guardados.
      // En modo geo el origen ya se acota por cercanía, así que ahí solo
      // aplicamos el filtro de destino.
      if (filters.origen && filters.origen.trim() && !useGeo) {
        query = query.ilike('origin_name', `%${filters.origen.trim()}%`);
      }
      if (filters.destino && filters.destino.trim()) {
        query = query.ilike('destination_name', `%${filters.destino.trim()}%`);
      }

      // Si hay fecha, filtramos por la fecha exacta (ignorando la hora)
      if (filters.fecha) {
        const startDate = new Date(filters.fecha);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(filters.fecha);
        endDate.setHours(23, 59, 59, 999);

        query = query
          .gte('departure_datetime', startDate.toISOString())
          .lte('departure_datetime', endDate.toISOString());
      } else if (!useGeo) {
        // Por defecto, mostrar viajes futuros (el RPC ya lo hace en modo geo)
        query = query.gte('departure_datetime', new Date().toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      // El path RPC no infiere cardinalidad: normalizamos siempre a array.
      const rows: any[] = Array.isArray(data) ? data : data ? [data] : [];
      return { success: true, data: rows };
    } catch (error: any) {
      console.error('Error buscando viajes:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
};
