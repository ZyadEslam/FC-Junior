import { db } from "@/lib/db";
import { fail, ok, parseBody, requireUser } from "@/lib/api";
import { taskCreateSchema } from "@/lib/validation";

function testCaseList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export async function GET() {
  const auth = await requireUser("ADMIN");
  if (auth.error) return auth.error;

  const tasks = await db.task.findMany({
    orderBy: [{ ageBand: "asc" }, { order: "asc" }, { title: "asc" }],
    include: { categories: { select: { id: true, name: true } } },
  });

  return ok({
    tasks: tasks.map((task) => ({ ...task, rubric: testCaseList(task.rubric), testCases: testCaseList(task.testCases) })),
  });
}

export async function POST(req: Request) {
  const auth = await requireUser("ADMIN");
  if (auth.error) return auth.error;

  const parsed = await parseBody(req, taskCreateSchema);
  if (parsed.error) return parsed.error;

  const existingTask = await db.task.findUnique({ where: { slug: parsed.data.slug }, select: { id: true } });
  if (existingTask) return fail("A challenge with this slug already exists.", 409);

  const categories = await db.category.findMany({
    where: { id: { in: parsed.data.categoryIds }, isActive: true },
    select: { id: true },
  });
  if (categories.length !== parsed.data.categoryIds.length) {
    return fail("One or more selected categories are unavailable.", 400);
  }

  const { categoryIds, ...taskData } = parsed.data;
  const task = await db.task.create({
    data: {
      ...taskData,
      rubric: taskData.rubric,
      testCases: taskData.testCases,
      order: (await db.task.count()) + 1,
      categories: { connect: categoryIds.map((id) => ({ id })) },
    },
    select: { id: true, slug: true, title: true },
  });
  return ok({ task }, { status: 201 });
}
