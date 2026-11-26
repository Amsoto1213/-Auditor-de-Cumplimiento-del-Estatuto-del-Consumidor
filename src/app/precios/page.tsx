import Link from "next/link";
import type { Metadata } from "next";
import { PLANS, cop, priceBreakdown } from "@/lib/site";

export const metadata: Metadata = {
  title: "Planes y precios",
  description: "Planes Gratis, Básico y Pro del Auditor de cumplimiento del Estatuto del Consumidor. Precios anuales en pesos colombianos con IVA incluido.",
};

export default function Page() {
  return (
    <div className="container-page py-14">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-slate-900">Planes y precios</h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">Precios anuales en pesos colombianos (COP), <strong>IVA del 19 % incluido</strong>. Pague con tarjeta, PSE o Nequi a través de Wompi.</p>
      </div>
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {PLANS.map((p) => {
          const b = priceBreakdown(p.priceYear);
          return (
            <div key={p.id} className={`card relative flex flex-col p-7 ${p.highlight ? "border-brand-600 ring-4 ring-brand-100" : ""}`}>
              {p.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">Más elegido</span>}
              <h2 className="text-xl font-bold text-slate-900">{p.name}</h2>
              <p className="mt-1 text-sm text-slate-600">{p.description}</p>
              <p className="mt-6 text-4xl font-extrabold text-slate-900">{p.priceYear ? cop(p.priceYear) : "$0"}</p>
              <p className="text-sm text-slate-500">{p.priceYear ? "por año · IVA incluido" : "para siempre"}</p>
              {p.priceYear > 0 && (
                <p className="mt-1 text-xs text-slate-400">Subtotal {cop(b.subtotal)} + IVA {cop(b.iva)} · equivale a {cop(Math.round(p.priceYear / 12))}/mes</p>
              )}
              <p className="mt-4 text-sm font-medium text-slate-700">{p.audits} · {p.stores} {p.stores === 1 ? "tienda" : "tiendas"}</p>
              <ul className="mt-5 flex-1 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f.label} className={`flex gap-2 ${f.included ? "text-slate-700" : "text-slate-400 line-through"}`}>
                    <span aria-hidden="true" className={f.included ? "text-green-600" : ""}>{f.included ? "✓" : "–"}</span>
                    <span>{f.label}<span className="sr-only">{f.included ? " (incluido)" : " (no incluido)"}</span></span>
                  </li>
                ))}
              </ul>
              <Link href={p.priceYear ? `/checkout?plan=${p.id}` : "/registro"} className={`${p.highlight ? "btn-primary" : "btn-secondary"} mt-7`}>
                {p.priceYear ? `Elegir plan ${p.name}` : "Empezar gratis"}
              </Link>
            </div>
          );
        })}
      </div>

      <div className="card mt-12 relative overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <caption className="p-5 text-left text-lg font-semibold text-slate-900">Comparativa de funcionalidades</caption>
          <thead>
            <tr className="border-y border-slate-200 bg-slate-50 text-left">
              <th className="p-4">Funcionalidad</th>
              {PLANS.map((p) => <th key={p.id} className="p-4 text-center">{p.name}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {PLANS[0].features.map((f, i) => (
              <tr key={f.label}>
                <td className="p-4 text-slate-700">{f.label}</td>
                {PLANS.map((p) => (
                  <td key={p.id} className="p-4 text-center">{p.features[i].included ? <span className="text-green-600">✓<span className="sr-only">Incluido</span></span> : <span className="text-slate-300">—<span className="sr-only">No incluido</span></span>}</td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="p-4 text-slate-700">Tiendas</td>
              {PLANS.map((p) => <td key={p.id} className="p-4 text-center">{p.stores}</td>)}
            </tr>
            <tr>
              <td className="p-4 text-slate-700">Precio anual (IVA incluido)</td>
              {PLANS.map((p) => <td key={p.id} className="p-4 text-center font-semibold">{p.priceYear ? cop(p.priceYear) : "Gratis"}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-6 text-center text-xs text-slate-500">
        Usted puede ejercer el <Link href="/legal/retracto" className="underline">derecho de retracto</Link> dentro de los 5 días hábiles siguientes a la compra. ¿Es una agencia web? Conozca nuestro <Link href="/aliados" className="underline">programa de aliados</Link>.
      </p>
    </div>
  );
}
