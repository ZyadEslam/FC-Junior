import { db } from "@/lib/db";
import { fail, ok, parseBody, requireUser } from "@/lib/api";
import { reviewSchema } from "@/lib/validation";

type Ctx = { params: { id: string } };

export async function POST(req: Request, { params }: Ctx) {
  const auth = await requireUser("PARENT");
  if (auth.error) return auth.error;

  const parsed = await parseBody(req, reviewSchema);
  if (parsed.error) return parsed.error;
  const { action, feedback } = parsed.data;

  const submission = await db.submission.findFirst({
    where: { id: params.id, child: { parentId: auth.user.id } },
    include: { task: { select: { categories: { select: { id: true } } } } },
  });
  if (!submission) return fail("Submission not found.", 404);
  if (submission.status !== "PENDING") {
    return fail("This submission has already been reviewed.", 409);
  }

  const updated = await db.$transaction(async (tx) => {
    const result = await tx.submission.updateMany({
      where: { id: submission.id, status: "PENDING" },
      data: {
        status: action === "APPROVE" ? "APPROVED" : "CHANGES_REQUESTED",
        feedback: action === "REQUEST_CHANGES" ? feedback ?? null : null,
        reviewedAt: new Date(),
      },
    });
    if (result.count !== 1) return null;

    if (action === "APPROVE") {
      for (const category of submission.task.categories) {
        const progress = await tx.categoryProgress.upsert({
          where: {
            childId_categoryId: { childId: submission.childId, categoryId: category.id },
          },
          create: {
            childId: submission.childId,
            categoryId: category.id,
            solvedCount: 1,
            level: 1,
          },
          update: { solvedCount: { increment: 1 } },
          select: { solvedCount: true },
        });
        await tx.categoryProgress.update({
          where: {
            childId_categoryId: { childId: submission.childId, categoryId: category.id },
          },
          data: { level: Math.floor(progress.solvedCount / 2) + 1 },
        });
      }
    }

    return { id: submission.id, status: action === "APPROVE" ? "APPROVED" : "CHANGES_REQUESTED" };
  });
  if (!updated) return fail("This submission has already been reviewed.", 409);

  return ok(updated);
}
