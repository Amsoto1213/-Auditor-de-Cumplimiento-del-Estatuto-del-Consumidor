import { NextResponse } from "next/server";
import { CrawlError, flashScan } from "@/lib/audit/crawler";
import { newId, putDoc } from "@/lib/db";
import { ipHash, rateLimit } from "@/lib/ratelimit";
import { currentUser } from "@/lib/auth";

export const maxDuration = 60;

function cleanUtm(u: unknown): Record<string, string> | null {
  if (!u || typeof u !== "object") return null;
  const out: Record<string, string> = {};
  for (const k of ["source", "medium", "campaign", "term", "content", "landing"]) {
    const v = (u as Record<string, unknown>)[k];
    if (typeof v === "string" && v) out[k] = v.slice(0, 80);
  }
  return out;
}

/** Escáner flash gratuito (HU-05, HU-06, HU-07). No requiere registro. */
export async function POST(req: Request) {
  let url = "";
  let utm: Record<string, string> | null = null;
  try {
    const body = (await req.json()) as { url?: string; utm?: Record<string, unknown> };
    url = String(body.url ?? "").slice(0, 300);
    utm = cleanUtm(body.utm);
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  if (!(await rateLimit("scan", 10, 10 * 60_000))) {
    return NextResponse.json({ error: "Ha realizado demasiados escaneos seguidos. Intente de nuevo en unos minutos." }, { status: 429 });
  }
  try {
    const result = await flashScan(url);
    const user = await currentUser();
    const id = newId("s");
    // Registro anónimo para medir el embudo (visitas → escaneos → registros → pagos).
    await putDoc("scans", id, {
      id,
      url: result.url,
      platform: result.platform,
      level: result.level,
      score: result.score,
      userId: user?.id ?? null,
      utm,
      ip: await ipHash(),
      createdAt: new Date().toISOString(),
    }).catch(() => undefined);
    return NextResponse.json({ ...result, id });
  } catch (e) {
    const msg = e instanceof CrawlError ? e.message : "No fue posible analizar el sitio en este momento. Intente de nuevo.";
    if (!(e instanceof CrawlError)) console.error("scan error", e);
    return NextResponse.json({ error: msg }, { status: 422 });
  }
}
