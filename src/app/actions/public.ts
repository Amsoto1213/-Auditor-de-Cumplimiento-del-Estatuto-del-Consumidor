"use server";
import { countDocs, getDoc, newId, putDoc, sha256 } from "@/lib/db";
import { isEmail, normalizeEmail } from "@/lib/auth";
import { ipHash, rateLimit } from "@/lib/ratelimit";
import { SITE } from "@/lib/site";
import { sendMail } from "@/lib/mail";

export type FormState = { ok?: boolean; error?: string; message?: string; data?: Record<string, string | number> } | null;

const str = (f: FormData, k: string, max = 200) => String(f.get(k) ?? "").trim().slice(0, max);

/** Lista de espera Beta (HU-08). */
export async function joinWaitlist(_: FormState, f: FormData): Promise<FormState> {
  if (!(await rateLimit("waitlist", 8, 60 * 60_000))) return { error: "Demasiados intentos. Intente más tarde." };
  const name = str(f, "name", 100);
  const email = normalizeEmail(str(f, "email", 160));
  const storeUrl = str(f, "storeUrl", 200);
  const consent = f.get("consent") === "on";
  if (name.length < 2) return { error: "Escriba su nombre." };
  if (!isEmail(email)) return { error: "Escriba un correo electrónico válido." };
  if (storeUrl.length < 4 || !/\.[a-z]{2,}/i.test(storeUrl)) return { error: "Escriba la dirección de su tienda virtual." };
  if (!consent) return { error: "Para inscribirse debe autorizar el tratamiento de sus datos personales." };
  const id = await sha256(email);
  const exists = await getDoc("waitlist", id);
  if (exists) {
    return { ok: true, message: "Este correo ya estaba inscrito en la lista de espera Beta. ¡Gracias por su interés!", data: { count: await countDocs("waitlist") } };
  }
  await putDoc("waitlist", id, {
    name,
    email,
    storeUrl,
    consent: { data: true, at: new Date().toISOString(), ip: await ipHash(), text: "Autorizo el tratamiento de mis datos personales según la política de tratamiento de datos." },
    createdAt: new Date().toISOString(),
  });
  const count = await countDocs("waitlist");
  return { ok: true, message: `¡Listo, ${name.split(" ")[0]}! Su inscripción en la versión Beta quedó registrada. Le escribiremos a ${email} cuando abramos su cupo.`, data: { count } };
}

/** Canal de PQRS (HU-12) con número de radicado. */
export async function submitPqrs(_: FormState, f: FormData): Promise<FormState> {
  if (!(await rateLimit("pqrs", 6, 60 * 60_000))) return { error: "Demasiados intentos. Intente más tarde." };
  const type = str(f, "type", 20);
  const name = str(f, "name", 100);
  const email = normalizeEmail(str(f, "email", 160));
  const message = str(f, "message", 3000);
  const consent = f.get("consent") === "on";
  if (!["peticion", "queja", "reclamo", "sugerencia"].includes(type)) return { error: "Seleccione el tipo de solicitud." };
  if (name.length < 2) return { error: "Escriba su nombre." };
  if (!isEmail(email)) return { error: "Escriba un correo electrónico válido." };
  if (message.length < 10) return { error: "Describa su solicitud (mínimo 10 caracteres)." };
  if (!consent) return { error: "Debe autorizar el tratamiento de sus datos para poder responder su solicitud." };
  const now = new Date();
  const radicado = `PQRS-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${newId().slice(-6).toUpperCase()}`;
  const due = new Date(now.getTime() + 21 * 24 * 3600_000); // ~15 días hábiles
  await putDoc("pqrs", radicado, { radicado, type, name, email, message, status: "radicada", createdAt: now.toISOString(), dueAt: due.toISOString(), ip: await ipHash() });
  await sendMail(email, `Radicado ${radicado} · ${SITE.name}`, `<p>Hola ${name}, recibimos su ${type} con el radicado <b>${radicado}</b>. Le responderemos dentro de los 15 días hábiles siguientes.</p>`);
  return { ok: true, message: radicado, data: { due: due.toLocaleDateString("es-CO", { dateStyle: "long" }) } };
}

/** Pre-registro de agencias aliadas (programa de afiliados, plan de marketing 8.3). */
export async function joinPartners(_: FormState, f: FormData): Promise<FormState> {
  if (!(await rateLimit("partners", 6, 60 * 60_000))) return { error: "Demasiados intentos. Intente más tarde." };
  const agency = str(f, "agency", 120);
  const name = str(f, "name", 100);
  const email = normalizeEmail(str(f, "email", 160));
  const city = str(f, "city", 60);
  const stores = str(f, "stores", 10);
  const consent = f.get("consent") === "on";
  if (agency.length < 2 || name.length < 2) return { error: "Escriba el nombre de la agencia y de la persona de contacto." };
  if (!isEmail(email)) return { error: "Escriba un correo electrónico válido." };
  if (!consent) return { error: "Debe autorizar el tratamiento de sus datos personales." };
  const id = await sha256(email);
  await putDoc("partners", id, { agency, name, email, city, stores, createdAt: new Date().toISOString(), consentAt: new Date().toISOString() });
  return { ok: true, message: `Gracias, ${name.split(" ")[0]}. Recibimos la solicitud de ${agency}; un asesor le contactará para formalizar el convenio.` };
}
