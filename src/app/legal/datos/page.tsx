import type { Metadata } from "next";
import { LegalPage, siteCompany } from "@/components/LegalPage";
import { legalContent } from "@/lib/templates";

export const metadata: Metadata = { title: "Política de tratamiento de datos personales" };

export default function Page() {
  const { blocks } = legalContent("datos", siteCompany, "26 de noviembre de 2026");
  return (
    <LegalPage title="Política de tratamiento de datos personales">
      {blocks.map((b, i) =>
        b.h ? <h2 key={i}>{b.h}</h2> : b.p ? <p key={i}>{b.p}</p> : <ul key={i}>{b.li?.map((x) => <li key={x}>{x}</li>)}</ul>,
      )}
      <h2>10. Datos que trata esta plataforma</h2>
      <ul>
        <li>Datos de registro: nombre, correo electrónico y contraseña (almacenada solo como hash criptográfico bcrypt).</li>
        <li>Datos de la empresa: razón social, NIT, dirección, teléfono y correo, para prellenar las plantillas.</li>
        <li>URL de las tiendas escaneadas y resultados de las auditorías.</li>
        <li>Lista de espera Beta y PQRS: nombre, correo y mensaje.</li>
        <li>Para el control de abuso guardamos un identificador anónimo derivado de la dirección IP (no la IP en claro).</li>
      </ul>
    </LegalPage>
  );
}
