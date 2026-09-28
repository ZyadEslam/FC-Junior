"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
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

  if (viewerRole === "PARENT") {
    return (
      <div className="mt-6 rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-600 ring-1 ring-inset ring-stone-200">
        You&apos;re signed in as a parent. Circle memberships are for family supporters —
        sign out and follow this link again, or share it with someone else.
      </div>
    );
  }

  if (viewerRole === "DONOR") {
    return (
      <form
        className="mt-6 space-y-3 text-left"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await accept.mutateAsync({ code, relationLabel: relation.trim() || "Family member" });
            toast.push({ variant: "success", title: `You're in ${childName}'s circle! 🎉` });
            router.push("/app/circle?welcome=1");
            router.refresh();
          } catch (err) {
            toast.push({ variant: "error", title: apiErrorMessage(err) });
          }
        }}
      >
        <Field label="What does the family call you?" hint='e.g. "Grandma", "Uncle Sam", "Gedo"'>
          <Input
            autoFocus
            placeholder="Grandma"
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            maxLength={30}
          />
        </Field>
        <Button type="submit" className="w-full" loading={accept.isPending}>
          Join {childName}&apos;s circle <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    );
  }

  // signed out
  return (
    <div className="mt-6 space-y-2">
      <Link href={`/sign-up?role=donor&code=${encodeURIComponent(code)}`} className="block">
        <Button className="w-full">
          Create supporter account <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
      <Link href={`/sign-in?next=${encodeURIComponent(`/invite/${code}`)}`} className="block">
        <Button variant="outline" className="w-full">
          I already have an account
        </Button>
      </Link>
    </div>
  );
}
