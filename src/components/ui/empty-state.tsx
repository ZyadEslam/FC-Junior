import { cn } from "@/lib/utils";

export function EmptyState({
  eyebrow,
  title,
  body,
  action,
  className,
}: {
  /** optional small uppercase label replacing the old icon */
  eyebrow?: string;
  /** @deprecated icon removed — pass eyebrow instead */
  icon?: unknown;
  title: string;
  body: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("dot-grid flex flex-col items-center justify-center px-6 py-12 text-center", className)}>
      {eyebrow && (
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-flame-600">{eyebrow}</p>
      )}
      <h3 className={cn("font-display text-xl tracking-tight text-ink", eyebrow ? "mt-2" : "")}>
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone-600">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
