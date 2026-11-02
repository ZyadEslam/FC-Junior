import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const POINTS = [
  {
    title: "It's invite-only",
    body: "Only the grown-up who runs the family space can let people in. No strangers can find your kid — there's nothing public to find.",
  },
  {
    title: "The happy rhythm",
    body: "Kids pick quests, build, parents approve, family cheers, and everything lands together every Friday.",
  },
  {
    title: "Money stays grown-up",
    body: "Cheers collect into a weekly pot that lands with the parent — real money via PayMob, or practice money in the demo.",
  },
];

/** Split-screen shell for all auth pages. Left = product world, right = the form. */
export function AuthShell({
  title,
  tagline,
  subtitle,
  footnote,
  children,
  hideIntro,
}: {
  title: string;
  /** small description the child/family can read at a glance */
  tagline?: string;
  /** alias for tagline (older call sites) */
  subtitle?: string;
  footnote?: React.ReactNode;
  children: React.ReactNode;
  hideIntro?: boolean;
}) {
  const blurb = tagline ?? subtitle;
  return (
    <div className="flex min-h-screen bg-white lg:grid lg:grid-cols-[44%_1fr]">
      {/* ── Left: brand intro ── */}
      {!hideIntro && (
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-stone-900 p-10 lg:flex">
          <div className="dot-grid absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
          <div className="relative">
            <Link href="/" className="inline-block">
              <span className="font-display text-[22px] font-extrabold leading-none tracking-tight text-white">
                FC-Junior<span className="text-taxi-400">.</span>
              </span>
            </Link>
            <h2 className="mt-14 max-w-sm font-display text-[34px] font-extrabold leading-[1.15] tracking-tight text-white">
              Where screen time becomes something to brag about.
            </h2>
            <ol className="mt-10 max-w-sm space-y-6">
              {POINTS.map((p, i) => (
                <li key={p.title} className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[12px] font-extrabold tabular-nums text-sun-400 ring-1 ring-inset ring-white/15">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-[15px] font-bold text-white">{p.title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-stone-400">{p.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <p className="relative text-[13px] font-medium text-stone-500">
            Thousands of tiny cheers = one very proud kid.
          </p>
        </aside>
      )}

      {/* ── Right: form ── */}
      <main className="flex min-h-screen flex-1 flex-col items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md animate-fade-up">
          <Link href="/" className="mb-10 inline-block lg:hidden">
            <Logo />
          </Link>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-taxi-700">FC-Junior</p>
          <h1 className="mt-1.5 font-display text-[30px] font-extrabold tracking-tight text-stone-900">
            {title}
          </h1>
          {blurb && <p className="mt-2 text-[15px] leading-relaxed text-stone-500">{blurb}</p>}
          <div className="mt-8">{children}</div>
          {footnote && <div className="mt-6 text-sm text-stone-500">{footnote}</div>}
        </div>
      </main>
    </div>
  );
}
