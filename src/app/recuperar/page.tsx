import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/AuthShell";
import { RequestResetForm } from "@/components/forms/ResetForms";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function Page() {
  return (
    <AuthShell title="Recupere su contraseña" subtitle="Le enviaremos un enlace para crear una nueva." footer={<Link href="/ingresar" className="font-semibold text-brand-600">Volver a ingresar</Link>}>
      <RequestResetForm />
    </AuthShell>
  );
}
