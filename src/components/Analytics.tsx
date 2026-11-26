"use client";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import { captureUtm, getConsent, setConsent } from "@/lib/analytics";

/**
 * Banner de cookies + carga condicionada de Google Analytics 4.
 * GA solo se carga si el visitante acepta las cookies de analítica (Ley 1581 de 2012).
 */
export function Analytics({ gaId }: { gaId: string }) {
  const [consent, setState] = useState<"all" | "necessary" | null | "loading">("loading");

  useEffect(() => {
    captureUtm();
    queueMicrotask(() => setState(getConsent()));
    const on = (e: Event) => setState((e as CustomEvent).detail);
    const open = () => setState(null);
    window.addEventListener("al-consent", on);
    window.addEventListener("al-open-cookies", open);
    return () => {
      window.removeEventListener("al-consent", on);
      window.removeEventListener("al-open-cookies", open);
    };
  }, []);

  return (
    <>
      {consent === "all" && gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${gaId}', { anonymize_ip: true });`}
          </Script>
        </>
      )}
      {consent === null && (
        <div role="dialog" aria-live="polite" aria-label="Aviso de cookies" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:inset-x-6">
          <p className="text-sm font-semibold text-slate-900">🍪 Usamos cookies</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Usamos cookies necesarias para que el sitio funcione (sesión) y, solo si usted lo autoriza, cookies de analítica de Google Analytics para medir el uso del sitio y mejorar el servicio. Puede cambiar su decisión en cualquier momento. Más información en la{" "}
            <Link href="/legal/cookies" className="text-brand-600 underline">política de cookies</Link>.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button type="button" className="btn-secondary !py-2" onClick={() => setConsent("necessary")}>Solo necesarias</button>
            <button type="button" className="btn-primary !py-2" onClick={() => setConsent("all")}>Aceptar analítica</button>
          </div>
        </div>
      )}
    </>
  );
}

export function CookieSettingsButton({ className = "" }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event("al-open-cookies"))}>
      Configurar cookies
    </button>
  );
}
