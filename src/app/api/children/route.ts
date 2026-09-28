import { db } from "@/lib/db";
import { fail, ok, parseBody, requireUser } from "@/lib/api";
import { childCreateSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const auth = await requireUser("PARENT");
  if (auth.error) return auth.error;

  const parsed = await parseBody(req, childCreateSchema);
  if (parsed.error) return parsed.error;

  const count = await db.child.count({ where: { parentId: auth.user.id } });
  if (count >= 5) return fail("You can add up to 5 children on this plan.", 400);

  const child = await db.child.create({
    data: { ...parsed.data, parentId: auth.user.id },
  });

  return ok({ id: child.id }, { status: 201 });
}
