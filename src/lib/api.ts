import { NextResponse } from "next/server";
import type { Role, User } from "@prisma/client";
import { ZodError, type ZodSchema } from "zod";
import { getSessionUser } from "./auth";

/** Standard success envelope. */
export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

/** Standard error envelope: { error: { message } }. */
export function fail(message: string, status = 400) {
  return NextResponse.json({ error: { message } }, { status });
}

type AuthSuccess = { user: User; error?: never };
type AuthFailure = { user?: never; error: NextResponse };

/** Requires a signed-in user, optionally restricted to role(s). */
export async function requireUser(role?: Role | Role[]): Promise<AuthSuccess | AuthFailure> {
  const user = await getSessionUser();
  if (!user) return { error: fail("You must be signed in.", 401) };
  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(user.role)) {
      return { error: fail("You don't have access to this.", 403) };
    }
  }
  return { user };
}

/** Parses a JSON body against a zod schema, returning data or a 422 response. */
export async function parseBody<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse }> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return { error: fail("Invalid JSON body.", 400) };
  }
  try {
    return { data: schema.parse(json) };
  } catch (e) {
    if (e instanceof ZodError) {
      const first = e.errors[0];
      const where = first.path.join(".");
      return { error: fail(where ? `${where}: ${first.message}` : first.message, 422) };
    }
    return { error: fail("Invalid request.", 400) };
  }
}
