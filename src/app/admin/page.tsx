import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { listDocs, storageMode } from "@/lib/db";
import type { Payment } from "@/lib/payments";
import { BETA_GOAL, cop } from "@/lib/site";

export const metadata: Metadata = { title: "Administración", robots: { index: false } };

type Row = Record<string, unknown> & { createdAt?: string };

export default async function Page() {
  const u = await requireUser("/admin");
  if (u.role !== "admin") notFound();
  const [scans, users, payments, waitlist, pqrs, partners] = await Promise.all([
    listDocs<Row>("scans"),
    listDocs<Row>("users"),
    listDocs<Payment>("payments"),
    listDocs<Row>("waitlist"),
    listDocs<Row>("pqrs"),
    listDocs<Row>("partners"),
  ]);
  const approved = payments.filter((p) => p.status === "APPROVED");
  const revenue = approved.reduce((s, p) => s + p.total, 0);
  const conv = scans.length ? ((approved.length / scans.length) * 100).toFixed(1) : "0";
  const funnel = [
    { l: "Escaneos gratuitos", v: scans.length },
    { l: "Registros", v: users.length },
    { l: "Pagos aprobados", v: approved.length },
  ];
  const max = Math.max(1, ...funnel.map((f) => f.v));
  const levels = ["alto", "medio", "bajo"].map((l) => ({ l, v: scans.filter((s) => s.level === l).length }));
  return (
    <div className="container-page space-y-6 py-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Métricas del negocio</h1>
        <p className="text-sm text-slate-500">Almacenamiento: {storageMode()}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          ["Lista de espera Beta", `${waitlist.length} / ${BETA_GOAL}`],
          ["Conversión escáner → pago", `${conv} %`],
          ["Ingresos (sandbox)", cop(revenue)],
          ["PQRS radicadas", String(pqrs.length)],
        ].map(([l, v]) => (
          <div key={l} className="card p-5"><p className="text-xs text-slate-500">{l}</p><p className="mt-1 text-2xl font-bold text-slate-900">{v}</p></div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900">Embudo de conversión</h2>
          <div className="mt-4 space-y-3">
            {funnel.map((f) => (
              <div key={f.l}>
                <div className="flex justify-between text-sm"><span>{f.l}</span><span className="font-semibold">{f.v}</span></div>
                <div className="mt-1 h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-brand-600" style={{ width: `${(f.v / max) * 100}%` }} /></div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-500">Meta del plan de marketing: 15 % de conversión del escáner gratuito a suscripción paga.</p>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900">Riesgo de las tiendas escaneadas</h2>
          <div className="mt-4 space-y-3">
            {levels.map((x) => (
              <div key={x.l}>
                <div className="flex justify-between text-sm capitalize"><span>{x.l}</span><span className="font-semibold">{x.v}</span></div>
                <div className="mt-1 h-3 rounded-full bg-slate-100"><div className={`h-3 rounded-full ${x.l === "alto" ? "bg-red-500" : x.l === "medio" ? "bg-amber-400" : "bg-green-500"}`} style={{ width: `${scans.length ? (x.v / scans.length) * 100 : 0}%` }} /></div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-500">Agencias aliadas pre-registradas: {partners.length} (meta: 10 convenios).</p>
        </div>
      </div>
      <div className="card relative overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
          <caption className="p-5 text-left font-semibold text-slate-900">Últimas PQRS</caption>
          <thead><tr className="border-y border-slate-200 bg-slate-50 text-left"><th className="p-3">Radicado</th><th className="p-3">Tipo</th><th className="p-3">Nombre</th><th className="p-3">Mensaje</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {pqrs.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 20).map((p) => (
              <tr key={String(p.radicado)}><td className="p-3 font-mono text-xs">{String(p.radicado)}</td><td className="p-3 capitalize">{String(p.type)}</td><td className="p-3">{String(p.name)}</td><td className="max-w-xs truncate p-3">{String(p.message)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
