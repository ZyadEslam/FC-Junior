import { db } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { fail, ok, parseBody } from "@/lib/api";
import { childSignInSchema } from "@/lib/validation";

/** Child authentication deliberately uses a private Studio Code + PIN, never a guardian credential. */
export async function POST(req: Request) {
  const parsed = await parseBody(req, childSignInSchema);
  if (parsed.error) return parsed.error;

  const child = await db.child.findUnique({
    where: { studioCode: parsed.data.studioCode },
    include: { account: true },
  });
  if (!child?.account || !(await verifyPassword(parsed.data.pin, child.account.passwordHash))) {
    return fail("That Studio Code or PIN doesn't match. Ask your grown-up for help.", 401);
  }

  await createSession(child.account.id);
  return ok({ role: "CHILD" as const, childId: child.id });
}
