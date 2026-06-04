-- ==========================================
-- RouteShare - Schema Completo
-- PUCV - Pontificia Universidad Católica de Valparaíso
-- ==========================================

-- 1. Usuarios (Extensión de auth.users)
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL CHECK (email ~ '^[a-zA-Z0-9._%+-]+@(?:mail\.)?pucv\.cl$'),
    nombre TEXT NOT NULL,
    apellido_paterno TEXT,
    apellido_materno TEXT,
    rut TEXT UNIQUE,
    celular TEXT,
    rol TEXT NOT NULL CHECK (rol IN ('conductor', 'pasajero', 'ambos')),
    estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'suspendido')),
    reputacion_promedio FLOAT DEFAULT 5.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en usuarios
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuarios
DROP POLICY IF EXISTS "Usuarios pueden ver perfiles" ON public.usuarios;
CREATE POLICY "Usuarios pueden ver perfiles" ON public.usuarios
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.usuarios;
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON public.usuarios
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuarios pueden insertar su propio perfil" ON public.usuarios;
CREATE POLICY "Usuarios pueden insertar su propio perfil" ON public.usuarios
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ==========================================
-- 2. Conductores (Verificación de documentos)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.conductores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES public.usuarios(id) NOT NULL,
    licencia_url TEXT,
    hoja_vida_url TEXT,
    estado_aprobacion TEXT DEFAULT 'pendiente' CHECK (estado_aprobacion IN ('pendiente', 'aprobado', 'rechazado')),
    motivo_rechazo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en conductores
ALTER TABLE public.conductores ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para conductores
DROP POLICY IF EXISTS "Usuarios pueden registrarse como conductor" ON public.conductores;
CREATE POLICY "Usuarios pueden registrarse como conductor" ON public.conductores
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Usuarios autenticados pueden ver conductores" ON public.conductores;
CREATE POLICY "Usuarios autenticados pueden ver conductores" ON public.conductores
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Conductores pueden actualizar su propio registro" ON public.conductores;
CREATE POLICY "Conductores pueden actualizar su propio registro" ON public.conductores
    FOR UPDATE USING (auth.uid() = usuario_id);

-- ==========================================
-- 3. Vehículos
-- ==========================================
CREATE TABLE IF NOT EXISTS public.vehiculos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conductor_id UUID REFERENCES public.conductores(id) NOT NULL,
    patente TEXT UNIQUE NOT NULL,
    modelo TEXT NOT NULL,
    capacidad INT NOT NULL CHECK (capacidad >= 1),
    padron_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en vehiculos
ALTER TABLE public.vehiculos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para vehiculos
DROP POLICY IF EXISTS "Conductores pueden registrar su vehículo" ON public.vehiculos;
CREATE POLICY "Conductores pueden registrar su vehículo" ON public.vehiculos
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT usuario_id FROM public.conductores WHERE id = conductor_id)
    );

DROP POLICY IF EXISTS "Usuarios autenticados pueden ver vehículos" ON public.vehiculos;
CREATE POLICY "Usuarios autenticados pueden ver vehículos" ON public.vehiculos
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Conductores pueden actualizar su vehículo" ON public.vehiculos;
CREATE POLICY "Conductores pueden actualizar su vehículo" ON public.vehiculos
    FOR UPDATE USING (
        auth.uid() IN (SELECT usuario_id FROM public.conductores WHERE id = conductor_id)
    );

-- ==========================================
-- 4. Rutas Frecuentes
-- ==========================================
CREATE TABLE IF NOT EXISTS public.rutas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conductor_id UUID REFERENCES public.usuarios(id) NOT NULL,
    origen_lat FLOAT NOT NULL,
    origen_lng FLOAT NOT NULL,
    destino_lat FLOAT NOT NULL,
    destino_lng FLOAT NOT NULL,
    es_sede_pucv BOOLEAN DEFAULT FALSE -- Validación de Zona Segura
);

-- Habilitar RLS en rutas
ALTER TABLE public.rutas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para rutas
DROP POLICY IF EXISTS "Conductores pueden crear rutas" ON public.rutas;
CREATE POLICY "Conductores pueden crear rutas" ON public.rutas
    FOR INSERT WITH CHECK (auth.uid() = conductor_id);

DROP POLICY IF EXISTS "Usuarios autenticados pueden ver rutas" ON public.rutas;
CREATE POLICY "Usuarios autenticados pueden ver rutas" ON public.rutas
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Conductores pueden actualizar sus rutas" ON public.rutas;
CREATE POLICY "Conductores pueden actualizar sus rutas" ON public.rutas
    FOR UPDATE USING (auth.uid() = conductor_id);

DROP POLICY IF EXISTS "Conductores pueden eliminar sus rutas" ON public.rutas;
CREATE POLICY "Conductores pueden eliminar sus rutas" ON public.rutas
    FOR DELETE USING (auth.uid() = conductor_id);

-- ==========================================
-- 5. Viajes (Instancias de una ruta)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.viajes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ruta_id UUID REFERENCES public.rutas(id) NOT NULL,
    conductor_id UUID REFERENCES public.usuarios(id) NOT NULL,
    estado TEXT DEFAULT 'programado' CHECK (estado IN ('programado', 'activo', 'completado', 'cancelado')),
    asientos_disponibles INT NOT NULL CHECK (asientos_disponibles >= 0),
    fecha_hora TIMESTAMPTZ NOT NULL,
    current_lat FLOAT,  -- Tracking en tiempo real
    current_lng FLOAT,  -- Tracking en tiempo real
    last_location_update TIMESTAMPTZ
);

-- Crear índice para optimizar consultas de tracking
CREATE INDEX IF NOT EXISTS idx_viajes_estado ON public.viajes(estado) WHERE estado = 'activo';

-- Habilitar RLS en viajes
ALTER TABLE public.viajes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para viajes
DROP POLICY IF EXISTS "Solo usuarios PUCV pueden ver viajes disponibles" ON public.viajes;
CREATE POLICY "Solo usuarios PUCV pueden ver viajes disponibles" ON public.viajes
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM public.usuarios) AND
        (estado = 'programado' OR estado = 'activo')
    );

DROP POLICY IF EXISTS "Solo el conductor puede actualizar su viaje/posición" ON public.viajes;
CREATE POLICY "Solo el conductor puede actualizar su viaje/posición" ON public.viajes
    FOR UPDATE USING (auth.uid() = conductor_id);

DROP POLICY IF EXISTS "Conductores pueden crear viajes" ON public.viajes;
CREATE POLICY "Conductores pueden crear viajes" ON public.viajes
    FOR INSERT WITH CHECK (auth.uid() = conductor_id);

-- ==========================================
-- 6. Reservas
-- ==========================================
CREATE TABLE IF NOT EXISTS public.reservas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    viaje_id UUID REFERENCES public.viajes(id) NOT NULL,
    pasajero_id UUID REFERENCES public.usuarios(id) NOT NULL,
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'rechazada', 'cancelada')),
    pin TEXT,
    monto FLOAT,
    estado_pago TEXT DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'retenido', 'liberado', 'reembolsado')),
    UNIQUE(viaje_id, pasajero_id)
);

-- Habilitar RLS en reservas
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para reservas
DROP POLICY IF EXISTS "Pasajeros pueden crear reservas" ON public.reservas;
CREATE POLICY "Pasajeros pueden crear reservas" ON public.reservas
    FOR INSERT WITH CHECK (auth.uid() = pasajero_id);

DROP POLICY IF EXISTS "Conductores pueden ver reservas de sus viajes" ON public.reservas;
CREATE POLICY "Conductores pueden ver reservas de sus viajes" ON public.reservas
    FOR SELECT USING (
        auth.uid() IN (SELECT conductor_id FROM public.viajes WHERE id = viaje_id) OR
        auth.uid() = pasajero_id
    );

DROP POLICY IF EXISTS "Pasajeros pueden actualizar sus reservas" ON public.reservas;
CREATE POLICY "Pasajeros pueden actualizar sus reservas" ON public.reservas
    FOR UPDATE USING (auth.uid() = pasajero_id);

-- ==========================================
-- 7. Pagos
-- ==========================================
CREATE TABLE IF NOT EXISTS public.pagos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reserva_id UUID REFERENCES public.reservas(id) NOT NULL,
    monto FLOAT NOT NULL,
    estado TEXT DEFAULT 'retenido' CHECK (estado IN ('retenido', 'liberado', 'reembolsado', 'error')),
    comision_porcentaje FLOAT DEFAULT 0.07,
    fecha_pago TIMESTAMPTZ DEFAULT NOW(),
    fecha_liberacion TIMESTAMPTZ
);

-- Habilitar RLS en pagos
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para pagos
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios pagos" ON public.pagos;
CREATE POLICY "Usuarios pueden ver sus propios pagos" ON public.pagos
    FOR SELECT USING (
        auth.uid() IN (
            SELECT r.pasajero_id FROM public.reservas r WHERE r.id = reserva_id
        ) OR
        auth.uid() IN (
            SELECT v.conductor_id FROM public.viajes v
            JOIN public.reservas r ON r.viaje_id = v.id
            WHERE r.id = reserva_id
        )
    );

-- Insert de pagos solo por sistema (service_role), no por usuario directo
-- No se crea política de INSERT para usuarios normales

-- ==========================================
-- 8. Calificaciones
-- ==========================================
CREATE TABLE IF NOT EXISTS public.calificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    viaje_id UUID REFERENCES public.viajes(id) NOT NULL,
    evaluador_id UUID REFERENCES public.usuarios(id) NOT NULL,
    evaluado_id UUID REFERENCES public.usuarios(id) NOT NULL,
    puntaje INT NOT NULL CHECK (puntaje >= 1 AND puntaje <= 5),
    comentario TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(viaje_id, evaluador_id, evaluado_id)
);

-- Habilitar RLS en calificaciones
ALTER TABLE public.calificaciones ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para calificaciones
DROP POLICY IF EXISTS "Usuarios pueden crear calificaciones propias" ON public.calificaciones;
CREATE POLICY "Usuarios pueden crear calificaciones propias" ON public.calificaciones
    FOR INSERT WITH CHECK (auth.uid() = evaluador_id);

DROP POLICY IF EXISTS "Todos los autenticados pueden ver calificaciones" ON public.calificaciones;
CREATE POLICY "Todos los autenticados pueden ver calificaciones" ON public.calificaciones
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- ==========================================
-- 9. Reportes
-- ==========================================
CREATE TABLE IF NOT EXISTS public.reportes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES public.usuarios(id) NOT NULL,
    viaje_id UUID REFERENCES public.viajes(id) NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('incidente', 'no_show', 'queja', 'otro')),
    descripcion TEXT NOT NULL,
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_revision', 'resuelto')),
    respuesta_admin TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en reportes
ALTER TABLE public.reportes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para reportes
DROP POLICY IF EXISTS "Usuarios pueden crear reportes propios" ON public.reportes;
CREATE POLICY "Usuarios pueden crear reportes propios" ON public.reportes
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Usuarios pueden ver sus propios reportes" ON public.reportes;
CREATE POLICY "Usuarios pueden ver sus propios reportes" ON public.reportes
    FOR SELECT USING (auth.uid() = usuario_id);
