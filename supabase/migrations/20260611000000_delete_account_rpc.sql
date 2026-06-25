-- Archivo de migración: 20260611000000_delete_account_rpc.sql

-- Función RPC para eliminar la cuenta del usuario autenticado
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Permite a la función saltar el RLS y actuar con permisos de superusuario
AS $$
DECLARE
  v_uid uuid;
BEGIN
  -- Obtener el ID del usuario actualmente autenticado
  v_uid := auth.uid();
  
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  -- 1. Eliminar los registros de la tabla pública User
  -- Nota: Si hay claves foráneas en otras tablas apuntando a User sin ON DELETE CASCADE,
  -- deberán eliminarse primero o configurar sus foreign keys correctamente.
  DELETE FROM public."User" WHERE id = v_uid;
  
  -- 2. Eliminar el registro en auth.users (Supabase Auth)
  DELETE FROM auth.users WHERE id = v_uid;
  
END;
$$;
