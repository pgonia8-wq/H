-- Payment Orders: cada intención de compra crea una orden
  CREATE TABLE IF NOT EXISTS payment_orders (
    id TEXT PRIMARY KEY DEFAULT 'ord_' || substr(md5(random()::text), 1, 12),
    user_id TEXT NOT NULL,
    username TEXT NOT NULL DEFAULT 'anon',
    token_id TEXT NOT NULL,
    token_symbol TEXT NOT NULL DEFAULT '',
    amount_wld NUMERIC NOT NULL,
    estimated_tokens NUMERIC NOT NULL DEFAULT 0,
    spot_price NUMERIC NOT NULL DEFAULT 0,
    reference TEXT UNIQUE NOT NULL,
    transaction_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',  -- pending | completed | failed | expired
    type TEXT NOT NULL DEFAULT 'buy',        -- buy | creation
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    error_message TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_payment_orders_user ON payment_orders(user_id);
  CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status);
  CREATE INDEX IF NOT EXISTS idx_payment_orders_reference ON payment_orders(reference);

  -- Ledger: registro de CADA movimiento financiero
  CREATE TABLE IF NOT EXISTS ledger (
    id TEXT PRIMARY KEY DEFAULT 'tk_' || substr(md5(random()::text), 1, 14),
    order_id TEXT REFERENCES payment_orders(id),
    type TEXT NOT NULL,
    -- buy_payment, buy_fee, buy_curve_deposit,
    -- sell_curve_withdraw, sell_slippage, sell_fee, sell_payout,
    -- creation_fee, graduation_pool, graduation_treasury
    user_id TEXT NOT NULL,
    username TEXT NOT NULL DEFAULT 'anon',
    token_id TEXT,
    token_symbol TEXT DEFAULT '',
    amount_wld NUMERIC NOT NULL,
    direction TEXT NOT NULL,  -- 'in' (ingresa al sistema) | 'out' (sale del sistema)
    description TEXT NOT NULL DEFAULT '',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS idx_ledger_order ON ledger(order_id);
  CREATE INDEX IF NOT EXISTS idx_ledger_user ON ledger(user_id);
  CREATE INDEX IF NOT EXISTS idx_ledger_token ON ledger(token_id);
  CREATE INDEX IF NOT EXISTS idx_ledger_type ON ledger(type);
  CREATE INDEX IF NOT EXISTS idx_ledger_created ON ledger(created_at DESC);
  