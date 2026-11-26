import { SITE } from "@/lib/site";

export function LegalPage({ title, updated = "26 de noviembre de 2026", children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">{SITE.legalName} · NIT {SITE.nit} · Última actualización: {updated}</p>
      <article className="prose-legal card mt-8 p-6 sm:p-10">{children}</article>
    </div>
  );
}

export const siteCompany = {
  legalName: SITE.legalName,
  nit: SITE.nit,
  address: SITE.address,
  city: "Cartagena de Indias",
  phone: SITE.phone,
  email: SITE.email,
  storeUrl: "este sitio web",
};
