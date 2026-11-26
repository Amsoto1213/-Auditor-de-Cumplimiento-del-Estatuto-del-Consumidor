import type { Metadata } from "next";
import { FlashScanner } from "@/components/FlashScanner";
import { SMMLV_2026, cop } from "@/lib/site";

/**
 * Landing de campañas pagadas (SEM): Google Ads y redes sociales.
 * Ejemplo de URL de anuncio: /escaner-gratis?utm_source=google&utm_medium=cpc&utm_campaign=multas-sic
 */
export const metadata: Metadata = {
  title: "Escáner legal gratis para tiendas virtuales",
  description: "¿Su tienda virtual podría recibir una multa de la SIC? Escanéela gratis en 30 segundos y conozca su nivel de riesgo.",
  alternates: { canonical: "/escaner-gratis" },
};

const VARIANTS: Record<string, { h: string; p: string }> = {
  "multas-sic": { h: "Evite multas de la SIC de hasta " + cop(2000 * SMMLV_2026), p: "La mayoría de las sanciones a tiendas virtuales se deben a omisiones fáciles de corregir. Descubra las suyas gratis." },
  "habeas-data": { h: "¿Su tienda cumple la Ley 1581 de datos personales?", p: "Revisamos su política de datos, el aviso de privacidad y las autorizaciones de sus formularios en 30 segundos." },
  "shopify": { h: "Auditoría legal gratis para su tienda Shopify", p: "Verificamos los requisitos del Estatuto del Consumidor colombiano en su tienda Shopify, sin instalar nada." },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ utm_campaign?: string }> }) {
  const { utm_campaign } = await searchParams;
  const v = VARIANTS[utm_campaign ?? ""] ?? { h: "¿Su tienda virtual cumple la ley? Descúbralo gratis", p: "Escáner del Estatuto del Consumidor (Ley 1480), el Decreto 587 y la Ley 1581 en 30 segundos, sin registro." };
  return (
    <section className="bg-gradient-to-b from-brand-900 to-brand-700 py-14 text-white sm:py-20">
      <div className="container-page max-w-3xl text-center">
        <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">{v.h}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">{v.p}</p>
        <div className="mt-8 text-left text-slate-900"><FlashScanner /></div>
        <ul className="mt-8 grid gap-2 text-sm text-blue-100 sm:grid-cols-3">
          <li>✓ Gratis y sin registro</li>
          <li>✓ Resultado en 30 segundos</li>
          <li>✓ Shopify, WooCommerce, Tiendanube</li>
        </ul>
      </div>
    </section>
  );
}
