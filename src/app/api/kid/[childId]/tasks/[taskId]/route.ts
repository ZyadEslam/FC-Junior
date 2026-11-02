import { db } from "@/lib/db";
import { fail, ok, requireChildWorkspace } from "@/lib/api";
import { ageBandOrder } from "@/lib/labels";

type Ctx = { params: { childId: string; taskId: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const workspace = await requireChildWorkspace(params.childId);
  if ("error" in workspace) return workspace.error;

  const child = await db.child.findFirst({
    where: { id: workspace.child.id },
    select: { id: true, ageBand: true, categories: { select: { id: true } } },
  });
  if (!child) return fail("Child not found.", 404);

  const task = await db.task.findUnique({
    where: { id: params.taskId },
    include: { categories: { select: { id: true, slug: true, name: true } } },
  });
  if (!task || !task.isPublished) return fail("Mission not found.", 404);
  if (
    ageBandOrder[task.ageBand] > ageBandOrder[child.ageBand] ||
    !task.categories.some((category) => child.categories.some((selected) => selected.id === category.id)) ||
    (task.generatedForChildId !== null && task.generatedForChildId !== child.id)
  ) {
    return fail("This challenge is not available for this child.", 404);
  }

  const submission = await db.submission.findUnique({
    where: { childId_taskId: { childId: child.id, taskId: task.id } },
    select: { id: true, status: true, note: true, feedback: true, proofLink: true, proofImage: true, updatedAt: true },
  });

  return ok({
    id: task.id,
    slug: task.slug,
    ageBand: task.ageBand,
    title: task.title,
    summary: task.summary,
    instructions: task.instructions,
    deliverable: task.deliverable,
    starter: task.starter,
    question: task.question,
    rubric: task.rubric as string[],
    difficulty: task.difficulty,
    points: task.points,
    estimatedMinutes: task.estimatedMinutes,
    categories: task.categories,
    testCases: Array.isArray(task.testCases)
      ? task.testCases.filter((testCase): testCase is string => typeof testCase === "string")
      : [],
    mySubmission: submission,
  });
}
