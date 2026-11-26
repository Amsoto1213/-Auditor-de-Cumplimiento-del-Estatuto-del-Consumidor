import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireUser, hasPaidPlan } from "@/lib/auth";
import { getAudit } from "@/lib/audits";
import { RULES } from "@/lib/audit/rules";
import { RISK_STYLE, ScoreRing, TrafficLight } from "@/components/Risk";
import { AuditReport, type RuleInfo } from "@/components/AuditReport";
import { UpgradeCard } from "@/components/Upgrade";
import { PrintButton } from "@/components/PrintButton";
import { SMMLV_2026, cop } from "@/lib/site";

export const metadata: Metadata = { title: "Informe de auditoría" };

const LEVEL_TEXT = {
  alto: "Su tienda tiene incumplimientos graves que la SIC sanciona con frecuencia (por ejemplo, ausencia de política de datos, leyendas que niegan devoluciones o falta de datos del vendedor). Priorice las correcciones marcadas en rojo.",
  medio: "Su tienda cumple lo esencial, pero tiene omisiones (como el enlace a la SIC o el desglose de costos) que conviene corregir para evitar reclamos.",
  bajo: "Su tienda publica la información exigida por el Estatuto del Consumidor y la Ley 1581. Mantenga los textos actualizados y vuelva a auditar cuando haga cambios.",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const u = await requireUser(`/panel/auditoria/${id}`);
  const a = await getAudit(id, u.id);
  if (!a) notFound();
  if (!hasPaidPlan(u)) return <UpgradeCard text="Su plan venció. Renuévelo para consultar el informe completo." />;

  const rules: Record<string, RuleInfo> = Object.fromEntries(
    RULES.map((r) => [r.id, { id: r.id, category: r.category, law: r.law, title: r.title, risk: r.risk, explanation: r.explanation, recommendation: r.recommendation, template: r.template }]),
  );
  const fails = a.findings.filter((f) => f.status === "no_cumple");
  const byLaw = (prefixes: string[]) => fails.filter((f) => prefixes.some((p) => f.ruleId.startsWith(p))).length;
  const l1480 = byLaw(["INF", "RET", "ABU", "REV"]);
  const l1581 = byLaw(["DAT"]);
  const s = RISK_STYLE[a.level];
  const fine = 2000 * SMMLV_2026;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/panel" className="text-sm text-brand-600 print:hidden">← Volver al panel</Link>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Informe de auditoría</h1>
          <p className="break-all text-sm text-slate-600">{a.url}</p>
        </div>
        <PrintButton />
      </div>

      <div className={`card grid gap-6 p-6 md:grid-cols-[auto_auto_1fr] md:items-center ${s.soft}`}>
        <TrafficLight level={a.level} />
        <ScoreRing score={a.score} level={a.level} />
        <div>
          <p className={`text-2xl font-bold ${s.text}`}>{s.label}</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{LEVEL_TEXT[a.level]}</p>
          <p className="mt-3 text-xs text-slate-500">
            {new Date(a.createdAt).toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" })} · {a.platform} · {a.pagesScanned.length} páginas analizadas en {(a.durationMs / 1000).toFixed(0)} s
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Incumplimientos" value={fails.length} cls="text-red-600" />
        <Stat label="Ley 1480 y Decreto 587" value={l1480} cls="text-slate-900" />
        <Stat label="Ley 1581 (datos)" value={l1581} cls="text-slate-900" />
        <Stat label="Reglas cumplidas" value={a.findings.filter((f) => f.status === "cumple").length} cls="text-green-600" />
      </div>

      {fails.length > 0 && (
        <div className="rounded-2xl bg-slate-900 p-5 text-sm text-slate-200">
          <p className="font-semibold text-white">¿Cuánto podría costarle?</p>
          <p className="mt-1 leading-6">
            La SIC puede imponer multas de hasta 2.000 SMMLV ({cop(fine)}) por infracciones al Estatuto del Consumidor (Ley 1480, art. 61) y hasta 2.000 SMMLV por infracciones a la Ley 1581 (art. 23). Corregir estos {fails.length} hallazgos reduce su exposición.
          </p>
        </div>
      )}

      <AuditReport findings={a.findings} rules={rules} />

      <details className="card p-5">
        <summary className="cursor-pointer font-semibold text-slate-900">Páginas analizadas ({a.pagesScanned.length})</summary>
        <ul className="mt-3 space-y-1 text-sm">
          {a.pagesScanned.map((p) => (
            <li key={p.url} className="truncate">
              <a href={p.url} target="_blank" rel="noopener noreferrer nofollow" className="text-brand-600 underline">{p.url}</a>
              {p.title && <span className="text-slate-500"> — {p.title}</span>}
            </li>
          ))}
        </ul>
        {a.robotsBlocked.length > 0 && (
          <p className="mt-3 text-xs text-slate-500">Páginas no leídas por indicación del archivo robots.txt: {a.robotsBlocked.length}.</p>
        )}
      </details>

      <p className="text-xs text-slate-500">
        Este informe es generado automáticamente a partir del contenido público del sitio y es una herramienta de apoyo preventivo. No constituye concepto jurídico ni reemplaza la asesoría de un abogado.
      </p>
    </div>
  );
}

function Stat({ label, value, cls }: { label: string; value: number; cls: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${cls}`}>{value}</p>
    </div>
  );
}
