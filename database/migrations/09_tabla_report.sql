-- ============================================================================
-- Migracion 09: tabla Report para no-shows e incidentes
-- APLICADA el 2026-06-10 via MCP (migracion: tabla_report_no_show).
-- Reemplaza la antigua tabla 'reportes' (que nunca existio en la BD real).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public."Report" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public."Trip"(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'no_show',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public."Report" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS report_insert_propio ON public."Report";
CREATE POLICY report_insert_propio ON public."Report"
  FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());

DROP POLICY IF EXISTS report_select_propio ON public."Report";
CREATE POLICY report_select_propio ON public."Report"
  FOR SELECT TO authenticated USING (reporter_id = auth.uid());
