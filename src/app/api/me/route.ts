import { getSessionUser, toSafeUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return fail("Not signed in.", 401);
  return ok({ user: toSafeUser(user) });
}
