import { db } from "@/lib/db";
import { ok, requireUser } from "@/lib/api";

/**
 * Weekly batch payout — runs on a cron in production (e.g. every Friday,
 * as a Stripe Connect transfer per child). In the MVP the parent triggers
 * it manually; semantics are identical.
 */
export async function POST() {
  const auth = await requireUser("PARENT");
  if (auth.error) return auth.error;
  const parentId = auth.user.id;

  const children = await db.child.findMany({
    where: { parentId },
    include: { donations: { where: { status: "PENDING_PAYOUT" } } },
  });

  let created = 0;
  let totalCents = 0;

  for (const child of children) {
    if (child.donations.length === 0) continue;
    const amount = child.donations.reduce((s, d) => s + d.amountCents, 0);
    const weekKeys = [...new Set(child.donations.map((d) => d.weekKey))].join(",");

    await db.$transaction(async (tx) => {
      const payout = await tx.payout.create({
        data: {
          childId: child.id,
          amountCents: amount,
          donationCount: child.donations.length,
          weekKeys,
        },
      });
      await tx.donation.updateMany({
        where: { id: { in: child.donations.map((d) => d.id) } },
        data: { status: "PAID_OUT", payoutId: payout.id },
      });
    });

    created += 1;
    totalCents += amount;
  }

  return ok({ created, totalCents });
}
