"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { Avatar } from "@/components/ui/avatar";

/** A focused studio workspace for young makers. */
export function KidShell({
  child,
  children,
}: {
  child: { id: string; firstName: string; avatarColor: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const homeHref = `/app/kid/${child.id}`;

  return (
    <div className="min-h-screen bg-[#f8f7f4]">

      <header className="sticky top-0 z-20 border-b border-stone-200 bg-[#f8f7f4]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href={homeHref} className="flex items-center gap-3">
            <Logo size="sm" withWordmark={false} />
            <span className="hidden font-display text-[17px] font-bold text-stone-900 min-[440px]:inline">
              {child.firstName}&apos;s studio
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href={homeHref}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-bold transition-colors",
                pathname === homeHref
                  ? "bg-taxi-600 text-white shadow-sm"
                  : "text-stone-500 hover:bg-stone-100"
              )}
            >
              Studio
            </Link>
            <span className="ml-1 hidden items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 ring-1 ring-stone-200 sm:inline-flex">
              <Avatar name={child.firstName} color={child.avatarColor} size="sm" />
              <span className="text-xs font-extrabold text-stone-700">{child.firstName}</span>
            </span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6">{children}</main>
    </div>
  );
}
