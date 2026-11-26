import Link from "next/link";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Aviso de privacidad" };

export default function Page() {
  return (
    <LegalPage title="Aviso de privacidad">
      <p>
        <strong>{SITE.legalName}</strong>, identificada con NIT {SITE.nit}, con domicilio en {SITE.address}, es responsable del tratamiento de los datos personales que usted suministra en este sitio, conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013.
      </p>
      <h2>Finalidades</h2>
      <ul>
        <li>Crear y administrar su cuenta y prestar el servicio de auditoría.</li>
        <li>Procesar pagos y emitir comprobantes.</li>
        <li>Gestionar la lista de espera Beta, el programa de aliados y las PQRS.</li>
        <li>Enviarle novedades normativas y comerciales, solo si usted lo autoriza.</li>
      </ul>
      <h2>Sus derechos</h2>
      <p>Usted puede conocer, actualizar, rectificar y suprimir sus datos, solicitar prueba de la autorización y revocarla, escribiendo a <a href={`mailto:${SITE.email}`}>{SITE.email}</a> o mediante el <Link href="/pqrs">formulario de PQRS</Link>. También puede presentar quejas ante la Superintendencia de Industria y Comercio.</p>
      <p>Consulte la <Link href="/legal/datos">política de tratamiento de datos personales</Link> completa.</p>
    </LegalPage>
  );
}
