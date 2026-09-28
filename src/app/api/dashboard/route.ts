import { db } from "@/lib/db";
import { ok, requireUser } from "@/lib/api";
import { weekKeyOf } from "@/lib/utils";
import type { ActivityItem } from "@/types/api";

export async function GET() {
  const auth = await requireUser("PARENT");
  if (auth.error) return auth.error;
  const parentId = auth.user.id;

  const children = await db.child.findMany({
    where: { parentId },
    orderBy: { createdAt: "asc" },
    include: {
      donations: { select: { amountCents: true, weekKey: true } },
      submissions: {
        select: { status: true, task: { select: { points: true } } },
      },
    },
  });

  const currentWeek = weekKeyOf(new Date());

  const childSummaries = children.map((c) => ({
    id: c.id,
    firstName: c.firstName,
    ageBand: c.ageBand,
    avatarColor: c.avatarColor,
    weeklyGoalCents: c.weeklyGoalCents,
    points: c.submissions.reduce((sum, s) => sum + (s.status === "APPROVED" ? s.task.points : 0), 0),
    weekReceivedCents: c.donations.reduce((sum, d) => sum + (d.weekKey === currentWeek ? d.amountCents : 0), 0),
    totalReceivedCents: c.donations.reduce((sum, d) => sum + d.amountCents, 0),
    pendingCount: c.submissions.filter((s) => s.status === "PENDING").length,
  }));

  const pendingCount = childSummaries.reduce((s, c) => s + c.pendingCount, 0);
  const weekReceivedCents = childSummaries.reduce((s, c) => s + c.weekReceivedCents, 0);

  const payoutAgg = await db.payout.aggregate({
    where: { child: { parentId } },
    _sum: { amountCents: true },
  });

  // Recent activity — merged from several event sources
  const [recentSubmissions, recentReviews, recentDonations, recentMembers] = await Promise.all([
    db.submission.findMany({
      where: { child: { parentId } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { child: { select: { firstName: true } }, task: { select: { title: true } } },
    }),
    db.submission.findMany({
      where: { child: { parentId }, reviewedAt: { not: null } },
      orderBy: { reviewedAt: "desc" },
      take: 5,
      include: { child: { select: { firstName: true } }, task: { select: { title: true } } },
    }),
    db.donation.findMany({
      where: { child: { parentId } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { child: { select: { firstName: true } }, donor: { select: { name: true } } },
    }),
    db.circleMember.findMany({
      where: { child: { parentId } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { child: { select: { firstName: true } }, donor: { select: { name: true } } },
    }),
  ]);

  const activity: ActivityItem[] = [
    ...recentSubmissions.map((s) => ({
      id: `sub-${s.id}`,
      type: "submission" as const,
      text: `submitted “${s.task.title}” for review`,
      childName: s.child.firstName,
      createdAt: s.createdAt.toISOString(),
    })),
    ...recentReviews
      .filter((s) => s.reviewedAt)
      .map((s) => ({
        id: `rev-${s.id}`,
        type: "review" as const,
        text:
          s.status === "APPROVED"
            ? `had “${s.task.title}” approved and posted to the circle`
            : `got feedback on “${s.task.title}”`,
        childName: s.child.firstName,
        createdAt: s.reviewedAt!.toISOString(),
      })),
    ...recentDonations.map((d) => ({
      id: `don-${d.id}`,
      type: "donation" as const,
      text: `received $${(d.amountCents / 100).toFixed(2)} from ${d.donor.name}`,
      childName: d.child.firstName,
      createdAt: d.createdAt.toISOString(),
    })),
    ...recentMembers.map((m) => ({
      id: `mem-${m.id}`,
      type: "member" as const,
      text: `welcomed ${m.donor.name} (${m.relationLabel}) to the circle`,
      childName: m.child.firstName,
      createdAt: m.createdAt.toISOString(),
    })),
  ]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 8);

  return ok({
    stats: {
      activeChildren: children.length,
      pendingCount,
      weekReceivedCents,
      totalPaidOutCents: payoutAgg._sum.amountCents ?? 0,
    },
    children: childSummaries,
    activity,
  });
}
