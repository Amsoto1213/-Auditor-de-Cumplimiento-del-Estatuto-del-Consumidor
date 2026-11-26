import Link from "next/link";

export function UpgradeCard({ title = "Desbloquee el informe completo", text }: { title?: string; text?: string }) {
  return (
    <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-6">
      <p className="text-lg font-bold text-slate-900">🔒 {title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {text ?? "Con el plan Básico o Pro obtiene la auditoría completa de hasta 20 páginas, el panel con todos los hallazgos, evidencia y recomendaciones, y las tres plantillas de corrección en Word."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/checkout?plan=basico" className="btn-primary">Activar plan Básico</Link>
        <Link href="/precios" className="btn-secondary">Comparar planes</Link>
      </div>
    </div>
  );
}
