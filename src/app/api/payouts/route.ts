import { db } from "@/lib/db";
import { ok, requireUser } from "@/lib/api";

export async function GET() {
  const auth = await requireUser("PARENT");
  if (auth.error) return auth.error;
  const parentId = auth.user.id;

  const [pending, payouts] = await Promise.all([
    db.donation.groupBy({
      by: ["childId"],
      where: { status: "PENDING_PAYOUT", child: { parentId } },
      _sum: { amountCents: true },
      _count: { _all: true },
    }),
    db.payout.findMany({
      where: { child: { parentId } },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { child: { select: { id: true, firstName: true, avatarColor: true } } },
    }),
  ]);

  const children = await db.child.findMany({
    where: { id: { in: pending.map((p) => p.childId) } },
    select: { id: true, firstName: true, avatarColor: true },
  });
  const childMap = new Map(children.map((c) => [c.id, c]));

  return ok({
    pendingByChild: pending.map((p) => ({
      childId: p.childId,
      firstName: childMap.get(p.childId)?.firstName ?? "—",
      avatarColor: childMap.get(p.childId)?.avatarColor ?? "emerald",
      pendingCents: p._sum.amountCents ?? 0,
      pendingCount: p._count._all,
    })),
    payouts,
  });
}
