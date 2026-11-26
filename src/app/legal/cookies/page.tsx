import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { CookieSettingsButton } from "@/components/Analytics";

export const metadata: Metadata = { title: "Política de cookies" };

export default function Page() {
  return (
    <LegalPage title="Política de cookies">
      <p>Este sitio usa cookies y tecnologías similares. En cumplimiento de la Ley 1581 de 2012, las cookies que no son necesarias solo se activan con su autorización previa, que puede retirar en cualquier momento.</p>
      <h2>Cookies necesarias (siempre activas)</h2>
      <ul>
        <li><strong>al_session</strong>: mantiene su sesión iniciada de forma segura (httpOnly, 7 días).</li>
        <li><strong>al_consent</strong> (almacenamiento local): recuerda su decisión sobre las cookies.</li>
        <li><strong>al_utm</strong> (almacenamiento local): recuerda por qué canal llegó al sitio (búsqueda, anuncio, red social) para medir nuestras campañas de forma agregada.</li>
      </ul>
      <h2>Cookies de analítica (requieren su autorización)</h2>
      <ul>
        <li><strong>Google Analytics 4</strong> (_ga, _ga_*): estadísticas anónimas de uso (páginas vistas, escaneos realizados, registros y compras), con la IP anonimizada. Duración hasta 2 años. Proveedor: Google LLC.</li>
      </ul>
      <h2>Cómo cambiar su decisión</h2>
      <p>Puede cambiar su elección en cualquier momento: <CookieSettingsButton className="font-semibold text-brand-600 underline" />. También puede borrar las cookies desde la configuración de su navegador.</p>
    </LegalPage>
  );
}
