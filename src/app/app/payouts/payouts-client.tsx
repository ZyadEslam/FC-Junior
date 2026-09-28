"use client";

import { CalendarClock, Wallet, PlayCircle, Info, Landmark } from "lucide-react";
import { usePayouts, useRunPayout } from "@/hooks/use-circle";
import { apiErrorMessage } from "@/lib/api-client";
import { formatCents, timeAgo } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export function PayoutsClient() {
  const { data, isLoading } = usePayouts();
  const runPayout = useRunPayout();
  const toast = useToast();

  const pendingTotal = data?.pendingByChild.reduce((s, p) => s + p.pendingCents, 0) ?? 0;

  async function onRun() {
    try {
      const res = await runPayout.mutateAsync();
      if (res.created === 0) {
        toast.push({ variant: "info", title: "Nothing pending", description: "No donations are waiting to be paid out." });
      } else {
        toast.push({
          variant: "success",
          title: `Payout batch complete 🎉`,
          description: `${formatCents(res.totalCents)} across ${res.created} child${res.created > 1 ? "ren" : ""} moved to paid out.`,
        });
      }
    } catch (err) {
      toast.push({ variant: "error", title: apiErrorMessage(err) });
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-stone-900">Payouts</h2>
        <p className="mt-1 text-sm text-stone-500">
          Family support settles into one weekly batch — routine over instant gratification.
        </p>
      </div>

      {/* how it works */}
      <div className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
        <p className="text-[13px] leading-snug text-sky-900">
          <span className="font-bold">How batching works:</span> every donation collects as
          “pending” through the week. Each Friday the batch settles into your custodial
          wallet. The button below runs the same job manually (in production, it&apos;s an
          automatic cron + Stripe Connect transfer).
        </p>
      </div>

      {/* pending batch */}
      <Card>
        <CardHeader
          title="This week's pending batch"
          subtitle={data ? `${formatCents(pendingTotal)} collecting so far` : "Loading…"}
          action={
            <Button onClick={onRun} loading={runPayout.isPending} disabled={pendingTotal === 0}>
              <PlayCircle className="h-4 w-4" /> Run payout now
            </Button>
          }
        />
        {isLoading || !data ? (
          <div className="px-5 py-4">
            <CardSkeleton lines={2} />
          </div>
        ) : data.pendingByChild.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="Nothing pending"
            body="New family support will collect here through the week until Friday's batch."
          />
        ) : (
          <ul className="divide-y divide-stone-100">
            {data.pendingByChild.map((p) => (
              <li key={p.childId} className="flex items-center gap-3 px-5 py-4">
                <Avatar name={p.firstName} color={p.avatarColor} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-stone-900">{p.firstName}</p>
                  <p className="text-xs text-stone-400">
                    {p.pendingCount} donation{p.pendingCount > 1 ? "s" : ""} waiting for Friday
                  </p>
                </div>
                <p className="text-base font-bold tabular-nums text-stone-900">{formatCents(p.pendingCents)}</p>
                <Badge className="bg-amber-50 text-amber-700 ring-amber-200">Pending</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* history */}
      <Card>
        <CardHeader title="Payout history" subtitle="Previous weekly batches" />
        {isLoading || !data ? (
          <div className="px-5 py-4">
            <CardSkeleton lines={3} />
          </div>
        ) : data.payouts.length === 0 ? (
          <EmptyState
            icon={Landmark}
            title="No payouts yet"
            body="Your first weekly batch will appear here once support starts flowing."
          />
        ) : (
          <ul className="divide-y divide-stone-100">
            {data.payouts.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <Avatar name={p.child.firstName} color={p.child.avatarColor} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-stone-900">
                    {p.child.firstName}&apos;s weekly payout
                  </p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-stone-400">
                    <CalendarClock className="h-3 w-3" />
                    {p.donationCount} donation{p.donationCount > 1 ? "s" : ""} · week
                    {p.weekKeys.includes(",") ? "s" : ""} {p.weekKeys} · {timeAgo(p.createdAt)}
                  </p>
                </div>
                <p className="text-base font-bold tabular-nums text-brand-700">+{formatCents(p.amountCents)}</p>
                <Badge className="bg-brand-50 text-brand-700 ring-brand-200">{p.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
