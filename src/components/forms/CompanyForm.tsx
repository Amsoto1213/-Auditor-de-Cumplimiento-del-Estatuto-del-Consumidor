"use client";
import { ActionForm } from "@/components/forms/ActionForm";
import { useActionState } from "react";
import { saveCompany } from "@/app/actions/panel";
import type { FormState } from "@/app/actions/public";
import type { Company } from "@/lib/auth";

const FIELDS: { k: keyof Company; label: string; ph: string; type?: string; full?: boolean }[] = [
  { k: "legalName", label: "Razón social", ph: "Mi Tienda S.A.S.", full: true },
  { k: "nit", label: "NIT", ph: "901.234.567-8" },
  { k: "city", label: "Ciudad", ph: "Cartagena de Indias" },
  { k: "address", label: "Dirección de notificación", ph: "Calle 30 # 20-15, Local 2", full: true },
  { k: "phone", label: "Teléfono de contacto", ph: "+57 300 000 0000", type: "tel" },
  { k: "email", label: "Correo de atención al cliente", ph: "contacto@mitienda.com", type: "email" },
  { k: "storeUrl", label: "URL de la tienda virtual", ph: "https://mitienda.com.co", full: true },
];

export function CompanyForm({ company }: { company?: Company }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveCompany, null);
  return (
    <ActionForm action={action} className="grid gap-4 sm:grid-cols-2">
      {FIELDS.map((x) => (
        <div key={x.k} className={x.full ? "sm:col-span-2" : ""}>
          <label className="label" htmlFor={`c-${x.k}`}>{x.label}</label>
          <input id={`c-${x.k}`} name={x.k} type={x.type ?? "text"} className="input" placeholder={x.ph} defaultValue={company?.[x.k] ?? ""} required={x.k !== "storeUrl"} />
        </div>
      ))}
      {state?.error && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{state.error}</p>}
      {state?.ok && <p role="status" className="text-sm text-green-700 sm:col-span-2">✓ {state.message}</p>}
      <button className="btn-primary sm:col-span-2" disabled={pending}>{pending ? "Guardando…" : "Guardar datos de la empresa"}</button>
    </ActionForm>
  );
}
