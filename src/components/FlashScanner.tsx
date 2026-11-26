"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FlashResult } from "@/lib/audit/types";
import { RISK_STYLE, ScoreRing, TrafficLight } from "./Risk";

const STEPS = [
  "Conectando con su tienda…",
  "Leyendo la página de inicio y el pie de página…",
  "Buscando la política de datos y el aviso de privacidad…",
  "Verificando datos del vendedor y canal de PQRS…",
  "Revisando el derecho de retracto y el enlace a la SIC…",
  "Calculando su nivel de riesgo…",
];

function validUrl(v: string) {
  const s = v.trim();
  if (!s) return "Escriba la dirección de su tienda.";
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(u.hostname)) return "Escriba un dominio válido, por ejemplo: mitienda.com.co";
    return null;
  } catch {
    return "Escriba una dirección válida, por ejemplo: mitienda.com.co";
  }
}

export function FlashScanner({ compact = false }: { compact?: boolean }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<(FlashResult & { id: string }) | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const problem = validUrl(url);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    setStep(0);
    setElapsed(0);
    const t0 = Date.now();
    timer.current = setInterval(() => {
      const s = (Date.now() - t0) / 1000;
      setElapsed(s);
      setStep(Math.min(STEPS.length - 1, Math.floor(s / 3)));
    }, 250);
    const ctrl = new AbortController();
    const kill = setTimeout(() => ctrl.abort(), 30_000);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
        signal: ctrl.signal,
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No fue posible analizar el sitio.");
      else setResult(json);
    } catch {
      setError("El análisis superó los 30 segundos. Es posible que el sitio sea lento o bloquee el rastreo automático. Intente de nuevo.");
    } finally {
      clearTimeout(kill);
      if (timer.current) clearInterval(timer.current);
      setLoading(false);
    }
  }

  return (
    <div className={compact ? "" : "card p-5 sm:p-7"}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="scan-url" className="sr-only">Dirección de su tienda virtual</label>
        <input
          id="scan-url"
          className="input flex-1"
          inputMode="url"
          autoComplete="url"
          placeholder="mitienda.com.co"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby="scan-help"
          disabled={loading}
        />
        <button className="btn-primary sm:w-56" disabled={loading}>
          {loading ? "Analizando…" : "Escanear gratis"}
        </button>
      </form>
      <p id="scan-help" className="mt-2 text-xs text-slate-500">
        Sin registro. Revisamos 5 elementos básicos en menos de 30 segundos. Funciona con Shopify, WooCommerce, Tiendanube y sitios propios.
      </p>

      {loading && (
        <div className="mt-6" aria-live="polite">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">{STEPS[step]}</span>
            <span className="tabular-nums text-slate-500">{elapsed.toFixed(0)} s</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-brand-600 transition-all duration-300" style={{ width: `${Math.min(95, (elapsed / 20) * 100)}%` }} />
          </div>
        </div>
      )}

      {error && (
        <div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {result && <FlashResultView r={result} />}
    </div>
  );
}

function FlashResultView({ r }: { r: FlashResult & { id: string } }) {
  const s = RISK_STYLE[r.level];
  const missing = r.items.filter((i) => !i.present).length;
  return (
    <div className="mt-6 border-t border-slate-200 pt-6" aria-live="polite">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <TrafficLight level={r.level} />
        <ScoreRing score={r.score} level={r.level} />
        <div className="text-center sm:text-left">
          <p className={`text-2xl font-bold ${s.text}`}>{s.label}</p>
          <p className="mt-1 text-sm text-slate-600 break-all">{r.url}</p>
          <p className="mt-2 text-sm text-slate-700">
            <strong>{missing}</strong> de 5 elementos básicos ausentes · <strong>{r.findingsCount}</strong> posibles incumplimientos detectados en total
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Plataforma: {r.platform} · {r.pagesScanned} páginas leídas · {(r.durationMs / 1000).toFixed(1)} s
          </p>
        </div>
      </div>

      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {r.items.map((i) => (
          <li key={i.key} className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${i.present ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
            <span aria-hidden="true" className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${i.present ? "bg-green-600" : "bg-red-600"}`}>
              {i.present ? "✓" : "✕"}
            </span>
            <span>
              <span className="font-medium text-slate-900">{i.label}</span>
              <span className={`block text-xs ${i.present ? "text-green-700" : "text-red-700"}`}>{i.present ? "Presente" : "Ausente"}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-xl bg-brand-50 p-5 sm:flex-row">
        <p className="text-sm text-slate-700">
          El informe completo revisa <strong>21 reglas</strong> de la Ley 1480, el Decreto 587 y la Ley 1581, con evidencia, explicación sencilla y plantillas para corregir cada hallazgo.
        </p>
        <Link href={`/registro?url=${encodeURIComponent(r.url)}`} className="btn-primary shrink-0">
          Ver informe completo
        </Link>
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">
        Resultado orientativo generado automáticamente. No reemplaza la asesoría jurídica profesional.
      </p>
    </div>
  );
}
