import type { Metadata } from "next";
import { requireUser, hasPaidPlan } from "@/lib/auth";
import { CompanyForm } from "@/components/forms/CompanyForm";
import { TEMPLATES } from "@/lib/templates";
import { UpgradeCard } from "@/components/Upgrade";
import { DownloadLink } from "@/components/DownloadLink";

export const metadata: Metadata = { title: "Empresa y plantillas" };

export default async function Page() {
  const u = await requireUser("/panel/plantillas");
  const paid = hasPaidPlan(u);
  const ready = Boolean(u.company?.legalName && u.company?.nit && u.company?.address && u.company?.phone);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Empresa y plantillas de corrección</h1>
        <p className="mt-1 text-slate-600">Complete los datos de su empresa una sola vez. Las plantillas se descargan en Word (.docx) con esta información ya incluida, listas para revisar y publicar.</p>
      </div>
      <section className="card p-6">
        <h2 className="mb-4 font-semibold text-slate-900">1. Datos de la empresa</h2>
        <CompanyForm company={u.company} />
      </section>
      <section className="card p-6">
        <h2 className="mb-4 font-semibold text-slate-900">2. Descargue sus plantillas</h2>
        {!paid ? (
          <UpgradeCard title="Las plantillas se desbloquean con un plan de pago" text="Active el plan Básico o Pro para descargar las tres plantillas prellenadas con los datos de su empresa." />
        ) : !ready ? (
          <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Guarde primero los datos de la empresa para generar las plantillas.</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-3">
            {TEMPLATES.map((t) => (
              <li key={t.id} className="flex flex-col rounded-xl border border-slate-200 p-5">
                <span className="text-3xl" aria-hidden="true">📄</span>
                <h3 className="mt-2 font-semibold text-slate-900">{t.title}</h3>
                <p className="text-xs font-medium text-brand-600">{t.laws}</p>
                <p className="mt-2 flex-1 text-sm text-slate-600">{t.description}</p>
                <DownloadLink href={`/api/plantillas/${t.id}`} file={t.file} />
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-slate-500">Las plantillas son un punto de partida conforme a la matriz normativa. Revíselas y ajústelas a la realidad de su negocio.</p>
      </section>
    </div>
  );
}
