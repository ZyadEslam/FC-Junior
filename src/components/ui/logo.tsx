import { cn } from "@/lib/utils";

export function Logo({
  className,
  withWordmark = true,
  size = "md",
}: {
  className?: string;
  withWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const box = size === "sm" ? "h-7 w-7 rounded-lg" : size === "lg" ? "h-11 w-11 rounded-xl" : "h-8 w-8 rounded-lg";
  const icon = size === "sm" ? 15 : size === "lg" ? 24 : 18;
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className={cn("flex items-center justify-center bg-brand-600 text-white shadow-sm", box)}>
        <svg width={icon} height={icon} viewBox="0 0 32 32" fill="none" aria-hidden>
          <path
            d="M16 24c0-6 2-9 8-11-1 6-3 9-8 11zm0 0c0-6-2-9-8-11 1 6 3 9 8 11zm0 2v-6"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {withWordmark && (
        <span className={cn("font-bold tracking-tight text-stone-900", size === "lg" ? "text-xl" : "text-[17px]")}>
          Giglet
        </span>
      )}
    </span>
  );
}
