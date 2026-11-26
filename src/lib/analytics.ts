// Utilidades de analítica del lado del cliente (GA4 + atribución de campañas UTM).

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const CONSENT_KEY = "al_consent"; // "all" | "necessary"
const UTM_KEY = "al_utm";

function store(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getConsent(): "all" | "necessary" | null {
  if (typeof window === "undefined") return null;
  const v = store()?.getItem(CONSENT_KEY);
  return v === "all" || v === "necessary" ? v : null;
}

export function setConsent(v: "all" | "necessary") {
  store()?.setItem(CONSENT_KEY, v);
  window.dispatchEvent(new CustomEvent("al-consent", { detail: v }));
}

/** Envía un evento a Google Analytics si el visitante aceptó la analítica. */
export function track(name: string, params: Params = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

export interface Utm {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
  landing?: string;
  referrer?: string;
}

/** Guarda la primera fuente de la visita (first touch) para medir los canales de captación. */
export function captureUtm() {
  if (typeof window === "undefined") return;
  const s = store();
  if (!s) return;
  const q = new URLSearchParams(window.location.search);
  const fromUrl: Utm = {
    source: q.get("utm_source") ?? undefined,
    medium: q.get("utm_medium") ?? undefined,
    campaign: q.get("utm_campaign") ?? undefined,
    term: q.get("utm_term") ?? undefined,
    content: q.get("utm_content") ?? undefined,
  };
  const existing = s.getItem(UTM_KEY);
  if (fromUrl.source || !existing) {
    let ref = "";
    try {
      ref = document.referrer ? new URL(document.referrer).hostname : "";
    } catch {}
    if (ref === window.location.hostname) ref = "";
    const utm: Utm = {
      ...fromUrl,
      source: fromUrl.source ?? (ref ? ref.replace(/^www\./, "") : "directo"),
      medium: fromUrl.medium ?? (ref ? (/google|bing|yahoo|duckduckgo/.test(ref) ? "organico" : "referido") : "ninguno"),
      landing: window.location.pathname,
      referrer: ref || undefined,
    };
    s.setItem(UTM_KEY, JSON.stringify(utm));
  }
}

export function getUtm(): Utm | null {
  try {
    const v = store()?.getItem(UTM_KEY);
    return v ? (JSON.parse(v) as Utm) : null;
  } catch {
    return null;
  }
}
