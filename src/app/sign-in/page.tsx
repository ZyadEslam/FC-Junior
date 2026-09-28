"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signInSchema } from "@/lib/validation";
import { useSignIn } from "@/hooks/use-auth";
import { apiErrorMessage } from "@/lib/api-client";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const signIn = useSignIn();

  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const next = params.get("next");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[issue.path[0] as string] = issue.message;
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    try {
      const { role } = await signIn.mutateAsync(parsed.data);
      router.push(next || (role === "PARENT" ? "/app/overview" : "/app/circle"));
      router.refresh();
    } catch (err) {
      setFormError(apiErrorMessage(err));
    }
  }

  function fillDemo(kind: "parent" | "donor") {
    setEmail(kind === "parent" ? "demo@giglet.app" : "grandma@giglet.app");
    setPassword("demo1234");
    setFormError(null);
    setFieldErrors({});
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Field label="Email" error={fieldErrors.email}>
        <Input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Field label="Password" error={fieldErrors.password}>
        <Input
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>

      {formError && (
        <div className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-[13px] font-medium text-rose-700 ring-1 ring-inset ring-rose-200">
          {formError}
        </div>
      )}

      <Button type="submit" className="w-full" loading={signIn.isPending}>
        Sign in
      </Button>

      {/* demo shortcuts */}
      <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-3.5">
        <p className="text-xs font-semibold text-stone-500">Explore the demo — one click:</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => fillDemo("parent")}>
            Parent demo
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => fillDemo("donor")}>
            Family demo
          </Button>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-stone-400">
          Parent: Laila (kids Maya &amp; Adam) · Family: Grandma Rose (Maya&apos;s circle).
          Password demo1234 fills automatically.
        </p>
      </div>

      <p className="text-center text-sm text-stone-500">
        New to Giglet?{" "}
        <Link href="/sign-up" className="font-semibold text-brand-700 hover:text-brand-800">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export default function SignInPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your family workspace.">
      <Suspense>
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}
