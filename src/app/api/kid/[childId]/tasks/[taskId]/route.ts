import { db } from "@/lib/db";
import { fail, ok, requireUser } from "@/lib/api";

type Ctx = { params: { childId: string; taskId: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const auth = await requireUser("PARENT");
  if (auth.error) return auth.error;

  const child = await db.child.findFirst({
    where: { id: params.childId, parentId: auth.user.id },
    select: { id: true },
  });
  if (!child) return fail("Child not found.", 404);

  const task = await db.task.findUnique({ where: { id: params.taskId } });
  if (!task || !task.isPublished) return fail("Mission not found.", 404);

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
    rubric: task.rubric as string[],
    difficulty: task.difficulty,
    points: task.points,
    estimatedMinutes: task.estimatedMinutes,
    mySubmission: submission,
  });
}
