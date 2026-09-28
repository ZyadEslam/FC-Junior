# Giglet

> Real skills. Real work. Family-funded.

Giglet turns "allowance" into "earned income": children complete curated skill
missions (Scratch, later web & security labs), a parent approves each piece of
work, and an **invite-only family circle** funds the wins — settled in a
**weekly batched payout** to the parent's custodial wallet.

This is the **Phase 1 MVP** build from the business plan. It deliberately
implements the safety constraints as _architecture_, not policy.

---

## Demo accounts

| Role   | Email                | Password   | Who                          |
| ------ | -------------------- | ---------- | ---------------------------- |
| Parent | `demo@giglet.app`    | `demo1234` | Laila — kids Maya & Adam     |
| Donor  | `grandma@giglet.app` | `demo1234` | Grandma Rose (Maya's circle) |
| Donor  | `samy@giglet.app`    | `demo1234` | Uncle Samy (Maya's circle)   |

Seeded invite code for Maya's circle: **`MAYA-FAM-26`** (try it via `/join`).

The sign-in page has one-click demo autofill buttons.

---

## Quick start

```bash
# 1 · PostgreSQL 17 (this sandbox runs it from /tmp — see scripts below)
#     Any Postgres ≥ 14 works. Create an empty DB named "giglet".

# 2 · Env
cp .env .env.local   # or just edit .env — set DATABASE_URL

# 3 · Install, migrate, seed, run
npm install
ç
npx tsx prisma/seed.ts
npm run dev -- -H 0.0.0.0
```

Sandbox-specific: Postgres was initialized under `/tmp/pgdata` and started as a
managed process:
`postgres -D /tmp/pgdata -k /tmp -p 5432 -c listen_addresses=127.0.0.1`
(run as the `postgres` user). If the sandbox restarts, re-run that command,
then `createdb -h 127.0.0.1 -U postgres giglet` if needed, then seed again.

---

## What's in the MVP (maps 1:1 to the plan)

| Plan requirement                                      | Where it lives                                          |
| ----------------------------------------------------- | ------------------------------------------------------- |
| Parent signup + custodial child profiles              | `/sign-up`, `/app/children/new`, `Child.parentId`       |
| Fixed task library (1 category, 16 missions, rubrics) | `prisma/seed.ts` → `/app/kid/[childId]`                 |
| Child submits proof → short post                      | Mission page: link OR screenshot + 20-600 char note     |
| Parent approval before circle visibility              | `/app/approvals` review queue, `Submission.status`      |
| Invite-only family circle                             | `/app/children/[id]` invites, `/invite/[code]`, `/join` |
| Donation pledge + weekly batched payout               | Donate modal, `/app/payouts`, ISO `weekKey` batching    |
| Donation counter visible inside circle                | Child wall header + circle cards (never public)         |
| First-name-only, age bands, no location               | Enforced by schema — these fields don't exist           |

Intentionally **out of scope** (per plan): AI-generated tasks, AI grading,
public discovery, real bug-bounty, cross-circle visibility.

## Safety architecture (hard rules, not settings)

- **Circle gate on data access**: every circle/feed/donation query checks
  `CircleMember` membership (or child ownership) server-side; strangers get
  404/403 — not even an existence leak.
- **Custodial only**: children have no login, no email, no standalone account.
  The kid workspace runs inside the parent's session with a visible
  "Parent preview" ribbon.
- **Moderation gate**: `Submission.status` starts `PENDING`; feeds select only
  `APPROVED`.
- **Session auth**: DB-backed sessions; the cookie holds an opaque token and
  Postgres stores only its sha256 hash (httpOnly, SameSite=Lax).

## Tech & code architecture

```
Next.js 14 (App Router) · TypeScript strict · Tailwind CSS · PostgreSQL ·
Prisma · TanStack Query · Zod · Axios · bcryptjs · lucide-react · date-fns
```

```
src/
├─ app/
│  ├─ page.tsx                  marketing landing (hand-built CSS product mock)
│  ├─ (auth) sign-in / sign-up  split-screen layout, zod-validated forms
│  ├─ invite/[code] · join      donor onboarding via invite links
│  ├─ app/                      authenticated product
│  │  ├─ layout.tsx             session guard + AppShell (sidebar, mobile tab bar)
│  │  ├─ overview/              parent dashboard (stats, builders, activity)
│  │  ├─ children/new|:[id]     create child · circle/invites/goal management
│  │  ├─ approvals/             moderation queue with rubric side panel
│  │  ├─ payouts/               weekly batch view + manual "run" (cron hook)
│  │  ├─ circle/                donor home + child wall (social-style feed)
│  │  └─ kid/[childId]/         kid workspace: mission board + mission detail
│  └─ api/…                     20 route handlers, all zod-validated
├─ components/
│  ├─ ui/                       design system: button, card, modal, toast,
│  │                            skeleton, empty-state, avatar, segmented, …
│  ├─ app/ · auth/ · marketing/ shells + landing sections
├─ hooks/                       TanStack Query hooks per domain
├─ lib/
│  ├─ auth.ts                   session creation/verification
│  ├─ api.ts                    requireUser + parseBody helpers (envelopes)
│  ├─ validation.ts             shared zod schemas (client + server)
│  ├─ db.ts · api-client.ts     Prisma singleton · Axios instance
│  └─ labels.ts · utils.ts      enum presentation maps · formatters
└─ types/api.ts                 DTO contracts shared by API + client
```

**Data flow:** client pages fetch via TanStack Query hooks → Axios → route
handlers → `requireUser` guard → zod `parseBody` → Prisma → standard
`ok({...})` / `fail(message, status)` envelopes. Mutations invalidate their
query keys; forms re-use the same zod schemas the server enforces.

**Money model:** donations carry `weekKey` (ISO week) + `PENDING_PAYOUT`;
`POST /api/payouts/run` groups them per child into a `Payout` in a transaction
(the exact job a Friday cron + Stripe Connect transfer would run).

## Production hardening notes (Phase 2+)

1. **Payments**: swap the simulated donation for Stripe PaymentIntents
   (create intent → webhook inserts the row) and Connect transfers for payouts;
   the `Payout`/`Donation` schema already matches that shape.
2. **Storage**: `proofImage` is a capped data-URL in Postgres for MVP; move to
   S3/R2 with signed URLs (+ image moderation) at scale.
3. **Cron**: schedule `payouts/run` (Vercel Cron); send digest emails via Resend.
4. **Compliance**: before a public launch — COPPA/GDPR-K review, verifiable
   parental consent record, DPA with processors, security headers, rate
   limiting on auth endpoints, audit log for money movements.
