// src/types/database.ts

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  rut?: string;
  celular?: string;
  rol: 'conductor' | 'pasajero' | 'ambos';
  estado?: 'activo' | 'inactivo' | 'suspendido';
  reputacion_promedio?: number;
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
  pin?: string;
  monto?: number;
  estado_pago?: 'pendiente' | 'retenido' | 'liberado' | 'reembolsado';
}

export interface Conductor {
  id?: string;
  usuario_id: string;
  licencia_url?: string;
  hoja_vida_url?: string;
  estado_aprobacion?: 'pendiente' | 'aprobado' | 'rechazado';
  motivo_rechazo?: string;
  created_at?: string;
}

export interface Vehiculo {
  id?: string;
  conductor_id: string;
  patente: string;
  modelo: string;
  capacidad: number;
  padron_url?: string;
  created_at?: string;
}

export interface Pago {
  id?: string;
  reserva_id: string;
  monto: number;
  estado?: 'retenido' | 'liberado' | 'reembolsado' | 'error';
  comision_porcentaje?: number;
  fecha_pago?: string;
  fecha_liberacion?: string;
}

export interface Calificacion {
  id?: string;
  viaje_id: string;
  evaluador_id: string;
  evaluado_id: string;
  puntaje: 1 | 2 | 3 | 4 | 5;
  comentario?: string;
  created_at?: string;
}

export interface Reporte {
  id?: string;
  usuario_id: string;
  viaje_id: string;
  tipo: 'incidente' | 'no_show' | 'queja' | 'otro';
  descripcion: string;
  estado?: 'pendiente' | 'en_revision' | 'resuelto';
  respuesta_admin?: string;
  created_at?: string;
}
