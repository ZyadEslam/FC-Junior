"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useAcceptInvite } from "@/hooks/use-invites";
import { apiErrorMessage } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export function InviteActions({
  code,
  viewerRole,
  childName,
}: {
  code: string;
  viewerRole: "PARENT" | "DONOR" | null;
  childName: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const accept = useAcceptInvite();
  const [relation, setRelation] = useState("");

  async function join() {
    try {
      await accept.mutateAsync({ code, relationLabel: relation.trim() });
      toast.push({ variant: "success", title: `You're in ${childName}'s circle!` });
      router.push("/app/circle");
      router.refresh();
    } catch (err) {
      toast.push({ variant: "error", title: "Couldn't join the circle", description: apiErrorMessage(err) });
    }
  }

  if (!viewerRole) {
    return (
      <div className="mt-6 space-y-2">
        <Link href={`/sign-up?invite=${code}`}>
          <Button className="w-full" size="lg">Join as a family fan</Button>
        </Link>
        <Link href={`/sign-in?next=/invite/${code}`}>
          <Button variant="outline" className="w-full" size="lg">I already have an account</Button>
        </Link>
      </div>
    );
  }

  if (viewerRole !== "DONOR") {
    return (
      <div className="mt-6">
        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-[13px] leading-snug text-amber-800 ring-1 ring-inset ring-amber-200">
          You&apos;re signed in as a parent account. Family circles are for the fan club — sign out
          and join with a family-fan account (or send this link to Grandma).
        </div>
        <Link href="/app/overview">
          <Button variant="outline" className="mt-3 w-full">Back to family HQ</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3 text-left">
      <Field label="You're the…" hint="e.g. Grandma, Uncle Sam, Godfather — this shows on your cheers.">
        <Input
          placeholder="Grandma Rose"
          value={relation}
          onChange={(e) => setRelation(e.target.value)}
          maxLength={30}
        />
      </Field>
      <Button
        className="w-full"
        size="lg"
        loading={accept.isPending}
        disabled={relation.trim().length < 2}
        onClick={join}
      >
        Join {childName}&apos;s circle
      </Button>
    </div>
  );
}
