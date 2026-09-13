-- ============================================================
-- Función RPC para obtener datos de auth.users (backup)
-- ============================================================
-- El cliente anon no puede leer auth.users directamente.
-- Esta función con SECURITY DEFINER permite a un admin obtener
-- los datos de las cuentas de login para incluirlos en el backup.
--
-- Uso desde el frontend:
--   supabase.rpc('get_auth_users_backup')
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_auth_users_backup()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  raw_user_meta_data jsonb,
  raw_app_meta_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Solo un admin puede ejecutar esta función
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'No autorizado: solo administradores pueden ver auth.users';
  END IF;

  RETURN QUERY
    SELECT
      u.id,
      u.email::text,
      u.created_at,
      u.last_sign_in_at,
      u.raw_user_meta_data,
      u.raw_app_meta_data
    FROM auth.users u;
END;
$$;

-- Permisos: permitir que los usuarios autenticados llamen la función
GRANT EXECUTE ON FUNCTION public.get_auth_users_backup() TO authenticated;
