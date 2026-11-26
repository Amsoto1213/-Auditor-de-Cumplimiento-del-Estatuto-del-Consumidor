// Datos legales y comerciales del propio sitio (HU-12).
// Al ser un proyecto académico, los datos de la empresa son ilustrativos y se
// pueden cambiar con variables de entorno sin tocar el código.

export const SITE = {
  name: "Auditor Legal",
  fullName: "Auditor de Cumplimiento del Estatuto del Consumidor",
  tagline: "Tu tienda virtual, en regla con la ley colombiana en 30 segundos",
  legalName: process.env.NEXT_PUBLIC_LEGAL_NAME ?? "Auditor Legal S.A.S. (proyecto académico)",
  nit: process.env.NEXT_PUBLIC_NIT ?? "901.234.567-8",
  address:
    process.env.NEXT_PUBLIC_ADDRESS ??
    "Avenida del Consulado, Calle 30 # 48-152, Campus Piedra de Bolívar, Cartagena de Indias, Bolívar",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "pqrs@auditorlegal.co",
  phone: process.env.NEXT_PUBLIC_PHONE ?? "+57 (605) 000 0000",
  hours: "Lunes a viernes, 8:00 a. m. a 5:00 p. m.",
  sicUrl: "https://www.sic.gov.co",
  sicPqrsUrl: "https://www.sic.gov.co/atencion-al-ciudadano",
  university: "Universidad de Cartagena · Programa de Ingeniería de Sistemas · Comercio Electrónico",
  team: [
    { name: "Melissa Torres Forero", role: "Product Owner" },
    { name: "Daniela Benavides Padilla", role: "Scrum Master" },
    { name: "Amilcar Soto Romero", role: "Developer" },
    { name: "Marlon Brandon Mier Gutierrez", role: "Developer" },
  ],
};

// Salario mínimo mensual legal vigente 2026 (Decreto del Gobierno Nacional).
export const SMMLV_2026 = 1_750_905;

export const IVA = 0.19;

export type PlanId = "gratis" | "basico" | "pro";

export interface Plan {
  id: PlanId;
  name: string;
  priceYear: number; // COP, IVA incluido
  description: string;
  stores: number;
  audits: string;
  features: { label: string; included: boolean }[];
  highlight?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "gratis",
    name: "Gratis",
    priceYear: 0,
    description: "Conoce tu nivel de riesgo en 30 segundos.",
    stores: 1,
    audits: "Escáneres flash ilimitados",
    features: [
      { label: "Escáner flash de 5 elementos básicos", included: true },
      { label: "Semáforo de riesgo y puntaje", included: true },
      { label: "Auditoría completa (Ley 1480, Decreto 587, Ley 1581)", included: false },
      { label: "Panel con hallazgos, evidencia y recomendaciones", included: false },
      { label: "Plantillas de corrección en Word", included: false },
      { label: "Soporte prioritario", included: false },
    ],
  },
  {
    id: "basico",
    name: "Básico",
    priceYear: 590_000,
    description: "Para la mipyme con una tienda virtual.",
    stores: 1,
    audits: "Hasta 12 auditorías completas al año",
    highlight: true,
    features: [
      { label: "Escáner flash de 5 elementos básicos", included: true },
      { label: "Semáforo de riesgo y puntaje", included: true },
      { label: "Auditoría completa (Ley 1480, Decreto 587, Ley 1581)", included: true },
      { label: "Panel con hallazgos, evidencia y recomendaciones", included: true },
      { label: "Plantillas de corrección en Word", included: true },
      { label: "Soporte prioritario", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceYear: 1_190_000,
    description: "Para negocios con varias tiendas o marcas.",
    stores: 3,
    audits: "Auditorías ilimitadas",
    features: [
      { label: "Escáner flash de 5 elementos básicos", included: true },
      { label: "Semáforo de riesgo y puntaje", included: true },
      { label: "Auditoría completa (Ley 1480, Decreto 587, Ley 1581)", included: true },
      { label: "Panel con hallazgos, evidencia y recomendaciones", included: true },
      { label: "Plantillas de corrección en Word", included: true },
      { label: "Soporte prioritario", included: true },
    ],
  },
];

export function getPlan(id: string | null | undefined): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function priceBreakdown(totalWithIva: number) {
  const subtotal = Math.round(totalWithIva / (1 + IVA));
  const iva = totalWithIva - subtotal;
  return { subtotal, iva, total: totalWithIva };
}

export function cop(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

export const BETA_GOAL = 100;

export function appUrl() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
