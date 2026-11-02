import { db } from "@/lib/db";
import { ok, requireUser } from "@/lib/api";

export async function GET() {
  const auth = await requireUser("PARENT");
  if (auth.error) return auth.error;
  const parentId = auth.user.id;

  const [pending, payouts] = await Promise.all([
    db.donation.findMany({
      where: { status: "PENDING_PAYOUT", child: { parentId } },
      select: { childId: true, amountCents: true, feeCents: true },
    }),
    db.payout.findMany({
      where: { child: { parentId } },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { child: { select: { id: true, firstName: true, avatarColor: true } } },
    }),
  ]);

  // group pending per child (net of platform fee)
  const byChild = new Map<string, { cents: number; count: number }>();
  for (const d of pending) {
    const row = byChild.get(d.childId) ?? { cents: 0, count: 0 };
    row.cents += d.amountCents - d.feeCents;
    row.count += 1;
    byChild.set(d.childId, row);
  }

  const children = await db.child.findMany({
    where: { id: { in: [...byChild.keys()] } },
    select: { id: true, firstName: true, avatarColor: true },
  });
  const childMap = new Map(children.map((c) => [c.id, c]));

  return ok({
    pendingByChild: [...byChild.entries()].map(([childId, row]) => ({
      childId,
      firstName: childMap.get(childId)?.firstName ?? "—",
      avatarColor: childMap.get(childId)?.avatarColor ?? "emerald",
      pendingCents: row.cents,
      pendingCount: row.count,
    })),
    payouts,
  });
}
