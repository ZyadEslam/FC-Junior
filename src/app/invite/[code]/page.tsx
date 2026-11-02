import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ageBandLabel } from "@/lib/labels";
import { Logo } from "@/components/ui/logo";
import { InviteActions } from "./invite-actions";

export const dynamic = "force-dynamic";

export default async function InvitePage({ params }: { params: { code: string } }) {
  const invite = await db.invite.findUnique({
    where: { code: params.code },
    include: {
      child: { select: { firstName: true, ageBand: true, avatarColor: true } },
      createdBy: { select: { name: true } },
    },
  });

  if (!invite || invite.expiresAt < new Date()) notFound();

  const user = await getSessionUser();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex h-16 items-center justify-center border-b border-stone-200 bg-white">
        <Link href="/" aria-label="FC-Junior home">
          <Logo />
        </Link>
      </header>

      <main className="dot-grid flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-up">
          <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-pop">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-flame-600">
              Family circle invite
            </p>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-stone-900">
              {invite.createdBy.name.split(" ")[0]} invited you to cheer for{" "}
              {invite.child.firstName}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              FC-Junior is a cozy, family-only space where kids build cool things with code and
              the people who love them cheer them on. You&apos;ve been invited to{" "}
              {invite.child.firstName}&apos;s circle ({ageBandLabel[invite.child.ageBand]}).
            </p>

            <InviteActions
              code={invite.code}
              viewerRole={!user ? null : user.role === "DONOR" ? "DONOR" : "PARENT"}
              childName={invite.child.firstName}
            />

            <div className="mt-6 grid grid-cols-2 gap-2 border-t border-stone-100 pt-5 text-left">
              <div className="flex items-start gap-2">
                · 
                <p className="text-xs leading-snug text-stone-500">
                  Invite-only by design — no public profiles, ever
                </p>
              </div>
              <div className="flex items-start gap-2">
                ·
                <p className="text-xs leading-snug text-stone-500">
                  A parent approves every post you&apos;ll see
                </p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-stone-400">
            First names and age bands only — that&apos;s all a circle ever shows.
          </p>
        </div>
      </main>
    </div>
  );
}
