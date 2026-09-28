"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { HeartHandshake, ArrowRight, Search } from "lucide-react";
import { useInvitePreview } from "@/hooks/use-invites";
import { ageBandLabel } from "@/lib/labels";
import { Logo } from "@/components/ui/logo";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

function JoinInner() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [submitted, setSubmitted] = useState("");
  const preview = useInvitePreview(submitted, !!submitted);

  function lookup(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(code.trim());
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-50">
      <header className="flex h-16 items-center justify-center border-b border-stone-200 bg-white">
        <Logo />
      </header>

      <main className="dot-grid flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-up">
          <Card className="shadow-pop">
            <CardBody className="p-8">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 ring-1 ring-inset ring-rose-100">
                <HeartHandshake className="h-7 w-7" />
              </span>
              <h1 className="mt-4 text-center text-xl font-extrabold tracking-tight text-stone-900">
                Join a family circle
              </h1>
              <p className="mt-1.5 text-center text-sm text-stone-500">
                Paste the invite code from the parent&apos;s link.
              </p>

              <form onSubmit={lookup} className="mt-6">
                <Field label="Invite code">
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. MAYA-FAM-26"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="font-mono"
                    />
                    <Button type="submit" variant="secondary" loading={preview.isFetching && !!submitted}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </Field>
              </form>

              {submitted && preview.isFetching && (
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              )}

              {submitted && preview.isError && (
                <p className="mt-4 rounded-xl bg-rose-50 px-3.5 py-2.5 text-[13px] font-medium text-rose-700 ring-1 ring-inset ring-rose-200">
                  That code doesn&apos;t match an active invite. Double-check the link with the parent.
                </p>
              )}

              {preview.data && (
                <div className="mt-4 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-4 animate-fade-in">
                  <p className="text-sm font-bold text-brand-900">
                    {preview.data.inviterName.split(" ")[0]} invited you to{" "}
                    {preview.data.childFirstName}&apos;s circle
                  </p>
                  <p className="mt-0.5 text-[13px] text-brand-800">
                    {ageBandLabel[preview.data.childAgeBand]} · invite-only circle
                  </p>
                  <Button
                    className="mt-3 w-full"
                    onClick={() => router.push(`/invite/${preview.data!.code}`)}
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>

          <p className="mt-4 text-center text-xs text-stone-400">
            Circles stay family-only — there&apos;s no directory of kids to browse.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense>
      <JoinInner />
    </Suspense>
  );
}
