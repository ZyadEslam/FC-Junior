import { db } from "@/lib/db";
import { fail, ok, requireUser } from "@/lib/api";

type Ctx = { params: { childId: string } };

/**
 * Child feed for the family circle.
 * Access rule (hard): the owning parent, or a donor who is a circle member.
 */
export async function GET(_req: Request, { params }: Ctx) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const user = auth.user;

  const child = await db.child.findUnique({
    where: { id: params.childId },
    select: {
      id: true,
      firstName: true,
      ageBand: true,
      avatarColor: true,
      parentId: true,
      _count: { select: { members: true } },
    },
  });
  if (!child) return fail("Not found.", 404);

  let relationLabel: string | null = null;
  if (user.role === "PARENT") {
    if (child.parentId !== user.id) return fail("Not found.", 404); // don't leak existence
  } else {
    const membership = await db.circleMember.findUnique({
      where: { childId_donorId: { childId: child.id, donorId: user.id } },
    });
    if (!membership) return fail("You're not part of this family circle.", 403);
    relationLabel = membership.relationLabel;
  }

  const [posts, totalAgg, myAgg] = await Promise.all([
    db.submission.findMany({
      where: { childId: child.id, status: "APPROVED" },
      orderBy: { reviewedAt: "desc" },
      take: 30,
      select: {
        id: true,
        note: true,
        proofLink: true,
        proofImage: true,
        createdAt: true,
        task: { select: { title: true, difficulty: true, points: true } },
      },
    }),
    db.donation.aggregate({ where: { childId: child.id }, _sum: { amountCents: true } }),
    db.donation.aggregate({
      where: { childId: child.id, donorId: user.id },
      _sum: { amountCents: true },
    }),
  ]);

  return ok({
    child: {
      id: child.id,
      firstName: child.firstName,
      ageBand: child.ageBand,
      avatarColor: child.avatarColor,
      totalReceivedCents: totalAgg._sum.amountCents ?? 0,
      memberCount: child._count.members,
    },
    relationLabel,
    myTotalCents: myAgg._sum.amountCents ?? 0,
    posts,
  });
}
