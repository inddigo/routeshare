-- ============================================================================
-- Migracion 14: el trigger de sincronizacion auth.users -> public."User"
-- tambien persiste el telefono (raw_user_meta_data->>'phone').
-- Antes solo leia full_name/avatar, por lo que el telefono ingresado en el
-- registro por correo se perdia. Politica "rellenar si falta": no pisa un
-- telefono ya editado por el usuario.
--
-- PENDIENTE DE APLICAR en el proyecto remoto (las migraciones <= 11 ya estan
-- aplicadas). Aplicar con la CLI/MCP de Supabase.
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
  v_phone TEXT;
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
  v_phone := NULLIF(NEW.raw_user_meta_data->>'phone', '');

  INSERT INTO public."User" (id, email, full_name, phone, avatar_url, role, university_verified)
  VALUES (NEW.id, NEW.email, v_full_name, v_phone, v_avatar, 'PASSENGER', false)
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(NULLIF(public."User".full_name, ''), EXCLUDED.full_name),
      phone = COALESCE(public."User".phone, EXCLUDED.phone),
      avatar_url = COALESCE(public."User".avatar_url, EXCLUDED.avatar_url);

  INSERT INTO public."Wallet" (id, user_id)
  SELECT gen_random_uuid(), NEW.id
  WHERE NOT EXISTS (SELECT 1 FROM public."Wallet" WHERE user_id = NEW.id);

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.sync_user_from_auth() FROM PUBLIC, anon, authenticated;

-- El trigger trg_sync_user_from_auth ya existe (migracion 11) y apunta a esta
-- misma funcion; con CREATE OR REPLACE basta para actualizar la logica.
