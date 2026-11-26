import { PanelNav } from "@/components/PanelNav";
import { requireUser, hasPaidPlan } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import { getPlan } from "@/lib/site";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const u = await requireUser();
  const paid = hasPaidPlan(u);
  return (
    <div className="container-page grid gap-6 py-8 lg:grid-cols-[230px_1fr]">
      <aside className="space-y-4">
        <div className="card p-4">
          <p className="truncate text-sm font-semibold text-slate-900">{u.name}</p>
          <p className="truncate text-xs text-slate-500">{u.email}</p>
          <p className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${paid ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"}`}>
            Plan {getPlan(paid ? u.plan : "gratis")?.name}
          </p>
        </div>
        <PanelNav />
        <form action={logout}>
          <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-100">↩ Cerrar sesión</button>
        </form>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
