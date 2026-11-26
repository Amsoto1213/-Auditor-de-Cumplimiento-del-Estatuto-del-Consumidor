import "server-only";
import { lookup } from "dns/promises";
import { isIP } from "net";
import type { AuditResult, FlashResult, PageData } from "./types";
import { detectPlatform, makeContext, parsePage, runFlash, runRules, scoreFindings } from "./engine";
import { normalize } from "./text";

const UA = "AuditorLegalBot/1.0 (+auditoria de cumplimiento Ley 1480; proyecto academico)";
const MAX_BYTES = 2_500_000;

export class CrawlError extends Error {}

/** Valida y normaliza la URL que escribe el usuario (HU-05). */
export function normalizeInputUrl(input: string): URL {
  let s = (input ?? "").trim();
  if (!s) throw new CrawlError("Escriba la dirección de su tienda virtual.");
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    throw new CrawlError("La dirección no tiene un formato válido. Ejemplo: mitienda.com");
  }
  if (!["http:", "https:"].includes(u.protocol)) throw new CrawlError("Solo se permiten direcciones http o https.");
  if (u.username || u.password) throw new CrawlError("La dirección no puede incluir usuario o contraseña.");
  if (u.port && !["80", "443"].includes(u.port) && process.env.ALLOW_PRIVATE_HOSTS !== "1") throw new CrawlError("Solo se permiten los puertos estándar 80 y 443.");
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(u.hostname) && !isIP(u.hostname))
    throw new CrawlError("El dominio no es válido. Ejemplo: mitienda.com.co");
  u.hash = "";
  return u;
}

function isPrivateIp(ip: string): boolean {
  if (ip.includes(":")) {
    const v = ip.toLowerCase();
    if (v === "::1" || v === "::") return true;
    if (v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80")) return true;
    if (v.startsWith("::ffff:")) return isPrivateIp(v.slice(7));
    return false;
  }
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224
  );
}

/** Protección SSRF: impide que el rastreador acceda a redes internas. */
async function assertPublicHost(host: string) {
  if (process.env.ALLOW_PRIVATE_HOSTS === "1") return;
  if (/^(localhost|.*\.local|.*\.internal)$/i.test(host)) throw new CrawlError("No se permiten direcciones internas.");
  let addrs: { address: string }[];
  try {
    addrs = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
  } catch {
    throw new CrawlError(`No se encontró el dominio «${host}». Verifique que la dirección esté bien escrita y que el sitio esté en línea.`);
  }
  if (addrs.length === 0 || addrs.some((a) => isPrivateIp(a.address))) throw new CrawlError("No se permiten direcciones internas o privadas.");
}

async function safeFetch(url: string, timeoutMs: number): Promise<{ url: string; status: number; html: string; contentType: string }> {
  let current = url;
  for (let i = 0; i < 5; i++) {
    const u = new URL(current);
    if (!["http:", "https:"].includes(u.protocol)) throw new CrawlError("Redirección no permitida.");
    await assertPublicHost(u.hostname);
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    let res: Response;
    try {
      res = await fetch(current, {
        redirect: "manual",
        signal: ctrl.signal,
        headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml", "accept-language": "es-CO,es;q=0.9" },
      });
    } catch (e) {
      clearTimeout(t);
      if (e instanceof Error && e.name === "AbortError") throw new CrawlError("El sitio tardó demasiado en responder.");
      throw new CrawlError("No fue posible conectarse con el sitio. Verifique que esté en línea.");
    }
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      clearTimeout(t);
      current = new URL(res.headers.get("location")!, current).toString();
      continue;
    }
    const contentType = res.headers.get("content-type") ?? "";
    let html = "";
    if (res.body) {
      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > MAX_BYTES) {
            await reader.cancel();
            break;
          }
          chunks.push(value);
        }
      } catch {
        // contenido parcial
      }
      html = new TextDecoder("utf-8").decode(Buffer.concat(chunks));
    }
    clearTimeout(t);
    return { url: current, status: res.status, html, contentType };
  }
  throw new CrawlError("Demasiadas redirecciones.");
}

// ─────────── robots.txt (HU-10) ───────────
async function loadRobots(origin: string): Promise<string[]> {
  try {
    const r = await safeFetch(`${origin}/robots.txt`, 4000);
    if (r.status !== 200) return [];
    const disallow: string[] = [];
    let applies = false;
    for (const raw of r.html.split(/\r?\n/)) {
      const line = raw.replace(/#.*/, "").trim();
      const [k, ...rest] = line.split(":");
      const v = rest.join(":").trim();
      if (!k) continue;
      const key = k.toLowerCase();
      if (key === "user-agent") applies = v === "*" || /auditorlegal/i.test(v);
      else if (key === "disallow" && applies && v) disallow.push(v);
    }
    return disallow;
  } catch {
    return [];
  }
}

function allowedByRobots(disallow: string[], url: string) {
  const p = new URL(url).pathname;
  return !disallow.some((d) => {
    const rule = d.replace(/\*/g, "");
    return rule !== "" && p.startsWith(rule.replace(/\$$/, ""));
  });
}

// ─────────── Selección de páginas relevantes ───────────
const KEYWORDS: [RegExp, number][] = [
  [/privacidad|privacy|tratamiento|proteccion-de-datos|proteccion de datos|habeas|datos personales/, 10],
  [/terminos|condiciones|terms|legal/, 9],
  [/devolucion|retracto|reembolso|refund|cambios|garantia|reversion/, 9],
  [/pqr|quejas|reclamos|contacto|contact|atencion/, 8],
  [/envio|envios|shipping|despacho|entrega/, 7],
  [/carrito|cart|checkout|finalizar-compra|pagar/, 6],
  [/registro|register|account|mi-cuenta|crear-cuenta|login/, 5],
  [/nosotros|quienes-somos|about|empresa|faq|preguntas/, 4],
  [/producto|products|product|tienda|shop|catalogo|collections/, 3],
];

const PLATFORM_PATHS: Record<string, string[]> = {
  Shopify: ["/policies/privacy-policy", "/policies/refund-policy", "/policies/terms-of-service", "/policies/shipping-policy", "/pages/contact", "/account/register", "/cart"],
  WooCommerce: ["/politica-de-privacidad/", "/terminos-y-condiciones/", "/contacto/", "/carrito/", "/mi-cuenta/", "/finalizar-compra/"],
  Tiendanube: ["/contacto/", "/politicas-de-privacidad/", "/account/register/"],
};

function sameSite(a: URL, b: URL) {
  const strip = (h: string) => h.replace(/^www\./, "");
  return strip(a.hostname) === strip(b.hostname);
}

function scoreLink(href: string, text: string, inFooter: boolean): number {
  const hay = normalize(`${text} ${href}`);
  let s = 0;
  for (const [re, w] of KEYWORDS) if (re.test(hay)) s = Math.max(s, w);
  if (inFooter && s > 0) s += 2;
  return s;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface CrawlOptions {
  maxPages: number;
  budgetMs: number;
  delayMs: number;
  probePlatformPaths: boolean;
  minScore: number;
}

async function crawl(input: string, opts: CrawlOptions) {
  const start = Date.now();
  const startUrl = normalizeInputUrl(input);
  const first = await safeFetch(startUrl.toString(), 12000);
  if (first.status >= 400) throw new CrawlError(`El sitio respondió con un error (${first.status}). Verifique la dirección.`);
  if (first.contentType && !/html|xml|text/i.test(first.contentType)) throw new CrawlError("La dirección no corresponde a una página web.");
  const base = new URL(first.url);
  const platform = detectPlatform(first.html);
  const home = parsePage(first.html, first.url);
  if (home.text.length < 40 && home.links.length < 3)
    throw new CrawlError("El sitio no devolvió contenido legible. Puede estar protegido contra rastreo automático o construido solo con JavaScript.");

  const disallow = await loadRobots(base.origin);
  const pages: PageData[] = [home];
  const seen = new Set<string>([first.url.replace(/\/$/, ""), startUrl.toString().replace(/\/$/, "")]);
  const robotsBlocked: string[] = [];
  const errors: string[] = [];

  const queue: { url: string; score: number }[] = [];
  const enqueue = (page: PageData) => {
    for (const l of page.links) {
      if (/^(mailto|tel):/i.test(l.href)) continue;
      let u: URL;
      try {
        u = new URL(l.href);
      } catch {
        continue;
      }
      if (!sameSite(u, base) || !/^https?:$/.test(u.protocol)) continue;
      if (/\.(jpg|jpeg|png|gif|webp|svg|pdf|zip|mp4|css|js|xml|ico)$/i.test(u.pathname)) continue;
      u.hash = "";
      u.search = "";
      const key = u.toString().replace(/\/$/, "");
      if (seen.has(key)) continue;
      const score = scoreLink(u.pathname, l.text, l.inFooter);
      if (score < opts.minScore) continue;
      const existing = queue.find((q) => q.url.replace(/\/$/, "") === key);
      if (existing) existing.score = Math.max(existing.score, score);
      else queue.push({ url: u.toString(), score });
    }
    queue.sort((a, b) => b.score - a.score);
  };
  enqueue(home);
  if (opts.probePlatformPaths) {
    for (const p of PLATFORM_PATHS[platform] ?? []) {
      const u = new URL(p, base).toString();
      if (!queue.some((q) => q.url === u)) queue.push({ url: u, score: 5 });
    }
    queue.sort((a, b) => b.score - a.score);
  }

  while (queue.length && pages.length < opts.maxPages && Date.now() - start < opts.budgetMs) {
    const batch = queue.splice(0, 3);
    await Promise.all(
      batch.map(async (item) => {
        const key = item.url.replace(/\/$/, "");
        if (seen.has(key)) return;
        seen.add(key);
        if (!allowedByRobots(disallow, item.url)) {
          robotsBlocked.push(item.url);
          return;
        }
        try {
          const r = await safeFetch(item.url, 8000);
          if (r.status >= 400 || !/html/i.test(r.contentType || "html")) return;
          const finalKey = r.url.replace(/\/$/, "");
          if (finalKey !== key && pages.some((p) => p.url.replace(/\/$/, "") === finalKey)) return;
          seen.add(finalKey);
          const page = parsePage(r.html, r.url);
          if (pages.length < opts.maxPages) {
            pages.push(page);
            enqueue(page);
          }
        } catch (e) {
          errors.push(`${item.url}: ${e instanceof Error ? e.message : "error"}`);
        }
      }),
    );
    if (opts.delayMs) await sleep(opts.delayMs);
  }

  return { pages, platform, url: base.toString(), robotsBlocked, errors, start };
}

/** Escáner flash gratuito (HU-05, HU-06): inicio + páginas legales del pie de página. */
export async function flashScan(input: string): Promise<FlashResult> {
  const c = await crawl(input, { maxPages: 8, budgetMs: 22000, delayMs: 150, probePlatformPaths: false, minScore: 7 });
  const ctx = makeContext(c.pages);
  const { items, score, level } = runFlash(ctx);
  const findingsCount = runRules(ctx).filter((f) => f.status === "no_cumple").length;
  return {
    url: c.url,
    platform: c.platform,
    items,
    score,
    level,
    findingsCount,
    pagesScanned: c.pages.length,
    durationMs: Date.now() - c.start,
  };
}

/** Auditoría completa (HU-10, HU-13 a HU-15): hasta 20 páginas. */
export async function fullAudit(input: string): Promise<AuditResult> {
  const c = await crawl(input, { maxPages: 20, budgetMs: 50000, delayMs: 400, probePlatformPaths: true, minScore: 3 });
  const ctx = makeContext(c.pages);
  const findings = runRules(ctx);
  const { score, level } = scoreFindings(findings);
  return {
    url: c.url,
    platform: c.platform,
    pagesScanned: c.pages.map((p) => ({ url: p.url, title: p.title })),
    findings,
    score,
    level,
    durationMs: Date.now() - c.start,
    robotsBlocked: c.robotsBlocked,
    errors: c.errors.slice(0, 10),
  };
}
