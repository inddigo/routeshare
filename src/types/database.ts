// src/types/database.ts
export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: 'conductor' | 'pasajero' | 'ambos';
  created_at?: string;
}

export interface Ruta {
  id?: string;
  conductor_id: string;
  origen_lat: number;
  origen_lng: number;
  destino_lat: number;
  destino_lng: number;
  es_sede_pucv: boolean;
}

export interface Viaje {
  id?: string;
  ruta_id: string;
  conductor_id: string;
  estado: 'programado' | 'activo' | 'completado' | 'cancelado';
  asientos_disponibles: number;
  fecha_hora: string;
  current_lat?: number;
  current_lng?: number;
  last_location_update?: string;
}

export interface Reserva {
  id?: string;
  viaje_id: string;
  pasajero_id: string;
  estado: 'pendiente' | 'confirmada' | 'rechazada' | 'cancelada';
}
