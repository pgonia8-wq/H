import React, { useState, useEffect } from "react";

const SEVERITY_STYLES: Record<string, { overlay: string; border: string; titleColor: string; icon: string }> = {
  warning: { overlay: "rgba(247, 166, 6, 0.85)", border: "#f7a606", titleColor: "#fff", icon: "⚠️" },
  danger: { overlay: "rgba(240, 80, 80, 0.85)", border: "#f05050", titleColor: "#fff", icon: "⏸️" },
  critical: { overlay: "rgba(200, 20, 20, 0.9)", border: "#ff2020", titleColor: "#fff", icon: "🚫" },
};

interface Notification {
  id: string;
  type: "warning" | "suspension" | "ban";
  title: string;
  message: string;
  severity: "warning" | "danger" | "critical";
  suspension_until?: string;
  is_read: boolean;
  created_at: string;
  expired?: boolean;
}

interface Props {
  userId: string;
  apiBase?: string;
}

export default function NotificationBanner({ userId, apiBase = "" }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const load = async () => {
    try {
      const res = await fetch(`${apiBase}/api/notifications?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) return;
      const data = await res.json();
      setNotifications((data.notifications || []).filter((n: Notification) => !n.expired));
    } catch {}
  };

  useEffect(() => {
    if (!userId) return;
    load();
    const iv = setInterval(load, 15000);
    return () => clearInterval(iv);
  }, [userId]);

  const dismiss = async (notifId: string) => {
    try {
      await fetch(`${apiBase}/api/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({ notificationId: notifId, action: "dismiss" }),
      });
      setNotifications(prev => prev.filter(n => n.id !== notifId));
    } catch {}
  };

  if (notifications.length === 0) return null;

  const notif = notifications[0];
  const style = SEVERITY_STYLES[notif.severity] || SEVERITY_STYLES.warning;
  const isBan = notif.type === "ban";

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      background: style.overlay,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
    }}>
      <div style={{
        maxWidth: 420,
        width: "100%",
        textAlign: "center",
        color: "#fff",
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{style.icon}</div>

        <h2 style={{
          fontSize: 22,
          fontWeight: 800,
          color: style.titleColor,
          marginBottom: 12,
          textShadow: "0 2px 8px rgba(0,0,0,0.4)",
          letterSpacing: "-0.02em",
        }}>
          {notif.title}
        </h2>

        <p style={{
          fontSize: 15,
          lineHeight: 1.6,
          color: "rgba(255,255,255,0.95)",
          marginBottom: 20,
          textShadow: "0 1px 4px rgba(0,0,0,0.3)",
          padding: "0 10px",
        }}>
          {notif.message}
        </p>

        {notif.type === "suspension" && notif.suspension_until && (
          <div style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.8)",
            marginBottom: 16,
            background: "rgba(0,0,0,0.2)",
            borderRadius: 8,
            padding: "8px 16px",
            display: "inline-block",
          }}>
            Suspensión hasta: {new Date(notif.suspension_until).toLocaleString()}
          </div>
        )}

        {isBan && (
          <div style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.7)",
            marginTop: 8,
          }}>
            Tu cuenta ha sido bloqueada permanentemente.
            <br />Si crees que es un error, contacta soporte.
          </div>
        )}

        {!isBan && (
          <button
            onClick={() => dismiss(notif.id)}
            style={{
              marginTop: 12,
              padding: "10px 32px",
              background: "rgba(255,255,255,0.2)",
              border: "2px solid rgba(255,255,255,0.5)",
              borderRadius: 10,
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              backdropFilter: "blur(4px)",
            }}
          >
            Entendido
          </button>
        )}

        <div style={{
          marginTop: 20,
          fontSize: 10,
          color: "rgba(255,255,255,0.5)",
        }}>
          {new Date(notif.created_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
