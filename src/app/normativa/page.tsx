import type { Metadata } from "next";
import { RULES, ABUSIVE_PHRASES } from "@/lib/audit/rules";
import { RiskBadge } from "@/components/Risk";

export const metadata: Metadata = {
  title: "Matriz normativa",
  description: "Reglas verificables de la Ley 1480 de 2011, el Decreto 587 de 2016 y la Ley 1581 de 2012 que evalúa el auditor.",
};

export default function Page() {
  const cats = [...new Set(RULES.map((r) => r.category))];
  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold text-slate-900">Matriz normativa</h1>
      <p className="mt-3 max-w-3xl text-slate-600">
        El motor de auditoría traduce la Ley 1480 de 2011 (Estatuto del Consumidor), el Decreto 587 de 2016, la Ley 1581 de 2012 y la Guía de comercio electrónico de la SIC en <strong>{RULES.length} reglas verificables</strong>. Cada regla tiene un identificador, la norma y el artículo, el nivel de riesgo y la forma de verificación.
      </p>
      {cats.map((c) => (
        <section key={c} className="mt-10">
          <h2 className="mb-3 text-xl font-semibold text-slate-900">{c}</h2>
          <div className="card relative overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead><tr className="border-b border-slate-200 bg-slate-50 text-left"><th className="p-3">ID</th><th className="p-3">Regla</th><th className="p-3">Norma</th><th className="p-3">Riesgo</th><th className="p-3">Verificación</th></tr></thead>
              <tbody className="divide-y divide-slate-100 align-top">
                {RULES.filter((r) => r.category === c).map((r) => (
                  <tr key={r.id}>
                    <td className="p-3 font-mono text-xs font-semibold">{r.id}</td>
                    <td className="p-3"><p className="font-medium text-slate-900">{r.title}</p><p className="text-xs text-slate-500">{r.description}</p></td>
                    <td className="p-3 text-slate-600">{r.law}</td>
                    <td className="p-3"><RiskBadge level={r.risk} /></td>
                    <td className="p-3 text-slate-600">{r.verification}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      <section className="mt-10 card p-6">
        <h2 className="text-lg font-semibold text-slate-900">Leyendas abusivas detectadas ({ABUSIVE_PHRASES.length} patrones)</h2>
        <ul className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
          {ABUSIVE_PHRASES.map((p) => <li key={p.label}>🚫 «{p.label}»</li>)}
        </ul>
      </section>
      <section className="mt-6 card p-6 text-sm text-slate-700">
        <h2 className="text-lg font-semibold text-slate-900">Metodología de calificación</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li><strong>Puntaje (0 a 100):</strong> promedio ponderado de las reglas evaluadas (riesgo alto = 3, medio = 2, bajo = 1). Las reglas «no determinadas» no afectan el puntaje.</li>
          <li><strong>Riesgo alto:</strong> falta la política de datos, hay leyendas que prohíben devoluciones o faltan datos del vendedor (razón social, NIT, contacto), o el puntaje es menor a 50.</li>
          <li><strong>Riesgo medio:</strong> hay otras omisiones, como el enlace a la SIC o los costos de envío.</li>
          <li><strong>Riesgo bajo:</strong> los textos exigidos están completos.</li>
        </ul>
      </section>
    </div>
  );
}
