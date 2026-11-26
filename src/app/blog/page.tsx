import Link from "next/link";
import type { Metadata } from "next";
import { POSTS } from "@/lib/blog";

export const metadata: Metadata = { title: "Blog y guías", description: "Guías prácticas sobre el Estatuto del Consumidor, la Ley 1581 y las sanciones de la SIC para tiendas virtuales." };

export default function Page() {
  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold text-slate-900">Blog y guías</h1>
      <p className="mt-2 text-slate-600">Regulación del comercio electrónico en Colombia, explicada en lenguaje sencillo.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {POSTS.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="card flex flex-col p-6 transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-xs text-slate-500">{new Date(p.date).toLocaleDateString("es-CO", { dateStyle: "long", timeZone: "UTC" })} · {p.minutes} min de lectura</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">{p.title}</h2>
            <p className="mt-2 flex-1 text-sm text-slate-600">{p.excerpt}</p>
            <span className="mt-4 text-sm font-semibold text-brand-600">Leer guía →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
