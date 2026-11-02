"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { Avatar } from "@/components/ui/avatar";
import { useSignOut } from "@/hooks/use-auth";

export type ShellUser = { name: string; email: string; role: "PARENT" | "DONOR" };

type NavItem = { href: string; label: string; mobileLabel?: string; badge?: number };

const TITLES: [string, string][] = [
  ["/app/overview", "Family overview"],
  ["/app/approvals", "Review projects"],
  ["/app/payouts", "Family payouts"],
  ["/app/children/new", "Add a child"],
  ["/app/children", "Child profile"],
  ["/app/circle", "Children I support"],
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
          { href: "/app/overview", label: "Overview", mobileLabel: "Home" },
          { href: "/app/approvals", label: "Review projects", mobileLabel: "Review", badge: pendingCount },
          { href: "/app/payouts", label: "Payouts" },
        ]
      : [{ href: "/app/circle", label: "Children I support", mobileLabel: "Families" }];

  const title =
    TITLES.find(([prefix]) => pathname.startsWith(prefix) && prefix !== "/app/children")?.[1] ??
    TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ??
    "FC-Junior";

  async function onSignOut() {
    await signOut.mutateAsync();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-white lg:pl-[264px]">
      {/* ── Sidebar (desktop) ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-stone-200 bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-stone-200 px-6">
          <Link href={user.role === "PARENT" ? "/app/overview" : "/app/circle"}>
            <Logo />
          </Link>
        </div>

        <nav className="flex-1 space-y-1.5 px-4 py-6">
          <p className="px-3 pb-2 text-xs font-semibold text-stone-500">
            {user.role === "PARENT" ? "Your family" : "Your family circles"}
          </p>
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3.5 py-3 text-[15px] font-semibold transition-colors",
                  active
                    ? "bg-taxi-50 text-taxi-900"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                )}
              >
                {item.label}
                {!!item.badge && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-flame-100 px-1.5 text-[11px] font-bold text-flame-800">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-stone-200 p-4">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar name={user.name} color={user.role === "PARENT" ? "amber" : "rose"} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-ink">{user.name}</p>
              <p className="truncate text-xs text-stone-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-stone-500 transition-colors hover:bg-stone-50 hover:text-stone-900"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Topbar ── */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-stone-200 bg-white/95 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <Link href={user.role === "PARENT" ? "/app/overview" : "/app/circle"} className="lg:hidden">
            <span className="font-display text-lg tracking-tight text-ink">
              FC-Junior<span className="ml-1 inline-block h-2.5 w-2.5 rounded-sm bg-taxi-400" />
            </span>
          </Link>
          <h1 className="hidden font-display text-lg font-semibold tracking-tight text-stone-800 sm:block">
            {title}
          </h1>
        </div>
        <span className="hidden rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-600 sm:inline-flex">
          {user.role === "PARENT" ? "Parent account" : "Family supporter"}
        </span>
      </header>

      {/* ── Content ── */}
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-8 sm:px-6 lg:pb-12 lg:pt-10">{children}</main>

      {/* ── Bottom nav (mobile) ── */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t border-stone-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgb(36_33_30_/_0.06)] backdrop-blur lg:hidden">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-3 text-[12px] font-semibold",
                active ? "bg-taxi-50 text-taxi-900" : "text-stone-500"
              )}
            >
              {item.mobileLabel ?? item.label}
              {!!item.badge && (
                <span className="absolute right-[16%] top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-flame-500 px-1 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
        <button
          onClick={onSignOut}
          className="flex flex-1 flex-col items-center justify-center py-3 text-[12px] font-semibold text-stone-500"
        >
          Sign out
        </button>
      </nav>
    </div>
  );
}
