import Link from "next/link";
import { ShieldCheck, Lock, EyeOff } from "lucide-react";
import { Logo } from "@/components/ui/logo";

/** Split-screen layout: form on the left, brand panel on the right. */
export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* form column */}
      <div className="flex w-full flex-col lg:w-[52%]">
        <div className="flex h-16 items-center px-6 sm:px-10">
          <Link href="/" aria-label="Giglet home">
            <Logo />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-16 sm:px-10">
          <div className="w-full max-w-[400px]">
            <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">{title}</h1>
            <p className="mt-1.5 text-sm text-stone-500">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>

      {/* brand panel */}
      <div className="relative hidden flex-1 overflow-hidden bg-stone-900 lg:block">
        <div className="dot-grid absolute inset-0 opacity-30" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-brand-300 ring-1 ring-inset ring-white/10">
            <ShieldCheck className="h-3.5 w-3.5" /> Family-gated by architecture
          </div>
          <div>
            <blockquote className="text-[26px] font-bold leading-snug text-white">
              “Maya checks her mission board before she checks YouTube now.
              Friday payout is basically a family holiday.”
            </blockquote>
            <p className="mt-4 text-sm font-medium text-stone-400">Laila H. — parent of two builders</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Lock, label: "Invite-only circles" },
              { icon: EyeOff, label: "No public profiles" },
              { icon: ShieldCheck, label: "Parent-approved posts" },
            ].map((f) => (
              <div key={f.label} className="rounded-xl bg-white/5 px-3.5 py-3 ring-1 ring-inset ring-white/10">
                <f.icon className="h-4 w-4 text-brand-400" />
                <p className="mt-2 text-xs font-semibold text-stone-200">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
