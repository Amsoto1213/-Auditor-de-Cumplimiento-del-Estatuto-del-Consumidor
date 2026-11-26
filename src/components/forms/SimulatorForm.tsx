"use client";
import { ActionForm } from "@/components/forms/ActionForm";
import { useActionState, useState } from "react";
import { simulatePayment } from "@/app/actions/checkout";
import type { FormState } from "@/app/actions/public";

export function SimulatorForm({ reference }: { reference: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(simulatePayment, null);
  const [method, setMethod] = useState<"CARD" | "PSE" | "NEQUI">("CARD");
  return (
    <ActionForm action={action} className="space-y-5">
      <input type="hidden" name="ref" value={reference} />
      <input type="hidden" name="method" value={method} />
      <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Medio de pago">
        {([["CARD", "💳 Tarjeta"], ["PSE", "🏦 PSE"], ["NEQUI", "📱 Nequi"]] as const).map(([m, l]) => (
          <button key={m} type="button" role="tab" aria-selected={method === m} onClick={() => setMethod(m)}
            className={`rounded-lg border px-3 py-3 text-sm font-semibold ${method === m ? "border-[#2C2A29] bg-[#2C2A29] text-white" : "border-slate-300 bg-white text-slate-700"}`}>
            {l}
          </button>
        ))}
      </div>
      {method === "CARD" && (
        <div className="space-y-3">
          <div>
            <label className="label" htmlFor="card">Número de tarjeta</label>
            <input id="card" name="card" className="input font-mono" inputMode="numeric" placeholder="4242 4242 4242 4242" autoComplete="off" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label" htmlFor="exp">Vencimiento</label><input id="exp" className="input" placeholder="12/29" autoComplete="off" /></div>
            <div><label className="label" htmlFor="cvc">CVC</label><input id="cvc" className="input" placeholder="123" autoComplete="off" /></div>
          </div>
          <p className="text-xs text-slate-500">Pruebas: <code>4242 4242 4242 4242</code> = aprobada · <code>4111 1111 1111 1111</code> = rechazada.</p>
        </div>
      )}
      {method === "PSE" && (
        <div>
          <label className="label" htmlFor="bank">Banco</label>
          <select id="bank" name="bank" className="input">
            <option value="1">Banco que aprueba (pruebas)</option>
            <option value="2">Banco que rechaza (pruebas)</option>
          </select>
        </div>
      )}
      {method === "NEQUI" && (
        <div>
          <label className="label" htmlFor="phone">Celular Nequi</label>
          <input id="phone" name="phone" className="input font-mono" inputMode="numeric" placeholder="3991111111" />
          <p className="mt-1 text-xs text-slate-500">Pruebas: <code>3991111111</code> = aprobado · <code>3992222222</code> = rechazado.</p>
        </div>
      )}
      {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <button className="btn w-full bg-[#2C2A29] !py-4 text-white hover:bg-black" disabled={pending}>{pending ? "Procesando…" : "Pagar"}</button>
    </ActionForm>
  );
}
