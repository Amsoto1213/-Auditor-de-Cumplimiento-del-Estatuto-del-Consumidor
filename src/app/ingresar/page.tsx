import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata: Metadata = { title: "Ingresar" };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string; verificado?: string }> }) {
  const { next, verificado } = await searchParams;
  return (
    <AuthShell
      title="Ingrese a su cuenta"
      footer={<>¿No tiene cuenta? <Link href="/registro" className="font-semibold text-brand-600">Cree una gratis</Link></>}
    >
      <LoginForm next={next} notice={verificado ? "Su correo fue confirmado. Ya puede ingresar." : undefined} />
    </AuthShell>
  );
}
