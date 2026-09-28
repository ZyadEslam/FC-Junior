"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Users,
  Link2,
  Star,
  CircleDollarSign,
  Trash2,
  CalendarClock,
  Settings2,
} from "lucide-react";
import { useChild, useUpdateChild } from "@/hooks/use-children";
import { useCreateInvite } from "@/hooks/use-invites";
import { apiErrorMessage } from "@/lib/api-client";
import { formatCents, timeAgo, cn } from "@/lib/utils";
import { ageBandShort, statusMeta } from "@/lib/labels";
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

  const [inviteModal, setInviteModal] = useState<string | null>(null); // holds new code
  const [goalModal, setGoalModal] = useState(false);
  const [goalInput, setGoalInput] = useState("");

  if (isError) {
    return (
      <Card>
        <EmptyState
          icon={Users}
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
      toast.push({ variant: "success", title: "Weekly goal updated" });
      setGoalModal(false);
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
        <ArrowLeft className="h-4 w-4" /> Back to overview
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
                  Ages {ageBandShort[data.child.ageBand]}
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-amber-600">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {data.child.points} pts
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-brand-700">
                  <CircleDollarSign className="h-3.5 w-3.5" /> {formatCents(data.child.totalReceivedCents)} earned
                </span>
              </div>
            </div>
            <Link href={`/app/kid/${childId}`}>
              <Button variant="secondary">
                Kid workspace <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
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
              <Settings2 className="h-3.5 w-3.5" /> Edit goal
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
          {/* family circle */}
          <Card>
            <CardHeader
              title="Family circle"
              subtitle={`${data.members.length} supporter${data.members.length === 1 ? "" : "s"} · invite-only`}
              action={
                <Button size="sm" onClick={onCreateInvite} loading={createInvite.isPending}>
                  <Link2 className="h-4 w-4" /> New invite link
                </Button>
              }
            />
            {data.members.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No supporters yet"
                body="Invite grandparents, aunts, uncles — anyone who'd love to fund finished work. Only invited people can ever see this profile."
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
            <CardHeader title="Recent support" subtitle="What the circle has sent" />
            {data.donations.length === 0 ? (
              <EmptyState
                icon={CircleDollarSign}
                title="No support yet"
                body="Once approved posts reach the circle, family support shows up here — and batches into the weekly payout."
              />
            ) : (
              <ul className="divide-y divide-stone-100">
                {data.donations.map((d) => (
                  <li key={d.id} className="flex items-start gap-3 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-stone-700">
                        <span className="font-semibold text-stone-900">{d.donor.name}</span>
                        {" sent "}
                        <span className="font-bold tabular-nums text-brand-700">{formatCents(d.amountCents)}</span>
                      </p>
                      {d.message && <p className="mt-0.5 truncate text-[13px] italic text-stone-500">“{d.message}”</p>}
                      <p className="mt-0.5 text-xs text-stone-400">{timeAgo(d.createdAt)}</p>
                    </div>
                    <Badge
                      className={cn(
                        "shrink-0",
                        d.status === "PAID_OUT"
                          ? "bg-brand-50 text-brand-700 ring-brand-200"
                          : "bg-amber-50 text-amber-700 ring-amber-200"
                      )}
                    >
                      {d.status === "PAID_OUT" ? "Paid out" : "Pending Friday"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* submissions history */}
          <Card className="lg:col-span-2">
            <CardHeader
              title="Submission history"
              subtitle="Latest work across missions"
              action={
                <Link href="/app/approvals">
                  <Button variant="outline" size="sm">Go to review queue</Button>
                </Link>
              }
            />
            {data.submissions.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="Nothing submitted yet"
                body="Open the kid workspace together and pick a first mission to get the loop going."
                action={
                  <Link href={`/app/kid/${childId}`}>
                    <Button size="sm">Open kid workspace</Button>
                  </Link>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 text-left text-xs font-semibold uppercase tracking-wide text-stone-400">
                      <th className="px-5 py-3">Mission</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Submitted</th>
                      <th className="px-5 py-3 text-right">Points</th>
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
        title="Weekly support goal"
        description={data ? `How much the circle aims to send ${data.child.firstName} each week.` : ""}
      >
        <form onSubmit={onSaveGoal} className="space-y-4">
          <Field label="Amount per week (USD)" hint="This powers the progress bar everyone sees.">
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
