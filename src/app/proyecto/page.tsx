import Link from "next/link";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Sobre el proyecto", description: "Proyecto académico de Comercio Electrónico, Universidad de Cartagena." };

const STORIES: [string, string, string, string][] = [
  ["HU-01", "Repositorio, ramas y CI/CD", "GitHub Actions (lint, pruebas y build) y despliegue continuo en Vercel", "/"],
  ["HU-02", "Arquitectura y modelo de datos", "Next.js (frontend + API), motor de rastreo, almacenamiento privado y pasarela Wompi. Entidades: usuario, empresa, auditoría, hallazgo, regla, plan y pago", "/"],
  ["HU-03", "Matriz de reglas normativas", "21 reglas con ID, norma, artículo, riesgo y forma de verificación", "/normativa"],
  ["HU-04", "Prototipos del flujo", "Flujo navegable: inicio → resultado del escáner → panel → checkout", "/"],
  ["HU-05", "Escáner flash sin registro", "Validación de URL, indicador de progreso y límite de 30 segundos", "/#escaner"],
  ["HU-06", "Cinco elementos básicos", "Privacidad, datos del vendedor, PQRS, retracto y enlace a la SIC; inicio + páginas legales del pie", "/#escaner"],
  ["HU-07", "Semáforo de riesgo", "Color, puntaje y número de hallazgos sin detalle; botón «Ver informe completo»", "/#escaner"],
  ["HU-08", "Lista de espera Beta", "Formulario con autorización no premarcada, confirmación y contador frente a la meta de 100", "/#beta"],
  ["HU-09", "Registro e inicio de sesión", "Verificación de correo, recuperación de contraseña, aceptación de términos y autorización con fecha", "/registro"],
  ["HU-10", "Rastreo de la tienda", "Hasta 20 páginas, respeta robots.txt, pausas entre peticiones, rutas de Shopify y WooCommerce", "/panel/nueva"],
  ["HU-11", "Página de precios", "Comparativa, precio anual en COP con IVA y botón «Elegir plan»", "/precios"],
  ["HU-12", "Cumplimiento legal propio", "Razón social, NIT, dirección, PQRS con radicado, términos, política de datos y enlace a la SIC", "/legal/terminos"],
  ["HU-13", "Deber de información (Ley 1480)", "Estados cumple / no cumple / no determinado con evidencia", "/normativa"],
  ["HU-14", "Retracto, reversión y leyendas abusivas", "5 días hábiles, reversión del pago y 12 patrones de leyendas abusivas", "/normativa"],
  ["HU-15", "Ley 1581 de datos personales", "Política, aviso, autorización en formularios y casillas premarcadas", "/normativa"],
  ["HU-16", "Panel de resultados", "Puntaje 0-100, semáforo, hallazgos por norma con Legal Design y filtro por riesgo", "/panel"],
  ["HU-17", "Tres plantillas en Word", "Formulario de la empresa y descarga .docx prellenada", "/panel/plantillas"],
  ["HU-18", "Checkout y pago con Wompi (sandbox)", "Resumen con subtotal, IVA 19 % y total; checkout oficial de Wompi (sandbox) con tarjeta, PSE, Nequi y más; webhook firmado y activación automática del plan", "/checkout?plan=basico"],
];

const REQS: [string, string, string?][] = [
  ["Requisitos mínimos legales de un CE en Colombia", "Identificación del vendedor (razón social, NIT, dirección, teléfono, correo), términos y condiciones, precios con IVA, derecho de retracto y reversión del pago (Ley 1480, Decreto 587), PQRS con radicado y enlace a la SIC. Comercio electrónico y mensajes de datos (Ley 527 de 1999).", "/legal/terminos"],
  ["Política de protección de datos", "Política de tratamiento de datos, aviso de privacidad, autorizaciones sin casillas premarcadas con fecha y hora, y política de cookies (Ley 1581 de 2012, Decreto 1377 de 2013).", "/legal/datos"],
  ["Seguridad en métodos de pago", "Wompi (tarjeta, PSE, Nequi) con firma de integridad SHA-256, webhook con checksum verificado, validación del valor pagado, HTTPS/HSTS, contraseñas bcrypt y sesiones httpOnly.", "/seguridad"],
  ["Formas de captación de clientes (multicanalidad)", "Escáner gratuito (freemium), lista de espera Beta, blog, boletín por correo, WhatsApp, redes sociales, programa de aliados (agencias) y landing de anuncios; cada registro guarda su canal de origen (UTM).", "/aliados"],
  ["Estrategias SEO / SEM", "SEO: metadatos y Open Graph, sitemap.xml, robots.txt, datos estructurados schema.org (Organization, SoftwareApplication, FAQPage, Article), URLs canónicas y blog. SEM: landing /escaner-gratis con mensajes por campaña y medición UTM para Google Ads y redes.", "/escaner-gratis?utm_source=google&utm_medium=cpc&utm_campaign=multas-sic"],
  ["Análisis de impacto (Google Analytics)", "Google Analytics 4 con consentimiento previo y eventos: scan_start, scan_complete, cta_full_report, sign_up, join_waitlist, begin_checkout, add_payment_info, purchase, file_download, newsletter_subscribe, contact. Panel interno de embudo y canales en /admin."],
  ["Alcance del Product Backlog y cambios documentados", "HU-01 a HU-18 completas. Cambios de tecnología y adelantos del backlog documentados en docs/CAMBIOS.md del repositorio."],
];

export default function Page() {
  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold text-slate-900">Sobre el proyecto</h1>
      <p className="mt-3 max-w-3xl text-slate-600">
        {SITE.fullName}: MVP académico desarrollado con Scrum para la asignatura de Comercio Electrónico. {SITE.university}. Docente: Heybertt Moreno Díaz.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {SITE.team.map((t) => (
          <div key={t.name} className="card p-4"><p className="font-semibold text-slate-900">{t.name}</p><p className="text-sm text-slate-500">{t.role}</p></div>
        ))}
      </div>
      <h2 className="mt-12 text-xl font-semibold text-slate-900">Historias comprometidas para la entrega del 1 de diciembre (67 puntos)</h2>
      <div className="card mt-4 relative overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead><tr className="border-b border-slate-200 bg-slate-50 text-left"><th className="p-3">ID</th><th className="p-3">Historia</th><th className="p-3">Cómo se cumple</th><th className="p-3">Estado</th></tr></thead>
          <tbody className="divide-y divide-slate-100 align-top">
            {STORIES.map(([id, t, d, href]) => (
              <tr key={id}>
                <td className="p-3 font-mono text-xs font-semibold">{id}</td>
                <td className="p-3 font-medium text-slate-900"><Link href={href} className="hover:text-brand-600">{t}</Link></td>
                <td className="p-3 text-slate-600">{d}</td>
                <td className="p-3"><span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Hecho</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="mt-12 text-xl font-semibold text-slate-900">Requisitos de la entrega final</h2>
      <div className="card relative mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead><tr className="border-b border-slate-200 bg-slate-50 text-left"><th className="p-3">Requisito</th><th className="p-3">Implementación</th></tr></thead>
          <tbody className="divide-y divide-slate-100 align-top">
            {REQS.map(([r, d, href]) => (
              <tr key={r}><td className="p-3 font-medium text-slate-900">{r}</td><td className="p-3 text-slate-600">{d} {href && <Link href={href} className="text-brand-600 underline">Ver</Link>}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="mt-12 text-xl font-semibold text-slate-900">Adelantos del backlog posterior incluidos</h2>
      <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-slate-700">
        <li>Blog con 3 guías optimizadas para buscadores (base de HU-23).</li>
        <li>Pre-registro del programa de aliados con comisión del 20 % (base de HU-40).</li>
        <li>Panel de métricas del embudo visitas → escaneos → registros → pagos para administradores (base de HU-24 y HU-39).</li>
        <li>Historial de auditorías e impresión del informe a PDF desde el navegador (base de HU-21 y HU-35).</li>
        <li>Diccionario de 12 leyendas abusivas (base de HU-29) y límite de escaneos por IP (base de HU-28).</li>
      </ul>
    </div>
  );
}
