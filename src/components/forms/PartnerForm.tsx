"use client";
import { ActionForm } from "@/components/forms/ActionForm";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { track } from "@/lib/analytics";
import { joinPartners, type FormState } from "@/app/actions/public";

export function PartnerForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(joinPartners, null);
  useEffect(() => {
    if (state?.ok) track("generate_lead", { lead_type: "aliado" });
  }, [state?.ok]);
  if (state?.ok) return <p role="status" className="rounded-lg bg-green-50 p-5 text-green-800">✓ {state.message}</p>;
  return (
    <ActionForm action={action} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2"><label className="label" htmlFor="a-agency">Agencia o desarrollador</label><input id="a-agency" name="agency" className="input" required /></div>
      <div><label className="label" htmlFor="a-name">Persona de contacto</label><input id="a-name" name="name" className="input" required autoComplete="name" /></div>
      <div><label className="label" htmlFor="a-email">Correo</label><input id="a-email" name="email" type="email" className="input" required autoComplete="email" /></div>
      <div><label className="label" htmlFor="a-city">Ciudad</label><input id="a-city" name="city" className="input" placeholder="Bogotá, Medellín, Cali…" /></div>
      <div>
        <label className="label" htmlFor="a-stores">Tiendas que entrega al año</label>
        <select id="a-stores" name="stores" className="input"><option>1-10</option><option>11-30</option><option>31-100</option><option>Más de 100</option></select>
      </div>
      <label className="flex items-start gap-3 text-sm text-slate-700 sm:col-span-2">
        <input type="checkbox" name="consent" className="mt-1 h-4 w-4 shrink-0 accent-brand-600" />
        <span>Autorizo el tratamiento de mis datos para gestionar el convenio de aliados, según la <Link href="/legal/datos" target="_blank" className="text-brand-600 underline">política de tratamiento de datos</Link>.</span>
      </label>
      {state?.error && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{state.error}</p>}
      <button className="btn-primary sm:col-span-2" disabled={pending}>{pending ? "Enviando…" : "Quiero ser aliado"}</button>
    </ActionForm>
  );
}
