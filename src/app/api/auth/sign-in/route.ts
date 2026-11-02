import { db } from "@/lib/db";
import { createSession, toSafeUser, verifyPassword } from "@/lib/auth";
import { fail, ok, parseBody } from "@/lib/api";
import { signInSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const parsed = await parseBody(req, signInSchema);
  if (parsed.error) return parsed.error;
  const { email, password } = parsed.data;

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return fail("Incorrect email or password.", 401);
  }

  await createSession(user.id);
  return ok({ user: toSafeUser(user), role: user.role });
}
