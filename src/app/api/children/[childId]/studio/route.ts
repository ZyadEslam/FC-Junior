import crypto from "node:crypto";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { fail, ok, parseBody, requireUser } from "@/lib/api";
import { studioAccessUpdateSchema } from "@/lib/validation";

type Ctx = { params: { childId: string } };

function newStudioCode() {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

/** Guardian-only Studio Code and PIN management. PINs are always hashed and never returned. */
export async function PATCH(req: Request, { params }: Ctx) {
  const auth = await requireUser("PARENT");
  if (auth.error) return auth.error;
  const parsed = await parseBody(req, studioAccessUpdateSchema);
  if (parsed.error) return parsed.error;

  const child = await db.child.findFirst({ where: { id: params.childId, parentId: auth.user.id } });
  if (!child) return fail("Child not found.", 404);
  if (!child.accountId && !parsed.data.pin) {
    return fail("Set a new PIN to finish creating this child's studio access.", 422);
  }

  const studioCode = parsed.data.studioCode ?? child.studioCode ?? newStudioCode();
  const codeOwner = await db.child.findFirst({ where: { studioCode, id: { not: child.id } }, select: { id: true } });
  if (codeOwner) return fail("That Studio Code is already in use. Choose another one.", 409);

  const pinHash = parsed.data.pin ? await hashPassword(parsed.data.pin) : undefined;
  const updated = await db.$transaction(async (tx) => {
    let accountId = child.accountId;
    if (accountId && pinHash) {
      await tx.user.update({ where: { id: accountId }, data: { passwordHash: pinHash } });
    }
    if (!accountId) {
      const account = await tx.user.create({
        data: {
          name: child.firstName,
          email: `child-${crypto.randomUUID()}@accounts.giglet.local`,
          passwordHash: pinHash!,
          role: "CHILD",
        },
      });
      accountId = account.id;
    }
    return tx.child.update({ where: { id: child.id }, data: { studioCode, accountId }, select: { studioCode: true } });
  });

  return ok({ studioCode: updated.studioCode });
}
