"use client";
import { ActionForm } from "@/components/forms/ActionForm";
import Link from "next/link";
import { useActionState } from "react";
import { requestReset, resetPassword } from "@/app/actions/auth";
import type { FormState } from "@/app/actions/public";
import { DemoLink } from "../AuthShell";

export function RequestResetForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(requestReset, null);
  if (state?.ok)
    return (
      <div role="status" className="text-sm text-slate-700">
        <p>{state.message}</p>
        <DemoLink href={state.data?.link} />
      </div>
    );
  return (
    <ActionForm action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="rr-email">Correo electrónico de su cuenta</label>
        <input id="rr-email" name="email" type="email" className="input" required autoComplete="email" />
      </div>
      {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <button className="btn-primary w-full" disabled={pending}>{pending ? "Enviando…" : "Enviar enlace"}</button>
    </ActionForm>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(resetPassword, null);
  if (state?.ok)
    return (
      <div role="status" className="text-sm text-slate-700">
        <p className="font-semibold text-green-700">✓ {state.message}</p>
        <Link href="/ingresar" className="btn-primary mt-4 w-full">Iniciar sesión</Link>
      </div>
    );
  return (
    <ActionForm action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label className="label" htmlFor="np">Nueva contraseña</label>
        <input id="np" name="password" type="password" className="input" required minLength={8} autoComplete="new-password" />
      </div>
      <div>
        <label className="label" htmlFor="np2">Confirmar contraseña</label>
        <input id="np2" name="confirm" type="password" className="input" required minLength={8} autoComplete="new-password" />
      </div>
      {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <button className="btn-primary w-full" disabled={pending}>{pending ? "Guardando…" : "Guardar contraseña"}</button>
    </ActionForm>
  );
}
