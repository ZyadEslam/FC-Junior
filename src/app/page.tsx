import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  EyeOff,
  Lock,
  HeartHandshake,
  Gamepad2,
  Code2,
  Bug,
  CheckCircle2,
  UserPlus,
  ClipboardCheck,
  HandCoins,
  Star,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { HeroMock } from "@/components/marketing/hero-mock";

const NAV = [
  { href: "#how", label: "How it works" },
  { href: "#missions", label: "Missions" },
  { href: "#safety", label: "Safety" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* ── Nav ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-stone-50/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-7 md:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get started <ArrowRight className="h-3.5 w-3.5" /></Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="dot-grid absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-2 lg:pt-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200 shadow-card">
              <ShieldCheck className="h-3.5 w-3.5" /> Invite-only. Parent-approved. Always.
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-stone-900 sm:text-[52px]">
              Where kids turn <span className="text-brand-700">skills</span> into earnings.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-stone-600">
              Giglet gives your child real coding missions, a portfolio of finished work,
              and a paycheck for every completed task — funded by the people who already
              cheer for them: family.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/sign-up">
                <Button size="lg">Create your family account <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <a href="#how">
                <Button variant="outline" size="lg">See how it works</Button>
              </a>
            </div>
            <p className="mt-5 text-[13px] text-stone-500">
              No public profiles · No strangers · 12% platform fee, no subscription during beta
            </p>
          </div>
          <div className="pb-10 animate-fade-up [animation-delay:100ms]">
            <HeroMock />
          </div>
        </div>
      </section>

      {/* ── Problem strip ───────────────────────────────── */}
      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
          {[
            {
              quote: "My daughter finished three Scratch courses… and forgot everything a month later.",
              author: "Course completion without practice fades fast",
            },
            {
              quote: "I want her allowance to mean something. Effort in, money out — not just a weekly handout.",
              author: "Allowance rarely teaches the earning loop",
            },
            {
              quote: "Her grandparents keep asking how to support her coding beyond birthday gifts.",
              author: "Family wants a structured way to cheer",
            },
          ].map((t, i) => (
            <figure key={i} className="rounded-2xl border border-stone-100 bg-stone-50 p-6">
              <blockquote className="text-[15px] leading-relaxed text-stone-700">“{t.quote}”</blockquote>
              <figcaption className="mt-4 text-[13px] font-semibold text-brand-700">{t.author}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────── */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-700">How it works</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-stone-900">
            Freelance-style earning, rebuilt for families
          </h2>
          <p className="mt-3 text-stone-600">
            Not a marketplace — strangers never enter the picture. It&apos;s a structured
            achievement system that only looks and feels like real work, funded by the
            people who already love your kid.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: UserPlus,
              step: "Step 1",
              title: "You add your child",
              body: "Custodial by design: you own the account, set the age band, and control everything they see and post. No standalone child accounts — ever.",
            },
            {
              icon: ClipboardCheck,
              step: "Step 2",
              title: "They complete missions",
              body: "A curated skill-tree of Scratch missions with clear rubrics and proof-of-work. They submit; you approve before anything is visible.",
            },
            {
              icon: HandCoins,
              step: "Step 3",
              title: "Family funds the win",
              body: "Approved work posts to an invite-only circle. Grandparents and aunts send support with a message; earnings settle in one weekly payout.",
            },
          ].map((s, i) => (
            <div key={i} className="group relative rounded-2xl border border-stone-200 bg-white p-6 shadow-card transition-shadow hover:shadow-lift">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100">
                <s.icon className="h-5 w-5" />
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-wider text-stone-400">{s.step}</p>
              <h3 className="mt-1.5 text-lg font-bold text-stone-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Missions ────────────────────────────────────── */}
      <section id="missions" className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-wider text-brand-700">The mission library</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-stone-900">
                A skill tree, not a chore chart
              </h2>
              <p className="mt-3 text-stone-600">
                Every mission has a deliverable spec and a grading rubric. Kids climb from
                first sprites to full arcade games — and each level unlocks with age.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <MissionCard
              icon={Gamepad2}
              tone="brand"
              tag="Ages 8–10 · Live"
              title="Scratch Foundations"
              items={["Draw with Code: Your First Sprite", "Catch the Falling Stars", "Virtual Pet", "Paint Studio"]}
            />
            <MissionCard
              icon={Code2}
              tone="sky"
              tag="Ages 11–13 · Live"
              title="Game Architecture"
              items={["Dodge the Lasers", "Flappy-Style Jumper", "Space Shooter: Wave Defense", "Escape Room"]}
            />
            <div className="relative overflow-hidden rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-200/70 text-stone-400">
                <Bug className="h-5 w-5" />
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-wider text-stone-400">Ages 14+ · Coming soon</p>
              <h3 className="mt-1.5 text-lg font-bold text-stone-500">Web &amp; Security Labs</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">
                HTML/CSS/JS projects and cybersecurity challenges on intentionally-vulnerable
                sandboxes — never live targets.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-stone-200/70 px-2.5 py-1 text-[11px] font-semibold text-stone-500">
                <Lock className="h-3 w-3" /> In development
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Safety ──────────────────────────────────────── */}
      <section id="safety" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-brand-700">Safety architecture</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-stone-900">
              Private by design, safe by default
            </h2>
            <p className="mt-3 leading-relaxed text-stone-600">
              Children, money and the internet need hard walls, not soft promises.
              These rules are built into the data model — not just the privacy policy.
            </p>
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800 ring-1 ring-inset ring-brand-100">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              Family-circle gating is an architectural rule, not a settings toggle.
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: Lock,
                title: "Invite-only circles",
                body: "Only people you personally invite can see your child's work or send support. No discovery, no search, no strangers.",
              },
              {
                icon: CheckCircle2,
                title: "Parent-approved posts",
                body: "Nothing your child submits becomes visible until you review and approve it against the mission rubric.",
              },
              {
                icon: EyeOff,
                title: "Minimal identity",
                body: "First name only, age bands instead of exact ages, no photos required, no location — on every surface, by default.",
              },
              {
                icon: HeartHandshake,
                title: "Custodial wallet",
                body: "Funds settle to the parent's account in weekly batches. Children see progress and pride, not a bank balance.",
              },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-card">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-900 text-white">
                  <f.icon className="h-4.5 w-4.5" size={18} />
                </div>
                <h3 className="mt-4 text-[15px] font-bold text-stone-900">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-stone-900 px-6 py-16 text-center sm:px-12">
          <div className="dot-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
          <div className="relative">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white">
              <Star className="h-6 w-6 fill-white" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Turn allowance into earned income
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-stone-400">
              Set up your family in under two minutes. Your child&apos;s first mission is waiting.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/sign-up">
                <Button size="lg" variant="amber">Start free <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" className="bg-white/10 text-white hover:bg-white/15 focus-visible:outline-white">
                  Explore the demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <Logo size="sm" />
          <p className="text-[13px] text-stone-400">
            © 2026 Giglet · Invite-only family circles · MVP demo build
          </p>
          <nav className="flex gap-5 text-[13px] font-medium text-stone-500">
            <a href="#how" className="hover:text-stone-900">How it works</a>
            <a href="#safety" className="hover:text-stone-900">Safety</a>
            <Link href="/sign-in" className="hover:text-stone-900">Sign in</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function MissionCard({
  icon: Icon,
  tone,
  tag,
  title,
  items,
}: {
  icon: React.ElementType;
  tone: "brand" | "sky";
  tag: string;
  title: string;
  items: string[];
}) {
  const tones = {
    brand: "bg-brand-50 text-brand-700 ring-brand-100",
    sky: "bg-sky-50 text-sky-700 ring-sky-100",
  };
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-card">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-inset ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-5 text-xs font-bold uppercase tracking-wider text-brand-700">{tag}</p>
      <h3 className="mt-1.5 text-lg font-bold text-stone-900">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-2 text-sm text-stone-600">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
