"use client";

import { cn } from "@/lib/utils";

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: string; description?: string }[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="grid grid-cols-2 gap-2 rounded-xl bg-stone-100 p-1.5"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-lg px-3 py-2.5 text-left transition-all",
              active ? "bg-white shadow-card ring-1 ring-stone-200" : "hover:bg-white/60"
            )}
          >
            <span className={cn("block text-sm font-semibold", active ? "text-stone-900" : "text-stone-600")}>
              {opt.label}
            </span>
            {opt.description && (
              <span className="mt-0.5 block text-xs text-stone-500">{opt.description}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
