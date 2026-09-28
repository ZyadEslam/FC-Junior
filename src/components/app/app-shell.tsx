"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardCheck,
  Wallet,
  HeartHandshake,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useSignOut } from "@/hooks/use-auth";

export type ShellUser = { name: string; email: string; role: "PARENT" | "DONOR" };

type NavItem = { href: string; label: string; icon: React.ElementType; badge?: number };

const TITLES: [string, string][] = [
  ["/app/overview", "Overview"],
  ["/app/approvals", "Review queue"],
  ["/app/payouts", "Payouts"],
  ["/app/children/new", "Add a child"],
  ["/app/children", "Child profile"],
  ["/app/circle", "My circle"],
];

export function AppShell({
  user,
  pendingCount,
  children,
}: {
  user: ShellUser;
  pendingCount: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const signOut = useSignOut();

  const nav: NavItem[] =
    user.role === "PARENT"
      ? [
          { href: "/app/overview", label: "Overview", icon: LayoutDashboard },
          { href: "/app/approvals", label: "Review queue", icon: ClipboardCheck, badge: pendingCount },
          { href: "/app/payouts", label: "Payouts", icon: Wallet },
        ]
      : [{ href: "/app/circle", label: "My circle", icon: HeartHandshake }];

  const title =
    TITLES.find(([prefix]) => pathname.startsWith(prefix) && prefix !== "/app/children")?.[1] ??
    TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ??
    "Giglet";

  async function onSignOut() {
    await signOut.mutateAsync();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-stone-50 lg:pl-[248px]">
      {/* ── Sidebar (desktop) ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-stone-200 bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-stone-100 px-5">
          <Link href={user.role === "PARENT" ? "/app/overview" : "/app/circle"}>
            <Logo />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-stone-400">
            {user.role === "PARENT" ? "Family workspace" : "Supporter workspace"}
          </p>
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/app/overview" && item.href !== "/app/circle" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-50 text-brand-800"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                )}
              >
                <item.icon className={cn("h-[18px] w-[18px]", active ? "text-brand-700" : "text-stone-400")} />
                <span className="flex-1">{item.label}</span>
                {!!item.badge && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-100 px-1.5 text-[11px] font-bold text-amber-800">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-stone-100 p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <Avatar name={user.name} color={user.role === "PARENT" ? "indigo" : "rose"} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-stone-900">{user.name}</p>
              <p className="truncate text-xs text-stone-400">{user.email}</p>
            </div>
            <button
              onClick={onSignOut}
              title="Sign out"
              className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Topbar ── */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-stone-200 bg-white/85 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/app/overview" className="lg:hidden">
            <Logo size="sm" withWordmark={false} />
          </Link>
          <h1 className="text-[17px] font-bold tracking-tight text-stone-900">{title}</h1>
        </div>
        <Badge className="bg-stone-100 text-stone-600 ring-stone-200">
          {user.role === "PARENT" ? "Parent account" : "Family supporter"}
        </Badge>
      </header>

      {/* ── Content ── */}
      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6 lg:pb-10">{children}</main>

      {/* ── Bottom nav (mobile) ── */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold",
                active ? "text-brand-700" : "text-stone-400"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
              {!!item.badge && (
                <span className="absolute right-[22%] top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-amber-950">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
        <button
          onClick={onSignOut}
          className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold text-stone-400"
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </button>
      </nav>
    </div>
  );
}
