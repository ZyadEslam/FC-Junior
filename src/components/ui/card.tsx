import { cn } from "@/lib/utils";

export function Card({
  className,
  shadow = "sm",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { shadow?: "none" | "sm" | "md" }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-stone-200 bg-white",
        shadow === "sm" && "shadow-sm",
        shadow === "md" && "shadow-md",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3 border-b border-stone-200 px-5 py-4", className)}>
      <div>
        <h3 className="font-display text-[17px] tracking-tight text-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[13px] text-stone-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}
