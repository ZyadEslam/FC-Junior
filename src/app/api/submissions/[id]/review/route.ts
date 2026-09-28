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
  });
  if (!submission) return fail("Submission not found.", 404);
  if (submission.status !== "PENDING") {
    return fail("This submission has already been reviewed.", 409);
  }

  const updated = await db.submission.update({
    where: { id: submission.id },
    data: {
      status: action === "APPROVE" ? "APPROVED" : "CHANGES_REQUESTED",
      feedback: action === "REQUEST_CHANGES" ? feedback ?? null : null,
      reviewedAt: new Date(),
    },
  });

  return ok({ id: updated.id, status: updated.status });
}
