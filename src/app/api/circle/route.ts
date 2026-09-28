import { db } from "@/lib/db";
import { ok, requireUser } from "@/lib/api";

/** Donor home: every child circle the supporter belongs to. */
export async function GET() {
  const auth = await requireUser("DONOR");
  if (auth.error) return auth.error;

  const memberships = await db.circleMember.findMany({
    where: { donorId: auth.user.id },
    orderBy: { createdAt: "asc" },
    include: {
      child: {
        select: {
          id: true,
          firstName: true,
          ageBand: true,
          avatarColor: true,
          donations: { select: { amountCents: true, donorId: true } },
          submissions: {
            where: { status: "APPROVED" },
            select: { reviewedAt: true },
            orderBy: { reviewedAt: "desc" },
          },
        },
      },
    },
  });

  const result = memberships.map((m) => {
    const c = m.child;
    return {
      child: { id: c.id, firstName: c.firstName, ageBand: c.ageBand, avatarColor: c.avatarColor },
      relationLabel: m.relationLabel,
      joinedAt: m.createdAt,
      myTotalCents: c.donations.reduce((s, d) => s + (d.donorId === auth.user.id ? d.amountCents : 0), 0),
      circleTotalCents: c.donations.reduce((s, d) => s + d.amountCents, 0),
      approvedCount: c.submissions.length,
      latestPostAt: c.submissions[0]?.reviewedAt ?? null,
    };
  });

  return ok(result);
}
