// src/types/database.ts
// Tipos del esquema REAL de la base de datos (tablas en inglés, estilo Prisma).
// Fuente de verdad: Supabase project jsutuayzayjrkmlidjav + database/migrations/.

export type Role = 'PASSENGER' | 'DRIVER';
export type TripStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type BookingStatus = 'REQUESTED' | 'CONFIRMED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'ESCROW' | 'RELEASED';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  rut?: string | null;
  avatar_url?: string | null;
  role: Role;
  university_verified: boolean;
  mp_customer_id?: string | null;
  license_url?: string | null;
  cv_url?: string | null;
}

export interface Vehicle {
  id: string;
  driver_id: string;
  make_model: string;
  license_plate: string;
  verification_status: string; // 'PENDING' por defecto
  capacity: number;
  registration_doc_url?: string | null;
}

export interface Trip {
  id: string;
  driver_id: string;
  origin_name: string;
  destination_name: string;
  origin_lat: number;
  origin_lng: number;
  destination_lat: number;
  destination_lng: number;
  departure_datetime: string;
  available_seats: number;
  suggested_price_clp: number;
  status: TripStatus;
}

// Nota: boarding_pin y pin_attempts existen en la tabla pero NO son legibles
// por el cliente (grants por columna). El pasajero consulta su PIN con el RPC
// obtener_pin_abordaje; el conductor valida con validar_pin.
export interface Booking {
  id: string;
  trip_id: string;
  passenger_id: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
}

export interface Wallet {
  id: string;
  user_id: string;
  available_balance: number; // CLP entero
  escrow_balance: number; // CLP entero
}

export interface Rating {
  id: string;
  trip_id: string;
  rater_id: string;
  rated_id: string;
  score: number; // 1-5
  comment?: string | null;
  created_at: string;
}

export interface Report {
  id: string;
  trip_id: string;
  reporter_id: string;
  reported_user_id: string;
  type: string; // 'no_show', etc.
  description?: string | null;
  status: string; // 'PENDING' por defecto
  created_at: string;
}
