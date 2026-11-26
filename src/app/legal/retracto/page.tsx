import Link from "next/link";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Derecho de retracto, devoluciones y reversión del pago" };

export default function Page() {
  return (
    <LegalPage title="Derecho de retracto, devoluciones y reversión del pago">
      <p>Conforme a la Ley 1480 de 2011 y el Decreto 587 de 2016, {SITE.legalName} informa a sus clientes las condiciones para ejercer el derecho de retracto y solicitar la reversión del pago de las suscripciones adquiridas en este sitio.</p>
      <h2>1. Derecho de retracto (art. 47, Ley 1480 de 2011)</h2>
      <p>Usted puede retractarse de la compra de cualquier plan dentro de los <strong>cinco (5) días hábiles</strong> siguientes a la fecha de pago, sin necesidad de justificar su decisión.</p>
      <p>Le reintegraremos la totalidad del dinero pagado, sin descuentos ni retenciones, en un plazo máximo de <strong>treinta (30) días calendario</strong> contados desde el momento en que ejerció el derecho. Al retractarse, su cuenta regresará al plan Gratis.</p>
      <h2>2. Cómo ejercer el retracto</h2>
      <p>Radique una solicitud de tipo «petición» en nuestro <Link href="/pqrs">formulario de PQRS</Link> o escriba a <a href={`mailto:${SITE.email}`}>{SITE.email}</a> indicando la referencia de pago (formato AL-XXXX).</p>
      <h2>3. Reversión del pago (art. 51, Ley 1480 de 2011 y Decreto 587 de 2016)</h2>
      <p>Si pagó con tarjeta de crédito, débito, PSE u otro instrumento de pago electrónico, puede solicitar la reversión del pago cuando:</p>
      <ul>
        <li>Haya sido objeto de fraude o corresponda a una operación no solicitada.</li>
        <li>El servicio adquirido no haya sido activado.</li>
        <li>El servicio no corresponda a lo solicitado o sea defectuoso.</li>
      </ul>
      <p>La solicitud debe presentarse dentro de los <strong>cinco (5) días hábiles</strong> siguientes a la fecha en que tuvo noticia de la operación fraudulenta o no solicitada, o en que debió recibir el servicio. Debe presentar la queja ante nosotros y notificar al emisor del instrumento de pago, quien realizará la reversión.</p>
      <h2>4. Garantía</h2>
      <p>El servicio cuenta con garantía de calidad e idoneidad. Si la plataforma no funciona como se ofrece, puede solicitar la corrección del servicio o la devolución proporcional del dinero a través de las PQRS.</p>
      <h2>5. Autoridad competente</h2>
      <p>Usted puede acudir a la Superintendencia de Industria y Comercio: <a href={SITE.sicUrl} target="_blank" rel="noopener noreferrer">www.sic.gov.co</a>.</p>
    </LegalPage>
  );
}
