import { db } from "@/lib/db";
import { fail, ok, parseBody, requireUser } from "@/lib/api";
import { inviteAcceptSchema } from "@/lib/validation";

type Ctx = { params: { code: string } };

export async function POST(req: Request, { params }: Ctx) {
  const auth = await requireUser("DONOR");
  if (auth.error) return auth.error;

  const parsed = await parseBody(req, inviteAcceptSchema);
  if (parsed.error) return parsed.error;

  const invite = await db.invite.findUnique({
    where: { code: params.code },
    include: { child: { select: { parentId: true, firstName: true } } },
  });
  if (!invite || invite.expiresAt < new Date()) {
    return fail("This invite link is invalid or has expired.", 404);
  }

  const existing = await db.circleMember.findUnique({
    where: { childId_donorId: { childId: invite.childId, donorId: auth.user.id } },
  });
  if (existing) return ok({ childId: invite.childId, alreadyMember: true });

  await db.$transaction([
    db.circleMember.create({
      data: {
        childId: invite.childId,
        donorId: auth.user.id,
        relationLabel: parsed.data.relationLabel,
      },
    }),
    db.invite.update({ where: { id: invite.id }, data: { uses: { increment: 1 } } }),
  ]);

  return ok({ childId: invite.childId, alreadyMember: false }, { status: 201 });
}
