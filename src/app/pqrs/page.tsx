import type { Metadata } from "next";
import { PqrsForm } from "@/components/forms/PqrsForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "PQRS · Peticiones, quejas, reclamos y sugerencias" };

export default function Page() {
  return (
    <div className="container-page grid max-w-5xl gap-8 py-12 lg:grid-cols-[1fr_1.3fr]">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">PQRS</h1>
        <p className="mt-3 text-slate-600">Radique sus peticiones, quejas, reclamos o sugerencias. Recibirá un número de radicado y le responderemos dentro de los <strong>15 días hábiles</strong> siguientes.</p>
        <div className="card mt-6 space-y-2 p-5 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Otros canales de atención</p>
          <p>Correo: <a className="text-brand-600 underline" href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
          <p>Teléfono: {SITE.phone}</p>
          <p>Horario: {SITE.hours}</p>
          <p>Dirección: {SITE.address}</p>
        </div>
        <p className="mt-4 text-sm text-slate-600">Si no está satisfecho con nuestra respuesta, puede acudir a la <a className="text-brand-600 underline" href={SITE.sicPqrsUrl} target="_blank" rel="noopener noreferrer">Superintendencia de Industria y Comercio</a>.</p>
      </div>
      <div className="card p-6 sm:p-8"><PqrsForm /></div>
    </div>
  );
}
