import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { applyPaymentStatus, fetchWompiTransaction, getPayment } from "@/lib/payments";
import { cop, getPlan } from "@/lib/site";
import { TrackOnMount } from "@/components/Track";

export const metadata: Metadata = { title: "Resultado del pago", robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ ref?: string; id?: string }> }) {
  const sp = await searchParams;
  // Tolera "?ref=AL-...?id=123" y el regreso de Wompi solo con "?id=".
  let ref = (sp.ref ?? "").split("?")[0];
  const id = sp.id ?? (sp.ref?.includes("?id=") ? sp.ref.split("?id=")[1] : undefined);
  const u = await requireUser(`/pago/resultado?${ref ? `ref=${ref}` : `id=${id ?? ""}`}`);
  const tx = id ? await fetchWompiTransaction(id) : null;
  if (!ref && tx) ref = tx.reference;
  let p = await getPayment(ref);
  if (!p || p.userId !== u.id) notFound();

  // Confirmación por redirección: se consulta la transacción en el API de Wompi.
  if (p.status === "PENDING" && tx) {
    if (tx && tx.reference === p.reference && tx.amount_in_cents === p.amountInCents && tx.status !== "PENDING") {
      p = (await applyPaymentStatus(p.reference, tx.status, { transactionId: tx.id, method: tx.payment_method_type })) ?? p;
    }
  }

  const ok = p.status === "APPROVED";
  const pending = p.status === "PENDING";
  return (
    <div className="container-page flex justify-center py-16">
      <div className="card w-full max-w-lg p-8 text-center">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl text-white ${ok ? "bg-green-600" : pending ? "bg-amber-500" : "bg-red-600"}`}>
          {ok ? "✓" : pending ? "…" : "✕"}
        </div>
        {ok && <TrackOnMount name="purchase" onceKey={`purchase-${p.reference}`} params={{ transaction_id: p.reference, currency: "COP", value: p.total, tax: p.iva, plan: p.plan }} />}
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          {ok ? "¡Pago aprobado!" : pending ? "Pago en proceso" : "Pago no aprobado"}
        </h1>
        <p className="mt-2 text-slate-600">
          {ok
            ? `Su plan ${getPlan(p.plan)?.name} quedó activo por 12 meses. Ya puede ver el informe completo y descargar las plantillas.`
            : pending
              ? "Estamos esperando la confirmación de Wompi. Actualice esta página en unos segundos."
              : "La transacción fue rechazada. Puede intentarlo de nuevo con otro medio de pago."}
        </p>
        <dl className="mt-6 space-y-1 rounded-lg bg-slate-50 p-4 text-left text-sm">
          <div className="flex justify-between"><dt className="text-slate-500">Referencia</dt><dd className="font-mono">{p.reference}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">Plan</dt><dd>{getPlan(p.plan)?.name} anual</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">Total (IVA incluido)</dt><dd>{cop(p.total)}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">Estado</dt><dd className="font-semibold">{p.status}</dd></div>
          {p.method && <div className="flex justify-between"><dt className="text-slate-500">Medio</dt><dd>{p.method}</dd></div>}
        </dl>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {ok ? (
            <>
              <Link href="/panel/nueva" className="btn-primary">Hacer mi auditoría completa</Link>
              <Link href="/panel/plantillas" className="btn-secondary">Ir a plantillas</Link>
            </>
          ) : pending ? (
            <Link href={`/pago/resultado?ref=${p.reference}`} className="btn-primary">Actualizar</Link>
          ) : (
            <Link href={`/checkout?plan=${p.plan}`} className="btn-primary">Intentar de nuevo</Link>
          )}
        </div>
        <p className="mt-6 text-xs text-slate-500">Recuerde que puede ejercer el <Link href="/legal/retracto" className="underline">derecho de retracto</Link> dentro de los 5 días hábiles siguientes.</p>
      </div>
    </div>
  );
}
