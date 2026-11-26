import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE, appUrl, GA_ID, PLANS } from "@/lib/site";
import { Analytics } from "@/components/Analytics";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { JsonLd } from "@/components/JsonLd";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: {
    default: `${SITE.name} · Auditor de cumplimiento del Estatuto del Consumidor`,
    template: `%s · ${SITE.name}`,
  },
  description:
    "Escanee gratis su tienda virtual en 30 segundos y descubra si cumple la Ley 1480 de 2011 (Estatuto del Consumidor), el Decreto 587 de 2016 y la Ley 1581 de 2012 de protección de datos.",
  keywords: ["estatuto del consumidor", "ley 1480", "ley 1581", "habeas data", "derecho de retracto", "SIC", "tienda virtual", "shopify", "woocommerce", "cumplimiento legal"],
  openGraph: {
    title: "¿Su tienda virtual cumple la ley? Descúbralo gratis en 30 segundos",
    description: "Auditoría automática del Estatuto del Consumidor y la Ley 1581 para mipymes colombianas.",
    locale: "es_CO",
    type: "website",
    siteName: SITE.name,
    url: appUrl(),
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION ? { verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } } : {}),
};

export const viewport: Viewport = { themeColor: "#1e3a8a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:p-2">
          Saltar al contenido
        </a>
        <Header />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Footer />
        <WhatsAppButton phone={SITE.whatsapp} />
        <Analytics gaId={GA_ID} />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                name: SITE.legalName,
                alternateName: SITE.name,
                url: appUrl(),
                email: SITE.email,
                telephone: SITE.phone,
                taxID: SITE.nit,
                address: { "@type": "PostalAddress", streetAddress: SITE.address, addressLocality: "Cartagena de Indias", addressCountry: "CO" },
                sameAs: Object.values(SITE.social),
              },
              {
                "@type": "SoftwareApplication",
                name: SITE.fullName,
                applicationCategory: "BusinessApplication",
                operatingSystem: "Web",
                url: appUrl(),
                offers: PLANS.map((p) => ({ "@type": "Offer", name: `Plan ${p.name}`, price: p.priceYear, priceCurrency: "COP" })),
              },
            ],
          }}
        />
      </body>
    </html>
  );
}
