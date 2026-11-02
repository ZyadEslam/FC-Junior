import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  tone = "stone",
}: {
  /** @deprecated icon removed */
  icon?: unknown;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: "stone" | "brand" | "amber" | "rose";
}) {
  const accents: Record<string, string> = {
    stone: "bg-stone-400",
    brand: "bg-taxi-500",
    amber: "bg-flame-500",
    rose: "bg-flame-400",
  };
  return (
    <div className="rounded-2xl border border-stone-200 bg-white px-5 py-5 shadow-sm">
      <p className="flex items-center gap-2 text-sm font-semibold text-stone-600">
        <span className={cn("h-2.5 w-2.5 rounded-full", accents[tone])} aria-hidden />
        {label}
      </p>
      <p className="mt-2 truncate font-display text-[30px] tabular-nums leading-none tracking-tight text-ink">
        {value}
      </p>
      {sub && <p className="mt-1.5 text-[13px] font-medium text-stone-500">{sub}</p>}
    </div>
  );
}
