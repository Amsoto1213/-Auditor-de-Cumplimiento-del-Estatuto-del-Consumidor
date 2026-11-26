import type { Risk } from "@/lib/audit/types";

export const RISK_STYLE: Record<Risk, { label: string; bg: string; text: string; ring: string; dot: string; soft: string }> = {
  alto: { label: "Riesgo alto", bg: "bg-red-600", text: "text-red-700", ring: "ring-red-200", dot: "bg-red-500", soft: "bg-red-50" },
  medio: { label: "Riesgo medio", bg: "bg-amber-500", text: "text-amber-700", ring: "ring-amber-200", dot: "bg-amber-400", soft: "bg-amber-50" },
  bajo: { label: "Riesgo bajo", bg: "bg-green-600", text: "text-green-700", ring: "ring-green-200", dot: "bg-green-500", soft: "bg-green-50" },
};

export function RiskBadge({ level, className = "" }: { level: Risk; className?: string }) {
  const s = RISK_STYLE[level];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${s.soft} ${s.text} ${s.ring} ${className}`}>
      <span className={`h-2 w-2 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

/** Semáforo de riesgo (HU-07, HU-16). */
export function TrafficLight({ level, size = "md" }: { level: Risk; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-5 w-5" : "h-9 w-9";
  const order: Risk[] = ["alto", "medio", "bajo"];
  const colors: Record<Risk, string> = { alto: "bg-red-500", medio: "bg-amber-400", bajo: "bg-green-500" };
  return (
    <div className={`inline-flex flex-col gap-2 rounded-2xl bg-slate-900 ${size === "sm" ? "p-1.5" : "p-3"}`} role="img" aria-label={RISK_STYLE[level].label}>
      {order.map((r) => (
        <span
          key={r}
          className={`${dim} rounded-full ${r === level ? `${colors[r]} shadow-[0_0_18px_rgba(255,255,255,.35)]` : "bg-slate-700"}`}
        />
      ))}
    </div>
  );
}

export function ScoreRing({ score, level }: { score: number; level: Risk }) {
  const color = level === "alto" ? "#dc2626" : level === "medio" ? "#f59e0b" : "#16a34a";
  const c = 2 * Math.PI * 42;
  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 100 100" className="h-32 w-32 -rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * score) / 100} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-900">{score}</span>
        <span className="text-xs text-slate-500">de 100</span>
      </div>
    </div>
  );
}
