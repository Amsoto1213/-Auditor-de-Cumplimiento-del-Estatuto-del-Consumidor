"use client";
import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Envía un evento de GA4 una sola vez al montar (p. ej. compra aprobada). */
export function TrackOnMount({ name, params, onceKey }: { name: string; params?: Record<string, string | number>; onceKey?: string }) {
  useEffect(() => {
    const fire = () => {
      try {
        if (onceKey && sessionStorage.getItem(onceKey)) return;
        if (typeof window.gtag !== "function") return;
        track(name, params);
        if (onceKey) sessionStorage.setItem(onceKey, "1");
      } catch {}
    };
    fire();
    const t = setTimeout(fire, 2500); // por si GA termina de cargar después
    return () => clearTimeout(t);
  }, [name, params, onceKey]);
  return null;
}
