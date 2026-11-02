import "server-only";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import { db } from "./db";

/**
 * Session auth — database-backed sessions with an httpOnly cookie.
 * The cookie holds a random bearer token; the DB stores only its sha256 hash,
 * so a database leak never exposes usable session tokens.
 */

export const SESSION_COOKIE = "giglet_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

const sha256 = (value: string) => crypto.createHash("sha256").update(value).digest("hex");

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/** Creates a session row and sets the cookie. Route handlers only. */
export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.session.create({
    data: { id: sha256(token), userId, expiresAt },
  });

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function destroySession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { id: sha256(token) } });
  }
  cookies().delete(SESSION_COOKIE);
}

/** Resolves the current user from the session cookie, or null. */
export async function getSessionUser(): Promise<User | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { id: sha256(token) },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return session.user;
}

export type SafeUser = Pick<User, "id" | "email" | "name" | "role" | "createdAt">;

export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
}
