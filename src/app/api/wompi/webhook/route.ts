import { NextResponse } from "next/server";
import { applyPaymentStatus, getPayment, verifyWompiEvent, type PaymentStatus } from "@/lib/payments";

/** Webhook de eventos de Wompi: confirma el pago y activa el plan (HU-18). */
export async function POST(req: Request) {
  let body: {
    event?: string;
    data?: { transaction?: { id: string; status: PaymentStatus; reference: string; amount_in_cents: number; payment_method_type?: string } };
    signature?: { properties?: string[]; checksum?: string };
    timestamp?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const valid = await verifyWompiEvent(body as never, req.headers.get("x-event-checksum"));
  if (!valid) return NextResponse.json({ ok: false, error: "Firma inválida" }, { status: 401 });
  const tx = body.data?.transaction;
  if (body.event === "transaction.updated" && tx) {
    const p = await getPayment(tx.reference);
    if (p && p.amountInCents === tx.amount_in_cents) {
      await applyPaymentStatus(tx.reference, tx.status, { transactionId: tx.id, method: tx.payment_method_type });
    }
  }
  return NextResponse.json({ ok: true });
}
