// src/services/geocodingService.ts
// Geocodificación de direcciones a coordenadas usando Nominatim (OpenStreetMap).
// Es gratuito y sin API key. Política de uso: máx. 1 req/s y User-Agent propio.
import { logger } from './logger';

export interface GeoPoint {
  lat: number;
  lng: number;
  displayName: string;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Convierte una dirección de texto en coordenadas. Sesga los resultados a
 * Chile (countrycodes=cl). Devuelve null si no encuentra el lugar.
 */
export const geocodeAddress = async (query: string): Promise<GeoPoint | null> => {
  const q = query.trim();
  if (!q) return null;

  try {
    const url =
      `${NOMINATIM_URL}?format=json&limit=1&countrycodes=cl&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: {
        // Nominatim exige identificar la aplicación.
        'User-Agent': 'RouteShare/1.0 (contacto: soporte@routeshare.app)',
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      logger.warn('Geocoding HTTP error', res.status);
      return null;
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const top = data[0];
    return {
      lat: parseFloat(top.lat),
      lng: parseFloat(top.lon),
      displayName: top.display_name,
    };
  } catch (error) {
    logger.error('Error geocodificando dirección', error);
    return null;
  }
};

/**
 * Devuelve hasta `limit` sugerencias de direcciones para autocompletar.
 * Sesga los resultados a Chile. Devuelve [] si no hay coincidencias o error.
 */
export const searchAddresses = async (
  query: string,
  limit: number = 5,
): Promise<GeoPoint[]> => {
  const q = query.trim();
  if (q.length < 3) return [];

  try {
    const url =
      `${NOMINATIM_URL}?format=json&addressdetails=0&limit=${limit}` +
      `&countrycodes=cl&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'RouteShare/1.0 (contacto: soporte@routeshare.app)',
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      logger.warn('Autocomplete HTTP error', res.status);
      return [];
    }

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      displayName: item.display_name as string,
    }));
  } catch (error) {
    logger.error('Error buscando direcciones', error);
    return [];
  }
};
