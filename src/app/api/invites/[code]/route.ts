import { db } from "@/lib/db";
import { fail, ok } from "@/lib/api";

type Ctx = { params: { code: string } };

/** Public preview of an invite — safe: first name + age band only. */
export async function GET(_req: Request, { params }: Ctx) {
  const invite = await db.invite.findUnique({
    where: { code: params.code },
    include: {
      child: { select: { firstName: true, ageBand: true } },
      createdBy: { select: { name: true } },
    },
  });

  if (!invite || invite.expiresAt < new Date()) {
    return fail("This invite link is invalid or has expired.", 404);
  }

  return ok({
    code: invite.code,
    childFirstName: invite.child.firstName,
    childAgeBand: invite.child.ageBand,
    inviterName: invite.createdBy.name,
    expiresAt: invite.expiresAt,
  });
}
