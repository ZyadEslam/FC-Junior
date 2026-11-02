import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/admin");
  if (user.role !== "ADMIN") redirect("/app");

  return (
    <div className="min-h-screen bg-[#1A1814] text-stone-100">
      <header className="sticky top-0 z-30 border-b-2 border-black bg-[#1A1814]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <span className="font-display text-xl tracking-tight text-white">
              FC-Junior <span className="text-taxi-400">Ops</span>
            </span>
            <span className="rounded-md border-2 border-flame-500 bg-flame-500/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-flame-400">
              Internal
            </span>
          </div>
          <nav className="flex items-center gap-1 text-sm font-bold">
            <Link href="/admin" className="rounded-lg px-3 py-1.5 text-stone-300 transition-colors hover:bg-white/10 hover:text-white">
              Overview
            </Link>
            <Link href="/admin/revenue" className="rounded-lg px-3 py-1.5 text-stone-300 transition-colors hover:bg-white/10 hover:text-white">
              Revenue
            </Link>
            <Link href="/admin/challenges" className="rounded-lg px-3 py-1.5 text-stone-300 transition-colors hover:bg-white/10 hover:text-white">
              Challenges
            </Link>
            <span className="mx-2 h-4 w-px bg-white/20" aria-hidden />
            <span className="text-xs font-semibold text-stone-500">{user.name}</span>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
