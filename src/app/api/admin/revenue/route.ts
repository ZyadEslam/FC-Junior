import { db } from "@/lib/db";
import { ok, requireUser } from "@/lib/api";

/** Revenue ledger — every cheer with gross / platform fee / family net. */
export async function GET() {
  const auth = await requireUser("ADMIN");
  if (auth.error) return auth.error;

  const donations = await db.donation.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      amountCents: true,
      feeCents: true,
      currency: true,
      provider: true,
      providerRef: true,
      status: true,
      weekKey: true,
      createdAt: true,
      paidAt: true,
      message: true,
      child: { select: { firstName: true, parent: { select: { name: true, email: true } } } },
      donor: { select: { name: true, email: true } },
    },
  });

  return ok({
    ledger: donations.map((d) => ({
      ...d,
      netCents: d.amountCents - d.feeCents,
    })),
  });
}
