import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "amber" | "taxi";
type Size = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const BASE =
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-transparent font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-taxi-700 disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-white shadow-sm hover:bg-stone-800",
  taxi: "bg-taxi-400 text-ink shadow-sm hover:bg-taxi-300",
  amber: "bg-flame-500 text-white shadow-sm hover:bg-flame-600",
  secondary: "border-stone-200 bg-white text-stone-800 shadow-sm hover:bg-stone-50",
  outline: "border-stone-300 bg-white text-stone-800 hover:bg-stone-50",
  ghost: "bg-transparent text-stone-700 hover:bg-stone-100",
  danger: "bg-flame-600 text-white shadow-sm hover:bg-flame-700",
};

const sizes: Record<Size, string> = {
  sm: "h-11 px-5 text-[15px]",
  md: "h-12 px-6 text-base",
  lg: "h-14 px-8 text-[17px]",
  icon: "h-11 w-11",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", loading, disabled, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(BASE, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80"
        />
      )}
      {children}
    </button>
  );
});
