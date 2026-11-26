"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Finding, Risk, RuleStatus } from "@/lib/audit/types";
import { RISK_STYLE, RiskBadge } from "./Risk";

export interface RuleInfo {
  id: string;
  category: string;
  law: string;
  title: string;
  risk: Risk;
  explanation: string;
  recommendation: string;
  template?: string;
}

const STATUS: Record<RuleStatus, { label: string; cls: string; icon: string }> = {
  no_cumple: { label: "No cumple", cls: "bg-red-100 text-red-800", icon: "✕" },
  cumple: { label: "Cumple", cls: "bg-green-100 text-green-800", icon: "✓" },
  no_determinado: { label: "No determinado", cls: "bg-slate-100 text-slate-700", icon: "?" },
};

const TEMPLATE_NAME: Record<string, string> = {
  datos: "Política de tratamiento de datos",
  terminos: "Términos y condiciones",
  retracto: "Política de retracto y devoluciones",
};

export function AuditReport({ findings, rules }: { findings: Finding[]; rules: Record<string, RuleInfo> }) {
  const [risk, setRisk] = useState<Risk | "todos">("todos");
  const [status, setStatus] = useState<RuleStatus | "todos">("no_cumple");

  const filtered = useMemo(
    () =>
      findings
        .filter((f) => (risk === "todos" ? true : rules[f.ruleId]?.risk === risk))
        .filter((f) => (status === "todos" ? true : f.status === status))
        .sort((a, b) => {
          const order = { no_cumple: 0, no_determinado: 1, cumple: 2 };
          const ro = { alto: 0, medio: 1, bajo: 2 };
          return order[a.status] - order[b.status] || ro[rules[a.ruleId].risk] - ro[rules[b.ruleId].risk];
        }),
    [findings, rules, risk, status],
  );

  const groups = useMemo(() => {
    const g = new Map<string, Finding[]>();
    for (const f of filtered) {
      const cat = rules[f.ruleId]?.category ?? "Otros";
      g.set(cat, [...(g.get(cat) ?? []), f]);
    }
    return [...g.entries()];
  }, [filtered, rules]);

  const count = (s: RuleStatus) => findings.filter((f) => f.status === s).length;

  return (
    <div>
      <div className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-end print:hidden">
        <div>
          <label className="label" htmlFor="f-status">Estado</label>
          <select id="f-status" className="input !py-2" value={status} onChange={(e) => setStatus(e.target.value as RuleStatus | "todos")}>
            <option value="no_cumple">No cumple ({count("no_cumple")})</option>
            <option value="no_determinado">No determinado ({count("no_determinado")})</option>
            <option value="cumple">Cumple ({count("cumple")})</option>
            <option value="todos">Todos ({findings.length})</option>
          </select>
        </div>
        <div>
          <span className="label">Nivel de riesgo</span>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por nivel de riesgo">
            {(["todos", "alto", "medio", "bajo"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRisk(r)}
                aria-pressed={risk === r}
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${risk === r ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
              >
                {r === "todos" ? "Todos" : RISK_STYLE[r].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="card mt-4 p-6 text-sm text-slate-600">No hay hallazgos con los filtros seleccionados.</p>
      )}

      <div className="mt-4 space-y-8">
        {groups.map(([cat, list]) => (
          <section key={cat}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{cat}</h3>
            <div className="space-y-3">
              {list.map((f) => {
                const r = rules[f.ruleId];
                const st = STATUS[f.status];
                return (
                  <article key={f.ruleId} className="card break-inside-avoid p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-400">{r.id} · {r.law}</p>
                        <h4 className="mt-1 font-semibold text-slate-900">{r.title}</h4>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <RiskBadge level={r.risk} />
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${st.cls}`}>
                          <span aria-hidden="true">{st.icon}</span>
                          {st.label}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      <span className="font-semibold">¿Qué significa? </span>
                      {r.explanation}
                    </p>
                    <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
                      <p className="font-semibold text-slate-700">Evidencia</p>
                      <p className="mt-1 break-words text-slate-600">{f.evidence}</p>
                      {f.url && (
                        <a href={f.url} target="_blank" rel="noopener noreferrer nofollow" className="mt-1 block truncate text-xs text-brand-600 underline">
                          {f.url}
                        </a>
                      )}
                    </div>
                    {f.status !== "cumple" && (
                      <div className="mt-3 rounded-lg border border-brand-100 bg-brand-50 p-3 text-sm">
                        <p className="font-semibold text-brand-800">Recomendación</p>
                        <p className="mt-1 text-slate-700">{r.recommendation}</p>
                        {r.template && (
                          <Link href="/panel/plantillas" className="mt-2 inline-block text-xs font-semibold text-brand-600 underline print:hidden">
                            Corregir con la plantilla: {TEMPLATE_NAME[r.template]} →
                          </Link>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
