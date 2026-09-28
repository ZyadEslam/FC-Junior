"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signUpSchema } from "@/lib/validation";
import { useSignUp } from "@/hooks/use-auth";
import { apiErrorMessage } from "@/lib/api-client";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented";

function SignUpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const signUp = useSignUp();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"PARENT" | "DONOR">(
    params.get("role") === "donor" ? "DONOR" : "PARENT"
  );
  const [inviteCode, setInviteCode] = useState(params.get("code") ?? "");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const parsed = signUpSchema.safeParse({
      name,
      email,
      password,
      role,
      inviteCode: inviteCode || undefined,
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[issue.path[0] as string] = issue.message;
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    try {
      await signUp.mutateAsync(parsed.data);
      router.push(parsed.data.role === "PARENT" ? "/app/overview?welcome=1" : "/app/circle?welcome=1");
      router.refresh();
    } catch (err) {
      setFormError(apiErrorMessage(err));
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <span className="mb-1.5 block text-[13px] font-medium text-stone-700">I am a…</span>
        <SegmentedControl
          ariaLabel="Account type"
          value={role}
          onChange={setRole}
          options={[
            { value: "PARENT", label: "Parent", description: "I manage my kids' missions & earnings" },
            { value: "DONOR", label: "Family supporter", description: "I was invited to cheer on a kid" },
          ]}
        />
      </div>

      <Field label="Full name" error={fieldErrors.name}>
        <Input
          autoComplete="name"
          placeholder={role === "DONOR" ? "Rose Mahmoud" : "Laila Hassan"}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>

      <Field label="Email" error={fieldErrors.email}>
        <Input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>

      <Field label="Password" error={fieldErrors.password} hint="At least 8 characters.">
        <Input
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>

      {role === "DONOR" && (
        <Field
          label="Invite code"
          error={fieldErrors.inviteCode}
          hint="From the family invite link. You can also add it later."
        >
          <Input
            placeholder="e.g. MAYA-FAM-26"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />
        </Field>
      )}

      {formError && (
        <div className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-[13px] font-medium text-rose-700 ring-1 ring-inset ring-rose-200">
          {formError}
        </div>
      )}

      <Button type="submit" className="w-full" loading={signUp.isPending}>
        {role === "PARENT" ? "Create family account" : "Join as supporter"}
      </Button>

      <p className="text-[12px] leading-snug text-stone-400">
        By continuing you agree that children&apos;s profiles are custodial — created and
        managed by a parent — and that circles stay invite-only.
      </p>

      <p className="text-center text-sm text-stone-500">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-brand-700 hover:text-brand-800">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Two minutes now, a habit that lasts for years."
    >
      <Suspense>
        <SignUpForm />
      </Suspense>
    </AuthShell>
  );
}
