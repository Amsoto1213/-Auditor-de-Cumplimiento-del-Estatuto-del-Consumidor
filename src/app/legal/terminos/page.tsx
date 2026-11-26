import Link from "next/link";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { PLANS, SITE, cop } from "@/lib/site";

export const metadata: Metadata = { title: "Términos y condiciones" };

export default function Page() {
  return (
    <LegalPage title="Términos y condiciones de uso">
      <p>Estos términos regulan el uso del software {SITE.fullName} («la plataforma») y la contratación de sus planes, conforme a la Ley 1480 de 2011, la Ley 527 de 1999 y demás normas aplicables. Al crear una cuenta o comprar un plan, usted declara haberlos leído y aceptado.</p>
      <h2>1. Identificación del proveedor</h2>
      <ul>
        <li>Razón social: {SITE.legalName}</li>
        <li>NIT: {SITE.nit}</li>
        <li>Dirección de notificación: {SITE.address}</li>
        <li>Correo electrónico: {SITE.email}</li>
        <li>Teléfono: {SITE.phone}</li>
      </ul>
      <h2>2. Descripción del servicio</h2>
      <p>La plataforma rastrea el contenido público de tiendas virtuales y lo contrasta con una matriz de reglas derivada de la Ley 1480 de 2011, el Decreto 587 de 2016 y la Ley 1581 de 2012. Entrega un puntaje, un semáforo de riesgo, hallazgos con evidencia y plantillas de corrección. <strong>El informe es una herramienta de apoyo preventivo y no constituye asesoría ni representación jurídica.</strong></p>
      <h2>3. Planes y precios</h2>
      <p>Todos los precios están expresados en pesos colombianos e <strong>incluyen el IVA del 19 %</strong>. No existen costos adicionales.</p>
      <ul>
        {PLANS.map((p) => <li key={p.id}>Plan {p.name}: {p.priceYear ? `${cop(p.priceYear)} por año` : "gratuito"} — {p.audits}.</li>)}
      </ul>
      <h2>4. Pagos</h2>
      <p>Los pagos se procesan a través de la pasarela Wompi (tarjeta, PSE o Nequi). La plataforma no almacena datos de tarjetas. El plan se activa cuando Wompi confirma el pago y tiene una vigencia de 12 meses.</p>
      <h2>5. Uso permitido</h2>
      <p>Usted se compromete a escanear únicamente sitios propios o de clientes que lo hayan autorizado. El rastreador respeta el archivo robots.txt y realiza pausas entre peticiones. Está prohibido usar la plataforma para sobrecargar sitios de terceros.</p>
      <h2>6. Derecho de retracto y reversión del pago</h2>
      <p>Usted puede retractarse dentro de los cinco (5) días hábiles siguientes a la compra y solicitar la reversión del pago en los casos de ley. Consulte la <Link href="/legal/retracto">política de retracto y reversión del pago</Link>.</p>
      <h2>7. Datos personales</h2>
      <p>El tratamiento de datos se rige por nuestra <Link href="/legal/datos">política de tratamiento de datos personales</Link>.</p>
      <h2>8. PQRS</h2>
      <p>Puede presentar peticiones, quejas y reclamos en el <Link href="/pqrs">formulario de PQRS</Link>. Se responden dentro de los quince (15) días hábiles siguientes a su radicación.</p>
      <h2>9. Autoridad de protección al consumidor</h2>
      <p>Superintendencia de Industria y Comercio: <a href={SITE.sicUrl} target="_blank" rel="noopener noreferrer">www.sic.gov.co</a>.</p>
      <h2>10. Ley aplicable</h2>
      <p>Estos términos se rigen por las leyes de la República de Colombia.</p>
    </LegalPage>
  );
}
