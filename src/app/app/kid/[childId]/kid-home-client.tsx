"use client";

import Link from "next/link";
import {
  Star,
  Clock,
  ArrowRight,
  CheckCircle2,
  RefreshCcw,
  Hourglass,
  Trophy,
  HandCoins,
  Users,
  Sparkles,
} from "lucide-react";
import { useKidHome } from "@/hooks/use-submissions";
import { formatCents, levelFor, cn } from "@/lib/utils";
import { difficultyMeta, statusMeta } from "@/lib/labels";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CardSkeleton } from "@/components/ui/skeleton";
import type { KidTaskDto } from "@/types/api";

function TaskCard({ task, childId }: { task: KidTaskDto; childId: string }) {
  const status = task.mySubmission?.status;
  const done = status === "APPROVED";

  return (
    <Link href={`/app/kid/${childId}/tasks/${task.id}`} className="group">
      <Card
        className={cn(
          "flex h-full flex-col p-5 transition-all group-hover:-translate-y-0.5 group-hover:shadow-lift",
          done && "border-brand-200 bg-brand-50/40"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <Badge className={difficultyMeta[task.difficulty].chip}>
            {difficultyMeta[task.difficulty].label}
          </Badge>
          <span className="inline-flex items-center gap-1 text-[13px] font-bold text-amber-600">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {task.points}
          </span>
        </div>

        <h3 className="mt-3 text-[15px] font-bold leading-snug text-stone-900 group-hover:text-brand-800">
          {task.title}
        </h3>
        <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-stone-500">{task.summary}</p>

        <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-400">
            <Clock className="h-3.5 w-3.5" /> ~{task.estimatedMinutes} min
          </span>
          {status ? (
            <Badge className={statusMeta[status].chip}>
              {status === "APPROVED" && <CheckCircle2 className="h-3 w-3" />}
              {status === "PENDING" && <Hourglass className="h-3 w-3" />}
              {status === "CHANGES_REQUESTED" && <RefreshCcw className="h-3 w-3" />}
              {statusMeta[status].label}
            </Badge>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 opacity-0 transition-opacity group-hover:opacity-100">
              Start <ArrowRight className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}

export function KidHomeClient({ childId }: { childId: string }) {
  const { data, isLoading } = useKidHome(childId);

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <CardSkeleton lines={3} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} lines={4} />
          ))}
        </div>
      </div>
    );
  }

  const { child, tasks } = data;
  const { level, pct } = levelFor(child.points);
  const todo = tasks.filter((t) => !t.mySubmission || t.mySubmission.status === "CHANGES_REQUESTED");
  const inReview = tasks.filter((t) => t.mySubmission?.status === "PENDING");
  const done = tasks.filter((t) => t.mySubmission?.status === "APPROVED");

  return (
    <div className="space-y-8 animate-fade-in">
      {/* hero stats row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="relative overflow-hidden bg-stone-900 text-white md:col-span-1">
          <div className="dot-grid absolute inset-0 opacity-25" />
          <div className="relative px-5 py-5">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-400">
              <Trophy className="h-3.5 w-3.5 text-amber-400" /> Level {level} Builder
            </p>
            <p className="mt-2 text-3xl font-extrabold tabular-nums">{child.points} pts</p>
            <div className="mt-3">
              <Progress value={pct} max={100} tone="amber" className="bg-white/15" />
              <p className="mt-1.5 text-xs text-stone-400">{100 - pct} pts to Level {level + 1}</p>
            </div>
          </div>
        </Card>

        <Card className="px-5 py-5">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-400">
            <HandCoins className="h-3.5 w-3.5 text-brand-600" /> Family earnings
          </p>
          <p className="mt-2 text-3xl font-extrabold tabular-nums text-stone-900">
            {formatCents(child.earnedCents)}
          </p>
          <div className="mt-3">
            <Progress value={child.weekReceivedCents} max={Math.max(child.weeklyGoalCents, 1)} />
            <p className="mt-1.5 text-xs text-stone-400">
              {formatCents(child.weekReceivedCents)} of {formatCents(child.weeklyGoalCents)} weekly goal
            </p>
          </div>
        </Card>

        <Card className="px-5 py-5">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-400">
            <Users className="h-3.5 w-3.5 text-violet-600" /> Your fan club
          </p>
          <p className="mt-2 text-3xl font-extrabold tabular-nums text-stone-900">
            {child.supporterCount} {child.supporterCount === 1 ? "supporter" : "supporters"}
          </p>
          <p className="mt-3 text-[13px] leading-snug text-stone-500">
            {child.approvedCount} approved mission{child.approvedCount === 1 ? "" : "s"} on your wall.
            Every approved post is a chance for family to cheer.
          </p>
        </Card>
      </div>

      {/* missions */}
      <section>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <h3 className="text-lg font-extrabold tracking-tight text-stone-900">Up next for you</h3>
        </div>
        {todo.length === 0 ? (
          <Card className="mt-4 px-6 py-8 text-center">
            <p className="text-lg font-bold text-stone-900">Board cleared — legend status 🏆</p>
            <p className="mt-1 text-sm text-stone-500">
              You&apos;ve attempted every mission available. New missions unlock as you level up!
            </p>
          </Card>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {todo.map((t) => (
              <TaskCard key={t.id} task={t} childId={childId} />
            ))}
          </div>
        )}
      </section>

      {inReview.length > 0 && (
        <section>
          <h3 className="text-lg font-extrabold tracking-tight text-stone-900">Waiting for review</h3>
          <p className="text-sm text-stone-500">Your parent is checking these against the rubric.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inReview.map((t) => (
              <TaskCard key={t.id} task={t} childId={childId} />
            ))}
          </div>
        </section>
      )}

      {done.length > 0 && (
        <section>
          <h3 className="text-lg font-extrabold tracking-tight text-stone-900">Completed 🎉</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {done.map((t) => (
              <TaskCard key={t.id} task={t} childId={childId} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
