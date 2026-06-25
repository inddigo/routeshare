-- ============================================================================
-- Migracion 11: sincronizacion de metadatos de auth.users -> public."User"
-- APLICADA el 2026-06-10 via MCP (migracion: sync_user_desde_auth_google).
-- Google guarda nombre/foto en raw_user_meta_data (full_name/name,
-- avatar_url/picture). Politica "rellenar si falta": no pisa datos editados.
-- Tambien crea la Wallet de usuarios nuevos e hizo backfill de existentes.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_user_from_auth()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_avatar TEXT;
BEGIN
  v_full_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'name', ''),
    split_part(NEW.email, '@', 1)
  );
  v_avatar := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
    NULLIF(NEW.raw_user_meta_data->>'picture', '')
  );

  INSERT INTO public."User" (id, email, full_name, avatar_url, role, university_verified)
  VALUES (NEW.id, NEW.email, v_full_name, v_avatar, 'PASSENGER', false)
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(NULLIF(public."User".full_name, ''), EXCLUDED.full_name),
      avatar_url = COALESCE(public."User".avatar_url, EXCLUDED.avatar_url);

  INSERT INTO public."Wallet" (id, user_id)
  SELECT gen_random_uuid(), NEW.id
  WHERE NOT EXISTS (SELECT 1 FROM public."Wallet" WHERE user_id = NEW.id);

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.sync_user_from_auth() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_sync_user_from_auth ON auth.users;
CREATE TRIGGER trg_sync_user_from_auth
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_from_auth();
