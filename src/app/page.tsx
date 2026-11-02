import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

const LOOP = [
  { n: "01", t: "Choose a brief", d: "A tailored creative brief meets each child at their current skills and interests.", bg: "bg-taxi-400" },
  { n: "02", t: "Make the work", d: "Code, design, experiment, and turn an idea into a real project.", bg: "bg-paper" },
  { n: "03", t: "Curate the portfolio", d: "Parents review the work before it earns a place on the private Family Wall.", bg: "bg-flame-500 text-white" },
  { n: "04", t: "Collect the cheers", d: "The family backs the work with kind words and support through the week.", bg: "bg-taxi-400" },
  { n: "05", t: "Release Friday", d: "Every cheer comes together in a Friday ritual worth looking forward to.", bg: "bg-ink text-paper" },
];

const ROLES = [
  {
    tag: "THE GROWN-UP IN CHARGE",
    title: "The Parent",
    points: ["Adds kids in seconds — first name only", "Approves everything before it's seen", "Invites the fan club. Money lands with them"],
    cta: "Start as a parent",
    box: "bg-white",
  },
  {
    tag: "THE STAR OF THE SHOW",
    title: "The Builder",
    points: ["Gets AI-generated challenges for their age and interests", "Builds, then shows off with a screenshot", "Collects stars, levels and Friday cheers"],
    cta: "Meet the builder",
    box: "bg-taxi-400",
  },
  {
    tag: "GRANDMA & CO.",
    title: "The Fan Club",
    points: ["Joins only with a family invite link", "Watches every proud creation on the wall", "Cheers with EGP 50 and a hug in words"],
    cta: "I have an invite",
    href: "/join",
    box: "bg-flame-500 text-white",
  },
];

const SAFETY = [
  { k: "ACCESS", t: "Invite-only fan club", d: "Only people you personally invite can see your child's wall or send cheers. No browsing, no search, no strangers." },
  { k: "VISIBILITY", t: "Parents approve first", d: "Nothing your kid shares appears anywhere until you've seen it and tapped the thumbs-up." },
  { k: "IDENTITY", t: "Almost no personal info", d: "First name only, age bands instead of birthdays, no photos needed, no location — anywhere, ever." },
  { k: "MONEY", t: "Money stays with grown-ups", d: "Cheers collect during the week and land with the parent every Friday. Licensed processing by PayMob." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo size="sm" className="whitespace-nowrap text-[18px] sm:text-xl" />
          <nav className="hidden items-center gap-6 text-[13px] font-bold uppercase tracking-wide md:flex">
            <a href="#how" className="hover:underline">How it works</a>
            <a href="#quests" className="hover:underline">The studio</a>
            <a href="#safety" className="hover:underline">Private by design</a>
            <a href="#pricing" className="hover:underline">Friday ritual</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="px-2 text-xs uppercase sm:px-3 sm:text-sm">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" variant="amber" className="px-2 text-xs sm:px-3 sm:text-sm">Start studio</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b-2 border-ink bg-[#faf8f2]">
        <div className="studio-grid absolute inset-0 opacity-30" aria-hidden />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative animate-fade-up">
            <div className="checker mb-6 h-4 w-40" aria-hidden />
            <p className="inline-block border-2 border-ink bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest shadow-hard-xs">
              A private creative studio for young makers
            </p>
            <h1 className="mt-6 font-display text-[52px] leading-[0.98] tracking-tight sm:text-[76px]">
              Make work.
              <br />
              Build a{" "}
              <span className="relative inline-block bg-taxi-400 px-2">
                portfolio
                <span className="absolute inset-0 -z-10 translate-x-1.5 translate-y-1.5 bg-ink" aria-hidden />
              </span>
              .
              <br />
              Make Friday matter.
            </h1>
            <p className="mt-6 max-w-lg text-xl font-medium leading-[1.7] text-stone-700">
              FC-Junior is where young makers turn coding challenges into work they&apos;re proud to show. Each project becomes part of a private family portfolio — and every Friday, support for that work arrives together.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/sign-up">
                <Button size="lg" variant="amber">Open your family studio</Button>
              </Link>
              <a href="#how">
                <Button size="lg" variant="secondary">Explore the creative loop</Button>
              </a>
            </div>
            <p className="mt-5 text-[13px] font-medium text-stone-600">
              Built for Scratch, Python, web projects, and young creators up to 17
            </p>
          </div>

          <div className="relative animate-fade-up [animation-delay:100ms]">
            <div className="absolute -left-3 -top-3 h-10 w-10 border-2 border-ink bg-flame-500" aria-hidden />
            <div className="relative overflow-hidden rounded-2xl border-2 border-ink bg-taxi-50 shadow-hard-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/art/hero-builder.png" alt="A kid building a robot from blocks" className="w-full" />
            </div>
            <div className="absolute -bottom-6 -left-4 hidden w-56 rounded-2xl border-2 border-ink bg-white p-4 shadow-hard sm:block">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-stone-500">Friday release</p>
              <p className="mt-1 font-display text-2xl tracking-tight">{`EGP 315`} landed</p>
              <p className="mt-0.5 text-[11px] font-medium text-stone-600">3 cheers · a week of work celebrated</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Loop ── */}
      <section id="how" className="border-b-2 border-ink bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-flame-600">The creative loop</p>
          <h2 className="mt-3 max-w-xl font-display text-4xl leading-tight tracking-tight sm:text-5xl">
            From an idea to a moment the whole family remembers
          </h2>
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {LOOP.map((s) => (
              <li
                key={s.n}
                className={`flex min-h-[190px] flex-col border-2 border-ink p-4 shadow-hard-sm transition-transform hover:-translate-y-1 ${s.bg}`}
              >
                <span className="font-display text-lg tracking-tight opacity-50">{s.n}</span>
                <h3 className="mt-auto font-display text-lg leading-tight tracking-tight">{s.t}</h3>
                <p className="mt-2 text-[12.5px] font-medium leading-relaxed opacity-80">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Roles ── */}
      <section id="roles" className="border-b-2 border-ink">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-flame-600">Who&apos;s who</p>
          <h2 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">Three roles, zero confusion</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {ROLES.map((r) => (
              <div key={r.title} className={`border-2 border-ink p-6 shadow-hard-sm transition-transform hover:-translate-y-1 ${r.box}`}>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] opacity-60">{r.tag}</p>
                <h3 className="mt-2 font-display text-2xl tracking-tight">{r.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {r.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-[15px] font-medium leading-[1.7]">
                      <span className="mt-1.5 h-2.5 w-2.5 shrink-0 border-2 border-ink bg-taxi-400" aria-hidden />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link href={r.href ?? "/sign-up"} className="mt-6 block">
                  <Button variant={r.box.includes("flame") ? "primary" : "secondary"} size="sm" className="w-full">
                    {r.cta} →
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI challenges ── */}
      <section id="quests" className="border-b-2 border-ink bg-taxi-400">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-ink/60">A studio that grows with them</p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight tracking-tight sm:text-5xl">
            Serious creative tools, at the right starting point
          </h2>
          <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-ink/75">
            From first Scratch sprites to Python logic and personal websites, FC-Junior gives each maker a fresh brief, clear goals, and room to develop their own point of view.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { band: "VISUAL CODING", title: "Scratch", items: ["A new project question", "A guided challenge checklist", "Difficulty that grows with practice"], box: "bg-paper" },
              { band: "APP BUILDING", title: "MIT App Inventor", items: ["Ideas for useful little apps", "Step-by-step build goals", "Checks for important behaviors"], box: "bg-white" },
              { band: "CODE & WEB", title: "Python and Web Design", items: ["Fresh coding problems", "Age-appropriate instructions", "More reasoning as skills grow"], box: "bg-ink text-paper" },
            ].map((t) => (
              <div key={t.title} className={`border-2 border-ink p-6 shadow-hard ${t.box}`}>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] opacity-60">{t.band}</p>
                <h3 className="mt-2 font-display text-xl tracking-tight">{t.title}</h3>
                <ul className="mt-4 space-y-2">
                  {t.items.map((it) => (
                    <li key={it} className="flex items-start gap-2.5 text-sm font-medium">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 ${t.box === "bg-ink text-paper" ? "bg-taxi-400" : "bg-flame-500"}`} aria-hidden />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing / how we earn ── */}
      <section id="pricing" className="border-b-2 border-ink bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-flame-600">How we earn</p>
            <h2 className="mt-3 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
              Friday is more than a transaction.
            </h2>
            <p className="mt-4 text-xl font-medium leading-[1.7] text-stone-700">
              It&apos;s the weekly release: a jar of messages, encouragement, and earnings gathered around the projects a child made. FC-Junior keeps{" "}
              <span className="border-b-4 border-taxi-400 font-extrabold">10% — capped at EGP 50</span> per cheer.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                ["EGP 50 cheer", "family gets EGP 45 · we keep 5"],
                ["EGP 200 cheer", "family gets EGP 180 · we keep 20"],
                ["EGP 1,000 gift", "family gets EGP 950 · we keep just 50"],
              ].map(([k, v]) => (
                <li key={k} className="flex flex-wrap items-baseline gap-3 border-2 border-ink bg-paper px-4 py-2.5 shadow-hard-xs">
                  <span className="font-display text-sm tracking-tight">{k}</span>
                  <span className="text-sm font-medium text-stone-600">→ {v}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[13px] font-medium text-stone-600">
              Never any subscription for parents. Never a cut of the stars. The fee covers
              PayMob card/Apple Pay processing, hosting, and keeping the fan club invite-only forever.
            </p>
          </div>
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl border-2 border-ink bg-taxi-50 shadow-hard-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/art/friday-jar.png" alt="A jar of Friday cheers with coins and an envelope" className="w-full" />
            </div>
            <div className="absolute -right-3 -top-3 hidden h-12 w-12 items-center justify-center border-2 border-ink bg-taxi-400 font-display text-lg shadow-hard-sm sm:flex">
              10%
            </div>
          </div>
        </div>
      </section>

      {/* ── Safety ── */}
      <section id="safety" className="border-b-2 border-ink bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.15fr]">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-taxi-300">Safety</p>
              <h2 className="mt-3 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
                Cozy like a treehouse — the door opens for family
              </h2>
              <p className="mt-4 font-medium leading-relaxed text-stone-300">
                Kids, money and the internet need hard walls, not soft promises.
                These aren&apos;t settings you can switch off — they&apos;re how FC-Junior is built.
              </p>
              <div className="mt-6 border-2 border-taxi-400 bg-taxi-400/10 px-4 py-3.5 text-sm font-bold text-taxi-300">
                There is no “public” on FC-Junior. Period.
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {SAFETY.map((f) => (
                <div key={f.t} className="border-2 border-paper/25 bg-[#1E1B17] p-5">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-flame-300">{f.k}</p>
                  <h3 className="mt-2 font-display text-lg leading-tight tracking-tight">{f.t}</h3>
                  <p className="mt-2 text-[15px] font-medium leading-[1.7] text-stone-300">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-taxi-400">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <div className="checker mx-auto h-4 w-40" aria-hidden />
          <h2 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">
            This Friday could celebrate their first real project
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-medium text-ink/70">
            Set up the studio, choose their interests, and give their next creation a place to live.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/sign-up">
              <Button size="lg" variant="primary">Start your family studio</Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="secondary">Peek at the demo</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t-2 border-ink bg-paper">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-[13px] font-semibold sm:flex-row sm:px-6">
          <Logo size="sm" />
          <p className="text-stone-500">© 2026 FC-Junior · Made for families, kept away from strangers · Payments by PayMob</p>
          <nav className="flex gap-5 uppercase tracking-wide">
            <a href="#how" className="hover:underline">The loop</a>
            <a href="#pricing" className="hover:underline">Fee</a>
            <Link href="/join" className="hover:underline">I have an invite</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
