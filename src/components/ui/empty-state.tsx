import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-[15px] font-semibold text-stone-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-stone-500">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
