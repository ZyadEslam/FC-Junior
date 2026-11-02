import { db } from "@/lib/db";
import { fail, ok, parseBody, requireUser } from "@/lib/api";
import { donationCreateSchema } from "@/lib/validation";
import { weekKeyOf } from "@/lib/utils";
import { CURRENCY, platformFeeCents } from "@/lib/finance";
import { createPaymobIntention, paymobConfigured, paymobMethods } from "@/lib/payments/paymob";

/**
 * Starts a cheer payment.
 *  - LIVE  (PayMob keys configured): creates the cheer as PENDING_PAYMENT and
 *    returns the PayMob unified checkout URL (card / Apple Pay / wallets).
 *  - DEMO  (keys absent): cheer settles straight into the Friday jar —
 *    same state machine, nothing charged.
 */
export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const user = auth.user;

  const parsed = await parseBody(req, donationCreateSchema);
  if (parsed.error) return parsed.error;
  const { childId, amountCents, message } = parsed.data;
  const feeCents = platformFeeCents(amountCents);

  const child = await db.child.findUnique({
    where: { id: childId },
    select: { id: true, parentId: true },
  });
  if (!child) return fail("Not found.", 404);

  // Hard fan-club gate — identical to the old demo endpoint.
  if (user.role === "CHILD") {
    return fail("Only a grown-up can send cheers or manage money.", 403);
  }
  if (user.role === "PARENT") {
    if (child.parentId !== user.id) return fail("Not found.", 404);
  } else if (user.role === "DONOR") {
    const member = await db.circleMember.findUnique({
      where: { childId_donorId: { childId, donorId: user.id } },
    });
    if (!member) return fail("You're not part of this family fan club.", 403);
  } else return fail("You don't have access to payments.", 403);

  if (!paymobConfigured()) {
    const donation = await db.donation.create({
      data: {
        childId,
        donorId: user.id,
        amountCents,
        feeCents,
        currency: CURRENCY,
        message: message || null,
        weekKey: weekKeyOf(new Date()),
        provider: "DEMO",
        status: "PENDING_PAYOUT",
      },
    });
    return ok({ mode: "demo" as const, id: donation.id, status: donation.status, feeCents, netCents: amountCents - feeCents });
  }

  // ── LIVE: hand over to PayMob for card / Apple Pay / wallet checkout ──
  const donation = await db.donation.create({
    data: {
      childId,
      donorId: user.id,
      amountCents,
      message: message || null,
      weekKey: weekKeyOf(new Date()),
      provider: "PAYMOB",
      status: "PENDING_PAYMENT",
    },
  });

  try {
    const { intentionId, checkoutUrl } = await createPaymobIntention({
      donationId: donation.id,
      amountCents,
      customerName: user.name,
      customerEmail: user.email,
    });
    await db.donation.update({ where: { id: donation.id }, data: { providerRef: intentionId } });
    return ok({
      mode: "live" as const,
      id: donation.id,
      checkoutUrl,
      methods: paymobMethods(),
    });
  } catch (e) {
    await db.donation.update({ where: { id: donation.id }, data: { status: "FAILED" } });
    return fail("Couldn't start the payment. Please try again.", 502);
  }
}
