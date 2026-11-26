import Link from "next/link";
import { Logo } from "./Logo";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 text-white">
            <Logo />
            <span className="text-lg font-bold">{SITE.name}</span>
          </div>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
            Software RegTech que audita tiendas virtuales colombianas frente a la Ley 1480 de 2011, el Decreto 587 de 2016 y la Ley 1581 de 2012.
          </p>
          <address className="mt-4 space-y-1 text-sm not-italic leading-6">
            <div><span className="text-slate-400">Razón social:</span> {SITE.legalName}</div>
            <div><span className="text-slate-400">NIT:</span> {SITE.nit}</div>
            <div><span className="text-slate-400">Dirección:</span> {SITE.address}</div>
            <div><span className="text-slate-400">Correo:</span> <a className="hover:text-white" href={`mailto:${SITE.email}`}>{SITE.email}</a></div>
            <div><span className="text-slate-400">Teléfono:</span> <a className="hover:text-white" href={`tel:${SITE.phone.replace(/[^+\d]/g, "")}`}>{SITE.phone}</a></div>
            <div><span className="text-slate-400">Horario:</span> {SITE.hours}</div>
          </address>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Legal</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-white" href="/legal/terminos">Términos y condiciones</Link></li>
            <li><Link className="hover:text-white" href="/legal/datos">Política de tratamiento de datos personales</Link></li>
            <li><Link className="hover:text-white" href="/legal/aviso-privacidad">Aviso de privacidad</Link></li>
            <li><Link className="hover:text-white" href="/legal/retracto">Derecho de retracto y reversión del pago</Link></li>
            <li><Link className="hover:text-white font-semibold text-white" href="/pqrs">PQRS: peticiones, quejas y reclamos</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Producto</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-white" href="/#escaner">Escáner flash gratuito</Link></li>
            <li><Link className="hover:text-white" href="/precios">Planes y precios</Link></li>
            <li><Link className="hover:text-white" href="/normativa">Matriz normativa</Link></li>
            <li><Link className="hover:text-white" href="/blog">Blog y guías</Link></li>
            <li><Link className="hover:text-white" href="/aliados">Programa de aliados</Link></li>
            <li><Link className="hover:text-white" href="/proyecto">Sobre el proyecto</Link></li>
          </ul>
          <a
            href={SITE.sicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-600 px-3 py-2 text-xs font-semibold text-white hover:border-white"
          >
            <span aria-hidden="true">🏛️</span> Superintendencia de Industria y Comercio · www.sic.gov.co
          </a>
        </div>
      </div>
      <div className="border-t border-slate-800">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-slate-500 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} {SITE.legalName}. Precios en pesos colombianos con IVA incluido.</p>
          <p>Los informes son una herramienta de apoyo y no reemplazan la asesoría jurídica profesional.</p>
        </div>
      </div>
    </footer>
  );
}
