import type { Metadata } from "next";
import { PartnerForm } from "@/components/forms/PartnerForm";
import { PLANS, cop } from "@/lib/site";

export const metadata: Metadata = { title: "Programa de aliados para agencias web", description: "Comisión recurrente del 20 % para agencias y desarrolladores que entregan tiendas virtuales en regla." };

export default function Page() {
  const basic = PLANS.find((p) => p.id === "basico")!.priceYear;
  return (
    <div>
      <section className="bg-gradient-to-b from-brand-900 to-brand-700 py-16 text-white">
        <div className="container-page max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-200">Para agencias web y desarrolladores</p>
          <h1 className="mt-3 text-4xl font-extrabold">Entregue tiendas virtuales en regla y gane un 20 % recurrente</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">Integre la auditoría de cumplimiento en cada tienda que construye. Su cliente recibe un sitio ajustado a la ley y usted una comisión cada año que el cliente renueve.</p>
        </div>
      </section>
      <section className="container-page grid gap-6 py-14 md:grid-cols-3">
        {[
          { t: "20 % de comisión recurrente", d: `Por cada plan Básico vendido recibe ${cop(Math.round(basic * 0.2))} al año, mientras el cliente siga activo.` },
          { t: "Valor agregado para sus clientes", d: "Entregue cada proyecto con un diagnóstico de cumplimiento del Estatuto del Consumidor y la Ley 1581." },
          { t: "Plan Agencia (próximamente)", d: "Administre las tiendas de varios clientes desde un mismo panel y emita un sello de cumplimiento verificable." },
        ].map((b) => (
          <div key={b.t} className="card p-6"><h2 className="font-semibold text-slate-900">{b.t}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{b.d}</p></div>
        ))}
      </section>
      <section className="container-page max-w-3xl pb-6">
        <div className="card p-6 sm:p-8">
          <h2 className="mb-5 text-xl font-bold text-slate-900">Solicite su convenio de aliado</h2>
          <PartnerForm />
        </div>
      </section>
    </div>
  );
}
