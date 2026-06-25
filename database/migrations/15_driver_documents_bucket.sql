-- ============================================================================
-- Migracion 15: bucket de Storage 'driver_documents' + politicas.
-- La pantalla DriverValidationScreen sube licencia y padron a este bucket via
-- uploadDocument(). El bucket no existia en el proyecto remoto, por lo que la
-- subida fallaba. Tambien se definen politicas RLS para permitir que un usuario
-- autenticado suba/actualice y que se puedan leer las URLs publicas.
--
-- YA APLICADO en el proyecto remoto via MCP el 2026-06-15.
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('driver_documents', 'driver_documents', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "driver_docs_insert" ON storage.objects;
DROP POLICY IF EXISTS "driver_docs_select" ON storage.objects;
DROP POLICY IF EXISTS "driver_docs_update" ON storage.objects;

CREATE POLICY "driver_docs_insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'driver_documents');

CREATE POLICY "driver_docs_select"
ON storage.objects FOR SELECT TO authenticated, anon
USING (bucket_id = 'driver_documents');

CREATE POLICY "driver_docs_update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'driver_documents');
