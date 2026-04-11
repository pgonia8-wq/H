import { useApp } from "@/context/AppContext";

export default function CurrencyToggle({ compact }: { compact?: boolean }) {
  const { displayCurrency, toggleCurrency, wldUsdRate } = useApp();
  const isWld = displayCurrency === "WLD";

  return (
    <button
      onClick={toggleCurrency}
      className="flex items-center rounded-lg bg-secondary/50 border border-border/30 p-0.5 transition-all active:scale-95"
      title={`1 WLD = $${wldUsdRate.toFixed(2)}`}
    >
      <span className={`px-2 py-1 rounded-md text-[9px] font-bold transition-all ${isWld ? "bg-green-500/20 text-green-400" : "text-muted-foreground"}`}>
        WLD
      </span>
      <span className={`px-2 py-1 rounded-md text-[9px] font-bold transition-all ${!isWld ? "bg-green-500/20 text-green-400" : "text-muted-foreground"}`}>
        USD
      </span>
    </button>
  );
}
