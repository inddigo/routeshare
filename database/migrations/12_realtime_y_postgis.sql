-- ============================================================================
-- Migracion 12: realtime para Trip + busqueda geoespacial con PostGIS
-- APLICADA el 2026-06-10 via MCP (migraciones: realtime_publicacion_trip y
-- postgis_busqueda_cercana).
-- ============================================================================

-- La publicacion supabase_realtime estaba vacia: ninguna suscripcion
-- postgres_changes recibia eventos. ActiveRideScreen escucha cambios de Trip.
ALTER PUBLICATION supabase_realtime ADD TABLE public."Trip";

-- PostGIS para filtros de cercania.
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- Viajes SCHEDULED futuros con asientos cuyo ORIGEN este dentro del radio
-- (metros) del punto del pasajero; opcionalmente filtra por DESTINO cercano.
-- SECURITY INVOKER: respeta las politicas RLS de Trip.
CREATE OR REPLACE FUNCTION public.buscar_viajes_cercanos(
  p_origen_lat DOUBLE PRECISION,
  p_origen_lng DOUBLE PRECISION,
  p_radio_metros INT DEFAULT 5000,
  p_destino_lat DOUBLE PRECISION DEFAULT NULL,
  p_destino_lng DOUBLE PRECISION DEFAULT NULL
)
RETURNS SETOF public."Trip"
LANGUAGE sql
STABLE
SET search_path = public, extensions
AS $$
  SELECT t.*
  FROM public."Trip" t
  WHERE t.status = 'SCHEDULED'
    AND t.available_seats > 0
    AND t.departure_datetime >= now()
    AND ST_DWithin(
      ST_MakePoint(t.origin_lng, t.origin_lat)::geography,
      ST_MakePoint(p_origen_lng, p_origen_lat)::geography,
      p_radio_metros
    )
    AND (
      p_destino_lat IS NULL
      OR ST_DWithin(
        ST_MakePoint(t.destination_lng, t.destination_lat)::geography,
        ST_MakePoint(p_destino_lng, p_destino_lat)::geography,
        p_radio_metros
      )
    )
  ORDER BY t.departure_datetime;
$$;

REVOKE EXECUTE ON FUNCTION public.buscar_viajes_cercanos(DOUBLE PRECISION, DOUBLE PRECISION, INT, DOUBLE PRECISION, DOUBLE PRECISION) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.buscar_viajes_cercanos(DOUBLE PRECISION, DOUBLE PRECISION, INT, DOUBLE PRECISION, DOUBLE PRECISION) TO authenticated;
