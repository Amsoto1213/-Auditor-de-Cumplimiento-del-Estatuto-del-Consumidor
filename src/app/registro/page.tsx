import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/AuthShell";
import { RegisterForm } from "@/components/forms/RegisterForm";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function Page({ searchParams }: { searchParams: Promise<{ url?: string }> }) {
  const { url } = await searchParams;
  return (
    <AuthShell
      title="Cree su cuenta gratis"
      subtitle="Acceda a su panel, active el informe completo y descargue las plantillas de corrección."
      footer={<>¿Ya tiene cuenta? <Link href="/ingresar" className="font-semibold text-brand-600">Ingresar</Link></>}
    >
      <RegisterForm storeUrl={url?.slice(0, 200)} />
    </AuthShell>
  );
}
