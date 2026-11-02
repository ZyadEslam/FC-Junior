"use client";

import { useState } from "react";
import { usePendingReviews, useReviewSubmission } from "@/hooks/use-submissions";
import { apiErrorMessage } from "@/lib/api-client";
import type { PendingReviewDto } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { difficultyMeta } from "@/lib/labels";

function ReviewCard({ sub }: { sub: PendingReviewDto }) {
  const { push } = useToast();
  const review = useReviewSubmission();
  const [note, setNote] = useState("");
  const [wantsChanges, setWantsChanges] = useState(false);

  function approve() {
    review.mutate(
      { id: sub.id, action: "APPROVE" },
      {
        onSuccess: () =>
          push({
            variant: "success",
            title: "On the wall!",
            description: `${sub.child.firstName}'s build is now showing for the family.`,
          }),
        onError: (e) => push({ variant: "error", title: "Could not save", description: apiErrorMessage(e) }),
      }
    );
  }

  function requestChanges() {
    review.mutate(
      { id: sub.id, action: "REQUEST_CHANGES", feedback: note.trim() },
      {
        onSuccess: () =>
          push({
            variant: "info",
            title: "Sent back with love",
            description: `${sub.child.firstName} will see your note and give it another go.`,
          }),
        onError: (e) => push({ variant: "error", title: "Could not save", description: apiErrorMessage(e) }),
      }
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="grid sm:grid-cols-[240px_1fr]">
        <div className="relative min-h-[180px] border-b border-stone-100 bg-stone-100 sm:border-b-0 sm:border-r">
          {sub.proofImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              alt={`${sub.child.firstName}'s build preview`}
              src={sub.proofImage}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="max-w-[200px] text-center text-xs text-stone-400">
                No preview attached — a note travels with it instead
              </p>
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge className={difficultyMeta[sub.task.difficulty].chip}>
              {difficultyMeta[sub.task.difficulty].label}
            </Badge>
            <span className="text-xs text-stone-400">
              {new Date(sub.createdAt).toLocaleString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>

          <h3 className="mt-3 font-display text-lg font-bold text-stone-900">{sub.task.title}</h3>

          <blockquote className="mt-3 rounded-2xl border border-stone-100 bg-paper px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-taxi-700">
              {sub.child.firstName}&apos;s note
            </p>
            <p className="mt-1 text-sm leading-relaxed text-stone-700">{sub.note}</p>
          </blockquote>

          {sub.proofLink && (
            <a
              href={sub.proofLink}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700 ring-1 ring-inset ring-sky-200 hover:bg-sky-100"
            >
              See it in action →
            </a>
          )}

          {sub.task.rubric.length > 0 && (
            <div className="mt-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400">
                Checklist for your thumbs-up
              </p>
              <ol className="mt-2 space-y-1.5">
                {sub.task.rubric.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13px] text-stone-600">
                    <span className="mt-0.5 font-bold tabular-nums text-stone-300">{i + 1}.</span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {wantsChanges && (
            <div className="mt-4">
              <Textarea
                aria-label="Tweak note"
                placeholder={`"So good! Can you make the basket catch stars one more time?"`}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="mt-1 block w-full"
              />
              {note.trim().length > 0 && note.trim().length < 10 && (
                <p className="mt-1 text-xs text-flame-600">A sentence or two helps — at least 10 characters.</p>
              )}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button loading={review.isPending} onClick={approve}>
              Thumbs-up — post it
            </Button>
            {wantsChanges ? (
              <>
                <Button
                  variant="outline"
                  loading={review.isPending}
                  disabled={note.trim().length < 10}
                  onClick={requestChanges}
                >
                  Send the tweak
                </Button>
                <Button variant="ghost" onClick={() => setWantsChanges(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setWantsChanges(true)}>
                Request tiny tweaks
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function ApprovalsClient() {
  const { data, isLoading, isError } = usePendingReviews();

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-taxi-700">Inbox</p>
        <p className="mt-1 text-sm text-stone-500">
          <span className="font-bold text-stone-900">{data?.length ?? 0}</span>{" "}
          build{data?.length === 1 ? "" : "s"} waiting for a grown-up thumbs-up. Post them — the
          family fan club can&apos;t wait.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-56" />
      ) : isError || !data ? (
        <Card className="p-6 text-sm text-stone-500">Couldn&apos;t load the inbox — try refreshing.</Card>
      ) : data.length === 0 ? (
        <Card>
          <EmptyState
            eyebrow="All clear"
            title="The inbox is squeaky clean"
            body="Nothing is waiting. When a kid shares a build, it lands here for your thumbs-up — nothing reaches the family wall without you."
            className="py-14"
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {data.map((s) => (
            <ReviewCard key={s.id} sub={s} />
          ))}
        </div>
      )}
    </div>
  );
}
