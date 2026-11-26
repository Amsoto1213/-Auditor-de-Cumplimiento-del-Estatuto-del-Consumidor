import type { Metadata } from "next";
import { AuthShell } from "@/components/AuthShell";
import { ResetPasswordForm } from "@/components/forms/ResetForms";

export const metadata: Metadata = { title: "Nueva contraseña" };

export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <AuthShell title="Cree una nueva contraseña">
      <ResetPasswordForm token={token ?? ""} />
    </AuthShell>
  );
}
