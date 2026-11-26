import type { AuditContext, Finding, Rule } from "./types";
import { findAll, findFirst, findLink, snippet, windows } from "./text";

/**
 * Matriz de reglas normativas (HU-03).
 * Traduce la Ley 1480 de 2011, el Decreto 587 de 2016, la Ley 1581 de 2012
 * y la Guía de comercio electrónico de la SIC en criterios verificables.
 */

type Out = Omit<Finding, "ruleId">;

const ok = (evidence: string, url?: string): Out => ({ status: "cumple", evidence, url });
const fail = (evidence: string, url?: string): Out => ({ status: "no_cumple", evidence, url });
const unknown = (evidence: string): Out => ({ status: "no_determinado", evidence });

function byText(ctx: AuditContext, re: RegExp, missing: string, linkRe?: RegExp): Out {
  if (linkRe) {
    const l = findLink(ctx, linkRe);
    if (l) return ok(`Enlace encontrado: «${l.link.text || l.link.href}»`, l.link.href);
  }
  const m = findFirst(ctx, re);
  if (m) return ok(m.evidence, m.page.url);
  return fail(missing);
}

// Frases que niegan el derecho de retracto o las devoluciones (HU-14: mínimo 10).
export const ABUSIVE_PHRASES: { re: RegExp; label: string }[] = [
  { re: /no se (devuelve|reembolsa|regresa) (el )?dinero/, label: "no se devuelve dinero" },
  { re: /no (hay|hacemos|realizamos|aceptamos|se aceptan|se admiten|se hacen) (cambios (ni|o|y) )?devoluciones/, label: "no se aceptan devoluciones" },
  { re: /no (hay|hacemos|realizamos|aceptamos|se aceptan|se hacen) reembolsos/, label: "no se hacen reembolsos" },
  { re: /no (hay|hacemos|realizamos|aceptamos|se aceptan|se hacen) (cambios ni|devoluciones ni) /, label: "no hay cambios ni devoluciones" },
  { re: /todas las ventas son (finales|definitivas)/, label: "todas las ventas son finales" },
  { re: /venta(s)? (final|definitiva)(es)?\b/, label: "venta final" },
  { re: /sin (derecho a )?(devolucion|reembolso)(es)?/, label: "sin devolución" },
  { re: /no (se )?aceptan? reclamos/, label: "no se aceptan reclamos" },
  { re: /no (hay|se hace|se realiza) devolucion de dinero/, label: "no hay devolución de dinero" },
  { re: /una vez (realizada|hecha|efectuada) la compra no (se )?(puede|podra|admite)/, label: "una vez realizada la compra no se puede…" },
  { re: /no nos hacemos responsables? (por|de) (la )?(garantia|devolucion)/, label: "no nos hacemos responsables de la garantía" },
  { re: /el dinero no (es|sera) reembolsable|no reembolsable/, label: "no reembolsable" },
];

const PERSONAL_FIELD = /(email|e-mail|correo|mail|tel|phone|celular|nombre|name|documento|cedula|direccion|address)/;
const NOT_PERSONAL = /(url|sitio|tienda|web|buscar|search|cupon|coupon)/;
const AUTH_TEXT = /(autoriz|acepto|he leido|tratamiento de (mis )?datos|politica de (privacidad|tratamiento|datos)|habeas data|proteccion de datos)/;

function personalForms(ctx: AuditContext) {
  const forms: { url: string; form: AuditContext["pages"][number]["forms"][number] }[] = [];
  for (const p of ctx.pages) {
    for (const f of p.forms) {
      const personal = f.fields.some((x) => {
        if (["email", "tel"].includes(x.type)) return true;
        if (["hidden", "submit", "checkbox", "radio", "search", "url"].includes(x.type)) return false;
        const hay = `${x.name} ${x.label}`.toLowerCase();
        return PERSONAL_FIELD.test(hay) && !NOT_PERSONAL.test(hay);
      });
      const isSearch = f.fields.every((x) => x.type === "search" || /^(q|s|search)$/.test(x.name) || x.type === "hidden" || x.type === "submit");
      if (personal && !isSearch) forms.push({ url: p.url, form: f });
    }
  }
  return forms;
}

export const RULES: Rule[] = [
  // ───────────── Deber de información · Ley 1480 de 2011 ─────────────
  {
    id: "INF-01",
    category: "Deber de información",
    law: "Ley 1480 de 2011, art. 50 lit. a) y art. 23",
    title: "Identidad del vendedor (razón social o nombre)",
    description: "El sitio publica la razón social o el nombre del comerciante.",
    risk: "alto",
    explanation: "El comprador tiene derecho a saber con quién está contratando. Sin la identidad del vendedor, la SIC presume que la tienda oculta información.",
    recommendation: "Publique en el pie de página la razón social completa (por ejemplo «Mi Tienda S.A.S.») o el nombre del comerciante persona natural.",
    template: "terminos",
    verification: "Busca «razón social», S.A.S., Ltda., E.U. o S.A. en las páginas rastreadas.",
    check: (ctx) =>
      byText(ctx, /razon social|\bs\.?\s?a\.?\s?s\b\.?|\bltda\b\.?|\be\.\s?u\.|\bs\.\s?a\.(?=[\s,;)]|$)|persona natural/, "No se encontró la razón social ni el nombre del comerciante."),
  },
  {
    id: "INF-02",
    category: "Deber de información",
    law: "Ley 1480 de 2011, art. 50 lit. a)",
    title: "NIT o número de identificación del vendedor",
    description: "El sitio publica el NIT (o la cédula en caso de persona natural).",
    risk: "alto",
    explanation: "El NIT permite verificar que la empresa existe y está registrada. Es uno de los datos que la SIC revisa primero.",
    recommendation: "Agregue el NIT junto a la razón social en el pie de página y en los términos y condiciones.",
    template: "terminos",
    verification: "Busca «NIT» seguido de un número, o «RUT»/«C.C.» con número.",
    check: (ctx) => byText(ctx, /\b(nit|rut|c\.?\s?c\.?)\b\.?\s*(no\.?|n°|numero|#)?\s*:?\s*\d[\d.\s]{5,}(-\s?\d)?/, "No se encontró el NIT del comerciante."),
  },
  {
    id: "INF-03",
    category: "Deber de información",
    law: "Ley 1480 de 2011, art. 50 lit. a)",
    title: "Dirección física de notificación",
    description: "El sitio publica una dirección física donde el consumidor pueda notificar.",
    risk: "medio",
    explanation: "Si el cliente necesita radicar un reclamo o una demanda, debe saber a qué dirección dirigirse.",
    recommendation: "Publique la dirección de notificación judicial (calle, carrera, ciudad) en el pie de página o en la página de contacto.",
    template: "terminos",
    verification: "Busca nomenclatura colombiana: calle, carrera, avenida, diagonal o transversal con número.",
    check: (ctx) =>
      byText(
        ctx,
        /\b(calle|carrera|cra|cr|kr|cll|cl|avenida|av|diagonal|dg|transversal|tv|autopista)\b\.?\s*\d+\s*[a-z]?\s*(bis)?\s*(#|no\.?|n°|numero|-)\s*\d+/,
        "No se encontró una dirección física de notificación.",
      ),
  },
  {
    id: "INF-04",
    category: "Deber de información",
    law: "Ley 1480 de 2011, art. 50 lit. a)",
    title: "Teléfono y correo electrónico de contacto",
    description: "El sitio publica un teléfono y un correo electrónico de contacto.",
    risk: "alto",
    explanation: "La ley exige que el consumidor pueda comunicarse con la tienda por medios ágiles: teléfono y correo electrónico.",
    recommendation: "Publique un correo electrónico y un número telefónico (o WhatsApp) visibles en todas las páginas.",
    template: "terminos",
    verification: "Busca un correo electrónico (o enlace mailto:) y un teléfono (o enlace tel:/WhatsApp).",
    check: (ctx) => {
      const mail = findFirst(ctx, /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/) ?? null;
      const mailLink = findLink(ctx, /^mailto:|mailto:/);
      const tel = findFirst(ctx, /(\+?57[\s-]?)?(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}|\(?60\d\)?[\s.-]?\d{3}[\s.-]?\d{4})/);
      const telLink = findLink(ctx, /tel:|wa\.me|whatsapp/);
      const hasMail = Boolean(mail || mailLink);
      const hasTel = Boolean(tel || telLink);
      if (hasMail && hasTel)
        return ok(`Correo: ${mail?.text ?? mailLink?.link.href ?? ""} · Teléfono: ${tel?.text ?? telLink?.link.href ?? ""}`, (mail ?? tel)?.page.url);
      if (hasMail) return fail(`Solo se encontró correo (${mail?.text ?? mailLink?.link.href}); falta un teléfono de contacto.`);
      if (hasTel) return fail(`Solo se encontró teléfono (${tel?.text ?? telLink?.link.href}); falta un correo electrónico.`);
      return fail("No se encontraron teléfono ni correo de contacto.");
    },
  },
  {
    id: "INF-05",
    category: "Deber de información",
    law: "Ley 1480 de 2011, art. 26 y art. 50 lit. c)",
    title: "Precio final con impuestos incluidos",
    description: "Los precios se informan como precio total, indicando que incluyen IVA.",
    risk: "medio",
    explanation: "El precio que ve el cliente debe ser el que paga, con todos los impuestos. Sumar el IVA al final se considera información engañosa.",
    recommendation: "Muestre los precios con IVA incluido y agregue la leyenda «Precio con IVA incluido» en productos y carrito.",
    template: "terminos",
    verification: "Si hay precios publicados, busca «IVA incluido», «impuestos incluidos» o «precio final».",
    check: (ctx) => {
      const m = findFirst(ctx, /iva incluido|incluye(n)? (el )?iva|impuestos? incluidos?|precio (final|total)|con iva|iva (del )?19/);
      if (m) return ok(m.evidence, m.page.url);
      if (!ctx.pages.some((p) => p.hasPrices)) return unknown("No se encontraron precios en las páginas rastreadas para verificar este punto.");
      return fail("Se encontraron precios, pero no se indica que incluyan IVA o impuestos.");
    },
  },
  {
    id: "INF-06",
    category: "Deber de información",
    law: "Ley 1480 de 2011, art. 50 lit. c)",
    title: "Costos de envío informados",
    description: "El sitio informa los costos de envío o flete antes de la compra.",
    risk: "medio",
    explanation: "El costo del envío hace parte del precio total. Si no se informa antes de pagar, el cliente se lleva una sorpresa y puede reclamar.",
    recommendation: "Publique una política de envíos con costos, tiempos y cobertura, y muestre el valor del envío en el carrito.",
    template: "terminos",
    verification: "Busca «costo de envío», «flete», «envío gratis» o una política de envíos.",
    check: (ctx) =>
      byText(
        ctx,
        /(costo|valor|precio|tarifa|cobro)s? (del |de )?(envio|flete|domicilio)|envios? gratis|flete gratis|politica de envios?|gastos de envio|tiempos? de (entrega|envio)/,
        "No se informan los costos de envío.",
        /politica de envios?|envios|shipping/,
      ),
  },
  {
    id: "INF-07",
    category: "Deber de información",
    law: "Ley 1480 de 2011, art. 37 y art. 50 lit. c)",
    title: "Términos y condiciones publicados",
    description: "Existe un documento de términos y condiciones accesible desde el sitio.",
    risk: "medio",
    explanation: "Los términos y condiciones son el «contrato» de la tienda. Deben ser claros, visibles y aceptados antes de pagar.",
    recommendation: "Publique los términos y condiciones y enlácelos en el pie de página y en el checkout.",
    template: "terminos",
    verification: "Busca un enlace o texto «términos y condiciones», «condiciones de uso» o «terms of service».",
    check: (ctx) =>
      byText(ctx, /terminos y condiciones|condiciones (generales|de uso|de compra)|terminos de (uso|servicio)/, "No se encontraron términos y condiciones.", /terminos|condiciones|terms/),
  },
  {
    id: "INF-08",
    category: "Deber de información",
    law: "Ley 1480 de 2011, art. 50 lit. e) y Circular Única SIC",
    title: "Canal de PQRS (peticiones, quejas y reclamos)",
    description: "El sitio ofrece un mecanismo visible para radicar peticiones, quejas y reclamos.",
    risk: "alto",
    explanation: "Toda tienda debe tener un canal para que los clientes presenten quejas y reclamos, y responderlos dentro de los plazos de ley.",
    recommendation: "Cree un botón «PQRS» en el pie de página que lleve a un formulario o correo de atención al cliente.",
    template: "terminos",
    verification: "Busca «PQRS», «peticiones, quejas y reclamos», «quejas y reclamos» o «libro de reclamaciones».",
    check: (ctx) =>
      byText(
        ctx,
        /\bpqrs?d?f?\b|peticiones,? quejas|quejas,? (y )?reclamos|libro de reclamaciones|radica(r)? (tu|su) (queja|reclamo)/,
        "No se encontró un canal de PQRS.",
        /\bpqr|quejas|reclamos|reclamaciones/,
      ),
  },
  {
    id: "INF-09",
    category: "Deber de información",
    law: "Ley 1480 de 2011, art. 50 y Guía SIC de comercio electrónico (2018)",
    title: "Enlace a la Superintendencia de Industria y Comercio",
    description: "El sitio incluye un enlace visible a la SIC.",
    risk: "medio",
    explanation: "El cliente debe saber que puede acudir a la SIC, la autoridad que protege al consumidor. Incluir el enlace es una buena práctica que la SIC verifica.",
    recommendation: "Agregue en el pie de página el logo o un enlace a www.sic.gov.co.",
    verification: "Busca un enlace a sic.gov.co o el texto «Superintendencia de Industria y Comercio».",
    check: (ctx) => {
      const l = findLink(ctx, /sic\.gov\.co/);
      if (l) return ok(`Enlace a la SIC: ${l.link.href}`, l.page.url);
      const m = findFirst(ctx, /superintendencia de industria y comercio/);
      if (m) return ok(m.evidence, m.page.url);
      return fail("No se encontró un enlace a la Superintendencia de Industria y Comercio.");
    },
  },
  {
    id: "INF-10",
    category: "Deber de información",
    law: "Ley 1480 de 2011, arts. 7, 8 y 50 lit. c)",
    title: "Información sobre la garantía legal",
    description: "El sitio informa las condiciones y el término de la garantía de los productos.",
    risk: "medio",
    explanation: "Todos los productos tienen garantía legal obligatoria. El cliente debe saber cómo y dónde hacerla efectiva.",
    recommendation: "Publique una sección de garantías con el término, cómo solicitarla y los puntos de atención.",
    template: "retracto",
    verification: "Busca el término «garantía».",
    check: (ctx) => byText(ctx, /garantia/, "No se encontró información sobre la garantía legal."),
  },

  // ───────────── Retracto y reversión del pago ─────────────
  {
    id: "RET-01",
    category: "Retracto y reversión",
    law: "Ley 1480 de 2011, art. 47",
    title: "Referencia al derecho de retracto",
    description: "El sitio informa que el consumidor puede retractarse de la compra.",
    risk: "alto",
    explanation: "En las ventas a distancia, el cliente puede arrepentirse de la compra. Si la tienda no lo informa, el plazo para retractarse se extiende hasta un año.",
    recommendation: "Publique una política de retracto y devoluciones que mencione expresamente el derecho de retracto.",
    template: "retracto",
    verification: "Busca la palabra «retracto».",
    check: (ctx) => byText(ctx, /retracto|retractarse|retractar/, "No se menciona el derecho de retracto."),
  },
  {
    id: "RET-02",
    category: "Retracto y reversión",
    law: "Ley 1480 de 2011, art. 47",
    title: "Plazo de 5 días hábiles para el retracto",
    description: "Se indica el plazo de cinco (5) días hábiles para ejercer el retracto.",
    risk: "alto",
    explanation: "La ley da al cliente cinco días hábiles, contados desde la entrega, para retractarse. Un plazo menor o no informado es ilegal.",
    recommendation: "Indique: «Puede ejercer el derecho de retracto dentro de los cinco (5) días hábiles siguientes a la entrega del producto».",
    template: "retracto",
    verification: "Cerca de la palabra «retracto» busca «cinco (5) días hábiles».",
    check: (ctx) => {
      const w = windows(ctx, /retract/);
      if (w.length === 0) return fail("No se menciona el retracto, por lo que tampoco su plazo.");
      for (const x of w) {
        const m = /(cinco|5)\s*\(?\s*(5)?\s*\)?\s*dias habiles/.exec(x.text);
        if (m) return ok(snippet(x.page, Math.max(0, x.index - 600) + m.index, m[0].length), x.page.url);
      }
      return fail("Se menciona el retracto, pero no el plazo de cinco (5) días hábiles.");
    },
  },
  {
    id: "RET-03",
    category: "Retracto y reversión",
    law: "Ley 1480 de 2011, art. 47 inc. 4",
    title: "Devolución del dinero en máximo 30 días",
    description: "Se informa que el dinero se reintegra en un plazo máximo de treinta (30) días calendario.",
    risk: "medio",
    explanation: "Cuando el cliente se retracta, la tienda debe devolverle todo el dinero en un máximo de 30 días calendario, sin descuentos.",
    recommendation: "Indique que el reembolso se realiza en máximo treinta (30) días calendario desde el retracto.",
    template: "retracto",
    verification: "Cerca de «retracto», «devolución» o «reembolso» busca «treinta (30) días».",
    check: (ctx) => {
      const w = windows(ctx, /retract|reembols|devolucion del dinero/);
      if (w.length === 0) return fail("No se informa el plazo para devolver el dinero.");
      for (const x of w) {
        const m = /(treinta|30)\s*\(?\s*(30)?\s*\)?\s*dias/.exec(x.text);
        if (m) return ok(snippet(x.page, Math.max(0, x.index - 600) + m.index, m[0].length), x.page.url);
      }
      return fail("No se indica el plazo máximo de 30 días para reintegrar el dinero.");
    },
  },
  {
    id: "REV-01",
    category: "Retracto y reversión",
    law: "Ley 1480 de 2011, art. 51 y Decreto 587 de 2016",
    title: "Procedimiento de reversión del pago",
    description: "El sitio explica el derecho y el procedimiento de reversión del pago.",
    risk: "alto",
    explanation: "Si el cliente pagó con tarjeta o medio electrónico y hubo fraude, el producto no llegó o no corresponde, puede pedir que le reversen el pago.",
    recommendation: "Publique el procedimiento de reversión del pago: causales, plazo de 5 días hábiles y canales para solicitarlo.",
    template: "retracto",
    verification: "Busca «reversión del pago» o «reversión de pago».",
    check: (ctx) => byText(ctx, /reversion (del|de|de los) pagos?/, "No se explica el procedimiento de reversión del pago."),
  },
  {
    id: "REV-02",
    category: "Retracto y reversión",
    law: "Decreto 587 de 2016 (art. 2.2.2.51.2 del Decreto 1074 de 2015)",
    title: "Plazo de 5 días hábiles para solicitar la reversión",
    description: "Se informa el plazo de cinco (5) días hábiles para solicitar la reversión del pago.",
    risk: "medio",
    explanation: "El cliente tiene cinco días hábiles desde que conoce el problema para pedir la reversión. Informarlo evita reclamos ante la SIC.",
    recommendation: "Indique que la reversión se solicita dentro de los cinco (5) días hábiles siguientes a la fecha en que se tuvo noticia de la operación.",
    template: "retracto",
    verification: "Cerca de «reversión» busca «cinco (5) días hábiles».",
    check: (ctx) => {
      const w = windows(ctx, /reversion/);
      if (w.length === 0) return fail("No se menciona la reversión del pago, por lo que tampoco su plazo.");
      for (const x of w) {
        const m = /(cinco|5)\s*\(?\s*(5)?\s*\)?\s*dias habiles/.exec(x.text);
        if (m) return ok(snippet(x.page, Math.max(0, x.index - 600) + m.index, m[0].length), x.page.url);
      }
      return fail("Se menciona la reversión, pero no el plazo de cinco (5) días hábiles.");
    },
  },

  // ───────────── Cláusulas abusivas ─────────────
  {
    id: "ABU-01",
    category: "Cláusulas abusivas",
    law: "Ley 1480 de 2011, arts. 42 y 43",
    title: "Leyendas que niegan devoluciones o el retracto",
    description: "El sitio no contiene frases que nieguen devoluciones, reembolsos o el retracto.",
    risk: "alto",
    explanation: "Frases como «no se devuelve dinero» son cláusulas abusivas: no tienen validez legal y son una de las causas más comunes de investigaciones de la SIC.",
    recommendation: "Elimine esas leyendas y reemplácelas por una política de retracto y devoluciones conforme a la ley.",
    template: "retracto",
    verification: `Busca ${ABUSIVE_PHRASES.length} patrones de frases que niegan devoluciones (por ejemplo «no se devuelve dinero», «no hay cambios ni devoluciones»).`,
    check: (ctx) => {
      const hits: string[] = [];
      let url: string | undefined;
      for (const p of ABUSIVE_PHRASES) {
        // Se ignoran las frases citadas entre comillas (por ejemplo, en textos educativos).
        const m = findAll(ctx, p.re, 20).find((x) => !/[«"“']\s*$/.test(x.page.norm.slice(Math.max(0, x.index - 3), x.index)));
        if (m) {
          hits.push(`«${m.evidence}»`);
          url ??= m.page.url;
        }
      }
      if (hits.length) return fail(`Se detectaron ${hits.length} leyenda(s) que niegan devoluciones: ${hits.slice(0, 3).join(" · ")}`, url);
      return ok("No se detectaron leyendas que nieguen devoluciones o el retracto.");
    },
  },

  // ───────────── Protección de datos · Ley 1581 de 2012 ─────────────
  {
    id: "DAT-01",
    category: "Protección de datos",
    law: "Ley 1581 de 2012, arts. 17 lit. k) y 18; Decreto 1377 de 2013, art. 13",
    title: "Política de tratamiento de datos personales",
    description: "El sitio publica y enlaza una política de tratamiento de datos personales.",
    risk: "alto",
    explanation: "Si su tienda recoge nombres, correos o teléfonos, la ley exige publicar cómo usa, guarda y protege esos datos.",
    recommendation: "Publique la política de tratamiento de datos personales y enlácela en el pie de página y en todos los formularios.",
    template: "datos",
    verification: "Busca un enlace o texto «política de tratamiento de datos», «protección de datos», «política de privacidad» o «habeas data».",
    check: (ctx) =>
      byText(
        ctx,
        /politica de (tratamiento|proteccion)( de (la )?(informacion|datos))?|tratamiento de (los )?datos personales|politica de privacidad|habeas data|proteccion de datos personales/,
        "No se encontró una política de tratamiento de datos personales.",
        /tratamiento|proteccion de datos|privacidad|privacy|habeas/,
      ),
  },
  {
    id: "DAT-02",
    category: "Protección de datos",
    law: "Decreto 1377 de 2013, arts. 14 y 15 (Decreto 1074 de 2015)",
    title: "Aviso de privacidad",
    description: "El sitio publica un aviso de privacidad que informa la finalidad del tratamiento.",
    risk: "medio",
    explanation: "El aviso de privacidad es un texto corto que explica al cliente quién trata sus datos, para qué, y dónde consultar la política completa.",
    recommendation: "Agregue un aviso de privacidad corto junto a los formularios, con enlace a la política completa.",
    template: "datos",
    verification: "Busca «aviso de privacidad» o un texto que informe la finalidad del tratamiento.",
    check: (ctx) =>
      byText(ctx, /aviso de privacidad|finalidad(es)? (del|de su) tratamiento|sus datos (seran|son) (tratados|utilizados)/, "No se encontró un aviso de privacidad.", /aviso de privacidad/),
  },
  {
    id: "DAT-03",
    category: "Protección de datos",
    law: "Ley 1581 de 2012, art. 9; Decreto 1377 de 2013, art. 5",
    title: "Autorización de datos en los formularios",
    description: "Los formularios que capturan datos personales solicitan la autorización del titular.",
    risk: "alto",
    explanation: "Antes de guardar los datos de un cliente (por ejemplo en el registro o en el boletín), debe pedirle autorización previa, expresa e informada.",
    recommendation: "Agregue a cada formulario una casilla (sin marcar) «Autorizo el tratamiento de mis datos según la política de tratamiento de datos».",
    template: "datos",
    verification: "Revisa los formularios de registro, contacto y checkout que piden datos personales.",
    check: (ctx) => {
      const forms = personalForms(ctx);
      if (forms.length === 0) return unknown("No se encontraron formularios con datos personales en las páginas rastreadas (pueden estar detrás de JavaScript o del inicio de sesión).");
      const bad = forms.filter((f) => !AUTH_TEXT.test(f.form.text) && !f.form.fields.some((x) => x.type === "checkbox" && AUTH_TEXT.test(x.label)));
      if (bad.length === 0) return ok(`${forms.length} formulario(s) con datos personales incluyen texto de autorización.`, forms[0].url);
      return fail(`${bad.length} de ${forms.length} formulario(s) piden datos personales sin solicitar autorización (p. ej. en ${bad[0].url}).`, bad[0].url);
    },
  },
  {
    id: "DAT-04",
    category: "Protección de datos",
    law: "Ley 1581 de 2012, art. 9; Decreto 1377 de 2013, art. 7",
    title: "Casillas de autorización premarcadas",
    description: "Las casillas de autorización o suscripción no vienen marcadas por defecto.",
    risk: "alto",
    explanation: "Una casilla ya marcada no es una autorización válida: el cliente debe marcarla él mismo, de forma libre e inequívoca.",
    recommendation: "Configure todas las casillas de autorización y suscripción para que aparezcan sin marcar.",
    template: "datos",
    verification: "Busca casillas (checkbox) con el atributo checked dentro de formularios.",
    check: (ctx) => {
      const forms = personalForms(ctx);
      const pre: { url: string; label: string }[] = [];
      for (const p of ctx.pages)
        for (const f of p.forms)
          for (const x of f.fields)
            if (x.type === "checkbox" && x.checked && /(autoriz|acepto|datos|privacidad|newsletter|boletin|suscrib|novedades|promociones|marketing|email)/.test(`${x.label} ${x.name}`.toLowerCase()))
              pre.push({ url: p.url, label: x.label || x.name });
      if (pre.length) return fail(`Se encontraron ${pre.length} casilla(s) premarcada(s): «${pre[0].label}».`, pre[0].url);
      if (forms.length === 0) return unknown("No se encontraron formularios con datos personales para revisar sus casillas.");
      return ok("Ninguna casilla de autorización o suscripción viene premarcada.");
    },
  },
  {
    id: "DAT-05",
    category: "Protección de datos",
    law: "Ley 1581 de 2012, art. 8 y art. 14-15",
    title: "Derechos del titular y canal de habeas data",
    description: "Se informan los derechos del titular (conocer, actualizar, rectificar, suprimir) y el canal para ejercerlos.",
    risk: "medio",
    explanation: "El cliente puede pedir en cualquier momento que le muestren, corrijan o borren sus datos. La tienda debe decirle cómo hacerlo.",
    recommendation: "Incluya en la política de datos los derechos del titular y un correo para ejercerlos.",
    template: "datos",
    verification: "Busca «derechos del titular», «conocer, actualizar y rectificar» o «supresión».",
    check: (ctx) =>
      byText(ctx, /derechos? (del|de los) titular(es)?|conocer,? actualizar,? (y )?rectificar|actualizar y rectificar|supresion de (los )?datos|revocar la autorizacion/, "No se informan los derechos del titular de los datos."),
  },
];

export const RULES_BY_ID = Object.fromEntries(RULES.map((r) => [r.id, r]));

export const CRITICAL_RULES = ["INF-01", "INF-02", "INF-04", "ABU-01", "DAT-01"];
