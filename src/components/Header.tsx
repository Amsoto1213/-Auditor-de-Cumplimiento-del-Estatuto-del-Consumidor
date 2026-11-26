import Link from "next/link";
import { Logo } from "./Logo";
import { currentUser } from "@/lib/auth";
import { SITE } from "@/lib/site";
import { MobileMenu } from "./MobileMenu";

const NAV = [
  { href: "/#escaner", label: "Escáner gratis" },
  { href: "/precios", label: "Precios" },
  { href: "/normativa", label: "Normativa" },
  { href: "/blog", label: "Blog" },
  { href: "/aliados", label: "Aliados" },
];

export async function Header() {
  const user = await currentUser();
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
          <Logo />
          <span className="text-lg">{SITE.name}</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex" aria-label="Principal">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-brand-600">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              {user.role === "admin" && (
                <Link href="/admin" className="btn-secondary !py-2">Admin</Link>
              )}
              <Link href="/panel" className="btn-primary !py-2">Mi panel</Link>
            </>
          ) : (
            <>
              <Link href="/ingresar" className="btn-secondary !py-2">Ingresar</Link>
              <Link href="/registro" className="btn-primary !py-2">Crear cuenta</Link>
            </>
          )}
        </div>
        <MobileMenu nav={NAV} loggedIn={Boolean(user)} />
      </div>
    </header>
  );
}
