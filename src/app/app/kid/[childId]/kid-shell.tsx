"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye, ArrowLeft, Gamepad2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { Avatar } from "@/components/ui/avatar";

/** Kid workspace chrome — friendlier than the parent dashboard, still clean. */
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
    <div className="min-h-screen bg-stone-50">
      {/* parent preview ribbon */}
      <div className="bg-stone-900">
        <div className="mx-auto flex h-9 max-w-5xl items-center justify-between px-4 sm:px-6">
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-300">
            <Eye className="h-3.5 w-3.5" />
            Parent preview — this is what {child.firstName} sees
          </p>
          <Link
            href="/app/overview"
            className="inline-flex items-center gap-1 text-xs font-semibold text-white hover:text-brand-300"
          >
            <ArrowLeft className="h-3 w-3" /> Exit kid mode
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href={homeHref} className="flex items-center gap-3">
            <Logo size="sm" withWordmark={false} />
            <span className="text-[15px] font-bold text-stone-900">
              {child.firstName}&apos;s mission board
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href={homeHref}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                pathname === homeHref
                  ? "bg-brand-50 text-brand-800"
                  : "text-stone-500 hover:bg-stone-100"
              )}
            >
              <Gamepad2 className="h-4 w-4" /> Missions
            </Link>
            <span className="ml-1 hidden items-center gap-2 rounded-full bg-stone-100 py-1 pl-1 pr-3 sm:inline-flex">
              <Avatar name={child.firstName} color={child.avatarColor} size="sm" />
              <span className="text-xs font-bold text-stone-700">{child.firstName}</span>
            </span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6">{children}</main>
    </div>
  );
}
