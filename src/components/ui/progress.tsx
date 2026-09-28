import { cn } from "@/lib/utils";

export function Progress({
  value,
  max = 100,
  tone = "brand",
  className,
}: {
  value: number;
  max?: number;
  tone?: "brand" | "amber";
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-stone-100", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-500",
          tone === "brand" ? "bg-brand-600" : "bg-amber-400"
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
