import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/api";
import { extractDonationId, verifyPaymobHmac } from "@/lib/payments/paymob";

/**
 * PayMob transaction "processed" callback — the authoritative payment signal.
 * Configure this URL in the PayMob dashboard: POST https://<app>/api/webhooks/paymob
 * Idempotent + HMAC-verified.
 */
export async function POST(req: NextRequest) {
  const hmac = req.nextUrl.searchParams.get("hmac") ?? "";

  let body: { obj?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return fail("Invalid payload.", 400);
  }
  const tx = body.obj;
  if (!tx || typeof tx !== "object") return fail("Invalid payload.", 400);

  if (!verifyPaymobHmac(tx, hmac)) {
    return fail("Bad signature.", 401);
  }

  const success = tx.success === true || tx.success === "true";
  const donationId = extractDonationId(tx);

  let donation = donationId
    ? await db.donation.findUnique({ where: { id: donationId } })
    : null;

  // Fallback: match by PayMob intention/transaction reference
  if (!donation) {
    const ref = String(tx.id ?? "");
    const intentionRef =
      typeof (tx as Record<string, unknown>).intention_id === "string"
        ? String((tx as Record<string, unknown>).intention_id)
        : null;
    donation =
      (intentionRef &&
        (await db.donation.findFirst({
          where: { provider: "PAYMOB", providerRef: intentionRef },
        }))) ||
      (ref
        ? await db.donation.findFirst({ where: { provider: "PAYMOB", providerRef: ref } })
        : null);
  }

  if (!donation) {
    // Unknown transaction — ack so PayMob doesn't retry forever.
    return ok({ ignored: true });
  }

  if (donation.status === "PENDING_PAYOUT" || donation.status === "PAID_OUT") {
    return ok({ alreadyProcessed: true });
  }

  await db.donation.update({
    where: { id: donation.id },
    data: success
      ? { status: "PENDING_PAYOUT", paidAt: new Date() }
      : { status: "FAILED" },
  });

  return ok({ processed: true, success });
}
