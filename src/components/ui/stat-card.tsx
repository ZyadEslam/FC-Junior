import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./card";

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "stone",
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: "stone" | "brand" | "amber" | "rose";
}) {
  const tones: Record<string, string> = {
    stone: "bg-stone-100 text-stone-600",
    brand: "bg-brand-50 text-brand-700",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };
  return (
    <Card className="px-5 py-4">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-stone-500">{label}</p>
          <p className="truncate text-xl font-bold tabular-nums text-stone-900">{value}</p>
        </div>
      </div>
      {sub && <p className="mt-2 text-[13px] text-stone-500">{sub}</p>}
    </Card>
  );
}
