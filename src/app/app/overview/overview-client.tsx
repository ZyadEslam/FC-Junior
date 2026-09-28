"use client";

import Link from "next/link";
import {
  Users,
  ClipboardCheck,
  CircleDollarSign,
  Wallet,
  Plus,
  Star,
  ArrowRight,
  ArrowUpRight,
  Inbox,
  PartyPopper,
} from "lucide-react";
import { useDashboard } from "@/hooks/use-children";
import { formatCents, firstNameOf, timeAgo, cn } from "@/lib/utils";
import { ageBandShort } from "@/lib/labels";
import { Card, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

const activityIcon: Record<string, { color: string; label: string }> = {
  submission: { color: "bg-sky-500", label: "Submission" },
  review: { color: "bg-brand-500", label: "Review" },
  donation: { color: "bg-amber-400", label: "Support" },
  member: { color: "bg-violet-500", label: "Circle" },
};

export function OverviewClient({ parentName }: { parentName: string }) {
  const { data, isLoading } = useDashboard();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-stone-900">
            {greeting}, {firstNameOf(parentName)}
          </h2>
          <p className="mt-1 text-sm text-stone-500">Here&apos;s what your builders have been up to.</p>
        </div>
        <Link href="/app/children/new">
          <Button>
            <Plus className="h-4 w-4" /> Add a child
          </Button>
        </Link>
      </div>

      {/* stats */}
      {isLoading || !data ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} lines={1} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Users} label="Active kids" value={data.stats.activeChildren} tone="brand" />
          <StatCard
            icon={ClipboardCheck}
            label="Waiting for review"
            value={data.stats.pendingCount}
            tone={data.stats.pendingCount > 0 ? "amber" : "stone"}
            sub={data.stats.pendingCount > 0 ? "Work is ready for your eyes" : "Queue is clear"}
          />
          <StatCard
            icon={CircleDollarSign}
            label="Received this week"
            value={formatCents(data.stats.weekReceivedCents)}
            tone="brand"
          />
          <StatCard
            icon={Wallet}
            label="Paid out (all-time)"
            value={formatCents(data.stats.totalPaidOutCents)}
            tone="stone"
          />
        </div>
      )}

      {/* pending reviews banner */}
      {!isLoading && data && data.stats.pendingCount > 0 && (
        <Link
          href="/app/approvals"
          className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 transition-colors hover:bg-amber-100/70"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-amber-950">
            <ClipboardCheck className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-900">
              {data.stats.pendingCount} mission{data.stats.pendingCount > 1 ? "s" : ""} waiting for your review
            </p>
            <p className="text-[13px] text-amber-700">
              Approving posts them to the family circle — that&apos;s what unlocks support.
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-amber-600" />
        </Link>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* children */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-stone-900">Your builders</h3>
          </div>

          {isLoading || !data ? (
            <div className="space-y-4">
              <CardSkeleton lines={4} />
              <CardSkeleton lines={4} />
            </div>
          ) : data.children.length === 0 ? (
            <Card>
              <EmptyState
                icon={PartyPopper}
                title="Add your first builder"
                body="Create a custodial profile for your child — first name and age band only — and their mission board unlocks instantly."
                action={
                  <Link href="/app/children/new">
                    <Button size="sm">
                      <Plus className="h-4 w-4" /> Add a child
                    </Button>
                  </Link>
                }
              />
            </Card>
          ) : (
            data.children.map((c) => (
              <Card key={c.id} className="transition-shadow hover:shadow-lift">
                <div className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <Avatar name={c.firstName} color={c.avatarColor} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[15px] font-bold text-stone-900">{c.firstName}</p>
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-500">
                        Ages {ageBandShort[c.ageBand]}
                      </span>
                      {c.pendingCount > 0 && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                          {c.pendingCount} to review
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-[13px] font-medium text-amber-600">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {c.points} pts · {formatCents(c.totalReceivedCents)} earned all-time
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/app/kid/${c.id}`}>
                      <Button variant="secondary" size="sm">
                        Kid workspace <ArrowUpRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Link href={`/app/children/${c.id}`}>
                      <Button variant="outline" size="sm">Manage</Button>
                    </Link>
                  </div>
                </div>
                <div className="border-t border-stone-100 px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Progress
                      value={c.weekReceivedCents}
                      max={c.weeklyGoalCents}
                      className="flex-1"
                    />
                    <p className="whitespace-nowrap text-xs font-medium tabular-nums text-stone-500">
                      <span className="font-bold text-stone-800">{formatCents(c.weekReceivedCents)}</span>
                      {" / "}
                      {formatCents(c.weeklyGoalCents)} this week
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </section>

        {/* activity */}
        <section>
          <Card>
            <CardHeader title="Recent activity" subtitle="Across your whole family" />
            {isLoading || !data ? (
              <div className="space-y-4 px-5 py-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-2.5 w-2.5 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            ) : data.activity.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="Quiet for now"
                body="Submissions, reviews and family support will show up here as they happen."
              />
            ) : (
              <ul className="divide-y divide-stone-100">
                {data.activity.map((a) => {
                  const meta = activityIcon[a.type] ?? activityIcon.submission;
                  return (
                    <li key={a.id} className="flex items-start gap-3 px-5 py-3.5">
                      <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", meta.color)} />
                      <div className="min-w-0">
                        <p className="text-sm leading-snug text-stone-700">
                          <span className="font-semibold text-stone-900">{a.childName}</span> {a.text}
                        </p>
                        <p className="mt-0.5 text-xs text-stone-400">{timeAgo(a.createdAt)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </section>
      </div>
    </div>
  );
}
