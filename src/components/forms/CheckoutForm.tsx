"use client";
import { ActionForm } from "@/components/forms/ActionForm";
import Link from "next/link";
import { useActionState } from "react";
import { track } from "@/lib/analytics";
import { startCheckout } from "@/app/actions/checkout";
import type { FormState } from "@/app/actions/public";

export function CheckoutForm({ plan, wompi, value }: { plan: string; wompi: boolean; value: number }) {
  const [state, action, pending] = useActionState<FormState, FormData>(startCheckout, null);
  return (
    <ActionForm action={action} className="space-y-4">
      <input type="hidden" name="plan" value={plan} />
      <label className="flex items-start gap-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
        <input type="checkbox" name="terms" className="mt-1 h-4 w-4 shrink-0 accent-brand-600" />
        <span>
          He leído y acepto los <Link href="/legal/terminos" target="_blank" className="text-brand-600 underline">términos y condiciones</Link> y la{" "}
          <Link href="/legal/retracto" target="_blank" className="text-brand-600 underline">política de retracto y reversión del pago</Link>.
        </span>
      </label>
      {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <button className="btn-primary w-full !py-4 text-base" disabled={pending} onClick={() => track("add_payment_info", { currency: "COP", value, items: [{ item_id: plan, item_name: `Plan ${plan}` }] } as never)}>{pending ? "Redirigiendo al pago…" : "Pagar con Wompi"}</button>
      <p className="text-center text-xs text-slate-500">
        Tarjeta de crédito o débito · PSE · Nequi. {wompi ? "Ambiente de pruebas (sandbox) de Wompi." : "Ambiente de pruebas: simulador sandbox."}
      </p>
    </ActionForm>
  );
}
