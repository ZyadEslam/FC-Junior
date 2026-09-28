import { db } from "@/lib/db";
import { fail, ok, parseBody, requireUser } from "@/lib/api";
import { donationCreateSchema } from "@/lib/validation";
import { weekKeyOf } from "@/lib/utils";

export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const user = auth.user;

  const parsed = await parseBody(req, donationCreateSchema);
  if (parsed.error) return parsed.error;
  const { childId, submissionId, amountCents, message } = parsed.data;

  const child = await db.child.findUnique({ where: { id: childId }, select: { id: true, parentId: true } });
  if (!child) return fail("Not found.", 404);

  // Hard circle gate: donor must be a member; parent may top up their own child.
  if (user.role === "PARENT") {
    if (child.parentId !== user.id) return fail("Not found.", 404);
  } else {
    const member = await db.circleMember.findUnique({
      where: { childId_donorId: { childId, donorId: user.id } },
    });
    if (!member) return fail("You're not part of this family circle.", 403);
  }

  if (submissionId) {
    const submission = await db.submission.findFirst({
      where: { id: submissionId, childId, status: "APPROVED" },
      select: { id: true },
    });
    if (!submission) return fail("That post is not available.", 404);
  }

  /*
   * PAYMENTS — MVP simulation.
   * Production: create a Stripe PaymentIntent here, confirm on the client,
   * and only insert the Donation row from the payment webhook. The weekly
   * payout then becomes a Stripe Connect transfer to the parent's account.
   */
  const donation = await db.donation.create({
    data: {
      childId,
      donorId: user.id,
      submissionId: submissionId ?? null,
      amountCents,
      message: message || null,
      weekKey: weekKeyOf(new Date()),
    },
  });

  return ok({ id: donation.id, status: donation.status }, { status: 201 });
}
