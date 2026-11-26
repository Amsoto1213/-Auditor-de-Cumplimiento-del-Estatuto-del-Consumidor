"use client";
import { ActionForm } from "@/components/forms/ActionForm";
import Link from "next/link";
import { useActionState } from "react";
import { submitPqrs, type FormState } from "@/app/actions/public";

export function PqrsForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(submitPqrs, null);
  if (state?.ok)
    return (
      <div role="status" className="text-center">
        <p className="text-lg font-semibold text-green-700">✓ Solicitud radicada</p>
        <p className="mt-2 text-sm text-slate-600">Número de radicado:</p>
        <p className="mt-1 font-mono text-2xl font-bold text-slate-900">{state.message}</p>
        <p className="mt-3 text-sm text-slate-600">Le responderemos a más tardar el {String(state.data?.due)}. Guarde este número para hacer seguimiento.</p>
      </div>
    );
  return (
    <ActionForm action={action} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="label" htmlFor="p-type">Tipo de solicitud</label>
        <select id="p-type" name="type" className="input" defaultValue="">
          <option value="" disabled>Seleccione…</option>
          <option value="peticion">Petición</option>
          <option value="queja">Queja</option>
          <option value="reclamo">Reclamo</option>
          <option value="sugerencia">Sugerencia</option>
        </select>
      </div>
      <div><label className="label" htmlFor="p-name">Nombre</label><input id="p-name" name="name" className="input" required autoComplete="name" /></div>
      <div><label className="label" htmlFor="p-email">Correo electrónico</label><input id="p-email" name="email" type="email" className="input" required autoComplete="email" /></div>
      <div className="sm:col-span-2"><label className="label" htmlFor="p-msg">Descripción</label><textarea id="p-msg" name="message" rows={5} className="input" required /></div>
      <label className="flex items-start gap-3 text-sm text-slate-700 sm:col-span-2">
        <input type="checkbox" name="consent" className="mt-1 h-4 w-4 shrink-0 accent-brand-600" />
        <span>Autorizo el tratamiento de mis datos personales para gestionar y responder esta solicitud, según la <Link href="/legal/datos" target="_blank" className="text-brand-600 underline">política de tratamiento de datos</Link>.</span>
      </label>
      {state?.error && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{state.error}</p>}
      <button className="btn-primary sm:col-span-2" disabled={pending}>{pending ? "Radicando…" : "Radicar solicitud"}</button>
    </ActionForm>
  );
}
