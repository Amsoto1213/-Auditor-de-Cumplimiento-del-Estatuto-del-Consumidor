import type { Metadata } from "next";
import { requireUser, hasPaidPlan } from "@/lib/auth";
import { AuditRunner } from "@/components/AuditRunner";
import { UpgradeCard } from "@/components/Upgrade";
import { RULES } from "@/lib/audit/rules";

export const metadata: Metadata = { title: "Nueva auditoría" };

export default async function Page() {
  const u = await requireUser("/panel/nueva");
  const paid = hasPaidPlan(u);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nueva auditoría completa</h1>
        <p className="mt-1 text-slate-600">
          Rastreamos hasta 20 páginas relevantes (inicio, productos, carrito, checkout, políticas y contacto) y evaluamos {RULES.length} reglas de la Ley 1480 de 2011, el Decreto 587 de 2016 y la Ley 1581 de 2012.
        </p>
      </div>
      {paid ? <AuditRunner defaultUrl={u.company?.storeUrl} /> : <UpgradeCard />}
    </div>
  );
}
