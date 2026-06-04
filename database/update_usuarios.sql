-- Ejecuta esto en tu Supabase SQL Editor para añadir las columnas faltantes a la tabla 'usuarios'
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS apellido_paterno TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS apellido_materno TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS rut TEXT UNIQUE;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS celular TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS rol TEXT CHECK (rol IN ('conductor', 'pasajero', 'ambos'));
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'suspendido'));
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS reputacion_promedio FLOAT DEFAULT 5.0;
