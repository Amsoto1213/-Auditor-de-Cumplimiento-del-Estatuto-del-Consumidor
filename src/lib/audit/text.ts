import type { AuditContext, PageData } from "./types";

const MAP: Record<string, string> = {
  á: "a", à: "a", ä: "a", â: "a", é: "e", è: "e", ë: "e", ê: "e",
  í: "i", ì: "i", ï: "i", î: "i", ó: "o", ò: "o", ö: "o", ô: "o",
  ú: "u", ù: "u", ü: "u", û: "u", ñ: "n", " ": " ",
};

/** Normaliza conservando la longitud: minúsculas y sin tildes. */
export function normalize(s: string): string {
  let out = "";
  for (const ch of s) {
    const low = ch.toLowerCase();
    const mapped = MAP[low] ?? low;
    out += mapped.length === ch.length ? mapped : ch;
  }
  return out;
}

export function collapse(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

export function snippet(page: PageData, index: number, length = 0, radius = 90): string {
  const src = page.text.length === page.norm.length ? page.text : page.norm;
  const start = Math.max(0, index - radius);
  const end = Math.min(src.length, index + length + radius);
  return `${start > 0 ? "…" : ""}${collapse(src.slice(start, end))}${end < src.length ? "…" : ""}`;
}

export interface Match {
  page: PageData;
  index: number;
  text: string;
  evidence: string;
}

export function findFirst(ctx: AuditContext, re: RegExp): Match | null {
  const flags = re.flags.includes("g") ? re.flags : re.flags + "g";
  for (const page of ctx.pages) {
    const r = new RegExp(re.source, flags);
    const m = r.exec(page.norm);
    if (m) {
      return { page, index: m.index, text: m[0], evidence: snippet(page, m.index, m[0].length) };
    }
  }
  return null;
}

export function findAll(ctx: AuditContext, re: RegExp, limit = 20): Match[] {
  const flags = re.flags.includes("g") ? re.flags : re.flags + "g";
  const out: Match[] = [];
  for (const page of ctx.pages) {
    const r = new RegExp(re.source, flags);
    let m: RegExpExecArray | null;
    while ((m = r.exec(page.norm)) && out.length < limit) {
      out.push({ page, index: m.index, text: m[0], evidence: snippet(page, m.index, m[0].length) });
      if (m[0].length === 0) r.lastIndex++;
    }
  }
  return out;
}

/** Busca un enlace cuyo texto o URL coincida con la expresión. */
export function findLink(ctx: AuditContext, re: RegExp) {
  for (const page of ctx.pages) {
    for (const l of page.links) {
      const hay = normalize(`${l.text} ${decodeURIComponentSafe(l.href)}`);
      if (re.test(hay)) return { page, link: l };
    }
  }
  return null;
}

/** Ventanas de texto alrededor de cada aparición de un término. */
export function windows(ctx: AuditContext, re: RegExp, radius = 600): { page: PageData; text: string; index: number }[] {
  return findAll(ctx, re, 40).map((m) => ({
    page: m.page,
    index: m.index,
    text: m.page.norm.slice(Math.max(0, m.index - radius), m.index + radius),
  }));
}

export function decodeURIComponentSafe(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}
