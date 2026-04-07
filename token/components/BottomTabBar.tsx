import { useApp } from "@/context/AppContext";
  import type { Screen } from "@/context/AppContext";
  import { Compass, Gift, User, Plus, BarChart3 } from "lucide-react";
  import { motion } from "framer-motion";

  const tabs: { key: Screen; icon: typeof Compass; label: string }[] = [
    { key: "discovery", icon: Compass, label: "Market" },
    { key: "airdrops", icon: Gift, label: "Airdrops" },
    { key: "profile", icon: User, label: "Portfolio" },
  ];

  export default function BottomTabBar() {
    const { screen, navigate, openCreatorDashboard, isCreatorModalOpen } = useApp();

    if (isCreatorModalOpen) return null;
    if (screen === "token") return null;

    return (
      <div className="relative flex items-center justify-around px-1 pb-[env(safe-area-inset-bottom)] bg-background/95 backdrop-blur-2xl border-t border-border/30" data-testid="bottom-tab-bar">
        {tabs.map((tab, i) => {
          const isActive = screen === tab.key;
          const Icon = tab.icon;

          if (i === 1) {
            return (
              <div key="create-group" className="flex items-center gap-0">
                <TabButton isActive={isActive} onClick={() => navigate(tab.key)} icon={Icon} label={tab.label} testId={`tab-${tab.key}`} />
                <button
                  onClick={openCreatorDashboard}
                  data-testid="button-create-token"
                  className="relative -mt-5 mx-2 w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20 active:scale-90 transition-transform"
                >
                  <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
                  <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" style={{ animationDuration: "3s" }} />
                </button>
              </div>
            );
          }

          return <TabButton key={tab.key} isActive={isActive} onClick={() => navigate(tab.key)} icon={Icon} label={tab.label} testId={`tab-${tab.key}`} />;
        })}
      </div>
    );
  }

  function TabButton({ isActive, onClick, icon: Icon, label, testId }: { isActive: boolean; onClick: () => void; icon: typeof Compass; label: string; testId: string }) {
    return (
      <button onClick={onClick} data-testid={testId} className="relative flex flex-col items-center gap-0.5 py-2.5 px-5 group">
        <div className="relative">
          <Icon className={`w-5 h-5 transition-all duration-200 ${isActive ? "text-green-400" : "text-muted-foreground/70 group-active:text-foreground"}`} strokeWidth={isActive ? 2.2 : 1.8} />
          {isActive && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-400"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </div>
        <span className={`text-[9px] font-semibold transition-colors ${isActive ? "text-green-400" : "text-muted-foreground/60"}`}>{label}</span>
      </button>
    );
  }
  