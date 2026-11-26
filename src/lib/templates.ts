import { AlignmentType, Document, Footer, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import type { Company } from "./auth";

export type TemplateId = "datos" | "terminos" | "retracto";

export const TEMPLATES: { id: TemplateId; title: string; file: string; description: string; laws: string }[] = [
  {
    id: "datos",
    title: "Política de tratamiento de datos personales",
    file: "politica-tratamiento-datos.docx",
    description: "Incluye responsable, finalidades, derechos del titular, procedimiento de consultas y reclamos, y aviso de privacidad.",
    laws: "Ley 1581 de 2012 · Decreto 1377 de 2013",
  },
  {
    id: "terminos",
    title: "Términos y condiciones de la tienda virtual",
    file: "terminos-y-condiciones.docx",
    description: "Identificación del vendedor, precios con IVA, envíos, medios de pago, garantía, PQRS y enlace a la SIC.",
    laws: "Ley 1480 de 2011, arts. 23, 26, 50 · Ley 527 de 1999",
  },
  {
    id: "retracto",
    title: "Política de retracto, devoluciones y reversión del pago",
    file: "politica-retracto-devoluciones.docx",
    description: "Derecho de retracto (5 días hábiles), reembolso en 30 días, reversión del pago y garantía legal.",
    laws: "Ley 1480 de 2011, arts. 7, 47, 51 · Decreto 587 de 2016",
  },
];

type Block = { h?: string; p?: string; li?: string[] };

export function legalContent(id: TemplateId, c: Company, date: string): { title: string; blocks: Block[] } {
  const store = c.storeUrl || "[dirección de la tienda virtual]";
  const ident = `${c.legalName}, identificada con NIT ${c.nit}, con domicilio en ${c.address}, ${c.city}`;
  const contact = `correo electrónico ${c.email} o teléfono ${c.phone}`;

  if (id === "datos")
    return {
      title: "POLÍTICA DE TRATAMIENTO DE DATOS PERSONALES",
      blocks: [
        { p: `En cumplimiento de la Ley 1581 de 2012, el Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015) y demás normas concordantes, ${ident} (en adelante «el Responsable»), adopta la presente política para el tratamiento de los datos personales que recolecta a través de su tienda virtual ${store} y de sus demás canales.` },
        { h: "1. Responsable del tratamiento" },
        { li: [`Razón social: ${c.legalName}`, `NIT: ${c.nit}`, `Dirección: ${c.address}, ${c.city}`, `Correo electrónico: ${c.email}`, `Teléfono: ${c.phone}`] },
        { h: "2. Datos que se recolectan" },
        { p: "Nombre, documento de identidad, dirección de entrega, correo electrónico, teléfono, historial de compras y datos necesarios para procesar pagos. El Responsable no almacena los datos completos de tarjetas, que son tratados por la pasarela de pagos." },
        { h: "3. Finalidades del tratamiento" },
        { li: [
          "Procesar pedidos, pagos, envíos, cambios, devoluciones y garantías.",
          "Atender peticiones, quejas, reclamos y sugerencias (PQRS).",
          "Emitir facturas y cumplir obligaciones legales, contables y tributarias.",
          "Enviar información comercial, promociones y novedades, únicamente cuando el titular lo haya autorizado expresamente.",
          "Realizar análisis estadísticos para mejorar el servicio.",
        ] },
        { h: "4. Derechos del titular" },
        { p: "De acuerdo con el artículo 8 de la Ley 1581 de 2012, el titular puede:" },
        { li: [
          "Conocer, actualizar y rectificar sus datos personales.",
          "Solicitar prueba de la autorización otorgada.",
          "Ser informado sobre el uso que se ha dado a sus datos.",
          "Presentar quejas ante la Superintendencia de Industria y Comercio (www.sic.gov.co).",
          "Revocar la autorización y/o solicitar la supresión de sus datos cuando no exista un deber legal o contractual de conservarlos.",
          "Acceder en forma gratuita a sus datos personales.",
        ] },
        { h: "5. Autorización" },
        { p: "El tratamiento se realiza con la autorización previa, expresa e informada del titular, que se obtiene mediante una casilla sin marcar en los formularios de la tienda virtual o por cualquier otro medio que permita su consulta posterior. No se usan casillas premarcadas." },
        { h: "6. Procedimiento para consultas y reclamos" },
        { p: `Las consultas y reclamos se presentan al ${contact}. Las consultas se responden en un máximo de diez (10) días hábiles y los reclamos en un máximo de quince (15) días hábiles, prorrogables en los términos de los artículos 14 y 15 de la Ley 1581 de 2012.` },
        { h: "7. Seguridad de la información" },
        { p: "El Responsable adopta medidas técnicas, humanas y administrativas para proteger los datos, como conexiones cifradas (HTTPS), control de acceso y almacenamiento seguro de contraseñas." },
        { h: "8. Aviso de privacidad" },
        { p: `${c.legalName} es responsable del tratamiento de sus datos personales, que serán usados para procesar sus compras, atender sus solicitudes y, si usted lo autoriza, enviarle información comercial. Usted puede conocer, actualizar, rectificar y suprimir sus datos escribiendo a ${c.email}. Consulte la política completa en ${store}.` },
        { h: "9. Vigencia" },
        { p: `Esta política rige a partir del ${date}. Los datos se conservarán durante el tiempo necesario para cumplir las finalidades descritas y las obligaciones legales.` },
      ],
    };

  if (id === "terminos")
    return {
      title: "TÉRMINOS Y CONDICIONES DE USO Y COMPRA",
      blocks: [
        { p: `Los presentes términos regulan el uso de la tienda virtual ${store} y las compras realizadas a través de ella, de conformidad con la Ley 1480 de 2011 (Estatuto del Consumidor), la Ley 527 de 1999 y demás normas aplicables. Al realizar una compra, el consumidor declara haberlos leído y aceptado.` },
        { h: "1. Identificación del vendedor" },
        { li: [`Razón social: ${c.legalName}`, `NIT: ${c.nit}`, `Dirección de notificación: ${c.address}, ${c.city}`, `Correo electrónico: ${c.email}`, `Teléfono: ${c.phone}`] },
        { h: "2. Información de los productos" },
        { p: "Las características, condiciones, garantía y disponibilidad de cada producto se informan en su ficha. Las imágenes son ilustrativas y corresponden fielmente al producto ofrecido." },
        { h: "3. Precios" },
        { p: "Todos los precios se expresan en pesos colombianos (COP) e incluyen el IVA y los demás impuestos aplicables. El precio total a pagar, incluidos los costos de envío, se informa antes de confirmar la compra." },
        { h: "4. Envíos" },
        { p: "El costo y el tiempo estimado de entrega dependen de la ciudad de destino y se muestran en el carrito antes del pago. El plazo máximo de entrega es de treinta (30) días calendario, salvo que se informe uno menor." },
        { h: "5. Medios de pago" },
        { p: "Se aceptan los medios de pago indicados en el checkout (tarjetas, PSE, Nequi u otros). Los pagos se procesan a través de una pasarela de pagos certificada; la tienda no almacena los datos de las tarjetas." },
        { h: "6. Derecho de retracto, devoluciones y reversión del pago" },
        { p: "El consumidor puede ejercer el derecho de retracto dentro de los cinco (5) días hábiles siguientes a la entrega del producto y solicitar la reversión del pago en los casos previstos en el artículo 51 de la Ley 1480 de 2011 y el Decreto 587 de 2016, según la política de retracto y devoluciones publicada en el sitio." },
        { h: "7. Garantía" },
        { p: "Todos los productos cuentan con la garantía legal establecida en los artículos 7 y siguientes de la Ley 1480 de 2011. Para hacerla efectiva, el consumidor puede comunicarse por los canales de atención indicados." },
        { h: "8. Peticiones, quejas y reclamos (PQRS)" },
        { p: `Las PQRS se reciben a través del formulario de PQRS del sitio, al ${contact}, y se responden dentro de los quince (15) días hábiles siguientes a su recepción.` },
        { h: "9. Protección de datos personales" },
        { p: "El tratamiento de los datos personales se rige por la Política de Tratamiento de Datos Personales publicada en el sitio, conforme a la Ley 1581 de 2012." },
        { h: "10. Autoridad de protección al consumidor" },
        { p: "El consumidor puede acudir a la Superintendencia de Industria y Comercio (www.sic.gov.co) para la protección de sus derechos." },
        { h: "11. Ley aplicable" },
        { p: `Estos términos se rigen por las leyes de la República de Colombia. Fecha de última actualización: ${date}.` },
      ],
    };

  return {
    title: "POLÍTICA DE RETRACTO, DEVOLUCIONES, REVERSIÓN DEL PAGO Y GARANTÍAS",
    blocks: [
      { p: `${ident}, informa a sus consumidores las condiciones para ejercer el derecho de retracto, solicitar devoluciones, la reversión del pago y la garantía de los productos adquiridos en ${store}, conforme a la Ley 1480 de 2011 y el Decreto 587 de 2016.` },
      { h: "1. Derecho de retracto (art. 47, Ley 1480 de 2011)" },
      { p: "En las compras realizadas por medios electrónicos, el consumidor puede retractarse dentro de los cinco (5) días hábiles siguientes a la entrega del producto, sin necesidad de justificar su decisión." },
      { li: [
        "El producto debe devolverse en las mismas condiciones en que se recibió.",
        "Los costos de transporte y demás que conlleve la devolución del bien serán cubiertos por el consumidor.",
        "El vendedor reintegrará el dinero pagado, sin descuentos ni retenciones, en un plazo máximo de treinta (30) días calendario desde el momento en que se ejerció el derecho.",
        "Excepciones: servicios ya iniciados con acuerdo del consumidor, productos personalizados o confeccionados según sus especificaciones, bienes perecederos y demás previstos en la ley.",
      ] },
      { h: "2. Cómo ejercer el retracto" },
      { p: `Escriba al ${contact}, indicando el número de pedido. Le enviaremos las instrucciones para la devolución del producto.` },
      { h: "3. Reversión del pago (art. 51, Ley 1480 de 2011 y Decreto 587 de 2016)" },
      { p: "Cuando la compra se haya pagado con tarjeta de crédito, débito o cualquier otro instrumento de pago electrónico, el consumidor puede solicitar la reversión del pago si:" },
      { li: [
        "Fue objeto de fraude o la operación no fue solicitada.",
        "El producto adquirido no fue recibido.",
        "El producto entregado no corresponde a lo solicitado o es defectuoso.",
      ] },
      { p: "La solicitud debe presentarse dentro de los cinco (5) días hábiles siguientes a la fecha en que el consumidor tuvo noticia de la operación fraudulenta o no solicitada, o en que debió haber recibido el producto. El consumidor debe presentar la queja ante el vendedor, devolver el producto cuando sea procedente y notificar al emisor del instrumento de pago." },
      { h: "4. Garantía legal (arts. 7 y siguientes, Ley 1480 de 2011)" },
      { p: "Todos los productos tienen garantía legal por la calidad, idoneidad y seguridad. Ante una falla, el consumidor puede solicitar la reparación gratuita y, si persiste, la reposición del producto o la devolución del dinero." },
      { h: "5. Nota importante" },
      { p: "Ninguna disposición de esta tienda limita los derechos de retracto, reversión del pago o garantía. Cualquier leyenda que los niegue (por ejemplo, «no se devuelve dinero») no tiene validez legal." },
      { h: "6. Autoridad competente" },
      { p: `Superintendencia de Industria y Comercio · www.sic.gov.co. Fecha de vigencia: ${date}.` },
    ],
  };
}

export async function buildTemplate(id: TemplateId, c: Company): Promise<Buffer> {
  const date = new Intl.DateTimeFormat("es-CO", { dateStyle: "long" }).format(new Date());
  const { title, blocks } = legalContent(id, c, date);
  const children: Paragraph[] = [
    new Paragraph({ text: title, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: `${c.legalName} · NIT ${c.nit}`, bold: true })] }),
  ];
  for (const b of blocks) {
    if (b.h) children.push(new Paragraph({ text: b.h, heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 } }));
    if (b.p) children.push(new Paragraph({ children: [new TextRun(b.p)], alignment: AlignmentType.JUSTIFIED, spacing: { after: 120 } }));
    if (b.li) for (const item of b.li) children.push(new Paragraph({ text: item, bullet: { level: 0 }, spacing: { after: 60 } }));
  }
  const doc = new Document({
    creator: "Auditor Legal",
    title,
    styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
    sections: [
      {
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "Plantilla generada por Auditor Legal. No reemplaza la asesoría jurídica profesional.", size: 16, color: "64748B" })],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });
  return Packer.toBuffer(doc);
}
