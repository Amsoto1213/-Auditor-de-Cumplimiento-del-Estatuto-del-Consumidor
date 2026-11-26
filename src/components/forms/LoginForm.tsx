"use client";
import { ActionForm } from "@/components/forms/ActionForm";
import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import type { FormState } from "@/app/actions/public";
import { DemoLink } from "../AuthShell";

export function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(login, null);
  return (
    <ActionForm action={action} className="space-y-4">
      {notice && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
      <input type="hidden" name="next" value={next ?? "/panel"} />
      <div>
        <label className="label" htmlFor="l-email">Correo electrónico</label>
        <input id="l-email" name="email" type="email" className="input" required autoComplete="email" />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="label" htmlFor="l-pass">Contraseña</label>
          <Link href="/recuperar" className="mb-1 text-xs font-medium text-brand-600 hover:underline">¿Olvidó su contraseña?</Link>
        </div>
        <input id="l-pass" name="password" type="password" className="input" required autoComplete="current-password" />
      </div>
      {state?.error && (
        <div role="alert" className="text-sm text-red-700">
          {state.error}
          <DemoLink href={state.data?.link} />
        </div>
      )}
      <button className="btn-primary w-full" disabled={pending}>{pending ? "Ingresando…" : "Ingresar"}</button>
    </ActionForm>
  );
}
