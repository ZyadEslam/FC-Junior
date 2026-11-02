"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGenerateChallenge, useKidHome } from "@/hooks/use-submissions";
import { cn, formatCents, levelFor } from "@/lib/utils";
import { ageBandLabel, difficultyMeta, statusMeta } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LoopSteps } from "@/components/app/loop-steps";
import { apiErrorMessage } from "@/lib/api-client";

const LEVEL_TITLES = ["Rookie", "Maker", "Tinkerer", "Creator", "Star Builder"];

export function KidHomeClient({ childId }: { childId: string }) {
  const { data, isLoading, isError } = useKidHome(childId);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [generationMessage, setGenerationMessage] = useState(0);
  const generateChallenge = useGenerateChallenge(childId);
  const router = useRouter();

  useEffect(() => {
    if (!generateChallenge.isPending) {
      setGenerationMessage(0);
      return;
    }
    const timer = window.setInterval(() => {
      setGenerationMessage((message) => (message + 1) % 3);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [generateChallenge.isPending]);

  if (isLoading || !data) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-48" />
        <CardSkeleton lines={3} />
        <CardSkeleton lines={3} />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <EmptyState
          eyebrow="Hmm"
          title="This world isn't loading"
          body="Try refreshing — or head back to the grown-up zone."
        />
      </Card>
    );
  }

  const { child, tasks } = data;
  const generationMessages = [
    "Be ready for a new challenge...",
    "Finding a fun idea for you...",
    "Get ready for cheers!",
  ];
  const lvl = levelFor(child.points);
  const title = LEVEL_TITLES[Math.min(lvl.level - 1, LEVEL_TITLES.length - 1)];

  const started = tasks.filter((t) => !!t.mySubmission);
  const shared = tasks.filter((t) => t.mySubmission?.status === "APPROVED");
  const waiting = tasks.filter((t) => t.mySubmission?.status === "PENDING");
  const visibleTasks =
    categoryFilter === "all"
      ? tasks
      : tasks.filter((task) => task.categories.some((category) => category.id === categoryFilter));

  const goalPct = child.weeklyGoalCents
    ? Math.min(100, Math.round((child.weekReceivedCents / child.weeklyGoalCents) * 100))
    : 0;

  return (
    <div className="space-y-5 animate-fade-up">
      {/* ── Hero ── */}
      <Card className="overflow-hidden border-stone-900 bg-stone-900 text-white shadow-[0_14px_34px_rgb(36_33_30_/_0.18)]" style={{ borderColor: "transparent" }}>
        <div className="studio-grid relative px-6 pb-7 pt-8 sm:px-8">
          <p className="absolute right-5 top-4 hidden font-mono text-[10px] font-bold tracking-[0.18em] text-white/25 sm:block">FC-JUNIOR / CREATIVE STUDIO</p>
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
                MAKER PROFILE · {child.firstName} · LEVEL {lvl.level} {title.toUpperCase()}
              </p>
              <h1 className="mt-2 font-display text-[32px] font-extrabold tracking-tight sm:text-[36px]">
                Make something worth showing.
              </h1>
              <p className="mt-1 max-w-sm text-sm text-white/55">
                {waiting.length > 0
                  ? "Your build is with the grown-up for a thumbs-up."
                  : started.length > 0
                    ? "You're mid-build — finish it and share it with the family."
                    : "Choose a brief, make it yours, then put it on the family wall."}
              </p>
            </div>
            <div className="flex gap-2 text-right">
              <span className="rounded-2xl bg-white/10 px-4 py-2.5 ring-1 ring-inset ring-white/15">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-white/45">Stars</span>
                <span className="font-display text-xl font-extrabold text-sun-400">{child.points} ★</span>
              </span>
              <span className="rounded-2xl bg-white/10 px-4 py-2.5 ring-1 ring-inset ring-white/15">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-white/45">
                  In your Friday jar
                </span>
                <span className="font-display text-xl font-extrabold text-taxi-400">
                  {formatCents(child.weekReceivedCents)}
                </span>
              </span>
            </div>
          </div>

          <div className="mt-6 max-w-sm">
            <div className="flex justify-between text-[12px] font-semibold text-white/55">
              <span className="uppercase tracking-wide">Level {lvl.level} — {title}</span>
              <span className="tabular-nums">{lvl.intoLevel}/100 ★</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sun-400 to-taxi-400 transition-all"
                style={{ width: `${lvl.pct}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      <section aria-labelledby="student-badges">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400">Studio record</p>
            <h2 id="student-badges" className="mt-1 font-display text-lg font-bold text-stone-900">Your milestones</h2>
            <p className="mt-1 text-sm text-stone-500">
              Earn these by doing the work and sharing it with the people behind you.
            </p>
          </div>
          <p className="text-sm font-semibold text-taxi-800">
            {child.badges.filter((badge) => badge.earned).length} of {child.badges.length} earned
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {child.badges.map((badge) => (
            <Card
              key={badge.id}
              className={cn("flex items-center gap-3 p-4", badge.earned ? "bg-taxi-50" : "bg-stone-50")}
              shadow="none"
            >
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl",
                  badge.earned ? "bg-taxi-200 text-taxi-900" : "bg-stone-200 text-stone-500"
                )}
                aria-hidden
              >
                {badge.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-stone-800">{badge.name}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-stone-500">{badge.description}</span>
                {!badge.earned && (
                  <span className="mt-1 block text-xs font-semibold text-stone-600">
                    Progress: {badge.progress}/{badge.target}
                  </span>
                )}
              </span>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Loop ── */}
      <Card className="border-stone-200 bg-white px-5 py-4">
        <LoopSteps
          steps={[
            { label: "Choose a brief", done: started.length > 0 },
            { label: "Make the work", done: started.length > 0 },
            { label: "Publish it", done: shared.length > 0 },
            { label: "Collect cheers", done: child.weekReceivedCents > 0 },
            { label: "Friday release", done: child.weekReceivedCents > 0 },
          ]}
          className="justify-between"
        />
      </Card>

      {/* ── Weekly goal ── */}
      <Card className="overflow-hidden border-stone-200 bg-white px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400">Friday jar / this week</p>
            <p className="mt-1 font-display text-xl font-extrabold tabular-nums text-stone-900">
              {formatCents(child.weekReceivedCents)}{" "}
              <span className="text-sm font-semibold text-stone-400">
                of {formatCents(child.weeklyGoalCents)}
              </span>
            </p>
          </div>
          <p className="text-xs text-stone-500">
              {child.supporterCount} famil{child.supporterCount === 1 ? "y supporter" : "y supporters"} backing your work · {child.approvedCount}{" "}
              project{child.approvedCount === 1 ? "" : "s"} in your portfolio
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-taxi-500 transition-all"
            style={{ width: `${goalPct}%` }}
          />
        </div>
      </Card>

      {/* ── Quest board ── */}
      <div>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400">Open briefs</p>
            <h2 className="mt-1 font-display text-lg font-bold text-stone-900">What will you make next?</h2>
            <p className="mt-1 text-sm text-stone-500">
              {child.age ? `For age ${child.age}` : ageBandLabel[child.ageBand]} · Choose a category to find your next project.
            </p>
          </div>
          <label className="text-sm font-semibold text-stone-600">
            <span className="sr-only">Filter challenges by category</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="h-10 min-w-48 rounded-xl border border-stone-300 bg-white px-3"
            >
              <option value="all">All categories</option>
              {child.categories.map((category) => {
                const level = child.categoryProgress.find((progress) => progress.categoryId === category.id)?.level ?? 1;
                return (
                  <option key={category.id} value={category.id}>
                    {category.name} · Level {level}
                  </option>
                );
              })}
            </select>
          </label>
        </div>
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-taxi-50 p-4 ring-1 ring-inset ring-taxi-100">
          <div className="min-w-0 flex-1">
            <p className="font-bold text-stone-900">Want a fresh challenge?</p>
            <p className="mt-0.5 text-sm text-stone-600">
              {categoryFilter === "all"
                ? "Choose a category above, then ask FC-Junior to make a new one."
                : `Get a new ${child.categories.find((category) => category.id === categoryFilter)?.name ?? ""} challenge made just for you.`}
            </p>
            {generateChallenge.isPending && (
              <p className="mt-2 text-sm font-semibold text-taxi-800" role="status" aria-live="polite">
                {generationMessages[generationMessage]}
              </p>
            )}
            {generateChallenge.isError && (
              <p className="mt-2 text-sm font-semibold text-rose-700" role="alert">
                {apiErrorMessage(generateChallenge.error)}
              </p>
            )}
          </div>
          <Button
            disabled={categoryFilter === "all" || child.categories.length === 0 || generateChallenge.isPending}
            loading={generateChallenge.isPending}
            onClick={() =>
              generateChallenge.mutate(categoryFilter, {
                onSuccess: (generated) => router.push(`/app/kid/${child.id}/tasks/${generated.taskId}`),
              })
            }
          >
            Get a new challenge
          </Button>
        </div>
        {visibleTasks.length === 0 ? (
          <Card>
            <EmptyState
              eyebrow={tasks.length > 0 ? "Choose another category" : "Coming soon"}
              title={tasks.length > 0 ? "No challenges in this category yet" : "No challenges for your categories yet"}
              body="Ask a parent to choose another category or let you know when a new challenge is available."
            />
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {visibleTasks.map((t) => {
              const st = t.mySubmission?.status;
              return (
                <Link key={t.id} href={`/app/kid/${child.id}/tasks/${t.id}`} className="group">
                  <Card className="h-full p-5 transition-all group-hover:-translate-y-0.5 group-hover:shadow-lift">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge className={difficultyMeta[t.difficulty].chip}>
                          {difficultyMeta[t.difficulty].label}
                        </Badge>
                        {t.categories.map((category) => (
                          <Badge key={category.id} className="bg-stone-100 text-stone-700 ring-stone-200">
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                      {st ? (
                        <Badge className={statusMeta[st].chip}>{statusMeta[st].label}</Badge>
                      ) : (
                        <span className="text-xs font-extrabold text-amber-600">+{t.points} ★</span>
                      )}
                    </div>
                    <h3 className="mt-3 font-display text-[17px] font-bold leading-snug text-stone-900 group-hover:text-taxi-700">
                      {t.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-stone-500">{t.summary}</p>
                    <p className="mt-3 text-xs font-bold text-stone-400 transition-colors group-hover:text-taxi-600">
                      {st === "CHANGES_REQUESTED" ? "Refine this project →" : st ? "View project brief →" : "Open the brief →"}
                    </p>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
