"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { HeartHandshake, ArrowRight, Sparkles, UserPlus, CheckCircle2 } from "lucide-react";
import { useCircle } from "@/hooks/use-circle";
import { formatCents, firstNameOf, timeAgo } from "@/lib/utils";
import { ageBandShort } from "@/lib/labels";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { CardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

function CircleInner({ supporterName }: { supporterName: string }) {
  const { data, isLoading } = useCircle();
  const params = useSearchParams();
  const welcomed = params.get("welcome") === "1";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-stone-900">
            Hello, {firstNameOf(supporterName)}
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            The kids you champion — and the work they&apos;re proud of.
          </p>
        </div>
        <Link href="/join">
          <Button variant="outline">
            <UserPlus className="h-4 w-4" /> Add another invite code
          </Button>
        </Link>
      </div>

      {welcomed && (
        <div className="flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-5 py-4">
          <Sparkles className="h-5 w-5 shrink-0 text-brand-700" />
          <p className="text-sm font-medium text-brand-900">
            Welcome to the family circle! When a kid completes a mission and their parent
            approves it, you&apos;ll see the post here — and can send support with one tap.
          </p>
        </div>
      )}

      {isLoading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <CardSkeleton lines={4} />
          <CardSkeleton lines={4} />
        </div>
      ) : data.length === 0 ? (
        <Card>
          <EmptyState
            icon={HeartHandshake}
            title="You're not in any circle yet"
            body="Ask the parent for their family invite link, or paste the invite code here to join a child's circle."
            action={
              <Link href="/join">
                <Button size="sm">
                  <UserPlus className="h-4 w-4" /> Enter an invite code
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.map((entry) => (
            <Link key={entry.child.id} href={`/app/circle/${entry.child.id}`} className="group">
              <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:shadow-lift">
                <div className="flex items-center gap-4 px-5 py-4">
                  <Avatar name={entry.child.firstName} color={entry.child.avatarColor} size="xl" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[15px] font-bold text-stone-900">
                        {entry.child.firstName}
                      </p>
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-500">
                        {entry.relationLabel}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-stone-400">
                      Ages {ageBandShort[entry.child.ageBand]} · {entry.approvedCount} post
                      {entry.approvedCount === 1 ? "" : "s"}
                      {entry.latestPostAt ? ` · latest ${timeAgo(entry.latestPostAt)}` : ""}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />
                </div>
                <div className="grid grid-cols-2 divide-x divide-stone-100 border-t border-stone-100">
                  <div className="px-5 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">You&apos;ve given</p>
                    <p className="mt-0.5 text-lg font-bold tabular-nums text-brand-700">
                      {formatCents(entry.myTotalCents)}
                    </p>
                  </div>
                  <div className="px-5 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">Circle total</p>
                    <p className="mt-0.5 text-lg font-bold tabular-nums text-stone-900">
                      {formatCents(entry.circleTotalCents)}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* how support works */}
      <Card className="bg-stone-900 text-stone-300">
        <div className="grid gap-4 px-6 py-6 sm:grid-cols-3">
          {[
            { step: "1", text: "A kid finishes a mission and writes about what they built" },
            { step: "2", text: "Their parent reviews it against the rubric and posts it" },
            { step: "3", text: "You send support with a message — it lands in Friday's payout" },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {s.step}
              </span>
              <p className="text-[13px] leading-snug">{s.text}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function CircleClient({ supporterName }: { supporterName: string }) {
  return (
    <Suspense>
      <CircleInner supporterName={supporterName} />
    </Suspense>
  );
}
