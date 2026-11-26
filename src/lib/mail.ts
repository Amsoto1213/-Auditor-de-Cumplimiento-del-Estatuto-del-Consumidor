import "server-only";
import { SITE } from "./site";

/**
 * Envío de correos transaccionales.
 * Si existe RESEND_API_KEY se envía el correo real con Resend.
 * Si no, la app funciona en "modo demostración": el enlace se muestra en pantalla
 * para que el flujo se pueda probar en la presentación sin un proveedor de correo.
 */
export function mailEnabled() {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendMail(to: string, subject: string, html: string): Promise<boolean> {
  if (!mailEnabled()) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: process.env.MAIL_FROM ?? `${SITE.name} <onboarding@resend.dev>`,
        to: [to],
        subject,
        html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function actionEmail(title: string, text: string, url: string, cta: string) {
  return `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#0f172a">
  <h2 style="color:#1e3a8a">${title}</h2>
  <p>${text}</p>
  <p><a href="${url}" style="display:inline-block;background:#1d4ed8;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">${cta}</a></p>
  <p style="font-size:12px;color:#64748b">Si no solicitó este correo, ignórelo. ${SITE.legalName} · NIT ${SITE.nit}</p>
</div>`;
}
