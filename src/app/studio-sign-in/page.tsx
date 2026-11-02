"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { childSignInSchema } from "@/lib/validation";
import { useChildSignIn } from "@/hooks/use-auth";
import { apiErrorMessage } from "@/lib/api-client";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export default function StudioSignInPage() {
  const router = useRouter();
  const signIn = useChildSignIn();
  const [studioCode, setStudioCode] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = childSignInSchema.safeParse({ studioCode, pin });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Check your details.");
    try {
      const result = await signIn.mutateAsync(parsed.data);
      router.push(`/app/kid/${result.childId}`);
      router.refresh();
    } catch (err) { setError(apiErrorMessage(err)); }
  }

  return <AuthShell title="Open your studio" subtitle="Use the Studio Code and PIN your grown-up created for you.">
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label="Studio Code"><Input value={studioCode} onChange={(e) => setStudioCode(e.target.value.toUpperCase())} placeholder="ABC123" maxLength={6} autoCapitalize="characters" /></Field>
      <Field label="PIN"><Input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="••••" maxLength={8} /></Field>
      {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>}
      <Button type="submit" className="w-full" loading={signIn.isPending}>Open my studio</Button>
      <p className="text-center text-sm text-stone-500">Grown-up? <Link href="/sign-in" className="font-semibold text-taxi-700">Sign in here</Link></p>
    </form>
  </AuthShell>;
}
