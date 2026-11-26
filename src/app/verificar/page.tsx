import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { verifyEmailToken } from "@/app/actions/auth";

export const metadata: Metadata = { title: "Confirmar correo" };

export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const ok = token ? await verifyEmailToken(token) : false;
  if (ok) redirect("/ingresar?verificado=1");
  return (
    <AuthShell title="No pudimos confirmar su correo">
      <p className="text-sm text-slate-700">El enlace no es válido, ya fue usado o venció. Intente ingresar de nuevo para recibir un enlace nuevo.</p>
      <Link href="/ingresar" className="btn-primary mt-5 w-full">Ir a ingresar</Link>
    </AuthShell>
  );
}
