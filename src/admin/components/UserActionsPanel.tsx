import React, { useState } from "react";

interface Props {
  apiCall: any;
  userId: string;
  username?: string;
  onDone?: () => void;
}

const ACTIONS = [
  {
    id: "warn",
    label: "Alertar usuario",
    icon: "⚠️",
    color: "#f7a606",
    bg: "#f7a60610",
    border: "#f7a60630",
    description: "Envía una advertencia visible. El usuario verá un banner amarillo que cubre toda su pantalla hasta que lo acepte.",
    placeholder: "Ej: Hemos detectado actividad inusual en tu cuenta. Te pedimos que revises las normas de la comunidad...",
  },
  {
    id: "suspend",
    label: "Suspender 48h",
    icon: "⏸️",
    color: "#f05050",
    bg: "#f0505010",
    border: "#f0505030",
    description: "Suspende la cuenta por 48 horas. El usuario no podrá interactuar y verá un banner rojo explicando la suspensión.",
    placeholder: "Ej: Tu cuenta ha sido suspendida temporalmente por 48 horas debido a comportamiento que viola nuestras normas...",
  },
  {
    id: "ban",
    label: "Bloquear permanente",
    icon: "🚫",
    color: "#ff2020",
    bg: "#ff202015",
    border: "#ff202040",
    description: "Bloqueo permanente. El usuario verá un banner crítico sin opción de cerrar. No podrá usar la app.",
    placeholder: "Ej: Tu cuenta ha sido bloqueada permanentemente por violaciones graves a las normas de la comunidad...",
  },
];

export default function UserActionsPanel({ apiCall, userId, username, onDone }: Props) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmStep, setConfirmStep] = useState(false);

  const action = ACTIONS.find(a => a.id === selectedAction);

  const handleSend = async () => {
    if (!action || !message.trim()) return;

    if (!confirmStep) {
      setConfirmStep(true);
      return;
    }

    setSending(true);
    setResult(null);
    try {
      const data = await apiCall("notify", {
        method: "POST",
        body: JSON.stringify({
          userId,
          action: action.id,
          message: message.trim(),
          reason: reason.trim() || undefined,
        }),
      });
      if (data.success) {
        setResult({ ok: true, text: action.id === "warn" ? "Alerta enviada" : action.id === "suspend" ? "Usuario suspendido 48h" : "Usuario bloqueado" });
        setMessage("");
        setReason("");
        setSelectedAction(null);
        setConfirmStep(false);
        onDone?.();
      } else {
        setResult({ ok: false, text: data.error || "Error desconocido" });
      }
    } catch (err: any) {
      setResult({ ok: false, text: err.message || "Error de conexión" });
    }
    setSending(false);
  };

  return (
    <div style={{ background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 14, padding: 20, marginTop: 16 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: "#e0e0e0", marginBottom: 4 }}>
        Acciones sobre {username || userId.slice(0, 16)}
      </h3>
      <p style={{ fontSize: 11, color: "#666", marginBottom: 16 }}>El usuario recibirá un banner a pantalla completa con tu mensaje</p>

      {result && (
        <div style={{
          padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 12, fontWeight: 600,
          background: result.ok ? "#10f09015" : "#f0505015",
          border: `1px solid ${result.ok ? "#10f09030" : "#f0505030"}`,
          color: result.ok ? "#10f090" : "#f05050",
        }}>
          {result.ok ? "✅" : "❌"} {result.text}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {ACTIONS.map(a => (
          <button
            key={a.id}
            onClick={() => { setSelectedAction(a.id); setConfirmStep(false); setResult(null); }}
            style={{
              flex: 1, minWidth: 120, padding: "12px 8px", borderRadius: 10, cursor: "pointer", textAlign: "center",
              background: selectedAction === a.id ? a.bg : "#0d0d14",
              border: `2px solid ${selectedAction === a.id ? a.border : "#1a1a2a"}`,
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 4 }}>{a.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: selectedAction === a.id ? a.color : "#888" }}>{a.label}</div>
          </button>
        ))}
      </div>

      {action && (
        <div style={{ animation: "fadeIn 0.2s ease" }}>
          <p style={{ fontSize: 11, color: "#888", marginBottom: 12, lineHeight: 1.5 }}>{action.description}</p>

          <label style={{ fontSize: 10, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>
            Mensaje para el usuario *
          </label>
          <textarea
            value={message}
            onChange={e => { setMessage(e.target.value); setConfirmStep(false); }}
            placeholder={action.placeholder}
            rows={4}
            style={{
              width: "100%", padding: "10px 14px", background: "#0d0d14", border: `1px solid ${action.border}`,
              borderRadius: 10, color: "#e0e0e0", fontSize: 13, lineHeight: 1.5, resize: "vertical",
              outline: "none", boxSizing: "border-box", fontFamily: "inherit",
            }}
          />

          <label style={{ fontSize: 10, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginTop: 12, marginBottom: 4 }}>
            Razón interna (solo admin, opcional)
          </label>
          <input
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Ej: Whale dump coordinado, bot sospechoso, etc."
            style={{
              width: "100%", padding: "8px 14px", background: "#0d0d14", border: "1px solid #1e1e2e",
              borderRadius: 8, color: "#ccc", fontSize: 12, outline: "none", boxSizing: "border-box",
            }}
          />

          <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={handleSend}
              disabled={!message.trim() || sending}
              style={{
                padding: "10px 24px", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: sending ? "wait" : "pointer",
                background: confirmStep ? action.color : `${action.color}20`,
                color: confirmStep ? "#fff" : action.color,
                border: `2px solid ${action.color}`,
                opacity: !message.trim() ? 0.4 : 1,
                transition: "all 0.15s ease",
              }}
            >
              {sending ? "Enviando..." : confirmStep ? `Confirmar ${action.label}` : action.label}
            </button>

            {confirmStep && !sending && (
              <button
                onClick={() => setConfirmStep(false)}
                style={{ padding: "10px 16px", background: "none", border: "1px solid #2a2a3e", borderRadius: 10, color: "#888", fontSize: 12, cursor: "pointer" }}
              >
                Cancelar
              </button>
            )}

            {confirmStep && !sending && (
              <span style={{ fontSize: 11, color: action.color, fontWeight: 600 }}>
                ¿Seguro? Click de nuevo para confirmar
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
