"use server";
import { redirect } from "next/navigation";
import { currentUser, getUser } from "@/lib/auth";
import { applyPaymentStatus, createPayment, getPayment, wompiCheckoutUrl, wompiEnabled } from "@/lib/payments";
import { getPlan, type PlanId } from "@/lib/site";
import type { FormState } from "./public";

export async function startCheckout(_: FormState, f: FormData): Promise<FormState> {
  const u = await currentUser();
  if (!u) return { error: "Su sesión expiró. Ingrese de nuevo." };
  const plan = String(f.get("plan") ?? "") as PlanId;
  if (!getPlan(plan) || plan === "gratis") return { error: "Seleccione un plan válido." };
  if (f.get("terms") !== "on") return { error: "Debe aceptar los términos y condiciones y la política de retracto para continuar." };
  const p = await createPayment(u.id, plan);
  if (wompiEnabled()) redirect(await wompiCheckoutUrl(p, u.email));
  redirect(`/pago/simulador?ref=${p.reference}`);
}

/**
 * Simulador del ambiente sandbox de Wompi (se usa cuando no hay llaves configuradas).
 * Replica las reglas de prueba de Wompi: tarjeta 4242 4242 4242 4242 aprobada,
 * 4111 1111 1111 1111 rechazada; Nequi 3991111111 aprobado, 3992222222 rechazado.
 */
export async function simulatePayment(_: FormState, f: FormData): Promise<FormState> {
  const u = await currentUser();
  if (!u) return { error: "Su sesión expiró. Ingrese de nuevo." };
  const ref = String(f.get("ref") ?? "");
  const p = await getPayment(ref);
  if (!p || p.userId !== u.id) return { error: "Pago no encontrado." };
  if (p.status !== "PENDING") redirect(`/pago/resultado?ref=${ref}`);
  const method = String(f.get("method") ?? "");
  let approved = false;
  if (method === "CARD") {
    const card = String(f.get("card") ?? "").replace(/\D/g, "");
    if (card.length < 15) return { error: "Escriba un número de tarjeta de prueba." };
    approved = card === "4242424242424242";
  } else if (method === "NEQUI") {
    const phone = String(f.get("phone") ?? "").replace(/\D/g, "");
    if (phone.length !== 10) return { error: "Escriba un número celular de 10 dígitos." };
    approved = phone === "3991111111";
  } else if (method === "PSE") {
    approved = String(f.get("bank") ?? "") === "1";
  } else return { error: "Seleccione un medio de pago." };
  await applyPaymentStatus(ref, approved ? "APPROVED" : "DECLINED", {
    method,
    transactionId: `sim-${Date.now()}`,
  });
  redirect(`/pago/resultado?ref=${ref}`);
}

export async function paymentOwner(ref: string) {
  const p = await getPayment(ref);
  return p ? getUser(p.userId) : null;
}
