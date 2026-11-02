import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const baseField =
  "w-full rounded-xl border-2 border-ink bg-white px-4 text-[15px] text-ink placeholder:text-stone-400 " +
  "transition-all hover:shadow-hard-xs focus:border-ink focus:bg-taxi-50 focus:shadow-hard-xs focus:outline-none " +
  "disabled:cursor-not-allowed disabled:bg-stone-50";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(baseField, "h-12", className)} {...props} />;
  }
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(baseField, "min-h-[96px] py-2.5", className)} {...props} />;
  }
);

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("mb-1.5 block text-sm font-semibold text-ink", className)} {...props} />
  );
}

/** Label + control + inline error wrapper used across all forms. */
export function Field({
  label,
  error,
  hint,
  children,
  className,
  labelClassName,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
}) {
  return (
    <div className={className}>
      <Label className={labelClassName}>{label}</Label>
      {children}
      {error ? (
        <p className="mt-1.5 text-[13px] font-medium text-rose-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[13px] text-stone-500">{hint}</p>
      ) : null}
    </div>
  );
}
