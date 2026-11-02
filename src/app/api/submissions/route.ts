import { db } from "@/lib/db";
import { fail, ok, parseBody, requireChildWorkspace } from "@/lib/api";
import { submissionCreateSchema } from "@/lib/validation";
import { ageBandOrder } from "@/lib/labels";

export async function POST(req: Request) {
  const parsed = await parseBody(req, submissionCreateSchema);
  if (parsed.error) return parsed.error;
  const { childId, taskId, note, proofLink, proofImage } = parsed.data;
  const workspace = await requireChildWorkspace(childId);
  if ("error" in workspace) return workspace.error;

  // Custodial guard: the child must belong to this parent.
  const child = await db.child.findFirst({
    where: { id: workspace.child.id },
    select: { id: true, ageBand: true, categories: { select: { id: true } } },
  });
  if (!child) return fail("Child not found.", 404);

  const task = await db.task.findUnique({
    where: { id: taskId },
    include: { categories: { select: { id: true } } },
  });
  if (!task || !task.isPublished) return fail("Mission not found.", 404);
  if (
    ageBandOrder[task.ageBand] > ageBandOrder[child.ageBand] ||
    !task.categories.some((category) => child.categories.some((selected) => selected.id === category.id)) ||
    (task.generatedForChildId !== null && task.generatedForChildId !== child.id)
  ) {
    return fail("This challenge is not available for this child.", 404);
  }

  const existing = await db.submission.findUnique({
    where: { childId_taskId: { childId, taskId } },
  });

  if (existing?.status === "APPROVED") {
    return fail("This mission is already approved — nice work!", 409);
  }
  if (existing?.status === "PENDING") {
    return fail("This mission is already waiting for parent review.", 409);
  }

  if (existing) {
    // CHANGES_REQUESTED → resubmission resets the review cycle
    const updated = await db.submission.update({
      where: { id: existing.id },
      data: {
        note,
        proofLink: proofLink ?? null,
        proofImage: proofImage ?? null,
        status: "PENDING",
        feedback: null,
        reviewedAt: null,
      },
    });
    return ok({ id: updated.id, status: updated.status });
  }

  const created = await db.submission.create({
    data: { childId, taskId, note, proofLink, proofImage },
  });
  return ok({ id: created.id, status: created.status }, { status: 201 });
}
