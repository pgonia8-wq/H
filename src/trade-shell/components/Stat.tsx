/** Stat — Mini card de métrica, usada en TokenPage/ProfilePage. */
interface Props {
  label:  string;
  value:  string;
  hint?:  string;
  color?: string;
}
export default function Stat({ label, value, hint, color = "#ffffff" }: Props) {
  return (
    <div
      className="rounded-xl px-3 py-3"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.45)" }}>
        {label}
      </div>
      <div className="mt-1 text-base font-semibold tabular-nums" style={{ color }}>
        {value}
      </div>
      {hint && (
        <div className="mt-0.5 text-[10px]" style={{ color: "rgba(255,255,255,0.40)" }}>
          {hint}
        </div>
      )}
    </div>
  );
}
