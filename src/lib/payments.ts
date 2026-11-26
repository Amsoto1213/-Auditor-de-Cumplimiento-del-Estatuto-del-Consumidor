import "server-only";
import { getDoc, putDoc, sha256 } from "./db";
import { getUser, saveUser } from "./auth";
import { appUrl, getPlan, priceBreakdown, type PlanId } from "./site";

export type PaymentStatus = "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";

export interface Payment {
  reference: string;
  userId: string;
  plan: PlanId;
  amountInCents: number;
  subtotal: number;
  iva: number;
  total: number;
  status: PaymentStatus;
  provider: "wompi" | "simulador";
  method?: string;
  transactionId?: string;
  termsAcceptedAt: string;
  createdAt: string;
  updatedAt: string;
}

export function wompiEnabled() {
  return Boolean(process.env.WOMPI_PUBLIC_KEY && process.env.WOMPI_INTEGRITY_SECRET);
}

export function wompiApiBase() {
  const pub = process.env.WOMPI_PUBLIC_KEY ?? "";
  return pub.startsWith("pub_prod_") ? "https://production.wompi.co/v1" : "https://sandbox.wompi.co/v1";
}

export async function createPayment(userId: string, planId: PlanId): Promise<Payment> {
  const plan = getPlan(planId);
  if (!plan || plan.priceYear <= 0) throw new Error("Plan inválido");
  const b = priceBreakdown(plan.priceYear);
  const reference = `AL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const now = new Date().toISOString();
  const p: Payment = {
    reference,
    userId,
    plan: planId,
    amountInCents: b.total * 100,
    subtotal: b.subtotal,
    iva: b.iva,
    total: b.total,
    status: "PENDING",
    provider: wompiEnabled() ? "wompi" : "simulador",
    termsAcceptedAt: now,
    createdAt: now,
    updatedAt: now,
  };
  await putDoc("payments", reference, p);
  return p;
}

export async function getPayment(reference: string) {
  if (!/^AL-[A-Z0-9-]+$/.test(reference)) return null;
  return getDoc<Payment>("payments", reference);
}

/** URL del Web Checkout de Wompi con firma de integridad. */
export async function wompiCheckoutUrl(p: Payment, email: string) {
  const currency = "COP";
  const signature = await sha256(`${p.reference}${p.amountInCents}${currency}${process.env.WOMPI_INTEGRITY_SECRET}`);
  const params = new URLSearchParams({
    "public-key": process.env.WOMPI_PUBLIC_KEY!,
    currency,
    "amount-in-cents": String(p.amountInCents),
    reference: p.reference,
    "signature:integrity": signature,
    "redirect-url": `${appUrl()}/pago/resultado?ref=${p.reference}`,
    "customer-data:email": email,
  });
  return `https://checkout.wompi.co/p/?${params.toString()}`;
}

/** Actualiza el pago y, si fue aprobado, activa el plan del usuario por un año. */
export async function applyPaymentStatus(reference: string, status: PaymentStatus, extra: Partial<Payment> = {}) {
  const p = await getPayment(reference);
  if (!p) return null;
  if (p.status === "APPROVED") return p; // idempotente
  const updated: Payment = { ...p, ...extra, status, updatedAt: new Date().toISOString() };
  await putDoc("payments", reference, updated);
  if (status === "APPROVED") {
    const u = await getUser(p.userId);
    if (u) {
      const now = new Date();
      u.plan = p.plan;
      u.planActivatedAt = now.toISOString();
      u.planExpiresAt = new Date(now.getTime() + 365 * 24 * 3600_000).toISOString();
      await saveUser(u);
    }
  }
  return updated;
}

/** Consulta la transacción en el API público de Wompi (confirmación en la redirección). */
export async function fetchWompiTransaction(id: string) {
  if (!/^[A-Za-z0-9-]+$/.test(id)) return null;
  try {
    const res = await fetch(`${wompiApiBase()}/transactions/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { id: string; status: PaymentStatus; reference: string; amount_in_cents: number; payment_method_type?: string } };
    return json.data ?? null;
  } catch {
    return null;
  }
}

/** Verifica la firma de un evento de Wompi (webhook). */
export async function verifyWompiEvent(body: {
  data?: Record<string, unknown>;
  signature?: { properties?: string[]; checksum?: string };
  timestamp?: number;
}, headerChecksum?: string | null) {
  const secret = process.env.WOMPI_EVENTS_SECRET;
  if (!secret || !body.signature?.properties || body.timestamp === undefined) return false;
  const values = body.signature.properties.map((path) => {
    let cur: unknown = body.data;
    for (const part of path.split(".")) cur = (cur as Record<string, unknown> | undefined)?.[part];
    return String(cur ?? "");
  });
  const checksum = await sha256(`${values.join("")}${body.timestamp}${secret}`);
  const expected = (headerChecksum ?? body.signature.checksum ?? "").toLowerCase();
  return expected.length > 0 && checksum === expected;
}
