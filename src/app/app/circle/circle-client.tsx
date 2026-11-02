"use client";

import { useState } from "react";
import Link from "next/link";
import { useCircle, useDonate } from "@/hooks/use-circle";
import { apiErrorMessage } from "@/lib/api-client";
import { donationCreateSchema } from "@/lib/validation";
import type { CircleChildDto } from "@/types/api";
import { cn, firstNameOf, formatCents } from "@/lib/utils";
import { platformFeeCents, MIN_CHEER_CENTS } from "@/lib/finance";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

const PRESETS = [
  { cents: 5000, label: "EGP 50", hint: "Small high five" },
  { cents: 10000, label: "EGP 100", hint: "Ice cream run" },
  { cents: 20000, label: "EGP 200", hint: "Movie night" },
  { cents: 50000, label: "EGP 500", hint: "Super fan" },
];

export function CheerModal({
  child,
  relationLabel,
  onClose,
}: {
  child: CircleChildDto["child"];
  relationLabel: string;
  onClose: () => void;
}) {
  const { push } = useToast();
  const donate = useDonate(child.id);
  const [amount, setAmount] = useState<number | null>(10000);
  const [custom, setCustom] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [headingToCheckout, setHeadingToCheckout] = useState(false);

  const amountCents = custom ? Math.round(Number(custom) * 100) : amount ?? 0;
  const feeCents = platformFeeCents(amountCents || 0);
  const netCents = amountCents - feeCents;

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const parsed = donationCreateSchema.safeParse({
      childId: child.id,
      amountCents,
      message: message.trim() || undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the amount");
      return;
    }
    setError(null);
    try {
      const res = await donate.mutateAsync(parsed.data);
      if (res.mode === "live" && res.checkoutUrl) {
        setHeadingToCheckout(true);
        window.location.assign(res.checkoutUrl); // PayMob unified checkout
        return;
      }
      push({ variant: "success", title: "Gift sent!", description: "It'll be included in Friday's payout." });
      onClose();
    } catch (err) {
      push({ variant: "error", title: "Couldn't send the gift", description: apiErrorMessage(err) });
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Send a gift for ${child.firstName}`}
      description="Choose an amount and add a message. The gift arrives with Friday's payout."
    >
      <form onSubmit={send} className="space-y-4">
        <div>
          <span className="mb-1.5 block text-sm font-extrabold text-ink">
            Gift amount
          </span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRESETS.map((p) => (
              <button
                key={p.cents}
                type="button"
                onClick={() => {
                  setAmount(p.cents);
                  setCustom("");
                }}
                className={cn(
                  "border-2 border-ink px-2 py-2.5 text-center transition-all",
                  amount === p.cents && !custom
                    ? "bg-taxi-400 shadow-hard-xs"
                    : "bg-white hover:bg-taxi-50"
                )}
              >
                <span className="block text-sm font-extrabold tabular-nums text-ink">{p.label}</span>
                <span className="mt-0.5 block text-[10px] font-semibold text-stone-500">{p.hint}</span>
              </button>
            ))}
          </div>
          <div className="mt-2">
            <Input
              type="number"
              min={50}
              max={5000}
              step="5"
              placeholder="…or type your own amount (EGP)"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
            />
          </div>
          {error && <p className="mt-1 text-[13px] font-medium text-flame-600">{error}</p>}
        </div>

        <Field label="Your message (the best part)" hint={`Signed as ${relationLabel}.`}>
          <Textarea
            placeholder="e.g. “Bravo!! Tell the dragon Grandma says hi.”"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={140}
            className="min-h-[72px]"
          />
        </Field>

        {/* fee breakdown — transparent by design */}
        <div className="border-2 border-ink bg-white px-4 py-3.5 text-[15px] font-medium leading-[1.7]">
          <div className="flex justify-between">
            <span>{child.firstName}&apos;s Friday jar gets</span>
            <span className="font-extrabold tabular-nums">{formatCents(Math.max(0, netCents))}</span>
          </div>
          <div className="flex justify-between text-stone-500">
            <span>FC-Junior fee — 10%, capped at EGP 50</span>
            <span className="tabular-nums">−{formatCents(feeCents)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t-2 border-ink pt-2">
            <span className="font-extrabold">You pay</span>
            <span className="font-extrabold tabular-nums">{formatCents(amountCents || 0)}</span>
          </div>
        </div>

        <p className="text-sm font-medium text-stone-600">
          Secure checkout by <span className="font-extrabold text-ink">PayMob</span> — card, Apple
          Pay, mobile wallets. Until live payments switch on, this runs as practice money.
        </p>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          variant="amber"
          loading={donate.isPending || headingToCheckout}
          disabled={!Number.isFinite(amountCents) || amountCents < MIN_CHEER_CENTS}
        >
          {headingToCheckout ? "Opening secure checkout…" : `Send a gift of ${formatCents(amountCents || 0)}`}
        </Button>
      </form>
    </Modal>
  );
}

export function CircleClient({ supporterName }: { supporterName: string }) {
  const { data, isLoading, isError } = useCircle();
  const [cheering, setCheering] = useState<CircleChildDto | null>(null);

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <p className="text-sm font-semibold text-taxi-800">Your family circles</p>
        <h2 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Welcome, {firstNameOf(supporterName)}
        </h2>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-stone-600">
          Choose a child to see their projects, or send a gift to celebrate their hard work.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : isError || !data || data.length === 0 ? (
        <Card>
          <EmptyState
            eyebrow="Not yet"
            title="No children linked yet"
            body="Ask a parent or caregiver to send you an invitation. Once you join, the children's projects will appear here."
            action={
              <Link href="/join">
                <Button size="sm" variant="secondary">Enter an invite code</Button>
              </Link>
            }
            className="py-14"
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.map((row) => (
            <Card key={row.child.id} className="flex h-full flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={row.child.firstName} color={row.child.avatarColor} size="lg" />
                  <div>
                    <p className="font-display text-xl font-semibold leading-tight tracking-tight text-ink">
                      {row.child.firstName}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-stone-500">
                      {row.relationLabel}
                    </p>
                  </div>
                </div>
                {row.myTotalCents > 0 && (
                  <span className="rounded-full bg-taxi-50 px-3 py-1.5 text-xs font-semibold text-taxi-900">
                    {formatCents(row.myTotalCents)}
                  </span>
                )}
              </div>

              <div className="mt-5 grid flex-1 grid-cols-2 gap-3 rounded-xl bg-stone-50 p-4">
                <div>
                  <p className="text-xs font-medium text-stone-500">Projects shared</p>
                  <p className="mt-1 text-lg font-semibold text-stone-800">{row.approvedCount}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-500">Family gifts</p>
                  <p className="mt-1 text-lg font-semibold text-stone-800">{formatCents(row.circleTotalCents)}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Button variant="amber" onClick={() => setCheering(row)} className="flex-1">
                  Send a gift
                </Button>
                <Link href={`/app/circle/${row.child.id}`} className="flex-1">
                  <Button variant="secondary" className="w-full">View projects</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <p className="font-semibold text-stone-800">Have another invitation?</p>
        <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
          Enter the code to join another child&apos;s family circle.{" "}
          <Link href="/join" className="font-semibold text-taxi-800 hover:underline">
            Enter an invite code
          </Link>
        </p>
      </div>

      {cheering && (
        <CheerModal
          child={cheering.child}
          relationLabel={cheering.relationLabel}
          onClose={() => setCheering(null)}
        />
      )}
    </div>
  );
}
