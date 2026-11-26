export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  minutes: number;
  body: { h?: string; p?: string; li?: string[] }[];
}

export const POSTS: Post[] = [
  {
    slug: "requisitos-para-vender-en-linea-en-colombia",
    title: "Requisitos legales para vender en línea en Colombia (guía 2026)",
    excerpt: "Lo que exige el Estatuto del Consumidor a toda tienda virtual: datos del vendedor, precios con IVA, retracto, reversión del pago y PQRS.",
    date: "2026-11-20",
    minutes: 6,
    body: [
      { p: "Si vende por internet en Colombia, la Ley 1480 de 2011 (Estatuto del Consumidor) le impone obligaciones especiales de información. El artículo 50 resume lo que su tienda debe publicar. Esta es la lista práctica." },
      { h: "1. Identifíquese como vendedor" },
      { p: "Publique en un lugar visible (normalmente el pie de página) su razón social o nombre, NIT, dirección de notificación, teléfono y correo electrónico. Es el primer punto que revisa la Superintendencia de Industria y Comercio (SIC)." },
      { h: "2. Precios finales con impuestos" },
      { p: "El precio publicado debe ser el precio total, con IVA incluido (art. 26). Informe también los costos de envío antes de que el cliente pague." },
      { h: "3. Derecho de retracto" },
      { p: "En las ventas a distancia el consumidor puede retractarse dentro de los cinco (5) días hábiles siguientes a la entrega (art. 47), y usted debe devolver el dinero en máximo 30 días calendario. Si no lo informa, el plazo se puede extender." },
      { h: "4. Reversión del pago" },
      { p: "Si el cliente pagó con tarjeta o medio electrónico y fue víctima de fraude, no recibió el producto o este no corresponde, puede pedir la reversión del pago (art. 51 y Decreto 587 de 2016)." },
      { h: "5. Canal de PQRS y enlace a la SIC" },
      { p: "Ofrezca un mecanismo para presentar peticiones, quejas y reclamos, y un enlace a www.sic.gov.co." },
      { h: "6. Protección de datos personales" },
      { p: "Si recoge datos de sus clientes, la Ley 1581 de 2012 exige una política de tratamiento de datos, un aviso de privacidad y autorización previa (sin casillas premarcadas)." },
      { h: "¿Cómo saber si su tienda cumple?" },
      { p: "Use nuestro escáner flash gratuito: en 30 segundos revisa cinco elementos básicos y le muestra su nivel de riesgo." },
    ],
  },
  {
    slug: "modelo-de-politica-de-tratamiento-de-datos",
    title: "Modelo de política de tratamiento de datos para tiendas virtuales",
    excerpt: "Qué debe contener la política de datos que exige la Ley 1581 de 2012 y los errores más comunes en los formularios.",
    date: "2026-11-13",
    minutes: 5,
    body: [
      { p: "Toda tienda virtual que recoja nombres, correos, teléfonos o direcciones es responsable del tratamiento de datos personales. La Ley 1581 de 2012 y el Decreto 1377 de 2013 definen qué debe publicar." },
      { h: "Contenido mínimo de la política" },
      { li: [
        "Identificación del responsable: razón social, NIT, dirección, correo y teléfono.",
        "Tratamiento al que se someterán los datos y su finalidad.",
        "Derechos del titular: conocer, actualizar, rectificar, suprimir y revocar la autorización.",
        "Persona o área responsable de atender consultas y reclamos.",
        "Procedimiento para ejercer los derechos (consultas en 10 días hábiles, reclamos en 15).",
        "Fecha de entrada en vigencia.",
      ] },
      { h: "Errores frecuentes en los formularios" },
      { li: [
        "No pedir autorización en el registro, el checkout o el boletín.",
        "Usar casillas de autorización ya marcadas: no son una autorización válida.",
        "Enlazar una política genérica copiada de otro país.",
      ] },
      { h: "Plantilla lista en Word" },
      { p: "Con un plan Básico o Pro puede descargar una política de tratamiento de datos prellenada con la razón social, el NIT y los datos de contacto de su empresa." },
    ],
  },
  {
    slug: "sanciones-comunes-de-la-sic-a-tiendas-virtuales",
    title: "Las sanciones más comunes de la SIC a tiendas virtuales",
    excerpt: "Por qué sanciona la SIC al comercio electrónico, cuánto pueden costar las multas y cómo prevenirlas.",
    date: "2026-11-06",
    minutes: 4,
    body: [
      { p: "La Superintendencia de Industria y Comercio ha intensificado la vigilancia sobre el comercio electrónico. La mayoría de las investigaciones se originan en fallas que se pueden prevenir fácilmente." },
      { h: "Infracciones frecuentes" },
      { li: [
        "Omitir los datos del vendedor o el precio final (deber de información, art. 50 Ley 1480).",
        "Leyendas como «no se devuelve dinero» o «no hay cambios ni devoluciones», que son cláusulas abusivas (arts. 42 y 43).",
        "No informar ni respetar el derecho de retracto.",
        "Capturar datos personales sin política ni autorización (Ley 1581).",
      ] },
      { h: "¿Cuánto cuestan las multas?" },
      { p: "El artículo 61 de la Ley 1480 permite multas de hasta 2.000 salarios mínimos mensuales legales vigentes. La Ley 1581 (art. 23) prevé multas de hasta 2.000 SMMLV. Con el salario mínimo de 2026, el tope supera los $3.500 millones: una cifra que puede cerrar una mipyme." },
      { h: "Prevenir es más barato" },
      { p: "Una suscripción anual de auditoría cuesta una fracción mínima de una multa. Revise su tienda hoy con el escáner gratuito y corrija los hallazgos con nuestras plantillas." },
    ],
  },
];
