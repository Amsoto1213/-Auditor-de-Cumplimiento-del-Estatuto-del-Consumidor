export type Risk = "alto" | "medio" | "bajo";
export type RuleStatus = "cumple" | "no_cumple" | "no_determinado";

export interface PageLink {
  href: string; // URL absoluta
  text: string;
  inFooter: boolean;
}

export interface FormField {
  type: string;
  name: string;
  checked: boolean;
  label: string;
}

export interface PageForm {
  action: string;
  text: string; // texto normalizado dentro del formulario
  fields: FormField[];
}

export interface PageData {
  url: string;
  title: string;
  text: string; // texto visible original (para evidencia)
  norm: string; // texto normalizado (minúsculas, sin tildes)
  links: PageLink[];
  forms: PageForm[];
  hasPrices: boolean;
}

export interface Finding {
  ruleId: string;
  status: RuleStatus;
  evidence: string;
  url?: string;
}

export interface AuditContext {
  pages: PageData[];
  allNorm: string;
}

export interface Rule {
  id: string;
  category: "Deber de información" | "Retracto y reversión" | "Cláusulas abusivas" | "Protección de datos";
  law: string; // norma y artículo
  title: string;
  description: string; // criterio verificable
  risk: Risk;
  explanation: string; // Legal Design: explicación en lenguaje sencillo
  recommendation: string;
  template?: "datos" | "terminos" | "retracto";
  verification: string; // cómo lo verifica el motor
  check: (ctx: AuditContext) => Omit<Finding, "ruleId">;
}

export interface AuditResult {
  url: string;
  platform: string;
  pagesScanned: { url: string; title: string }[];
  findings: Finding[];
  score: number;
  level: Risk;
  durationMs: number;
  robotsBlocked: string[];
  errors: string[];
}

export interface FlashItem {
  key: "privacidad" | "vendedor" | "pqrs" | "retracto" | "sic";
  label: string;
  present: boolean;
  evidence: string;
}

export interface FlashResult {
  url: string;
  platform: string;
  items: FlashItem[];
  score: number;
  level: Risk;
  findingsCount: number;
  pagesScanned: number;
  durationMs: number;
}
