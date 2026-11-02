import { cn, initials } from "@/lib/utils";
import { avatarColorMeta } from "@/lib/labels";

export function Avatar({
  name,
  color = "emerald",
  size = "md",
  className,
}: {
  name: string;
  color?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const meta = avatarColorMeta[color] ?? avatarColorMeta.emerald;
  const sizes = {
    sm: "h-7 w-7 text-[10px]",
    md: "h-9 w-9 text-xs",
    lg: "h-11 w-11 text-sm",
    xl: "h-14 w-14 text-base",
  };
  return (
    <span
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full border-2 border-ink font-extrabold uppercase shadow-hard-xs",
        meta.bg,
        meta.text,
        sizes[size],
        className
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
