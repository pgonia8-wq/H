-- ============================================================================
-- migration_11_totem_graduations.sql
--
-- Persistencia off-chain del estado de graduación de tótems.
--
-- ESPEJO ON-CHAIN: replica el bit `graduated[user]` del contrato
-- TotemGraduationManager.sol. ON-CHAIN ES VERDAD: cuando el evento
-- Graduated(user) llegue del contrato, esta tabla se actualiza desde el
-- listener (no al revés).
--
-- En MODO DEV (sin GRADUATION_MANAGER_ADDRESS) el endpoint
-- /api/totem/graduate-execute escribe filas con mode='simulation'.
-- En MODO PROD escribirá mode='production' tras validar receipt + evento.
--
-- INVARIANTES DURAS (enforzadas por constraints):
--   - UNIQUE(totem)    → un tótem solo se gradúa UNA vez (espejo on-chain).
--   - UNIQUE(tx_hash)  → anti-replay: el mismo hash no se procesa dos veces.
--
-- IDEMPOTENTE: usa IF NOT EXISTS en todo. Re-ejecutable sin daño.
-- NO MODIFICA: ninguna tabla existente queda tocada (totems, trades,
-- profiles permanecen exactamente igual).
-- ============================================================================

CREATE TABLE IF NOT EXISTS totem_graduations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  totem           text NOT NULL,
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  wallet          text NOT NULL,
  tx_hash         text NOT NULL,
  mode            text NOT NULL CHECK (mode IN ('simulation', 'production')),
  -- Snapshot del cálculo de liquidez (mirror calcLiquidityAmounts).
  -- Stored como text para preservar precisión BigInt sin pérdida.
  liquidity_token text,
  liquidity_wld   text,
  created_at      timestamptz NOT NULL DEFAULT now(),

  -- Espejo on-chain: graduated[user] solo true UNA vez
  CONSTRAINT totem_graduations_totem_unique UNIQUE (totem),
  -- Anti-replay
  CONSTRAINT totem_graduations_tx_unique    UNIQUE (tx_hash)
);

CREATE INDEX IF NOT EXISTS totem_graduations_user_id_idx
  ON totem_graduations (user_id);

CREATE INDEX IF NOT EXISTS totem_graduations_created_at_idx
  ON totem_graduations (created_at DESC);

-- ────────────────────────────────────────────────────────────────────────────
-- RLS: la información de graduación es pública (es estado del protocolo).
-- Solo service_role puede escribir (los endpoints usan SUPABASE_SERVICE_ROLE_KEY).
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE totem_graduations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS totem_graduations_public_read ON totem_graduations;
CREATE POLICY totem_graduations_public_read
  ON totem_graduations
  FOR SELECT
  USING (true);

-- INSERT/UPDATE/DELETE: sin policy → solo service_role bypassea RLS.
-- (Los anon/authenticated tokens no podrán escribir aunque conozcan el endpoint.)
