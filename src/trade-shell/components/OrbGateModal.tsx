/**
 * OrbGateModal — Gate Orb: solo humanos verificados pueden crear/operar.
 * Reusa verifyOrb() pasado por App.tsx (MiniKit.commandsAsync.verify).
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";

interface Props {
  intent:   "create" | "trade";
  onClose:  () => void;
  onVerify: () => Promise<void>;
}

export default function OrbGateModal({ intent, onClose, onVerify }: Props) {
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState<string | null>(null);

  async function handle() {
    if (busy) return;
    setBusy(true); setErr(null);
    try { await onVerify(); onClose(); }
    catch (e: any) { setErr(e?.message ?? "Verificación fallida."); setBusy(false); }
  }

  const copy = intent === "create"
    ? "Crear un Totem requiere verificación Orb. Solo humanos únicos pueden lanzar."
    : "Operar requiere verificación Orb. Una sola cuenta por humano.";

  return (
    <AnimatePresence>
      <motion.div
        key="orb-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10010]"
        style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(16px)" }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          key="orb-card"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm rounded-2xl p-6"
          style={{
            background: "linear-gradient(160deg,#1a1a1a 0%,#0f0f0f 100%)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
          }}
        >
          <button onClick={onClose} aria-label="Cerrar"
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/5">
            <X size={16} color="rgba(255,255,255,0.5)" />
          </button>

          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.4)" }}>
              <ShieldCheck size={28} color="#a78bfa" />
            </div>
          </div>

          <h3 className="text-white text-lg font-semibold text-center">Verificación requerida</h3>
          <p className="mt-2 text-sm text-center" style={{ color: "rgba(255,255,255,0.55)" }}>
            {copy}
          </p>

          {err && (
            <div className="mt-3 text-[12px] text-center rounded-lg px-3 py-2"
              style={{ background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.3)", color: "#fca5a5" }}>
              {err}
            </div>
          )}

          <button
            onClick={handle}
            disabled={busy}
            className="mt-5 w-full py-3 rounded-xl font-semibold disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg,#a78bfa 0%,#7c3aed 100%)",
              color: "#fff",
              boxShadow: "0 6px 20px rgba(124,58,237,0.35)",
            }}
          >
            {busy ? "Verificando…" : "Verificar con World ID"}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
