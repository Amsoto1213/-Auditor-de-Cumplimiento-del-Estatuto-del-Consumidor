import { NextResponse } from "next/server";
import { currentUser, hasPaidPlan, saveUser } from "@/lib/auth";
import { CrawlError, fullAudit } from "@/lib/audit/crawler";
import { auditLimit, auditsThisPeriod, saveAudit } from "@/lib/audits";
import { rateLimit } from "@/lib/ratelimit";

export const maxDuration = 60;

/** Auditoría completa (HU-10, HU-13, HU-14, HU-15). Requiere plan de pago. */
export async function POST(req: Request) {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "Debe iniciar sesión." }, { status: 401 });
  if (!hasPaidPlan(u)) return NextResponse.json({ error: "La auditoría completa requiere un plan Básico o Pro." }, { status: 402 });
  if (!(await rateLimit("audit", 6, 10 * 60_000))) return NextResponse.json({ error: "Demasiadas auditorías seguidas. Espere unos minutos." }, { status: 429 });
  const used = await auditsThisPeriod(u);
  if (used >= auditLimit(u)) return NextResponse.json({ error: `Alcanzó el límite de ${auditLimit(u)} auditorías de su plan. Mejore al plan Pro para auditorías ilimitadas.` }, { status: 403 });
  let url = "";
  try {
    url = String(((await req.json()) as { url?: string }).url ?? "").slice(0, 300);
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  try {
    const result = await fullAudit(url);
    const saved = await saveAudit(u.id, result);
    if (u.company && !u.company.storeUrl) {
      u.company.storeUrl = result.url;
      await saveUser(u);
    }
    return NextResponse.json({ id: saved.id });
  } catch (e) {
    const msg = e instanceof CrawlError ? e.message : "No fue posible completar la auditoría. Intente de nuevo.";
    if (!(e instanceof CrawlError)) console.error("audit error", e);
    return NextResponse.json({ error: msg }, { status: 422 });
  }
}
