import { db } from "@/lib/db";
import { fail, ok, requireUser } from "@/lib/api";

type Ctx = { params: { id: string } };

/** Pollable cheer status for the post-checkout return page. */
export async function GET(_req: Request, { params }: Ctx) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const user = auth.user;

  const donation = await db.donation.findUnique({
    where: { id: params.id },
    include: { child: { select: { parentId: true, firstName: true, id: true } } },
  });
  if (!donation) return fail("Not found.", 404);

  const isDonor = donation.donorId === user.id;
  const isParent = donation.child.parentId === user.id;
  if (!isDonor && !isParent) return fail("Not found.", 404);

  return ok({
    status: donation.status,
    paid: donation.status === "PENDING_PAYOUT" || donation.status === "PAID_OUT",
    failed: donation.status === "FAILED",
    childId: donation.child.id,
    childName: donation.child.firstName,
    amountCents: donation.amountCents,
    viewerIsParent: isParent,
  });
}
