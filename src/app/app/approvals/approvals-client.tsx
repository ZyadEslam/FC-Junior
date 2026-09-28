"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ClipboardCheck,
  CheckCircle2,
  RefreshCcw,
  Star,
  ExternalLink,
  Clock,
  ListChecks,
  PackageOpen,
} from "lucide-react";
import { usePendingReviews, useReviewSubmission } from "@/hooks/use-submissions";
import { apiErrorMessage } from "@/lib/api-client";
import { timeAgo } from "@/lib/utils";
import { difficultyMeta } from "@/lib/labels";
import type { PendingReviewDto } from "@/types/api";
import { useToast } from "@/components/ui/toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Field, Textarea } from "@/components/ui/input";
import { CardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export function ApprovalsClient() {
  const { data, isLoading } = usePendingReviews();
  const review = useReviewSubmission();
  const toast = useToast();

  const [changesFor, setChangesFor] = useState<PendingReviewDto | null>(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  async function approve(s: PendingReviewDto) {
    try {
      await review.mutateAsync({ id: s.id, action: "APPROVE" });
      toast.push({
        variant: "success",
        title: `Posted to ${s.child.firstName}'s circle 🎉`,
        description: `“${s.task.title}” is now visible to the family — support can roll in.`,
      });
    } catch (err) {
      toast.push({ variant: "error", title: apiErrorMessage(err) });
    }
  }

  async function requestChanges() {
    if (!changesFor) return;
    if (feedback.trim().length < 10) {
      setFeedbackError("Explain what needs fixing (at least 10 characters).");
      return;
    }
    try {
      await review.mutateAsync({ id: changesFor.id, action: "REQUEST_CHANGES", feedback });
      toast.push({
        variant: "info",
        title: `Feedback sent to ${changesFor.child.firstName}`,
        description: "The mission moves back to them with your notes.",
      });
      setChangesFor(null);
      setFeedback("");
      setFeedbackError(null);
    } catch (err) {
      toast.push({ variant: "error", title: apiErrorMessage(err) });
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-stone-900">Review queue</h2>
        <p className="mt-1 text-sm text-stone-500">
          Nothing reaches the family circle without your approval. Check the work against the rubric.
        </p>
      </div>

      {isLoading || !data ? (
        <div className="space-y-4">
          <CardSkeleton lines={5} />
          <CardSkeleton lines={5} />
        </div>
      ) : data.length === 0 ? (
        <Card>
          <EmptyState
            icon={PackageOpen}
            title="All caught up"
            body="When your kids submit missions, they'll land here for your eyes first. Approved work is what unlocks family support."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {data.map((s) => (
            <Card key={s.id} className="overflow-hidden">
              {/* header */}
              <div className="flex flex-wrap items-center gap-3 border-b border-stone-100 px-5 py-4">
                <Avatar name={s.child.firstName} color={s.child.avatarColor} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-stone-900">
                    {s.child.firstName}
                    <span className="font-normal text-stone-400"> · submitted {timeAgo(s.createdAt)}</span>
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-semibold text-stone-700">{s.task.title}</span>
                    <Badge className={difficultyMeta[s.task.difficulty].chip}>
                      {difficultyMeta[s.task.difficulty].label}
                    </Badge>
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-600">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {s.task.points} pts
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-0 lg:grid-cols-[1fr_300px]">
                {/* submission content */}
                <div className="space-y-4 px-5 py-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                      {s.child.firstName}&apos;s note
                    </p>
                    <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-stone-700">{s.note}</p>
                  </div>

                  {s.proofImage && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Proof of work</p>
                      <div className="relative mt-1.5 aspect-[8/5] w-full max-w-md overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                        {/* eslint-disable-next-line @next/next/no-img-element -- data URLs from uploads */}
                        <img src={s.proofImage} alt="Submission proof" className="h-full w-full object-cover" />
                      </div>
                    </div>
                  )}
                  {s.proofLink && (
                    <a
                      href={s.proofLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 ring-1 ring-inset ring-sky-200 hover:bg-sky-100"
                    >
                      <ExternalLink className="h-4 w-4" /> Open project link
                    </a>
                  )}
                </div>

                {/* rubric panel */}
                <div className="border-t border-stone-100 bg-stone-50/70 px-5 py-4 lg:border-l lg:border-t-0">
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400">
                    <ListChecks className="h-3.5 w-3.5" /> Grading rubric
                  </p>
                  <ul className="mt-2.5 space-y-2">
                    {s.task.rubric.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] leading-snug text-stone-600">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-300" />
                        {r}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 border-t border-stone-200 pt-3 text-[12px] leading-snug text-stone-400">
                    <span className="font-semibold text-stone-500">Deliverable: </span>
                    {s.task.deliverable}
                  </p>
                </div>
              </div>

              {/* actions */}
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-stone-100 bg-white px-5 py-3.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setChangesFor(s);
                    setFeedback("");
                    setFeedbackError(null);
                  }}
                >
                  <RefreshCcw className="h-3.5 w-3.5" /> Request changes
                </Button>
                <Button size="sm" onClick={() => approve(s)} loading={review.isPending}>
                  <CheckCircle2 className="h-4 w-4" /> Approve &amp; post to circle
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* request-changes modal */}
      <Modal
        open={!!changesFor}
        onClose={() => setChangesFor(null)}
        title={`Feedback for ${changesFor?.child.firstName ?? ""}`}
        description="Be specific and kind — this is coaching, not rejection."
      >
        <div className="space-y-4">
          <Field
            label="What should they fix?"
            error={feedbackError ?? undefined}
            hint="Reference the rubric so they know exactly what 'done' looks like."
          >
            <Textarea
              autoFocus
              placeholder='e.g. "The timer doesn&apos;t end the game yet — check the rubric point about the 30-second limit. You&apos;re close!"'
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              maxLength={600}
            />
          </Field>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setChangesFor(null)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={requestChanges} loading={review.isPending}>
              <Clock className="h-4 w-4" /> Send feedback
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
