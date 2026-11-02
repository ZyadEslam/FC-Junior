import { db } from "@/lib/db";
import { fail, ok, parseBody, requireUser } from "@/lib/api";
import { childCreateSchema } from "@/lib/validation";
import { ageBandForAge } from "@/lib/labels";
import { hashPassword } from "@/lib/auth";
import crypto from "node:crypto";

function studioCode() {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

export async function POST(req: Request) {
  const auth = await requireUser("PARENT");
  if (auth.error) return auth.error;

  const parsed = await parseBody(req, childCreateSchema);
  if (parsed.error) return parsed.error;

  const count = await db.child.count({ where: { parentId: auth.user.id } });
  if (count >= 5) return fail("You can add up to 5 children on this plan.", 400);

  const categories = await db.category.findMany({
    where: { id: { in: parsed.data.categoryIds }, isActive: true },
    select: { id: true },
  });
  if (categories.length !== parsed.data.categoryIds.length) {
    return fail("One or more selected challenge categories are unavailable.", 400);
  }

  const { categoryIds, age, pin, ...childData } = parsed.data;
  const code = studioCode();
  const pinHash = await hashPassword(pin);
  const child = await db.$transaction(async (tx) => {
    const account = await tx.user.create({
      data: {
        name: childData.firstName,
        // Child accounts never use email sign-in. This non-routable value only satisfies
        // the shared account model and is never returned to the client.
        email: `child-${crypto.randomUUID()}@accounts.giglet.local`,
        passwordHash: pinHash,
        role: "CHILD",
      },
    });
    return tx.child.create({
      data: {
        ...childData,
        age,
        ageBand: ageBandForAge(age),
        parentId: auth.user.id,
        accountId: account.id,
        studioCode: code,
        categories: { connect: categoryIds.map((id) => ({ id })) },
      },
    });
  });

  return ok({ id: child.id, studioCode: code }, { status: 201 });
}
