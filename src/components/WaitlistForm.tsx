"use client";
import { ActionForm } from "@/components/forms/ActionForm";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { track } from "@/lib/analytics";
import { joinWaitlist, type FormState } from "@/app/actions/public";
import { BETA_GOAL } from "@/lib/site";

export function WaitlistForm({ initialCount }: { initialCount: number }) {
  const [state, action, pending] = useActionState<FormState, FormData>(joinWaitlist, null);
  useEffect(() => {
    if (state?.ok) track("join_waitlist");
  }, [state?.ok]);
  const count = Number(state?.data?.count ?? initialCount);
  const pct = Math.min(100, Math.round((count / BETA_GOAL) * 100));
  return (
    <div className="card p-6 sm:p-8">
      <div className="mb-6">
        <div className="flex items-end justify-between text-sm">
          <span className="font-semibold text-slate-900">{count} de {BETA_GOAL} mipymes inscritas</span>
          <span className="text-slate-500">{pct} %</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={count} aria-valuemin={0} aria-valuemax={BETA_GOAL} aria-label="Inscritos en la lista de espera Beta">
          <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
      {state?.ok ? (
        <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-5 text-green-800">
          <p className="font-semibold">Inscripción confirmada</p>
          <p className="mt-1 text-sm">{state.message}</p>
        </div>
      ) : (
        <ActionForm action={action} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="wl-name">Nombre</label>
            <input id="wl-name" name="name" className="input" required autoComplete="name" />
          </div>
          <div>
            <label className="label" htmlFor="wl-email">Correo electrónico</label>
            <input id="wl-email" name="email" type="email" className="input" required autoComplete="email" />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="wl-url">URL de su tienda virtual</label>
            <input id="wl-url" name="storeUrl" className="input" required placeholder="mitienda.com.co" inputMode="url" />
          </div>
          <label className="flex items-start gap-3 text-sm text-slate-700 sm:col-span-2">
            <input type="checkbox" name="consent" className="mt-1 h-4 w-4 shrink-0 accent-brand-600" />
            <span>
              Autorizo de manera previa, expresa e informada el tratamiento de mis datos personales para gestionar mi inscripción en la versión Beta, según la{" "}
              <Link href="/legal/datos" className="text-brand-600 underline" target="_blank">política de tratamiento de datos</Link>.
            </span>
          </label>
          {state?.error && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{state.error}</p>}
          <button className="btn-primary sm:col-span-2" disabled={pending}>{pending ? "Enviando…" : "Quiero probar la Beta"}</button>
        </ActionForm>
      )}
    </div>
  );
}
