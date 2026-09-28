import crypto from "node:crypto";
import { db } from "@/lib/db";
import { fail, ok, requireUser } from "@/lib/api";

/** Creates a fresh invite code for one of the parent's children. */
export async function POST(req: Request) {
  const auth = await requireUser("PARENT");
  if (auth.error) return auth.error;

  let childId: string | undefined;
  try {
    const body = (await req.json()) as { childId?: string };
    childId = body.childId;
  } catch {
    return fail("Invalid JSON body.", 400);
  }
  if (!childId) return fail("childId is required.", 422);

  const child = await db.child.findFirst({ where: { id: childId, parentId: auth.user.id } });
  if (!child) return fail("Child not found.", 404);

  const code = crypto
    .randomBytes(6)
    .toString("base64url")
    .toUpperCase()
    .replace(/[-_]/g, "K");

  const invite = await db.invite.create({
    data: {
      code,
      childId,
      createdById: auth.user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 14 days
    },
  });

  return ok({ code: invite.code, expiresAt: invite.expiresAt }, { status: 201 });
}
