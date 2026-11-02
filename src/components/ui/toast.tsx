"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Toast = {
  id: number;
  title: string;
  description?: string;
  variant: "success" | "error" | "info";
};

type ToastInput = Omit<Toast, "id">;

const ToastContext = createContext<{ push: (t: ToastInput) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <Providers>");
  return ctx;
}

const STRIP: Record<Toast["variant"], string> = {
  success: "border-taxi-400",
  error: "border-flame-500",
  info: "border-sky-400",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const push = useCallback((t: ToastInput) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4200);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex gap-3 rounded-xl border-2 border-ink bg-paper px-4 py-3 shadow-hard-sm animate-toast-in"
            )}
          >
            <span className={cn("w-1.5 self-stretch rounded-full border border-ink", STRIP[t.variant])} aria-hidden />
            <div className="min-w-0">
              <p className="text-sm font-extrabold uppercase tracking-tight text-ink">{t.title}</p>
              {t.description && <p className="mt-0.5 text-[13px] text-stone-600">{t.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
