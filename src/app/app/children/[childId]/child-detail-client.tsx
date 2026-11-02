"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useChild, useUpdateChild, useUpdateStudioAccess } from "@/hooks/use-children";
import { useCreateInvite } from "@/hooks/use-invites";
import { apiErrorMessage } from "@/lib/api-client";
import { formatCents, timeAgo, cn } from "@/lib/utils";
import { ageBandLabel, statusMeta } from "@/lib/labels";
import { useToast } from "@/components/ui/toast";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Modal } from "@/components/ui/modal";
import { CopyButton } from "@/components/ui/copy-button";
import { Field, Input } from "@/components/ui/input";
import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export function ChildDetailClient({ childId }: { childId: string }) {
  const toast = useToast();
  const { data, isLoading, isError } = useChild(childId);
  const createInvite = useCreateInvite();
  const updateChild = useUpdateChild(childId);
  const updateStudioAccess = useUpdateStudioAccess(childId);

  const [inviteModal, setInviteModal] = useState<string | null>(null); // holds new code
  const [goalModal, setGoalModal] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [studioCodeInput, setStudioCodeInput] = useState("");
  const [studioPinInput, setStudioPinInput] = useState("");

  useEffect(() => {
    setStudioCodeInput(data?.child.studioCode ?? "");
  }, [data?.child.studioCode]);

  if (isError) {
    return (
      <Card>
        <EmptyState
          eyebrow="Missing"
          title="Profile not found"
          body="This child profile doesn't exist or doesn't belong to your account."
          action={
            <Link href="/app/overview">
              <Button size="sm" variant="outline">Back to overview</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  async function onCreateInvite() {
    try {
      const { code } = await createInvite.mutateAsync(childId);
      setInviteModal(code);
    } catch (err) {
      toast.push({ variant: "error", title: "Couldn't create invite", description: apiErrorMessage(err) });
    }
  }

  async function onSaveGoal(e: React.FormEvent) {
    e.preventDefault();
    const dollars = Number(goalInput);
    if (!Number.isFinite(dollars) || dollars < 5) {
      toast.push({ variant: "error", title: "Weekly goal must be at least $5" });
      return;
    }
    try {
      await updateChild.mutateAsync({ weeklyGoalCents: Math.round(dollars * 100) });
      toast.push({ variant: "success", title: "Weekly cheer goal updated" });
      setGoalModal(false);
    } catch (err) {
      toast.push({ variant: "error", title: apiErrorMessage(err) });
    }
  }

  async function onSaveStudioAccess(e: React.FormEvent) {
    e.preventDefault();
    try {
      const result = await updateStudioAccess.mutateAsync({
        studioCode: studioCodeInput.trim() || undefined,
        pin: studioPinInput || undefined,
      });
      setStudioPinInput("");
      toast.push({ variant: "success", title: "Studio access updated", description: `Studio Code: ${result.studioCode}` });
    } catch (err) {
      toast.push({ variant: "error", title: apiErrorMessage(err) });
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        href="/app/overview"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900"
      >
        ← Back to overview
      </Link>

      {/* header */}
      {!data ? (
        <Card className="px-5 py-5">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="flex flex-wrap items-center gap-4 px-5 py-5">
            <Avatar name={data.child.firstName} color={data.child.avatarColor} size="xl" />
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-extrabold tracking-tight text-stone-900">
                {data.child.firstName}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-stone-500">
                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-500">
                  {data.child.age ? `Age ${data.child.age}` : ageBandLabel[data.child.ageBand]}
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-amber-600">
                  {data.child.points} ★
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-taxi-700">
                  {formatCents(data.child.totalReceivedCents)} earned
                </span>
              </div>
              <p className="mt-2 text-xs text-stone-500">
                Categories: {data.child.categories.map((category) => category.name).join(", ")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/app/circle/${childId}`}>
                <Button variant="amber">
                  {data.child.totalReceivedCents === 0 ? "Be the first supporter" : "Send a cheer"}
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-stone-100 px-5 py-3.5">
            <Progress
              value={data.child.weekReceivedCents}
              max={data.child.weeklyGoalCents}
              className="min-w-[160px] flex-1"
            />
            <p className="text-xs font-medium tabular-nums text-stone-500">
              <span className="font-bold text-stone-800">{formatCents(data.child.weekReceivedCents)}</span>
              {" / "}
              {formatCents(data.child.weeklyGoalCents)} weekly goal
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setGoalInput(String(data.child.weeklyGoalCents / 100));
                setGoalModal(true);
              }}
            >
              Edit goal
            </Button>
          </div>
        </Card>
      )}

      {!data ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <CardSkeleton lines={5} />
          <CardSkeleton lines={5} />
        </div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Studio access" subtitle="Only your child uses these details to enter their private quest board." />
            <CardBody>
              <form onSubmit={onSaveStudioAccess} className="space-y-4" noValidate>
                <Field label="Studio Code">
                  <div className="flex gap-2">
                    <Input value={studioCodeInput} onChange={(e) => setStudioCodeInput(e.target.value.toUpperCase())} placeholder="ABC123" maxLength={6} autoCapitalize="characters" />
                    {data.child.studioCode && <CopyButton value={data.child.studioCode} label="Copy" />}
                  </div>
                </Field>
                <Field label={data.child.hasStudioAccess ? "Reset Studio PIN" : "Create Studio PIN"}>
                  <Input type="password" inputMode="numeric" value={studioPinInput} onChange={(e) => setStudioPinInput(e.target.value.replace(/\D/g, ""))} placeholder="4 to 8 digits" maxLength={8} />
                </Field>
                <p className="text-xs leading-relaxed text-stone-500">The PIN is never shown or stored in readable form. Reset it if it is forgotten.</p>
                <Button type="submit" size="sm" loading={updateStudioAccess.isPending}>
                  {data.child.hasStudioAccess ? "Save studio access" : "Create studio access"}
                </Button>
              </form>
            </CardBody>
          </Card>

          {/* family circle */}
          <Card>
            <CardHeader
              title="The fan club"
              subtitle={`${data.members.length} fan${data.members.length === 1 ? "" : "s"} · invite-only`}
              action={
                <Button size="sm" onClick={onCreateInvite} loading={createInvite.isPending}>
                  Invite a fan
                </Button>
              }
            />
            {data.members.length === 0 ? (
              <EmptyState
                eyebrow="Team roster"
                title="The fan club is empty"
                body="Send an invite link to grandparents, aunts, uncles — anyone who'd love to cheer with a few dollars and a big hug in words. Only invited family can ever see this page."
              />
            ) : (
              <ul className="divide-y divide-stone-100">
                {data.members.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                    <Avatar name={m.donor.name} color="rose" size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-stone-900">{m.donor.name}</p>
                      <p className="text-xs text-stone-400">{m.relationLabel} · joined {timeAgo(m.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {data.invites.length > 0 && (
              <div className="border-t border-stone-100 px-5 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Active links</p>
                <ul className="mt-2 space-y-2">
                  {data.invites.map((i) => (
                    <li key={i.id} className="flex items-center gap-2 text-[13px]">
                      <code className="rounded-md bg-stone-100 px-2 py-1 font-mono text-xs font-bold text-stone-700">
                        {i.code}
                      </code>
                      <span className="text-xs text-stone-400">
                        {i.uses} used · expires {new Date(i.expiresAt).toLocaleDateString()}
                      </span>
                      <span className="ml-auto">
                        <CopyButton value={`${typeof window !== "undefined" ? window.location.origin : ""}/invite/${i.code}`} label="Copy" />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* recent support */}
          <Card>
            <CardHeader title="Latest cheers" subtitle="The fan club, being awesome" />
            {data.donations.length === 0 ? (
              <EmptyState
                eyebrow="Jar"
                title="The first cheer is coming — soon!"
                body="Once a build is posted to the family wall, the cheers roll in here and collect for Friday payday."
              />
            ) : (
              <ul className="divide-y divide-stone-100">
                {data.donations.map((d) => (
                  <li key={d.id} className="flex items-start gap-3 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-stone-700">
                        <span className="font-semibold text-stone-900">{d.donor.name}</span>
                        {" sent "}
                        <span className="font-bold tabular-nums text-taxi-700">{formatCents(d.amountCents)}</span>
                      </p>
                      {d.message && <p className="mt-0.5 truncate text-[13px] italic text-stone-500">“{d.message}”</p>}
                      <p className="mt-0.5 text-xs text-stone-400">{timeAgo(d.createdAt)}</p>
                    </div>
                    <Badge
                      className={cn(
                        "shrink-0",
                        d.status === "PAID_OUT"
                          ? "bg-taxi-50 text-taxi-700 ring-taxi-200"
                          : "bg-amber-50 text-amber-700 ring-amber-200"
                      )}
                    >
                      {d.status === "PAID_OUT" ? "Payday landed" : "In the Friday jar"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* submissions history */}
          <Card className="lg:col-span-2">
            <CardHeader
              title="What they've shared"
              subtitle="Every build, every share"
              action={
                <Link href="/app/approvals">
                  <Button variant="outline" size="sm">To thumbs-up time</Button>
                </Link>
              }
            />
            {data.submissions.length === 0 ? (
              <EmptyState
                eyebrow="History"
                title="No shares yet"
                body="Ask them to open their private studio and pick a first adventure — that first thumbs-up is magical."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 text-left text-xs font-semibold uppercase tracking-wide text-stone-400">
                      <th className="px-5 py-3">Quest</th>
                      <th className="px-5 py-3">Where it is</th>
                      <th className="px-5 py-3">Shared</th>
                      <th className="px-5 py-3 text-right">Stars</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {data.submissions.map((s) => (
                      <tr key={s.id} className="text-stone-700">
                        <td className="px-5 py-3.5 font-semibold text-stone-900">{s.task.title}</td>
                        <td className="px-5 py-3.5">
                          <Badge className={statusMeta[s.status].chip}>{statusMeta[s.status].label}</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-stone-500">{timeAgo(s.createdAt)}</td>
                        <td className="px-5 py-3.5 text-right font-bold tabular-nums text-amber-600">
                          {s.status === "APPROVED" ? `+${s.task.points}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* invite success modal */}
      <Modal
        open={!!inviteModal}
        onClose={() => setInviteModal(null)}
        title="Invite link ready"
        description="Share it with a grandparent, aunt or uncle — only people you send it to can join."
      >
        {inviteModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 font-mono text-sm font-bold text-stone-800">
                {typeof window !== "undefined" ? `${window.location.origin}/invite/${inviteModal}` : `/invite/${inviteModal}`}
              </code>
              <CopyButton
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/invite/${inviteModal}`}
              />
            </div>
            <p className="text-[13px] leading-snug text-stone-500">
              The link expires in 14 days. The supporter picks their relation label
              (Grandma, Uncle Sam…) when they join.
            </p>
            <Button className="w-full" onClick={() => setInviteModal(null)}>
              Done
            </Button>
          </div>
        )}
      </Modal>

      {/* weekly goal modal */}
      <Modal
        open={goalModal}
        onClose={() => setGoalModal(false)}
        title="Weekly cheer goal"
        description={data ? `A happy target for the fan club to reach each week for ${data.child.firstName}.` : ""}
      >
        <form onSubmit={onSaveGoal} className="space-y-4">
          <Field label="Amount per week (USD)" hint="This powers the little progress bar everyone sees.">
            <Input
              type="number"
              min={5}
              max={1000}
              step="0.5"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
            />
          </Field>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setGoalModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={updateChild.isPending}>
              Save goal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
