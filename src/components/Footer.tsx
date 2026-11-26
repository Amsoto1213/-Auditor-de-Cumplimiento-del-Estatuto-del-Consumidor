import Link from "next/link";
import { Logo } from "./Logo";
import { SITE } from "@/lib/site";
import { NewsletterForm } from "./forms/NewsletterForm";
import { CookieSettingsButton } from "./Analytics";

const SOCIAL = [
  { k: "instagram", label: "Instagram", d: "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4ZM17.3 5.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4ZM12 2c-2.7 0-3 0-4.1.1C4.3 2.3 2.3 4.3 2.1 7.9 2 9 2 9.3 2 12s0 3 .1 4.1c.2 3.6 2.2 5.6 5.8 5.8 1.1.1 1.4.1 4.1.1s3 0 4.1-.1c3.6-.2 5.6-2.2 5.8-5.8.1-1.1.1-1.4.1-4.1s0-3-.1-4.1c-.2-3.6-2.2-5.6-5.8-5.8C15 2 14.7 2 12 2Z" },
  { k: "facebook", label: "Facebook", d: "M14 8V6.5c0-.7.2-1.1 1.2-1.1H17V2.2C16.6 2.1 15.5 2 14.3 2 11.7 2 10 3.6 10 6.4V8H7v3.5h3V22h4V11.5h2.9L17.4 8H14Z" },
  { k: "linkedin", label: "LinkedIn", d: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6.1V21h-4v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21h-4V9Z" },
  { k: "tiktok", label: "TikTok", d: "M16.6 2h-3.4v13.4a2.9 2.9 0 1 1-2.1-2.8V9.1a6.3 6.3 0 1 0 5.5 6.3V8.6a8 8 0 0 0 4.4 1.3V6.5a4.5 4.5 0 0 1-4.4-4.5Z" },
] as const;

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
          <div className="mt-6 max-w-md">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Boletín de novedades normativas</h2>
            <p className="mb-3 mt-1 text-xs text-slate-400">Cambios en la ley y nuevas sanciones de la SIC, una vez al mes.</p>
            <NewsletterForm />
          </div>
          <div className="mt-6 flex gap-3" aria-label="Redes sociales">
            {SOCIAL.map((n) => (
              <a key={n.k} href={SITE.social[n.k]} target="_blank" rel="noopener noreferrer" aria-label={n.label} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-brand-600 hover:text-white">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d={n.d} /></svg>
              </a>
            ))}
            <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex h-9 items-center justify-center rounded-full bg-slate-800 px-3 text-xs font-semibold text-slate-300 hover:bg-[#25D366] hover:text-white">WhatsApp</a>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Legal</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-white" href="/legal/terminos">Términos y condiciones</Link></li>
            <li><Link className="hover:text-white" href="/legal/datos">Política de tratamiento de datos personales</Link></li>
            <li><Link className="hover:text-white" href="/legal/aviso-privacidad">Aviso de privacidad</Link></li>
            <li><Link className="hover:text-white" href="/legal/retracto">Derecho de retracto y reversión del pago</Link></li>
            <li><Link className="hover:text-white" href="/legal/cookies">Política de cookies</Link></li>
            <li><Link className="hover:text-white" href="/seguridad">Seguridad y pagos</Link></li>
            <li><Link className="hover:text-white font-semibold text-white" href="/pqrs">PQRS: peticiones, quejas y reclamos</Link></li>
            <li><CookieSettingsButton className="hover:text-white" /></li>
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
