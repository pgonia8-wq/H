CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('warning', 'suspension', 'ban')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  admin_reason TEXT,
  severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('warning', 'danger', 'critical')),
  suspension_until TIMESTAMPTZ,
  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notif_user ON user_notifications(user_id, is_dismissed, created_at DESC);
CREATE INDEX idx_notif_type ON user_notifications(type, created_at DESC);
