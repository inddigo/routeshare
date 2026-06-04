-- ==========================================
-- Script para actualizar TODAS las tablas existentes
-- Añade cualquier columna que falte sin borrar datos.
-- Ejecuta todo este contenido en tu Supabase SQL Editor.
-- ==========================================

-- Aseguramos que las tablas existan (por si acaso falta alguna tabla completa)
CREATE TABLE IF NOT EXISTS public.usuarios (id UUID PRIMARY KEY);
CREATE TABLE IF NOT EXISTS public.conductores (id UUID PRIMARY KEY DEFAULT uuid_generate_v4());
CREATE TABLE IF NOT EXISTS public.vehiculos (id UUID PRIMARY KEY DEFAULT uuid_generate_v4());
CREATE TABLE IF NOT EXISTS public.rutas (id UUID PRIMARY KEY DEFAULT uuid_generate_v4());
CREATE TABLE IF NOT EXISTS public.viajes (id UUID PRIMARY KEY DEFAULT uuid_generate_v4());
CREATE TABLE IF NOT EXISTS public.reservas (id UUID PRIMARY KEY DEFAULT uuid_generate_v4());
CREATE TABLE IF NOT EXISTS public.pagos (id UUID PRIMARY KEY DEFAULT uuid_generate_v4());
CREATE TABLE IF NOT EXISTS public.calificaciones (id UUID PRIMARY KEY DEFAULT uuid_generate_v4());
CREATE TABLE IF NOT EXISTS public.reportes (id UUID PRIMARY KEY DEFAULT uuid_generate_v4());

-- 1. USUARIOS
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS nombre TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS apellido_paterno TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS apellido_materno TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS rut TEXT UNIQUE;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS celular TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS rol TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'activo';
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS reputacion_promedio FLOAT DEFAULT 5.0;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 2. CONDUCTORES
ALTER TABLE public.conductores ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES public.usuarios(id);
ALTER TABLE public.conductores ADD COLUMN IF NOT EXISTS licencia_url TEXT;
ALTER TABLE public.conductores ADD COLUMN IF NOT EXISTS hoja_vida_url TEXT;
ALTER TABLE public.conductores ADD COLUMN IF NOT EXISTS estado_aprobacion TEXT DEFAULT 'pendiente';
ALTER TABLE public.conductores ADD COLUMN IF NOT EXISTS motivo_rechazo TEXT;
ALTER TABLE public.conductores ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 3. VEHÍCULOS
ALTER TABLE public.vehiculos ADD COLUMN IF NOT EXISTS conductor_id UUID REFERENCES public.conductores(id);
ALTER TABLE public.vehiculos ADD COLUMN IF NOT EXISTS patente TEXT UNIQUE;
ALTER TABLE public.vehiculos ADD COLUMN IF NOT EXISTS modelo TEXT;
ALTER TABLE public.vehiculos ADD COLUMN IF NOT EXISTS capacidad INT;
ALTER TABLE public.vehiculos ADD COLUMN IF NOT EXISTS padron_url TEXT;
ALTER TABLE public.vehiculos ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 4. RUTAS
ALTER TABLE public.rutas ADD COLUMN IF NOT EXISTS conductor_id UUID REFERENCES public.usuarios(id);
ALTER TABLE public.rutas ADD COLUMN IF NOT EXISTS origen_lat FLOAT;
ALTER TABLE public.rutas ADD COLUMN IF NOT EXISTS origen_lng FLOAT;
ALTER TABLE public.rutas ADD COLUMN IF NOT EXISTS destino_lat FLOAT;
ALTER TABLE public.rutas ADD COLUMN IF NOT EXISTS destino_lng FLOAT;
ALTER TABLE public.rutas ADD COLUMN IF NOT EXISTS es_sede_pucv BOOLEAN DEFAULT FALSE;
ALTER TABLE public.rutas ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 5. VIAJES
ALTER TABLE public.viajes ADD COLUMN IF NOT EXISTS ruta_id UUID REFERENCES public.rutas(id);
ALTER TABLE public.viajes ADD COLUMN IF NOT EXISTS conductor_id UUID REFERENCES public.usuarios(id);
ALTER TABLE public.viajes ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'programado';
ALTER TABLE public.viajes ADD COLUMN IF NOT EXISTS asientos_disponibles INT;
ALTER TABLE public.viajes ADD COLUMN IF NOT EXISTS fecha_hora TIMESTAMPTZ;
ALTER TABLE public.viajes ADD COLUMN IF NOT EXISTS current_lat FLOAT;
ALTER TABLE public.viajes ADD COLUMN IF NOT EXISTS current_lng FLOAT;
ALTER TABLE public.viajes ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMPTZ;
ALTER TABLE public.viajes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 6. RESERVAS
ALTER TABLE public.reservas ADD COLUMN IF NOT EXISTS viaje_id UUID REFERENCES public.viajes(id);
ALTER TABLE public.reservas ADD COLUMN IF NOT EXISTS pasajero_id UUID REFERENCES public.usuarios(id);
ALTER TABLE public.reservas ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'pendiente';
ALTER TABLE public.reservas ADD COLUMN IF NOT EXISTS pin TEXT;
ALTER TABLE public.reservas ADD COLUMN IF NOT EXISTS monto FLOAT;
ALTER TABLE public.reservas ADD COLUMN IF NOT EXISTS estado_pago TEXT DEFAULT 'pendiente';
ALTER TABLE public.reservas ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 7. PAGOS
ALTER TABLE public.pagos ADD COLUMN IF NOT EXISTS reserva_id UUID REFERENCES public.reservas(id);
ALTER TABLE public.pagos ADD COLUMN IF NOT EXISTS monto FLOAT;
ALTER TABLE public.pagos ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'retenido';
ALTER TABLE public.pagos ADD COLUMN IF NOT EXISTS comision_porcentaje FLOAT DEFAULT 0.07;
ALTER TABLE public.pagos ADD COLUMN IF NOT EXISTS fecha_pago TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.pagos ADD COLUMN IF NOT EXISTS fecha_liberacion TIMESTAMPTZ;

-- 8. CALIFICACIONES
ALTER TABLE public.calificaciones ADD COLUMN IF NOT EXISTS viaje_id UUID REFERENCES public.viajes(id);
ALTER TABLE public.calificaciones ADD COLUMN IF NOT EXISTS evaluador_id UUID REFERENCES public.usuarios(id);
ALTER TABLE public.calificaciones ADD COLUMN IF NOT EXISTS evaluado_id UUID REFERENCES public.usuarios(id);
ALTER TABLE public.calificaciones ADD COLUMN IF NOT EXISTS puntaje INT;
ALTER TABLE public.calificaciones ADD COLUMN IF NOT EXISTS comentario TEXT;
ALTER TABLE public.calificaciones ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 9. REPORTES
ALTER TABLE public.reportes ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES public.usuarios(id);
ALTER TABLE public.reportes ADD COLUMN IF NOT EXISTS viaje_id UUID REFERENCES public.viajes(id);
ALTER TABLE public.reportes ADD COLUMN IF NOT EXISTS tipo TEXT;
ALTER TABLE public.reportes ADD COLUMN IF NOT EXISTS descripcion TEXT;
ALTER TABLE public.reportes ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'pendiente';
ALTER TABLE public.reportes ADD COLUMN IF NOT EXISTS respuesta_admin TEXT;
ALTER TABLE public.reportes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
