-- Crear tabla auth_status para gestionar activación/pausa de usuarios
CREATE TABLE IF NOT EXISTS auth_status (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  status BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_auth_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auth_status_updated_at ON auth_status;
CREATE TRIGGER trigger_auth_status_updated_at
  BEFORE UPDATE ON auth_status
  FOR EACH ROW
  EXECUTE FUNCTION update_auth_status_updated_at();

-- Habilitar RLS
ALTER TABLE auth_status ENABLE ROW LEVEL SECURITY;

-- Política: admin puede leer todo
CREATE POLICY "Admin can read all auth_status"
  ON auth_status FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Política: admin puede insertar
CREATE POLICY "Admin can insert auth_status"
  ON auth_status FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Política: admin puede actualizar
CREATE POLICY "Admin can update auth_status"
  ON auth_status FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Política: usuarios pueden leer su propio status
CREATE POLICY "Users can read own auth_status"
  ON auth_status FOR SELECT
  USING (user_id = auth.uid());
