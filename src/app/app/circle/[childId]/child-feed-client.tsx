"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Gift,
  HandCoins,
  Star,
  ExternalLink,
  Users,
  MailOpen,
  TrendingUp,
  Heart,
} from "lucide-react";
import { useChildFeed, useDonate } from "@/hooks/use-circle";
import { apiErrorMessage } from "@/lib/api-client";
import { donationCreateSchema } from "@/lib/validation";
import { formatCents, timeAgo, cn, firstNameOf } from "@/lib/utils";
import { ageBandShort, difficultyMeta } from "@/lib/labels";
import { useToast } from "@/components/ui/toast";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Textarea } from "@/components/ui/input";
import { CardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

const PRESETS = [500, 1000, 2000, 5000];

export function ChildFeedClient({
  childId,
  viewerRole,
  viewerName,
}: {
  childId: string;
  viewerRole: "PARENT" | "DONOR";
  viewerName: string;
}) {
  const { data, isLoading, isError } = useChildFeed(childId);
  const donate = useDonate(childId);
  const toast = useToast();

  const [donateOpen, setDonateOpen] = useState(false);
  const [donationFor, setDonationFor] = useState<string | null>(null); // submission id
  const [amount, setAmount] = useState<number | null>(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);

  function openDonate(submissionId?: string) {
    setDonationFor(submissionId ?? null);
    setDonateOpen(true);
  }

  async function onDonate(e: React.FormEvent) {
    e.preventDefault();
    const amountCents = customAmount
      ? Math.round(Number(customAmount) * 100)
      : amount ?? 0;
    const parsed = donationCreateSchema.safeParse({
      childId,
      submissionId: donationFor ?? undefined,
      amountCents,
      message: message || undefined,
    });
    if (!parsed.success) {
      setAmountError(parsed.error.issues[0]?.message ?? "Invalid amount");
      return;
    }
    setAmountError(null);
    try {
      await donate.mutateAsync(parsed.data);
      toast.push({
        variant: "success",
        title: `${formatCents(parsed.data.amountCents)} on its way 💛`,
        description: data
          ? `${data.child.firstName} will see it in Friday's payout.`
          : undefined,
      });
      setDonateOpen(false);
      setMessage("");
      setCustomAmount("");
      setAmount(1000);
    } catch (err) {
      toast.push({ variant: "error", title: apiErrorMessage(err) });
    }
  }

  if (isError) {
    return (
      <Card>
        <EmptyState
          icon={Users}
          title="Circle not found"
          body="Either this circle doesn't exist, or you haven't been invited to it."
          action={
            <Link href="/app/circle">
              <Button size="sm" variant="outline">Back to my circle</Button>
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
        className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      {/* child header */}
      {!data ? (
        <CardSkeleton lines={2} />
      ) : (
        <Card>
          <div className="flex flex-wrap items-center gap-4 px-5 py-5">
            <Avatar name={data.child.firstName} color={data.child.avatarColor} size="xl" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight text-stone-900">
                  {data.child.firstName}&apos;s wall
                </h2>
                {data.relationLabel && (
                  <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-600 ring-1 ring-inset ring-rose-200">
                    You&apos;re the {data.relationLabel}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[13px] text-stone-500">
                Ages {ageBandShort[data.child.ageBand]} · {data.child.memberCount} supporter
                {data.child.memberCount === 1 ? "" : "s"} in the circle
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                Circle has sent
              </p>
              <p className="text-2xl font-extrabold tabular-nums text-brand-700">
                {formatCents(data.child.totalReceivedCents)}
              </p>
            </div>
            <Button onClick={() => openDonate()} variant="amber" className="font-bold">
              <Gift className="h-4 w-4" /> Send support
            </Button>
          </div>
        </Card>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_300px]">
        {/* feed */}
        <div className="space-y-4">
          {isLoading || !data ? (
            <>
              <CardSkeleton lines={5} />
              <CardSkeleton lines={4} />
            </>
          ) : data.posts.length === 0 ? (
            <Card>
              <EmptyState
                icon={MailOpen}
                title="No posts yet"
                body={`When ${data.child.firstName} completes a mission and it passes parent review, it will appear here. ${data.child.firstName} is just getting started!`}
              />
            </Card>
          ) : (
            data.posts.map((p) => (
              <Card key={p.id} className="overflow-hidden">
                <div className="flex items-start gap-3 px-5 pt-4">
                  <Avatar name={data.child.firstName} color={data.child.avatarColor} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-stone-900">
                      {data.child.firstName}
                      <span className="ml-2 font-normal text-stone-400">{timeAgo(p.createdAt)}</span>
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-semibold text-stone-600">
                        completed: {p.task.title}
                      </span>
                      <Badge className={difficultyMeta[p.task.difficulty].chip}>
                        {difficultyMeta[p.task.difficulty].label}
                      </Badge>
                      <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-600">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> +{p.task.points} pts
                      </span>
                    </div>
                  </div>
                </div>

                <p className="whitespace-pre-line px-5 pb-1 pt-3 text-sm leading-relaxed text-stone-700">
                  {p.note}
                </p>

                {p.proofImage && (
                  <div className="mx-5 mt-3 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                    {/* eslint-disable-next-line @next/next/no-img-element -- data URL uploads */}
                    <img src={p.proofImage} alt="Proof of work" className="max-h-[340px] w-full object-cover" />
                  </div>
                )}
                {p.proofLink && (
                  <div className="px-5 pt-3">
                    <a
                      href={p.proofLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 ring-1 ring-inset ring-sky-200 hover:bg-sky-100"
                    >
                      <ExternalLink className="h-4 w-4" /> View the project
                    </a>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between border-t border-stone-100 px-5 py-3">
                  <button
                    onClick={() => openDonate(p.id)}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-stone-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Heart className="h-4 w-4" /> Cheer with support
                  </button>
                  <span className="text-xs text-stone-400">Parent-approved ✓</span>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* right rail */}
        {data && (
          <div className="sticky top-20 space-y-4">
            <Card>
              <CardBody>
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400">
                  <TrendingUp className="h-3.5 w-3.5" /> Your impact
                </p>
                <p className="mt-2 text-2xl font-extrabold tabular-nums text-stone-900">
                  {formatCents(data.myTotalCents)}
                </p>
                <p className="mt-0.5 text-[13px] text-stone-500">
                  {viewerRole === "DONOR"
                    ? `you've sent ${data.child.firstName} so far`
                    : `collected for ${data.child.firstName} so far`}
                </p>
                <Button className="mt-4 w-full" variant="amber" onClick={() => openDonate()}>
                  <HandCoins className="h-4 w-4" /> Send support
                </Button>
              </CardBody>
            </Card>
            <div className="rounded-2xl border border-stone-200 bg-white px-5 py-4 text-[13px] leading-snug text-stone-500 shadow-card">
              <p className="font-semibold text-stone-700">Why it matters</p>
              <p className="mt-1">
                Support ties effort to outcome. Kids remember that finishing real work is
                what made the family cheer — not just shows up on their birthday.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* donate modal */}
      <Modal
        open={donateOpen}
        onClose={() => setDonateOpen(false)}
        title={data ? `Support ${data.child.firstName}` : "Send support"}
        description="It collects through the week and lands in Friday's payout — with your message attached."
      >
        <form onSubmit={onDonate} className="space-y-4">
          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-stone-700">Amount</span>
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setAmount(p);
                    setCustomAmount("");
                  }}
                  className={cn(
                    "rounded-xl border px-2 py-2.5 text-sm font-bold tabular-nums transition-all",
                    amount === p && !customAmount
                      ? "border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-600/15"
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                  )}
                >
                  ${p / 100}
                </button>
              ))}
            </div>
            <div className="mt-2">
              <Input
                type="number"
                min={1}
                max={500}
                step="0.5"
                placeholder="Custom amount (USD)"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
            </div>
            {amountError && <p className="mt-1.5 text-[13px] font-medium text-rose-600">{amountError}</p>}
          </div>

          <Field label="Message (optional)" hint="Kids say the messages matter more than the money.">
            <Textarea
              placeholder={`e.g. "So proud of you — keep building!"`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={140}
              className="min-h-[72px]"
            />
          </Field>

          <div className="rounded-xl bg-stone-50 px-4 py-3 text-[13px] text-stone-500 ring-1 ring-inset ring-stone-200">
            Demo mode: no card is charged. In production this step collects payment
            securely and Friday&apos;s batch transfers to the parent&apos;s custodial wallet.
          </div>

          <Button type="submit" className="w-full" variant="amber" loading={donate.isPending}>
            <Gift className="h-4 w-4" />
            Send {formatCents(customAmount ? Math.round(Number(customAmount) * 100) || 0 : amount ?? 0)}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
