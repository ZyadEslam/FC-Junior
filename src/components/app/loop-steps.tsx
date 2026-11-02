import { cn } from "@/lib/utils";

export interface LoopStep {
  label: string;
  done: boolean;
  /** @deprecated emoji removed — steps are numbered now */
  emoji?: string;
}

/** The weekly loop as a numbered neo-brutalist stepper. */
export function LoopSteps({
  steps,
  className,
  tone = "light",
}: {
  steps: LoopStep[];
  className?: string;
  tone?: "light" | "dark";
}) {
  const current = steps.findIndex((s) => !s.done);
  const activeIndex = current === -1 ? steps.length : current;
  const dark = tone === "dark";

  return (
    <ol className={cn("flex flex-wrap items-stretch gap-2", className)}>
      {steps.map((step, i) => {
        const done = step.done;
        const active = i === activeIndex;
        return (
          <li
            key={step.label}
            className={cn(
              "flex items-center gap-2.5 border-2 px-3 py-2",
              done
                ? dark
                  ? "border-taxi-400 bg-taxi-400/15 text-paper"
                  : "border-ink bg-taxi-400 text-ink"
                : active
                  ? "border-ink bg-flame-500 text-white shadow-hard-sm"
                  : dark
                    ? "border-paper/20 bg-transparent text-paper/40"
                    : "border-stone-300 bg-white text-stone-400"
            )}
          >
            <span className="font-display text-sm tabular-nums leading-none">
              {done ? "✓" : String(i + 1).padStart(2, "0")}
            </span>
            <span className="whitespace-nowrap text-[12px] font-extrabold uppercase tracking-tight">
              {step.label}
              {active && (
                <span className="ml-1.5 bg-ink px-1.5 py-0.5 text-[10px] text-taxi-400">
                  you&apos;re here
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
