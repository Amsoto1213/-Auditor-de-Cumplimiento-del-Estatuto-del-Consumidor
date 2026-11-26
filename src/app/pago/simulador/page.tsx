import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getPayment } from "@/lib/payments";
import { cop, getPlan } from "@/lib/site";
import { SimulatorForm } from "@/components/forms/SimulatorForm";

export const metadata: Metadata = { title: "Pago (sandbox)", robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref = "" } = await searchParams;
  const u = await requireUser(`/pago/simulador?ref=${ref}`);
  const p = await getPayment(ref);
  if (!p || p.userId !== u.id) notFound();
  if (p.status !== "PENDING") redirect(`/pago/resultado?ref=${ref}`);
  return (
    <div className="container-page flex justify-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <strong>Ambiente de pruebas (sandbox).</strong> Simulador del Web Checkout de Wompi: no se realizan cobros reales. Al configurar las llaves de Wompi la compra se redirige al checkout oficial de Wompi.
        </div>
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between bg-[#2C2A29] px-6 py-4 text-white">
            <span className="text-lg font-extrabold tracking-wide">wompi <span className="text-xs font-normal text-slate-300">sandbox</span></span>
            <span className="text-xs text-slate-300">Ref. {p.reference}</span>
          </div>
          <div className="p-6">
            <p className="text-sm text-slate-500">Auditor Legal · Plan {getPlan(p.plan)?.name} anual</p>
            <p className="text-3xl font-bold text-slate-900">{cop(p.total)}</p>
            <p className="mb-6 text-xs text-slate-500">Incluye IVA {cop(p.iva)}</p>
            <SimulatorForm reference={p.reference} />
          </div>
        </div>
      </div>
    </div>
  );
}
