import Link from "next/link";
import { Logo } from "./Logo";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="container-page flex justify-center py-12 sm:py-16">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex"><Logo className="h-12 w-12" /></Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-slate-600">{subtitle}</p>}
        </div>
        <div className="card p-6 sm:p-8">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-slate-600">{footer}</div>}
      </div>
    </div>
  );
}

export function DemoLink({ href }: { href?: string | number }) {
  if (!href) return null;
  return (
    <a href={String(href)} className="mt-3 block break-all rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm font-medium text-amber-900 underline">
      {String(href)}
    </a>
  );
}
