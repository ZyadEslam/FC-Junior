import { db } from "@/lib/db";
import { fail, ok, parseBody, requireUser } from "@/lib/api";
import { taskUpdateSchema } from "@/lib/validation";

type Ctx = { params: { taskId: string } };

export async function PATCH(req: Request, { params }: Ctx) {
  const auth = await requireUser("ADMIN");
  if (auth.error) return auth.error;

  const parsed = await parseBody(req, taskUpdateSchema);
  if (parsed.error) return parsed.error;

  if (parsed.data.categoryIds) {
    const categories = await db.category.findMany({
      where: { id: { in: parsed.data.categoryIds }, isActive: true },
      select: { id: true },
    });
    if (categories.length !== parsed.data.categoryIds.length) {
      return fail("One or more selected categories are unavailable.", 400);
    }
  }

  const { categoryIds, rubric, testCases, ...taskData } = parsed.data;
  const existingTask = await db.task.findUnique({ where: { id: params.taskId }, select: { id: true } });
  if (!existingTask) return fail("Challenge not found.", 404);
  if (taskData.slug) {
    const duplicate = await db.task.findFirst({
      where: { slug: taskData.slug, NOT: { id: params.taskId } },
      select: { id: true },
    });
    if (duplicate) return fail("A challenge with this slug already exists.", 409);
  }
  await db.task.update({
    where: { id: params.taskId },
    data: {
      ...taskData,
      ...(rubric ? { rubric } : {}),
      ...(testCases ? { testCases } : {}),
      ...(categoryIds ? { categories: { set: categoryIds.map((id) => ({ id })) } } : {}),
    },
  });
  return ok({ updated: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const auth = await requireUser("ADMIN");
  if (auth.error) return auth.error;

  const result = await db.task.updateMany({
    where: { id: params.taskId },
    data: { isPublished: false },
  });
  if (!result.count) return fail("Challenge not found.", 404);
  return ok({ archived: true });
}
