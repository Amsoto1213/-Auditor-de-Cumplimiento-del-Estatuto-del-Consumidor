import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { POSTS } from "@/lib/blog";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = POSTS.find((x) => x.slug === slug);
  return p ? { title: p.title, description: p.excerpt } : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = POSTS.find((x) => x.slug === slug);
  if (!p) notFound();
  return (
    <div className="container-page max-w-3xl py-12">
      <Link href="/blog" className="text-sm text-brand-600">← Blog</Link>
      <h1 className="mt-3 text-3xl font-bold text-slate-900">{p.title}</h1>
      <p className="mt-2 text-sm text-slate-500">{new Date(p.date).toLocaleDateString("es-CO", { dateStyle: "long", timeZone: "UTC" })} · {p.minutes} min de lectura</p>
      <article className="prose-legal mt-8">
        {p.body.map((b, i) =>
          b.h ? <h2 key={i}>{b.h}</h2> : b.p ? <p key={i}>{b.p}</p> : <ul key={i}>{b.li?.map((x) => <li key={x}>{x}</li>)}</ul>,
        )}
      </article>
      <div className="mt-10 rounded-2xl bg-brand-50 p-6 text-center">
        <p className="font-semibold text-slate-900">¿Su tienda cumple? Descúbralo gratis en 30 segundos.</p>
        <Link href="/#escaner" className="btn-primary mt-4">Escanear mi tienda</Link>
      </div>
    </div>
  );
}
