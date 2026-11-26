import Link from "next/link";
import type { Metadata } from "next";
import { requireUser, hasPaidPlan } from "@/lib/auth";
import { listDocs } from "@/lib/db";
import type { Payment } from "@/lib/payments";
import { cop, getPlan } from "@/lib/site";

export const metadata: Metadata = { title: "Plan y pagos" };

export default async function Page() {
  const u = await requireUser("/panel/plan");
  const paid = hasPaidPlan(u);
  const payments = (await listDocs<Payment>("payments")).filter((p) => p.userId === u.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Plan y pagos</h1>
      <div className="card flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-slate-500">Plan actual</p>
          <p className="text-2xl font-bold text-slate-900">{getPlan(paid ? u.plan : "gratis")?.name}</p>
          {paid && u.planExpiresAt && <p className="text-sm text-slate-600">Vigente hasta el {new Date(u.planExpiresAt).toLocaleDateString("es-CO", { dateStyle: "long" })}</p>}
        </div>
        <div className="flex gap-2">
          {u.plan !== "pro" && <Link href={`/checkout?plan=${paid ? "pro" : "basico"}`} className="btn-primary">{paid ? "Mejorar a Pro" : "Activar plan"}</Link>}
          <Link href="/precios" className="btn-secondary">Ver planes</Link>
        </div>
      </div>
      <div className="card relative overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <caption className="p-5 text-left font-semibold text-slate-900">Historial de pagos</caption>
          <thead><tr className="border-y border-slate-200 bg-slate-50 text-left"><th className="p-3">Fecha</th><th className="p-3">Referencia</th><th className="p-3">Plan</th><th className="p-3">Total</th><th className="p-3">Estado</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {payments.length === 0 && <tr><td colSpan={5} className="p-5 text-slate-500">Aún no hay pagos.</td></tr>}
            {payments.map((p) => (
              <tr key={p.reference}>
                <td className="p-3">{new Date(p.createdAt).toLocaleDateString("es-CO")}</td>
                <td className="p-3 font-mono text-xs"><Link href={`/pago/resultado?ref=${p.reference}`} className="text-brand-600 underline">{p.reference}</Link></td>
                <td className="p-3">{getPlan(p.plan)?.name}</td>
                <td className="p-3">{cop(p.total)}</td>
                <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.status === "APPROVED" ? "bg-green-100 text-green-800" : p.status === "PENDING" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">La facturación electrónica DIAN y la gestión de renovación/cancelación hacen parte del siguiente release (HU-19, HU-20).</p>
    </div>
  );
}
