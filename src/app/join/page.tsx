"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInvitePreview } from "@/hooks/use-invites";
import { Logo } from "@/components/ui/logo";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ageBandLabel } from "@/lib/labels";

function JoinInner() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const trimmed = code.trim().toUpperCase();
  const { data, isFetching, isError } = useInvitePreview(trimmed, trimmed.length >= 6);

  return (
    <AuthShell
      title="Join a kid's fan club"
      tagline="Your family sent you an invite code — it looks something like MAYA-FAM-26. That's your ticket to the front row."
      footnote={
        <p>
          No code? These circles are invite-only on purpose.{" "}
          <span className="font-semibold text-stone-700">Ask the grown-up in the family</span>{" "}
          to send you their link.
        </p>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (data) router.push(`/invite/${trimmed}`);
        }}
        className="space-y-4"
      >
        <Field label="Your invite code">
          <Input
            placeholder="MAYA-FAM-26"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={20}
            autoComplete="off"
            className="font-mono tracking-widest"
          />
        </Field>

        {trimmed.length >= 6 && isFetching && (
          <p className="text-sm text-stone-400">Checking the code…</p>
        )}
        {trimmed.length >= 6 && !isFetching && isError && (
          <p className="text-sm font-medium text-flame-600">
            That code doesn&apos;t ring any bells — worth a second look at the invite?
          </p>
        )}
        {data && (
          <Card className="border-taxi-200 bg-taxi-50/60 p-4">
            <p className="text-sm font-bold text-stone-900">
              ✓ Found it — you&apos;re invited to cheer for {data.childFirstName}
            </p>
            <p className="mt-0.5 text-[13px] text-stone-600">
              {ageBandLabel[data.childAgeBand]} · invite from {data.inviterName} · valid until{" "}
              {new Date(data.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </Card>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={!data}>
          Continue →
        </Button>
      </form>

      <p className="mt-6 text-[13px] text-stone-400">
        New here?{" "}
        <Link href="/sign-up" className="font-semibold text-taxi-700 hover:underline">
          Create a family-fan account
        </Link>{" "}
        — invite links carry straight into your sign-up.
      </p>
    </AuthShell>
  );
}

export default function JoinPage() {
  return (
    <Suspense>
      <JoinInner />
    </Suspense>
  );
}
