import { describe, expect, it } from "vitest";
import { makeContext, parsePage, runFlash, runRules, scoreFindings, detectPlatform } from "@/lib/audit/engine";
import { RULES, ABUSIVE_PHRASES } from "@/lib/audit/rules";
import { normalize } from "@/lib/audit/text";
import { BAD_HOME, COMPLIANT_HOME, COMPLIANT_POLICIES } from "./fixtures";

const good = makeContext([parsePage(COMPLIANT_HOME, "https://tiendaejemplo.co/"), parsePage(COMPLIANT_POLICIES, "https://tiendaejemplo.co/politicas")]);
const bad = makeContext([parsePage(BAD_HOME, "https://malatienda.co/")]);
const byId = (ctx: ReturnType<typeof makeContext>) => Object.fromEntries(runRules(ctx).map((f) => [f.ruleId, f]));

describe("matriz normativa (HU-03)", () => {
  it("tiene al menos 15 reglas con ID, norma y verificación", () => {
    expect(RULES.length).toBeGreaterThanOrEqual(15);
    for (const r of RULES) {
      expect(r.id).toMatch(/^[A-Z]{3}-\d{2}$/);
      expect(r.law.length).toBeGreaterThan(5);
      expect(r.verification.length).toBeGreaterThan(5);
    }
    expect(new Set(RULES.map((r) => r.id)).size).toBe(RULES.length);
  });
  it("cubre deber de información, retracto, reversión, leyendas abusivas y habeas data", () => {
    const ids = RULES.map((r) => r.id);
    for (const id of ["INF-01", "RET-01", "REV-01", "ABU-01", "DAT-01"]) expect(ids).toContain(id);
  });
});

describe("normalización de texto", () => {
  it("quita tildes conservando la longitud", () => {
    const s = "Política de Retracto Ñandú";
    expect(normalize(s)).toBe("politica de retracto nandu");
    expect(normalize(s).length).toBe(s.length);
  });
});

describe("deber de información (HU-13)", () => {
  it("una tienda completa cumple todas las reglas de información", () => {
    const f = byId(good);
    for (const id of ["INF-01", "INF-02", "INF-03", "INF-04", "INF-05", "INF-06", "INF-07", "INF-08", "INF-09", "INF-10"]) {
      expect(f[id].status, id).toBe("cumple");
      expect(f[id].evidence.length).toBeGreaterThan(0);
    }
  });
  it("detecta la ausencia de datos del vendedor", () => {
    const f = byId(bad);
    expect(f["INF-01"].status).toBe("no_cumple");
    expect(f["INF-02"].status).toBe("no_cumple");
    expect(f["INF-04"].status).toBe("no_cumple");
    expect(f["INF-09"].status).toBe("no_cumple");
  });
  it("marca precio sin IVA como incumplimiento cuando hay precios", () => {
    expect(byId(bad)["INF-05"].status).toBe("no_cumple");
  });
  it("marca INF-05 como no determinado si no hay precios", () => {
    const ctx = makeContext([parsePage("<html><body><p>Bienvenido a nuestra tienda de artesanías hechas a mano en Colombia</p></body></html>", "https://x.co/")]);
    expect(byId(ctx)["INF-05"].status).toBe("no_determinado");
  });
});

describe("retracto, reversión y leyendas abusivas (HU-14)", () => {
  it("detecta el plazo de 5 días hábiles y la reversión", () => {
    const f = byId(good);
    for (const id of ["RET-01", "RET-02", "RET-03", "REV-01", "REV-02"]) expect(f[id].status, id).toBe("cumple");
  });
  it("tiene al menos 10 patrones de leyendas abusivas", () => {
    expect(ABUSIVE_PHRASES.length).toBeGreaterThanOrEqual(10);
  });
  it.each([
    "No se devuelve dinero",
    "No hay cambios ni devoluciones",
    "Todas las ventas son finales",
    "No aceptamos devoluciones",
    "No hacemos reembolsos",
    "Una vez realizada la compra no se puede cancelar",
    "Producto sin derecho a devolución",
    "No se aceptan reclamos",
    "No hay devolución de dinero",
    "El dinero no es reembolsable",
  ])("detecta «%s»", (phrase) => {
    const ctx = makeContext([parsePage(`<html><body><p>${phrase}.</p></body></html>`, "https://x.co/")]);
    const f = byId(ctx)["ABU-01"];
    expect(f.status).toBe("no_cumple");
  });
  it("no reporta leyendas en una tienda conforme", () => {
    expect(byId(good)["ABU-01"].status).toBe("cumple");
  });
  it("la ausencia de retracto es riesgo alto", () => {
    expect(byId(bad)["RET-01"].status).toBe("no_cumple");
    expect(RULES.find((r) => r.id === "RET-01")!.risk).toBe("alto");
  });
});

describe("Ley 1581 (HU-15)", () => {
  it("acepta formularios con autorización sin premarcar", () => {
    const f = byId(good);
    expect(f["DAT-01"].status).toBe("cumple");
    expect(f["DAT-02"].status).toBe("cumple");
    expect(f["DAT-03"].status).toBe("cumple");
    expect(f["DAT-04"].status).toBe("cumple");
    expect(f["DAT-05"].status).toBe("cumple");
  });
  it("detecta casillas premarcadas y formularios sin autorización", () => {
    const f = byId(bad);
    expect(f["DAT-01"].status).toBe("no_cumple");
    expect(f["DAT-03"].status).toBe("no_cumple");
    expect(f["DAT-04"].status).toBe("no_cumple");
  });
  it("es no determinado si no hay formularios", () => {
    const ctx = makeContext([parsePage("<html><body><p>Hola mundo, esta es una página sin formularios de ningún tipo.</p></body></html>", "https://x.co/")]);
    expect(byId(ctx)["DAT-03"].status).toBe("no_determinado");
  });
});

describe("puntaje y semáforo (HU-07, HU-16)", () => {
  it("tienda conforme: riesgo bajo y puntaje 100", () => {
    const r = scoreFindings(runRules(good));
    expect(r.score).toBe(100);
    expect(r.level).toBe("bajo");
  });
  it("tienda con leyendas abusivas: riesgo alto", () => {
    const r = scoreFindings(runRules(bad));
    expect(r.level).toBe("alto");
    expect(r.score).toBeLessThan(50);
  });
  it("solo falta el enlace a la SIC: riesgo medio", () => {
    const html = COMPLIANT_HOME.replace(/<a href="https:\/\/www.sic.gov.co">Superintendencia de Industria y Comercio<\/a>/, "");
    const ctx = makeContext([parsePage(html, "https://t.co/"), parsePage(COMPLIANT_POLICIES, "https://t.co/p")]);
    const r = scoreFindings(runRules(ctx));
    expect(r.level).toBe("medio");
    expect(r.score).toBeGreaterThan(85);
  });
  it("puntaje entre 0 y 100", () => {
    for (const ctx of [good, bad]) {
      const { score } = scoreFindings(runRules(ctx));
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});

describe("escáner flash (HU-06)", () => {
  it("reporta los cinco elementos como presentes en una tienda conforme", () => {
    const f = runFlash(good);
    expect(f.items).toHaveLength(5);
    expect(f.items.every((i) => i.present)).toBe(true);
    expect(f.level).toBe("bajo");
  });
  it("reporta ausencias y riesgo alto en una tienda incumplida", () => {
    const f = runFlash(bad);
    expect(f.items.filter((i) => !i.present)).toHaveLength(5);
    expect(f.level).toBe("alto");
    expect(f.score).toBe(0);
  });
});

describe("detección de plataforma", () => {
  it("identifica Shopify y WooCommerce", () => {
    expect(detectPlatform('<script src="https://cdn.shopify.com/x.js"></script>')).toBe("Shopify");
    expect(detectPlatform('<body class="woocommerce-page">')).toBe("WooCommerce");
  });
});

describe("casos especiales", () => {
  it("ignora frases abusivas citadas entre comillas (textos educativos)", () => {
    const ctx = makeContext([parsePage("<html><body><p>Leyendas como «no se devuelve dinero» no tienen validez.</p></body></html>", "https://x.co/")]);
    expect(byId(ctx)["ABU-01"].status).toBe("cumple");
  });
  it("un formulario de URL de tienda no se considera de datos personales", () => {
    const ctx = makeContext([parsePage('<html><body><form><label for="u">Dirección de su tienda virtual</label><input id="u"><button>Escanear</button></form></body></html>', "https://x.co/")]);
    expect(byId(ctx)["DAT-03"].status).toBe("no_determinado");
  });
});
