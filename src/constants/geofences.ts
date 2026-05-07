// src/constants/geofences.ts
// Zonas seguras simuladas para la PUCV
// En el futuro, estas coordenadas se pueden cargar desde Supabase.

export interface Geofence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number; // Radio de tolerancia para validar si está en la zona
}

export const PUCV_GEOFENCES: Geofence[] = [
  {
    id: 'casa-central',
    name: 'Casa Central',
    latitude: -33.0443, // Mock coord
    longitude: -71.6146,
    radiusMeters: 200,
  },
  {
    id: 'curauma',
    name: 'Campus Curauma',
    latitude: -33.1259, // Mock coord
    longitude: -71.5724,
    radiusMeters: 500,
  },
  {
    id: 'fin',
    name: 'Facultad de Ingeniería',
    latitude: -33.0440, // Mock coord
    longitude: -71.6120,
    radiusMeters: 250,
  },
];

// Función utilitaria ligera (sin mapas) para calcular distancia (Haversine formula)
export const calculateDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Radio de la tierra en metros
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Validar si una coordenada está dentro de una sede PUCV
export const isInsidePUCVZone = (lat: number, lng: number): boolean => {
  for (const zone of PUCV_GEOFENCES) {
    const distance = calculateDistanceMeters(lat, lng, zone.latitude, zone.longitude);
    if (distance <= zone.radiusMeters) {
      return true;
    }
  }
  return false;
};
