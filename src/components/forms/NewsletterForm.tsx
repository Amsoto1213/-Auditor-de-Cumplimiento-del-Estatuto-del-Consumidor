"use client";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { ActionForm } from "@/components/forms/ActionForm";
import { subscribeNewsletter, type FormState } from "@/app/actions/public";
import { track } from "@/lib/analytics";

export function NewsletterForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(subscribeNewsletter, null);
  useEffect(() => {
    if (state?.ok) track("newsletter_subscribe");
  }, [state?.ok]);
  if (state?.ok) return <p role="status" className="text-sm text-green-400">✓ {state.message}</p>;
  return (
    <ActionForm action={action} className="space-y-2">
      <div className="flex gap-2">
        <label htmlFor="nl-email" className="sr-only">Correo electrónico</label>
        <input id="nl-email" name="email" type="email" placeholder="su@correo.com" className="min-w-0 flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500" />
        <button className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700" disabled={pending}>{pending ? "…" : "Suscribirme"}</button>
      </div>
      <label className="flex items-start gap-2 text-xs text-slate-400">
        <input type="checkbox" name="consent" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>Autorizo recibir información normativa y comercial según la <Link href="/legal/datos" className="underline">política de datos</Link>.</span>
      </label>
      {state?.error && <p role="alert" className="text-xs text-red-400">{state.error}</p>}
    </ActionForm>
  );
}
