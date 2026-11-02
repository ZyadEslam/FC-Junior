"use client";

import Link from "next/link";
import { useDashboard } from "@/hooks/use-children";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCents, levelFor, firstNameOf } from "@/lib/utils";
import { ageBandLabel } from "@/lib/labels";

const LEVEL_TITLES = ["Rookie", "Maker", "Tinkerer", "Creator", "Star Builder"];

export function OverviewClient({ parentName }: { parentName: string }) {
  const { data, isLoading, isError } = useDashboard();

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Greeting */}
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-taxi-800">Your family at a glance</p>
          <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Welcome, {firstNameOf(parentName)}
          </h2>
          <p className="mt-2 max-w-xl text-base leading-relaxed text-stone-600">
            See how the children are doing and take care of anything that needs your attention.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/app/children/new">
            <Button variant="outline">Add a child</Button>
          </Link>
          <Link href="/app/approvals">
            <Button>
              Review projects
              {!!data?.stats.pendingCount && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/25 px-1.5 text-[11px] font-bold">
                  {data.stats.pendingCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="px-5 py-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-3 h-7 w-16" />
            </Card>
          ))}
        </div>
      ) : isError || !data ? (
        <Card className="p-6 text-sm text-stone-500">
          Couldn&apos;t load the family numbers — try refreshing.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Children" value={data.stats.activeChildren} sub="in your family" tone="brand" />
          <StatCard
            label="Projects to review"
            value={data.stats.pendingCount}
            sub="Waiting for your approval"
            tone="amber"
          />
          <StatCard
            label="Paid out so far"
            value={formatCents(data.stats.totalPaidOutCents)}
            sub="sent to your family"
            tone="stone"
          />
        </div>
      )}

      {/* Builders */}
      <div>
        <div className="mb-4">
          <h3 className="font-display text-xl font-bold text-stone-900">Your children</h3>
          <p className="mt-1 text-sm text-stone-500">Check their progress, review new projects, or open a profile.</p>
        </div>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-44" />
            ))}
          </div>
        ) : !data || data.children.length === 0 ? (
          <Card>
            <EmptyState
              eyebrow="First step"
              title="Add your first child"
              body="Create a profile for your child to get started with projects and family support."
              action={
                <Link href="/app/children/new">
                  <Button>Add a child</Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.children.map((child) => {
              const lvl = levelFor(child.points);
              const title = LEVEL_TITLES[Math.min(lvl.level - 1, LEVEL_TITLES.length - 1)];
              const busy = child.pendingCount + child.approvedCount > 0;
              return (
                <Card key={child.id} className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3 p-5 pb-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={child.firstName} color={child.avatarColor} size="lg" />
                      <div>
                        <p className="font-display text-lg font-bold leading-tight text-stone-900">
                          {child.firstName}
                        </p>
                        <p className="mt-0.5 text-xs text-stone-500">
                          {child.age ? `Age ${child.age}` : ageBandLabel[child.ageBand]} · Level {lvl.level} {title} · {child.points} stars
                        </p>
                      </div>
                    </div>
                    {child.pendingCount > 0 ? (
                      <Badge className="bg-sun-50 text-amber-700 ring-sun-200">
                        {child.pendingCount} to review
                      </Badge>
                    ) : (
                      <Badge className="bg-taxi-50 text-taxi-700 ring-taxi-200">
                        {child.approvedCount} shared
                      </Badge>
                    )}
                  </div>

                  <div className="border-t border-stone-100 px-5 py-3.5">
                    <p className="text-xs font-semibold text-stone-500">Next step</p>
                    <p className="mt-1.5 text-sm font-semibold text-stone-800">
                      {busy
                        ? child.pendingCount > 0
                          ? `${child.pendingCount} project${child.pendingCount > 1 ? "s" : ""} need${child.pendingCount > 1 ? "" : "s"} your approval.`
                          : `Family supporters can see ${child.firstName}'s shared projects.`
                        : "Choose a project together to get started."}
                    </p>
                  </div>

                  <div className="mt-auto border-t border-stone-100 px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-stone-500">
                          Received this week
                        </p>
                        <p className="mt-0.5 font-display text-xl font-extrabold tabular-nums text-stone-900">
                          {formatCents(child.weekReceivedCents)}
                          <span className="ml-1.5 text-xs font-semibold text-stone-400">
                            {formatCents(child.totalReceivedCents)} all time
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        <Link href={`/app/children/${child.id}`}>
                          <Button size="sm">Manage profile</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
