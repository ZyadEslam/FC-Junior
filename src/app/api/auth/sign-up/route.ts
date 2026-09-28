import { db } from "@/lib/db";
import { createSession, hashPassword, toSafeUser } from "@/lib/auth";
import { fail, ok, parseBody } from "@/lib/api";
import { signUpSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const parsed = await parseBody(req, signUpSchema);
  if (parsed.error) return parsed.error;
  const { name, email, password, role, inviteCode } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return fail("An account with this email already exists.", 409);

  const user = await db.user.create({
    data: { name, email, passwordHash: await hashPassword(password), role },
  });

  // Donors can attach to a family circle immediately via invite code.
  if (role === "DONOR" && inviteCode) {
    const invite = await db.invite.findUnique({ where: { code: inviteCode.trim() } });
    if (invite && invite.expiresAt > new Date()) {
      await db.circleMember.upsert({
        where: { childId_donorId: { childId: invite.childId, donorId: user.id } },
        update: {},
        create: { childId: invite.childId, donorId: user.id, relationLabel: "Family member" },
      });
      await db.invite.update({ where: { id: invite.id }, data: { uses: { increment: 1 } } });
    }
  }

  await createSession(user.id);
  return ok({ user: toSafeUser(user), role: user.role }, { status: 201 });
}
