/**
 * BottomTabBar — 3 tabs fijos: Mercado · Crear · Perfil.
 * Estética clonada de token/components/BottomTabBar.
 */
import { motion } from "framer-motion";
import { TrendingUp, Plus, User } from "lucide-react";
import { useShell, type Screen } from "../context/ShellContext";

const TABS: { id: Screen; label: string; Icon: typeof TrendingUp }[] = [
  { id: "discovery", label: "Mercado", Icon: TrendingUp },
  { id: "creator",   label: "Crear",   Icon: Plus },
  { id: "profile",   label: "Perfil",  Icon: User },
];

export default function BottomTabBar() {
  const { screen, setScreen } = useShell();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[10000] pointer-events-none"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="max-w-md mx-auto px-4 pb-3 pointer-events-auto">
        <div
          className="flex items-center justify-around rounded-2xl px-2 py-2"
          style={{
            background: "rgba(10,10,10,0.88)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 -4px 24px rgba(0,0,0,0.6)",
          }}
        >
          {TABS.map(({ id, label, Icon }) => {
            const active = screen === id || (id === "discovery" && screen === "token");
            return (
              <button
                key={id}
                onClick={() => setScreen(id)}
                className="relative flex flex-col items-center justify-center gap-1 px-5 py-2 rounded-xl transition-colors"
                aria-label={label}
              >
                {active && (
                  <motion.span
                    layoutId="tab-active-bg"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: "rgba(34,197,94,0.14)" }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon size={20} color={active ? "#22c55e" : "rgba(255,255,255,0.55)"} />
                <span
                  className="relative text-[10px] font-medium tracking-wide"
                  style={{ color: active ? "#22c55e" : "rgba(255,255,255,0.55)" }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
