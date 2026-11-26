"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const STEPS = [
  "Validando la dirección y revisando robots.txt…",
  "Rastreando la página de inicio…",
  "Buscando páginas de productos, carrito y checkout…",
  "Leyendo términos, políticas de privacidad, envíos y devoluciones…",
  "Verificando el deber de información (Ley 1480)…",
  "Verificando retracto y reversión del pago (Decreto 587)…",
  "Revisando formularios y autorizaciones (Ley 1581)…",
  "Buscando cláusulas abusivas…",
  "Calculando puntaje y semáforo de riesgo…",
];

export function AuditRunner({ defaultUrl }: { defaultUrl?: string }) {
  const router = useRouter();
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return setError("Escriba la dirección de su tienda.");
    setError(null);
    setLoading(true);
    const t0 = Date.now();
    timer.current = setInterval(() => setElapsed((Date.now() - t0) / 1000), 250);
    try {
      const res = await fetch("/api/audits", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url }) });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "No fue posible completar la auditoría.");
        setLoading(false);
      } else {
        router.push(`/panel/auditoria/${json.id}`);
        router.refresh();
      }
    } catch {
      setError("Se perdió la conexión durante la auditoría. Intente de nuevo.");
      setLoading(false);
    } finally {
      if (timer.current) clearInterval(timer.current);
    }
  }

  const step = Math.min(STEPS.length - 1, Math.floor(elapsed / 5));
  return (
    <div className="card p-6">
      <form onSubmit={run} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="audit-url" className="sr-only">URL de la tienda</label>
        <input id="audit-url" className="input flex-1" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="mitienda.com.co" disabled={loading} inputMode="url" />
        <button className="btn-primary sm:w-52" disabled={loading}>{loading ? "Auditando…" : "Iniciar auditoría"}</button>
      </form>
      {loading && (
        <div className="mt-6" aria-live="polite">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-slate-700">{STEPS[step]}</span>
            <span className="tabular-nums text-slate-500">{elapsed.toFixed(0)} s</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${Math.min(95, (elapsed / 45) * 100)}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">Rastreamos hasta 20 páginas con pausas entre peticiones para no sobrecargar su tienda. Puede tardar hasta un minuto.</p>
        </div>
      )}
      {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    </div>
  );
}
