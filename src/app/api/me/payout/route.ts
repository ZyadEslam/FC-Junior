import { z } from "zod";
import { db } from "@/lib/db";
import { fail, ok, parseBody, requireUser } from "@/lib/api";

const EG_MOBILE = /^01[0-9]{9}$/; // Egyptian msisdn without country code
const EG_IBAN = /^EG[a-zA-Z0-9]{27}$/; // Egypt fixes 29-char IBAN

const schema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("WALLET"),
    dest: z
      .string()
      .trim()
      .regex(EG_MOBILE, "Mobile wallets in Egypt use an 11-digit number starting 01."),
  }),
  z.object({
    method: z.literal("BANK"),
    dest: z
      .string()
      .trim()
      .transform((v) => v.replace(/\s+/g, "").toUpperCase())
      .pipe(
        z
          .string()
          .regex(EG_IBAN, "Bank payouts need an Egyptian IBAN — 29 characters starting “EG”.")
      ),
  }),
]);

export async function GET() {
  const auth = await requireUser("PARENT");
  if (auth.error) return auth.error;
  const user = await db.user.findUnique({
    where: { id: auth.user.id },
    select: { payoutMethod: true, payoutDest: true },
  });
  return ok({ payoutMethod: user?.payoutMethod ?? null, payoutDest: mask(user?.payoutDest) });
}

/** Parent sets where Friday batches should land. */
export async function POST(req: Request) {
  const auth = await requireUser("PARENT");
  if (auth.error) return auth.error;
  const parsed = await parseBody(req, schema);
  if (parsed.error) return parsed.error;

  await db.user.update({
    where: { id: auth.user.id },
    data: { payoutMethod: parsed.data.method, payoutDest: parsed.data.dest },
  });

  return ok({ saved: true, payoutMethod: parsed.data.method, payoutDest: mask(parsed.data.dest) });
}

function mask(dest: string | null | undefined): string | null {
  if (!dest) return null;
  const tail = dest.slice(-4);
  return dest.length <= 6 ? `•••${tail}` : `${dest.slice(0, 3)}••••••${tail}`;
}
