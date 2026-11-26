import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { cop, getPlan, priceBreakdown, IVA } from "@/lib/site";
import { CheckoutForm } from "@/components/forms/CheckoutForm";
import { wompiEnabled } from "@/lib/payments";

export const metadata: Metadata = { title: "Resumen de compra" };

export default async function Page({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan: planId } = await searchParams;
  const plan = getPlan(planId);
  if (!plan || plan.priceYear === 0) redirect("/precios");
  const u = await currentUser();
  if (!u) redirect(`/ingresar?next=${encodeURIComponent(`/checkout?plan=${plan.id}`)}`);
  const b = priceBreakdown(plan.priceYear);
  return (
    <div className="container-page max-w-4xl py-12">
      <Link href="/precios" className="text-sm text-brand-600">← Cambiar de plan</Link>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Resumen de compra</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900">Plan {plan.name} · suscripción anual</h2>
          <p className="mt-1 text-sm text-slate-600">{plan.description}</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {plan.features.filter((f) => f.included).map((f) => <li key={f.label}>✓ {f.label}</li>)}
            <li>✓ {plan.audits}</li>
          </ul>
          <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            <p><span className="font-medium text-slate-700">Cliente:</span> {u.name} · {u.email}</p>
            {u.company?.legalName && <p><span className="font-medium text-slate-700">Empresa:</span> {u.company.legalName} · NIT {u.company.nit}</p>}
            <p className="mt-2 text-xs">El acceso se activa de inmediato cuando Wompi confirma el pago y tiene vigencia de 12 meses.</p>
          </div>
        </div>
        <div className="card p-6">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-600">Plan {plan.name} (12 meses)</dt><dd>{cop(b.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-600">Subtotal</dt><dd>{cop(b.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-600">IVA ({Math.round(IVA * 100)} %)</dt><dd>{cop(b.iva)}</dd></div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-bold text-slate-900"><dt>Total a pagar</dt><dd>{cop(b.total)}</dd></div>
          </dl>
          <div className="mt-6">
            <CheckoutForm plan={plan.id} wompi={wompiEnabled()} />
          </div>
        </div>
      </div>
    </div>
  );
}
