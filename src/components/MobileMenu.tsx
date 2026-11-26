"use client";
import Link from "next/link";
import { useState } from "react";

export function MobileMenu({ nav, loggedIn }: { nav: { href: string; label: string }[]; loggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
          {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      {open && (
        <div className="absolute inset-x-0 top-16 border-b border-slate-200 bg-white shadow-lg">
          <nav className="container-page flex flex-col gap-1 py-3" aria-label="Móvil">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 font-medium text-slate-700 hover:bg-slate-50">
                {n.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              {loggedIn ? (
                <Link href="/panel" onClick={() => setOpen(false)} className="btn-primary col-span-2">Mi panel</Link>
              ) : (
                <>
                  <Link href="/ingresar" onClick={() => setOpen(false)} className="btn-secondary">Ingresar</Link>
                  <Link href="/registro" onClick={() => setOpen(false)} className="btn-primary">Crear cuenta</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
