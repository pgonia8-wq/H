-- ============================================================================
-- SQL de correcciones para Humans Mini App
-- Ejecutar en Supabase SQL Editor
-- Todas las sentencias usan IF NOT EXISTS para seguridad
-- ============================================================================

-- 1. Tabla nonces — Persistencia server-side para evitar replay attacks
CREATE TABLE IF NOT EXISTS nonces (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nonce text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_nonces_nonce ON nonces (nonce);
CREATE INDEX IF NOT EXISTS idx_nonces_expires_at ON nonces (expires_at);

-- 2. Tabla tips — Registro de propinas entre usuarios
CREATE TABLE IF NOT EXISTS tips (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id text NOT NULL,
  to_user_id text NOT NULL,
  amount numeric DEFAULT 0,
  transaction_id text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tips_from_user ON tips (from_user_id);
CREATE INDEX IF NOT EXISTS idx_tips_to_user ON tips (to_user_id);
CREATE INDEX IF NOT EXISTS idx_tips_transaction_id ON tips (transaction_id);

-- 3. Tabla boosts — Registro de boosts a posts
CREATE TABLE IF NOT EXISTS boosts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  post_id text,
  transaction_id text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_boosts_user_id ON boosts (user_id);
CREATE INDEX IF NOT EXISTS idx_boosts_post_id ON boosts (post_id);
CREATE INDEX IF NOT EXISTS idx_boosts_transaction_id ON boosts (transaction_id);

-- 4. Columna nullifier_hash en profiles (si no existe)
-- Necesaria para la validación cruzada Device/Orb en verifyOrbStatus.mjs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'nullifier_hash'
  ) THEN
    ALTER TABLE profiles ADD COLUMN nullifier_hash text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_nullifier_hash ON profiles (nullifier_hash);

-- 5. Columnas wallet_verified en profiles (si no existen)
-- Usadas por walletVerify.mjs para guardar verificación SIWE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'wallet_address'
  ) THEN
    ALTER TABLE profiles ADD COLUMN wallet_address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'wallet_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN wallet_verified boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'wallet_verified_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN wallet_verified_at timestamptz;
  END IF;
END $$;

-- 6. Limpieza automática de nonces expirados (opcional pero recomendado)
-- Ejecutar como cron job en Supabase o manualmente periódicamente
-- DELETE FROM nonces WHERE expires_at < now();

-- ============================================================================
-- FIN — Verificar que no haya errores arriba antes de continuar
-- ============================================================================
