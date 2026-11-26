import * as cheerio from "cheerio";
import type { AuditContext, FlashItem, Finding, PageData, PageForm, Risk } from "./types";
import { CRITICAL_RULES, RULES, RULES_BY_ID } from "./rules";
import { collapse, normalize } from "./text";

/** Convierte HTML en la estructura que usan las reglas. */
export function parsePage(html: string, url: string): PageData {
  const $ = cheerio.load(html);
  const title = collapse($("title").first().text());

  const links: PageData["links"] = [];
  const footerSel = "footer, [class*=footer], [id*=footer], [role=contentinfo]";
  $("a[href]").each((_, el) => {
    const raw = $(el).attr("href") ?? "";
    if (!raw || raw.startsWith("#") || raw.startsWith("javascript:")) return;
    let href = raw;
    try {
      href = /^(mailto|tel):/i.test(raw) ? raw : new URL(raw, url).toString();
    } catch {
      return;
    }
    const text = collapse($(el).text() || $(el).attr("title") || $(el).attr("aria-label") || "");
    links.push({ href, text, inFooter: $(el).closest(footerSel).length > 0 });
  });

  const forms: PageForm[] = [];
  $("form").each((_, form) => {
    const $f = $(form);
    const fields: PageForm["fields"] = [];
    $f.find("input, textarea, select").each((_, el) => {
      const $el = $(el);
      const type = (($el.attr("type") ?? (el.tagName === "input" ? "text" : el.tagName)) || "text").toLowerCase();
      const id = $el.attr("id");
      let label = "";
      if (id) label = $(`label[for="${id.replace(/"/g, "")}"]`).text();
      if (!label) label = $el.closest("label").text();
      if (!label) label = $el.attr("placeholder") ?? $el.attr("aria-label") ?? "";
      if (!label && type === "checkbox") label = $el.parent().text();
      fields.push({
        type,
        name: ($el.attr("name") ?? id ?? "").toLowerCase(),
        checked: $el.is("[checked]"),
        label: normalize(collapse(label)),
      });
    });
    forms.push({ action: $f.attr("action") ?? "", text: normalize(collapse($f.text())), fields });
  });

  $("script, style, noscript, svg, template, iframe").remove();
  // Inserta saltos para no pegar palabras de bloques distintos.
  $("br, p, div, li, h1, h2, h3, h4, h5, h6, td, th, section, article, footer, header, span, a").each((_, el) => {
    $(el).append(" ");
  });
  const text = collapse($("body").text() || $.root().text());
  const norm = normalize(text);
  const hasPrices = /\$\s?\d{1,3}([.,]\d{3})+|\bcop\s?\$?\s?\d|\d{1,3}([.,]\d{3})+\s?cop/.test(norm);

  return { url, title, text, norm, links, forms, hasPrices };
}

export function makeContext(pages: PageData[]): AuditContext {
  return { pages, allNorm: pages.map((p) => p.norm).join("\n") };
}

export function detectPlatform(html: string): string {
  const h = html.toLowerCase();
  if (h.includes("cdn.shopify.com") || h.includes("shopify.theme") || h.includes("myshopify.com")) return "Shopify";
  if (/wp-content\/plugins\/woocommerce|class="[^"]*woocommerce|wc-block-|woocommerce_params/.test(h)) return "WooCommerce";
  if (/mitiendanube\.com|nuvemshop|tiendanube\.com\/|cdn\.tiendanube/.test(h)) return "Tiendanube";
  if (/vtexassets|vteximg|\.vtex\.com/.test(h)) return "VTEX";
  if (h.includes("wixstatic") || h.includes("wix.com")) return "Wix";
  if (h.includes("wp-content")) return "WordPress";
  if (h.includes("prestashop")) return "PrestaShop";
  if (h.includes("magento")) return "Magento";
  return "Otra / sitio propio";
}

export function runRules(ctx: AuditContext): Finding[] {
  return RULES.map((rule) => {
    try {
      return { ruleId: rule.id, ...rule.check(ctx) };
    } catch {
      return { ruleId: rule.id, status: "no_determinado" as const, evidence: "No fue posible evaluar esta regla." };
    }
  });
}

const WEIGHT: Record<Risk, number> = { alto: 3, medio: 2, bajo: 1 };

/**
 * Puntaje de 0 a 100 y clasificación según la sección 7.3 del plan de marketing:
 * - Alto: falta la política de privacidad/datos, hay leyendas que prohíben devoluciones
 *   o faltan datos del vendedor (o el puntaje es menor a 50).
 * - Medio: fallas como la ausencia del enlace a la SIC o del desglose del envío.
 * - Bajo: textos completos y actualizados.
 */
export function scoreFindings(findings: Finding[]): { score: number; level: Risk } {
  let total = 0;
  let got = 0;
  for (const f of findings) {
    if (f.status === "no_determinado") continue;
    const w = WEIGHT[RULES_BY_ID[f.ruleId]?.risk ?? "bajo"];
    total += w;
    if (f.status === "cumple") got += w;
  }
  const score = total === 0 ? 0 : Math.round((got / total) * 100);
  const criticalFail = findings.some((f) => f.status === "no_cumple" && CRITICAL_RULES.includes(f.ruleId));
  const anyFail = findings.some((f) => f.status === "no_cumple");
  let level: Risk;
  if (criticalFail || score < 50) level = "alto";
  else if (anyFail || score < 85) level = "medio";
  else level = "bajo";
  return { score, level };
}

/** Escáner flash: los cinco elementos básicos (HU-06). */
export function runFlash(ctx: AuditContext): { items: FlashItem[]; score: number; level: Risk } {
  const f = Object.fromEntries(runRules(ctx).map((x) => [x.ruleId, x]));
  const present = (...ids: string[]) => ids.some((id) => f[id]?.status === "cumple");
  const ev = (...ids: string[]) => ids.map((id) => f[id]).find((x) => x?.status === "cumple")?.evidence ?? f[ids[0]]?.evidence ?? "";
  const items: FlashItem[] = [
    { key: "privacidad", label: "Aviso de privacidad / política de datos", present: present("DAT-01", "DAT-02"), evidence: ev("DAT-01", "DAT-02") },
    { key: "vendedor", label: "Datos del vendedor (razón social y NIT)", present: present("INF-01") && present("INF-02"), evidence: present("INF-01") && present("INF-02") ? ev("INF-02") : !present("INF-01") ? f["INF-01"].evidence : f["INF-02"].evidence },
    { key: "pqrs", label: "Botón o canal de reclamos (PQRS)", present: present("INF-08"), evidence: ev("INF-08") },
    { key: "retracto", label: "Referencia al derecho de retracto", present: present("RET-01"), evidence: ev("RET-01") },
    { key: "sic", label: "Enlace a la SIC", present: present("INF-09"), evidence: ev("INF-09") },
  ];
  const ok = items.filter((i) => i.present).length;
  const score = Math.round((ok / items.length) * 100);
  const missing = items.filter((i) => !i.present).map((i) => i.key);
  let level: Risk = "bajo";
  if (missing.includes("privacidad") || missing.includes("vendedor") || missing.length >= 3) level = "alto";
  else if (missing.length > 0) level = "medio";
  return { items, score, level };
}
