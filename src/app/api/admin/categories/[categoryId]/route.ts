import { db } from "@/lib/db";
import { fail, ok, parseBody, requireUser } from "@/lib/api";
import { categoryUpdateSchema } from "@/lib/validation";

type Ctx = { params: { categoryId: string } };

export async function PATCH(req: Request, { params }: Ctx) {
  const auth = await requireUser("ADMIN");
  if (auth.error) return auth.error;

  const parsed = await parseBody(req, categoryUpdateSchema);
  if (parsed.error) return parsed.error;

  const updated = await db.category.updateMany({
    where: { id: params.categoryId },
    data: parsed.data,
  });
  if (!updated.count) return fail("Category not found.", 404);
  return ok({ updated: true });
}
