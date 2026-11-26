import { NextResponse } from "next/server";
import { currentUser, hasPaidPlan } from "@/lib/auth";
import { TEMPLATES, buildTemplate, type TemplateId } from "@/lib/templates";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = TEMPLATES.find((x) => x.id === id);
  if (!t) return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 });
  const u = await currentUser();
  if (!u) return NextResponse.redirect(new URL("/ingresar?next=/panel/plantillas", _.url));
  if (!hasPaidPlan(u)) return NextResponse.json({ error: "Requiere un plan de pago" }, { status: 402 });
  if (!u.company?.legalName || !u.company?.nit) return NextResponse.json({ error: "Complete los datos de la empresa" }, { status: 400 });
  const buf = await buildTemplate(id as TemplateId, u.company);
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "content-disposition": `attachment; filename="${t.file}"`,
      "cache-control": "no-store",
    },
  });
}
