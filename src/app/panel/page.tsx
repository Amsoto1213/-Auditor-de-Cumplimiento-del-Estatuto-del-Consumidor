import Link from "next/link";
import type { Metadata } from "next";
import { requireUser, hasPaidPlan } from "@/lib/auth";
import { auditLimit, auditsThisPeriod, listAudits } from "@/lib/audits";
import { RiskBadge } from "@/components/Risk";
import { UpgradeCard } from "@/components/Upgrade";
import { FlashScanner } from "@/components/FlashScanner";

export const metadata: Metadata = { title: "Mi panel" };

export default async function PanelHome() {
  const u = await requireUser("/panel");
  const paid = hasPaidPlan(u);
  const audits = await listAudits(u.id, 20);
  const used = paid ? await auditsThisPeriod(u) : 0;
  const limit = auditLimit(u);
  const last = audits[0];
  const companyReady = Boolean(u.company?.legalName && u.company?.nit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hola, {u.name.split(" ")[0]} 👋</h1>
        <p className="mt-1 text-slate-600">Este es el estado de cumplimiento de su tienda virtual.</p>
      </div>

      {paid ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <p className="text-sm text-slate-500">Último resultado</p>
            {last ? (
              <>
                <p className="mt-1 text-3xl font-bold text-slate-900">{last.score}<span className="text-base font-normal text-slate-500">/100</span></p>
                <RiskBadge level={last.level} className="mt-2" />
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-600">Aún no ha realizado auditorías.</p>
            )}
          </div>
          <div className="card p-5">
            <p className="text-sm text-slate-500">Auditorías del período</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{used}<span className="text-base font-normal text-slate-500"> / {limit === Infinity ? "∞" : limit}</span></p>
            <p className="mt-2 text-xs text-slate-500">Plan vigente hasta {u.planExpiresAt ? new Date(u.planExpiresAt).toLocaleDateString("es-CO", { dateStyle: "long" }) : "—"}</p>
          </div>
          <div className="card flex flex-col justify-between gap-3 p-5">
            <p className="text-sm text-slate-500">Acciones rápidas</p>
            <Link href="/panel/nueva" className="btn-primary !py-2">Nueva auditoría</Link>
            <Link href="/panel/plantillas" className="btn-secondary !py-2">Descargar plantillas</Link>
          </div>
        </div>
      ) : (
        <>
          <UpgradeCard />
          <div>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Escáner flash gratuito</h2>
            <FlashScanner />
          </div>
        </>
      )}

      {!companyReady && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Complete los <Link href="/panel/plantillas" className="font-semibold underline">datos de su empresa</Link> (razón social, NIT, dirección y contacto) para generar las plantillas prellenadas.
        </div>
      )}

      {paid && (
        <div className="card">
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">Historial de auditorías</h2>
            <Link href="/panel/nueva" className="text-sm font-semibold text-brand-600">+ Nueva</Link>
          </div>
          {audits.length === 0 ? (
            <p className="p-5 text-sm text-slate-600">Todavía no hay auditorías. <Link href="/panel/nueva" className="font-semibold text-brand-600">Realice la primera</Link>.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {audits.map((a) => (
                <li key={a.id}>
                  <Link href={`/panel/auditoria/${a.id}`} className="flex flex-col gap-2 p-5 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{a.url}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(a.createdAt).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })} · {a.platform} · {a.pagesScanned.length} páginas
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-900">{a.score}/100</span>
                      <RiskBadge level={a.level} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
