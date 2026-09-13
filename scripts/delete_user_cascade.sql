-- ============================================================
-- Eliminación completa de un usuario y todos sus datos
-- ============================================================
-- Este script crea una función RPC `delete_user_cascade` que borra
-- de forma segura y atómica:
--   1. bandas (bands)
--   2. trabajos (jobs)
--   3. pagos (payments)
--   4. pagos administrativos (admin_payments)
--   5. estado de autenticación (auth_status)
--   6. el usuario en public.users
--
-- NOTA: public.users.id es de tipo BIGINT (entero), no UUID.
-- Se ejecuta con SECURITY DEFINER para poder borrar todas las tablas.
--
-- Uso:
--   1) Pegar el contenido en el SQL Editor de Supabase y ejecutar.
--   2) Llamar desde el frontend con:
--        supabase.rpc('delete_user_cascade', { user_id: userId })
-- ============================================================

-- Asegurar ON DELETE CASCADE en las tablas que referencian users(id)
-- (best-effort: si la FK ya existe con otro nombre, se ignora el error)
DO $$
BEGIN
  -- bands.user_id -> users.id
  BEGIN
    ALTER TABLE public.bands
      DROP CONSTRAINT IF EXISTS bands_user_id_fkey;
    ALTER TABLE public.bands
      ADD CONSTRAINT bands_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'bands FK: %', SQLERRM;
  END;

  -- jobs.user_id -> users.id
  BEGIN
    ALTER TABLE public.jobs
      DROP CONSTRAINT IF EXISTS jobs_user_id_fkey;
    ALTER TABLE public.jobs
      ADD CONSTRAINT jobs_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'jobs FK: %', SQLERRM;
  END;

  -- payments.user_id -> users.id
  BEGIN
    ALTER TABLE public.payments
      DROP CONSTRAINT IF EXISTS payments_user_id_fkey;
    ALTER TABLE public.payments
      ADD CONSTRAINT payments_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'payments FK: %', SQLERRM;
  END;

  -- admin_payments.user_id -> users.id
  BEGIN
    ALTER TABLE public.admin_payments
      DROP CONSTRAINT IF EXISTS admin_payments_user_id_fkey;
    ALTER TABLE public.admin_payments
      ADD CONSTRAINT admin_payments_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'admin_payments FK: %', SQLERRM;
  END;
END;
$$;


-- ============================================================
-- Función RPC para eliminar usuario y todos sus datos
-- ============================================================
CREATE OR REPLACE FUNCTION public.delete_user_cascade(p_user_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Bandas del usuario
  DELETE FROM public.bands WHERE user_id = p_user_id;

  -- 2. Trabajos del usuario
  DELETE FROM public.jobs WHERE user_id = p_user_id;

  -- 3. Pagos del usuario
  DELETE FROM public.payments WHERE user_id = p_user_id;

  -- 4. Pagos administrativos del usuario
  DELETE FROM public.admin_payments WHERE user_id = p_user_id;

  -- 5. Estado de autenticación del usuario
  DELETE FROM public.auth_status WHERE user_id = p_user_id;

  -- 6. Usuario en public.users
  DELETE FROM public.users WHERE id = p_user_id;
END;
$$;

-- Permisos: permitir que los usuarios autenticados llamen la función
GRANT EXECUTE ON FUNCTION public.delete_user_cascade(bigint) TO authenticated;
