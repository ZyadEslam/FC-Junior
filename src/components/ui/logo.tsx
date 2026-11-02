import { cn } from "@/lib/utils";

/** Wordmark: black lowercase + taxi-yellow block period. */
export function Logo({
  className,
  size = "md",
  dark = false,
}: {
  className?: string;
  withWordmark?: boolean; // kept for call-site compatibility, ignored
  size?: "sm" | "md" | "lg";
  dark?: boolean;
}) {
  const text = size === "sm" ? "text-xl" : size === "lg" ? "text-[30px]" : "text-[24px]";
  return (
    <span
      className={cn(
        "font-display leading-none tracking-tight",
        text,
        dark ? "text-paper" : "text-ink",
        className
      )}
    >
      <span className="whitespace-nowrap">FC-Junior</span>
      <span className="ml-1 inline-block h-[0.5em] w-[0.5em] border-2 border-ink bg-taxi-400" aria-hidden />
    </span>
  );
}
