import { db } from "@/lib/db";
import { ok, requireUser } from "@/lib/api";
import { startOfThisWeek, weekKeyOf } from "@/lib/utils";

/** Platform-wide KPIs for the admin console (role ADMIN only). */
export async function GET() {
  const auth = await requireUser("ADMIN");
  if (auth.error) return auth.error;

  const [parents, fans, children, circles, cheers, pendingReviews, payouts] =
    await Promise.all([
      db.user.count({ where: { role: "PARENT" } }),
      db.user.count({ where: { role: "DONOR" } }),
      db.child.count(),
      db.circleMember.count(),
      db.donation.findMany({
        select: { amountCents: true, feeCents: true, status: true, weekKey: true, provider: true },
      }),
      db.submission.count({ where: { status: "PENDING" } }),
      db.payout.aggregate({ _sum: { amountCents: true }, _count: { _all: true } }),
    ]);

  const funded = cheers.filter((d) => d.status === "PENDING_PAYOUT" || d.status === "PAID_OUT");
  const gmv = funded.reduce((s, d) => s + d.amountCents, 0);
  const revenue = funded.reduce((s, d) => s + d.feeCents, 0); // net platform take
  const familiesValue = funded.reduce((s, d) => s + (d.amountCents - d.feeCents), 0);

  const thisWeekKey = weekKeyOf(new Date());
  const weekCheers = funded.filter((d) => d.weekKey === thisWeekKey);
  const weekGmv = weekCheers.reduce((s, d) => s + d.amountCents, 0);
  const weekRevenue = weekCheers.reduce((s, d) => s + d.feeCents, 0);

  // last 8 weekly buckets for the bar chart
  const buckets = new Map<string, { gmv: number; revenue: number; count: number }>();
  for (let i = 7; i >= 0; i--) {
    const d = new Date(startOfThisWeek().getTime() - i * 7 * 86400000);
    buckets.set(weekKeyOf(d), { gmv: 0, revenue: 0, count: 0 });
  }
  for (const c of funded) {
    const b = buckets.get(c.weekKey);
    if (b) {
      b.gmv += c.amountCents;
      b.revenue += c.feeCents;
      b.count += 1;
    }
  }

  const byProvider = new Map<string, { count: number; gmv: number; revenue: number }>();
  for (const c of funded) {
    const row = byProvider.get(c.provider) ?? { count: 0, gmv: 0, revenue: 0 };
    row.count += 1;
    row.gmv += c.amountCents;
    row.revenue += c.feeCents;
    byProvider.set(c.provider, row);
  }

  return ok({
    kpis: {
      families: parents,
      fans,
      children,
      circleMemberships: circles,
      cheersCount: funded.length,
      pendingReviews,
      payoutCount: payouts._count._all,
      paidOutCents: payouts._sum.amountCents ?? 0,
      gmvCents: gmv,
      revenueCents: revenue,
      familiesValueCents: familiesValue,
      weekGmvCents: weekGmv,
      weekRevenueCents: weekRevenue,
      weekCheers: weekCheers.length,
      avgCheerCents: funded.length ? Math.round(gmv / funded.length) : 0,
      takeRate: gmv > 0 ? revenue / gmv : 0,
    },
    weekly: [...buckets.entries()].map(([weekKey, v]) => ({ weekKey, ...v })),
    byProvider: [...byProvider.entries()].map(([provider, v]) => ({ provider, ...v })),
  });
}
