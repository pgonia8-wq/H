-- ============================================================================
-- 01 — SISTEMA DE PAGOS, RETIROS Y DISTRIBUCIÓN AUTOMÁTICA
-- Ejecutar en Supabase SQL Editor (una sola vez)
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. TABLAS EXISTENTES: Columnas nuevas
-- ─────────────────────────────────────────────────────────────────────────────

-- 1a. tips → distributed_at (para saber cuáles ya se distribuyeron al creador)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tips' AND column_name = 'distributed_at'
  ) THEN
    ALTER TABLE tips ADD COLUMN distributed_at timestamptz;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tips_distributed_at ON tips (distributed_at);
CREATE INDEX IF NOT EXISTS idx_tips_created_at ON tips (created_at);

-- 1b. withdrawals → tx_hash (hash de la transacción on-chain)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'withdrawals' AND column_name = 'tx_hash'
  ) THEN
    ALTER TABLE withdrawals ADD COLUMN tx_hash text;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. TABLA: nonces (autenticación SIWE)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS nonces (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nonce text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_nonces_nonce ON nonces (nonce);
CREATE INDEX IF NOT EXISTS idx_nonces_expires ON nonces (expires_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. TABLA: boosts
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS boosts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  post_id uuid,
  transaction_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_boosts_user_id ON boosts (user_id);
CREATE INDEX IF NOT EXISTS idx_boosts_post_id ON boosts (post_id);
CREATE INDEX IF NOT EXISTS idx_boosts_tx ON boosts (transaction_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. TABLA: balances (saldo disponible de cada creador para retiros)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS balances (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text UNIQUE NOT NULL,
  available numeric NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_balances_user_id ON balances (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. TABLA: payout_logs (registro de cada distribución automática)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payout_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  total_tips numeric NOT NULL DEFAULT 0,
  creator_total numeric NOT NULL DEFAULT 0,
  platform_total numeric NOT NULL DEFAULT 0,
  pool_total numeric NOT NULL DEFAULT 0,
  creators_paid integer NOT NULL DEFAULT 0,
  tips_processed integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. FUNCIÓN: deduct_balance (retiros — atómica, evita race conditions)
--    - Si p_amount > 0: deduce saldo, falla si no alcanza
--    - Si p_amount < 0: reembolsa (usado cuando falla la transferencia on-chain)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION deduct_balance(p_user_id text, p_amount numeric)
RETURNS void AS $$
BEGIN
  IF p_amount > 0 THEN
    UPDATE balances
    SET available = available - p_amount,
        updated_at = now()
    WHERE user_id = p_user_id
      AND available >= p_amount;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient balance or user not found';
    END IF;
  ELSIF p_amount < 0 THEN
    -- Reembolso: p_amount es negativo, así que restar un negativo = sumar
    UPDATE balances
    SET available = available - p_amount,
        updated_at = now()
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
      INSERT INTO balances (user_id, available, updated_at)
      VALUES (p_user_id, ABS(p_amount), now());
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. FUNCIÓN: add_balance (acredita saldo — usado por distributePayout.mjs
--    para creadores que no tienen wallet registrado)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION add_balance(p_user_id text, p_amount numeric)
RETURNS void AS $$
BEGIN
  INSERT INTO balances (user_id, available, updated_at)
  VALUES (p_user_id, p_amount, now())
  ON CONFLICT (user_id) DO UPDATE
  SET available = balances.available + p_amount,
      updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FIN — 01_payout_system.sql
-- ============================================================================
