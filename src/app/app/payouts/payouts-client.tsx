"use client";

import { usePayouts, useRunPayout } from "@/hooks/use-circle";
import { apiErrorMessage } from "@/lib/api-client";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { formatCents } from "@/lib/utils";
import { PayoutDestinationCard } from "@/components/app/payout-destination-card";

export function PayoutsClient() {
  const { push } = useToast();
  const { data, isLoading, isError } = usePayouts();
  const runPayout = useRunPayout();

  const totalPending = data?.pendingByChild.reduce((sum, c) => sum + c.pendingCents, 0) ?? 0;

  function send() {
    runPayout.mutate(undefined, {
      onSuccess: () =>
        push({
          variant: "success",
          title: "It's time!",
          description: "This week's cheers are on their way to the kids.",
        }),
      onError: (e) =>
        push({ variant: "error", title: "Could not send the cheers", description: apiErrorMessage(e) }),
    });
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <PayoutDestinationCard />
      <div className="jar-glow relative overflow-hidden rounded-3xl border border-stone-900 p-6 text-white shadow-[0_16px_34px_rgb(36_33_30_/_0.16)] sm:p-8">
        <div className="studio-grid absolute inset-0 opacity-40" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-taxi-200">The weekly release · Friday payday</p>
            <h2 className="mt-2 max-w-lg font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              A week of making, gathered in one moment.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
              Every cheer, note, and small win has been collecting in the jar. Friday is when the family gets to celebrate the work together.
            </p>
          </div>
          {!!data && totalPending > 0 && (
            <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-right backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">In the jars</p>
              <p className="mt-1 font-display text-3xl font-extrabold tabular-nums text-taxi-200">
                {formatCents(totalPending)}
              </p>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : isError || !data ? (
        <Card className="p-6 text-sm text-stone-500">Couldn&apos;t load the jars — try refreshing.</Card>
      ) : data.pendingByChild.length === 0 ? (
        <Card>
          <EmptyState
            eyebrow="Nothing brewing"
            title="Jars are empty right now"
            body="The moment family cheers arrive, they'll line up here for Friday."
            className="py-14"
          />
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {data.pendingByChild.map((row) => (
              <Card key={row.childId} className="flex flex-wrap items-center justify-between gap-4 border-stone-200 bg-[#fcfbf8] p-5">
                <div className="flex items-center gap-4">
                  <Avatar name={row.firstName} color={row.avatarColor} size="lg" />
                  <div>
                    <p className="font-display font-bold text-stone-900">{row.firstName}&apos;s Friday jar</p>
                    <p className="mt-0.5 text-xs text-stone-500">
                      <span className="font-bold text-amber-600">
                        {formatCents(row.pendingCents)} waiting
                      </span>{" "}
                      · {row.pendingCount} cheer{row.pendingCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <Badge className="bg-sun-50 text-amber-700 ring-sun-200">Due Friday</Badge>
              </Card>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-taxi-200 bg-taxi-50 p-4">
            <Button
              size="lg"
              variant="amber"
              loading={runPayout.isPending}
              onClick={send}
            >
              Release {formatCents(totalPending)} of cheers
            </Button>
            <p className="max-w-xl text-xs leading-relaxed text-stone-500">
              A single release sends every child&apos;s collected cheers to the grown-up managing their account, ready for their own Friday celebration.
            </p>
          </div>
        </>
      )}

      <div>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400">Archive</p>
            <h3 className="mt-1 font-display text-lg font-bold text-stone-900">Past Friday releases</h3>
          </div>
        </div>
        {!data || data.payouts.length === 0 ? (
          <Card>
            <EmptyState
              eyebrow="Brand new"
              title="No history yet"
              body="As soon as the first Friday rolls by, you'll see everything here."
            />
          </Card>
        ) : (
          <Card className="divide-y divide-stone-100">
            {data.payouts.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <Badge className="bg-taxi-50 text-taxi-700 ring-taxi-200">Paid</Badge>
                  <span className="font-display font-bold text-stone-900">{p.child.firstName}</span>
                  <span className="text-xs text-stone-400">
                    {p.donationCount} cheer{p.donationCount === 1 ? "" : "s"} · week of{" "}
                    {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <span className="font-display text-lg font-extrabold tabular-nums text-stone-900">
                  {formatCents(p.amountCents)}
                </span>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
