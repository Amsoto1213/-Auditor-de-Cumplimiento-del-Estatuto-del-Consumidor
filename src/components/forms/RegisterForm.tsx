"use client";
import { ActionForm } from "@/components/forms/ActionForm";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { track } from "@/lib/analytics";
import { register } from "@/app/actions/auth";
import type { FormState } from "@/app/actions/public";
import { DemoLink } from "../AuthShell";

export function RegisterForm({ storeUrl }: { storeUrl?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(register, null);
  useEffect(() => {
    if (state?.ok) track("sign_up", { method: "email" });
  }, [state?.ok]);
  if (state?.ok)
    return (
      <div role="status" className="text-sm text-slate-700">
        <p className="text-lg font-semibold text-green-700">✓ Cuenta creada</p>
        <p className="mt-2">{state.message}</p>
        <DemoLink href={state.data?.link} />
        <Link href="/ingresar" className="btn-secondary mt-5 w-full">Ir a iniciar sesión</Link>
      </div>
    );
  return (
    <ActionForm action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="r-name">Nombre completo</label>
        <input id="r-name" name="name" className="input" required autoComplete="name" />
      </div>
      <div>
        <label className="label" htmlFor="r-email">Correo electrónico</label>
        <input id="r-email" name="email" type="email" className="input" required autoComplete="email" />
      </div>
      <div>
        <label className="label" htmlFor="r-pass">Contraseña</label>
        <input id="r-pass" name="password" type="password" className="input" required minLength={8} autoComplete="new-password" aria-describedby="r-pass-help" />
        <p id="r-pass-help" className="mt-1 text-xs text-slate-500">Mínimo 8 caracteres, con letras y números.</p>
      </div>
      <div>
        <label className="label" htmlFor="r-url">URL de su tienda virtual <span className="font-normal text-slate-400">(opcional)</span></label>
        <input id="r-url" name="storeUrl" className="input" defaultValue={storeUrl} placeholder="mitienda.com.co" />
      </div>
      <fieldset className="space-y-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
        <legend className="sr-only">Autorizaciones</legend>
        <label className="flex items-start gap-3">
          <input type="checkbox" name="terms" className="mt-1 h-4 w-4 shrink-0 accent-brand-600" />
          <span>Acepto los <Link href="/legal/terminos" target="_blank" className="text-brand-600 underline">términos y condiciones</Link>. <span className="text-red-600">*</span></span>
        </label>
        <label className="flex items-start gap-3">
          <input type="checkbox" name="data" className="mt-1 h-4 w-4 shrink-0 accent-brand-600" />
          <span>Autorizo el tratamiento de mis datos personales conforme a la <Link href="/legal/datos" target="_blank" className="text-brand-600 underline">política de tratamiento de datos</Link> (Ley 1581 de 2012). <span className="text-red-600">*</span></span>
        </label>
        <label className="flex items-start gap-3">
          <input type="checkbox" name="marketing" className="mt-1 h-4 w-4 shrink-0 accent-brand-600" />
          <span>Quiero recibir novedades normativas y comerciales por correo (opcional).</span>
        </label>
      </fieldset>
      {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <button className="btn-primary w-full" disabled={pending}>{pending ? "Creando cuenta…" : "Crear cuenta gratis"}</button>
    </ActionForm>
  );
}
