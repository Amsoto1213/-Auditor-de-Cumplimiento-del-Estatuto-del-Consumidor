"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/panel", label: "Resumen", icon: "🏠" },
  { href: "/panel/nueva", label: "Nueva auditoría", icon: "🔎" },
  { href: "/panel/plantillas", label: "Empresa y plantillas", icon: "📄" },
  { href: "/panel/plan", label: "Plan y pagos", icon: "💳" },
];

export function PanelNav() {
  const path = usePathname();
  return (
    <nav aria-label="Panel" className="flex gap-1 relative overflow-x-auto lg:flex-col">
      {ITEMS.map((i) => {
        const active = i.href === "/panel" ? path === "/panel" : path.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${active ? "bg-brand-600 text-white" : "text-slate-700 hover:bg-slate-100"}`}
          >
            <span aria-hidden="true">{i.icon}</span>
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
