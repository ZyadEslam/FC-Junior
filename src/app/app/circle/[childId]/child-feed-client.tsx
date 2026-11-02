"use client";

import { useState } from "react";
import Link from "next/link";
import { useChildFeed } from "@/hooks/use-circle";
import { formatCents, timeAgo } from "@/lib/utils";
import { difficultyMeta } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { CardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { CheerModal } from "../circle-client";

export function ChildFeedClient({
  childId,
  viewerRole,
}: {
  childId: string;
  viewerRole: "PARENT" | "DONOR";
  viewerName: string;
}) {
  const { data, isLoading, isError } = useChildFeed(childId);
  const [donateOpen, setDonateOpen] = useState(false);

  if (isError) {
    return (
      <Card>
        <EmptyState
          eyebrow="Not here"
          title="Hmm, can't find this wall"
          body="Either the invite didn't stick, or this family's wall isn't shared with you."
          action={
            <Link href="/app/circle">
              <Button size="sm" variant="secondary">Back to my families</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        href={viewerRole === "DONOR" ? "/app/circle" : "/app/overview"}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-ink"
      >
        ← Back
      </Link>

      {!data ? (
        <CardSkeleton lines={2} />
      ) : (
        <Card className="portfolio-grid relative overflow-hidden border-stone-200 bg-[#fcfbf8] p-5 sm:p-7">
          <span className="absolute right-5 top-5 font-mono text-[10px] font-bold tracking-[0.16em] text-stone-400">FAMILY ARCHIVE / PRIVATE</span>
          <div className="flex flex-wrap items-center gap-4">
            <Avatar
              name={data.child.firstName}
              color={data.child.avatarColor}
              size="xl"
              className="ring-4 ring-stone-100"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
                  {data.child.firstName}&apos;s family wall
                </h2>
                {(viewerRole === "PARENT" || data.relationLabel) && (
                  <span className="rounded-full bg-taxi-50 px-3 py-1 text-xs font-semibold text-taxi-900">
                    {viewerRole === "PARENT" ? "Parent" : data.relationLabel}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-stone-500">
                A private portfolio of work-in-progress and finished projects · {data.child.memberCount} family supporter
                {data.child.memberCount === 1 ? "" : "s"}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">Cheers collected</p>
              <p className="font-display text-2xl font-bold tabular-nums tracking-tight text-ink">
                {formatCents(data.child.totalReceivedCents)}
              </p>
            </div>
            <Button onClick={() => setDonateOpen(true)} variant="amber">
              {viewerRole === "PARENT" && data?.child.totalReceivedCents === 0
                ? "Be the first supporter"
                : "Send a cheer"}
            </Button>
          </div>
        </Card>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_300px]">
        {/* work archive */}
        <div className="space-y-5">
          {isLoading || !data ? (
            <>
              <CardSkeleton lines={5} />
              <CardSkeleton lines={4} />
            </>
          ) : data.posts.length === 0 ? (
            <Card>
              <EmptyState
                eyebrow="The first blank page"
                title="This portfolio is just getting started"
                body={`${data.child.firstName}'s next finished project will take its place here, with every build kept as part of the story.`}
              />
            </Card>
          ) : (
            data.posts.map((p) => (
              <Card key={p.id} className="group overflow-hidden border-stone-200 bg-white transition-shadow hover:shadow-lift">
                <div className="flex items-start justify-between gap-3 border-b border-stone-100 bg-[#fcfbf8] px-5 py-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={data.child.firstName} color={data.child.avatarColor} size="lg" />
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">
                        {p.task.title}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-stone-500">
                        <span>By {data.child.firstName}</span>
                        <span>·</span>
                        <span>{timeAgo(p.createdAt)}</span>
                        <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-800">
                          {difficultyMeta[p.task.difficulty].label}
                        </span>
                        <span className="rounded-full bg-taxi-50 px-2 py-0.5 text-[10px] font-semibold text-taxi-900">
                          +{p.task.points} ★
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <p className="px-5 pt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400">Artist&apos;s note</p>
                <p className="whitespace-pre-line px-5 pb-2 pt-1 text-[15px] font-medium leading-relaxed text-ink">
                  {p.note}
                </p>

                {/* media */}
                {p.proofImage && (
                  <div className="mx-5 mt-3 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                    {/* eslint-disable-next-line @next/next/no-img-element -- data URL uploads */}
                    <img
                      src={p.proofImage}
                      alt="What the child built"
                      className="max-h-[440px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                    />
                  </div>
                )}
                {p.proofLink && (
                  <div className="px-5 pt-3">
                    <a
                      href={p.proofLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-800 transition-colors hover:bg-sky-100"
                    >
                      See it in action →
                    </a>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-stone-200 bg-stone-50 px-5 py-3">
                  <Button onClick={() => setDonateOpen(true)} variant="amber" size="sm">
                    Applaud this work
                  </Button>
                  <span className="text-xs font-medium text-stone-500">
                    Curated by parent · private family archive
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* right rail */}
        {data && (
          <div className="sticky top-20 space-y-4">
            <Card className="overflow-hidden border-stone-900 bg-stone-900 text-white">
              <div className="p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">
                  Your contribution
                </p>
                <p className="mt-2 font-display text-3xl tabular-nums tracking-tight text-taxi-300">
                  {formatCents(data.myTotalCents)}
                </p>
                <p className="mt-0.5 text-sm text-white/60">backing {data.child.firstName}&apos;s creative practice</p>
                <Button
                  className="mt-4 w-full"
                  variant="amber"
                  onClick={() => setDonateOpen(true)}
                >
                  Send a cheer
                </Button>
              </div>
            </Card>
            <Card>
              <div className="portfolio-grid px-5 py-4 text-[13px] font-medium leading-relaxed text-stone-600">
                <p className="font-display text-base tracking-tight text-ink">
                  The Friday ritual
                </p>
                <p className="mt-1.5">
                  Cheers collect in a weekly jar, then arrive together on Friday with the messages that made each project matter.
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>

      {donateOpen && data && (
        <CheerModal
          child={data.child}
          relationLabel={viewerRole === "PARENT" ? "parent" : data.relationLabel ?? "family fan"}
          onClose={() => setDonateOpen(false)}
        />
      )}
    </div>
  );
}
