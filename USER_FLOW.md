# FC-Junior — Detailed User Flow

Version 4 · September 2026
(Updated: Groq-generated challenges · per-category levels · age- and category-based challenges · student badges · admin challenge studio)

FC-Junior is a private, family-only platform where kids earn real money by building
things — quests they finish, parents approve, and family members cheer with
small Friday payments. This document describes every role, every journey, every
state, and every screen in the current product.

---

## 1 · People & words

| Role | Who | Can do |
|------|-----|--------|
| **Parent** | The grown-up who runs the family space | Add kids, approve posts, manage invites, run Friday payday |
| **Builder** (kid) | The child, ages 8–17 | Signs into their own private studio, picks category-matched challenges, builds, and submits creations |
| **Family fan** (donor) | Grandma, uncle, godfather… | See approved builds, send cheers (money + message) |

Vocabulary across the product: tasks are **quests**, money is **cheers**,
paying out is **Friday payday**, the feed is the **wall**, supporters are the
**fan club** (circle), the moderator action is the **thumbs-up**.

Design principle: **no icons, no emoji in UI chrome.** Warmth comes from color,
typography, rounded shapes and copy. Only typographic glyphs: ★ (star points),
← / → in links, × close, ✓ check.

---

## 2 · The weekly loop (the heart of FC-Junior)

```
 01  Pick a quest          kid chooses from age-matched quest board
 02  Build it              kid makes the thing (Scratch-style project)
 03  Parent thumbs-up      parent reviews note/checklist → post or “tiny tweaks”
 04  Family cheers         circle members send $ + message (PayMob checkout)
 05  Friday payday         weekly batch lands with the parent
```

The loop renders as a numbered **stepper** (`LoopSteps`) on the kid home and is
vocabulary on the landing page. The first unfinished step carries a sun-yellow
“you're here” chip.

---

## 3 · Onboarding journeys

### 3.1 Parent sign-up
1. `/sign-up` — role cards (Parent / Family fan), name, email, password.
2. Lands on `/app/overview` (empty team) → **Add your first child**.
3. `/app/children/new` — first name, age (8–17), one or more project categories,
   and avatar color. Exact age is stored for the parent and used to derive an
   age group; invited supporters only see the age group.
   Existing profiles keep their existing age group until an exact age is added.
4. Available categories include Scratch, MIT App Inventor, Web Design, and
   Python Problem Solving. Admins can add more categories.
5. The overview shows each child&apos;s age, selected categories, progress, and
   received gifts. No exact birthdate, photo, or location is requested.

### 3.2 Building the fan club (invite)
1. Child page (`/app/children/[id]`) → **Invite a fan** → creates a code (`MAYA-FAM-26`-style).
2. Parent shares the link `/invite/[code]` (or just the code) by any channel.
3. Donor opens `/invite/[code]`:
   - Not signed in → buttons to `/sign-up?invite=` / `/sign-in?next=`.
   - Signed in as parent → politely told circles are for fan accounts.
   - Signed in as fan → enters **“You're the…”** (relation label) → **Join circle**.
4. Alternatively the donor can go to `/join` and type the code; a live preview
   card verifies it (“Found it — you're invited to cheer for Maya”) before
   continuing.

### 3.3 Sign-in
Grown-ups and fans use `/sign-in` with email and password. Each builder uses
`/studio-sign-in` with their private six-character Studio Code and 4–8 digit
PIN, created by their parent. A builder session can only open its matching
studio; it never includes guardian navigation, supporter access, payment, or
payout controls.

---

## 4 · Builder journey (kid — private studio)

1. The builder signs into `/studio-sign-in` and lands in their own
   `/app/kid/[childId]` studio. The quest board is child-only; guardians use
   the child profile to manage access and review submitted work.
2. **Hero card** (dark, dot-grid): greeting, ★ star count + level progress,
   “Coming on Friday” jar amount.
3. **Loop stepper** shows where they are in the week (numbered 01–05 with the
   “you're here” chip).
4. **Challenge board**: published challenges matched to age group and selected
   categories. A category filter narrows the board; cards show category,
   difficulty, status (*Waiting* / *On the wall* / *Needs tweaks*) and points.
   After choosing a category, the builder can ask FC-Junior to generate a fresh
   challenge. The generated task is saved to that child's board and uses the
   usual submission and parent-review flow.
5. Tapping a challenge opens `/app/kid/[childId]/tasks/[taskId]`:
   - intro, estimated minutes, challenge question, **success checklist** and
     test cases;
   - share form: show-&-tell note + optional proof link/screenshot;
   - if parent requested tweaks, the parent's note shows with
     *“Almost there — tiny tweaks”* and a *“Share it again”* state.
6. Badges unlock for participation milestones and parent-approved completed
   challenges; locked badges show progress toward their next milestone.
7. Nothing the kid shares is visible anywhere until the parent approves it.
   Builders can only access their own work—even when siblings share a device.
8. Each category has its own level. A level advances after every two
   parent-approved solutions in that category, and the current level guides
   later generated challenges. Difficulty calibration caps at level 8 to keep
   tasks age-appropriate, while the student's recorded category level can keep
   growing. The generator uses the child's age group, not their name or exact
   age; Groq credentials stay on the server.

### 4.1 Generated challenge configuration
Set `GROQ_API_KEY` on the server to enable generation. `GROQ_MODEL` is optional
and defaults to `llama-3.3-70b-versatile`. Each child is limited to ten
generated challenges in a rolling 24-hour window.

---

## 5 · Parent journey

### 5.1 Family overview — `/app/overview`
- Welcome message and clear actions to **Add a child** and **Review projects**.
- Stat cards: Children · Projects to review · Paid out so far.
- One card per child: age, level + ★, next step, categories, received this
  week, and actions to **View projects** or open the **Profile**.

### 5.2 Thumbs-up inbox — `/app/approvals`
- Each pending share = a review card: screenshot (if any), kid's note,
  difficulty chip, **the quest checklist** as a numbered review aid,
  optional “see it in action” link.
- Actions: **Thumbs-up — post it** or **Request tiny tweaks** (note required,
  ≥ 10 chars). Both show encouraging toasts; counts update everywhere.

### 5.3 Friday payday — `/app/payouts`
- **"Where your money lands"** card: parent registers their payout destination
  (Egyptian mobile wallet `01xxxxxxxxx` or IBAN `EG…`) — stored masked,
  changeable anytime. Collection (fans' cards/wallets) and payout (to the
  parent's wallet/IBAN) are two distinct PayMob rails: money settles weekly
  into FC-Junior's merchant account; the Friday batch then pushes each child's
  **net** to the parent.)
- How money moves: fan pays at PayMob checkout → settles into platform
  merchant account (10% fee held) → Friday batch sends net to parent's
  wallet/bank via Payouts API. Kids never touch account details.
- Pending jars per child (amount + cheer count, “Due Friday”).
- One **Send $X of cheers** action batches every pending cheer per child into a
  `Payout` record (in production: a real transfer per child).
- **Jar history**: past payouts with child, cheer count and week.

### 5.4 Child page — `/app/children/[id]` (“Hallway”)
- Child card: level, ★, lifetime earned, jar this week.
- **Studio access**: guardian can view or change the child's Studio Code and
  reset their PIN. The PIN is never displayed or stored in readable form.
- **Be the first supporter** / **Send a cheer** opens the child’s family wall,
  where the parent can contribute to the Friday jar using the same secure
  payment flow as invited supporters.
- Fan club roster, invite codes (create/copy), weekly jar goal editor.
- Latest cheers and submission history.

---

## 6 · Family supporter journey

### 6.1 Home — `/app/circle`
- Cards for each child: age group (not exact age), relation, projects shared,
  family gifts; actions **Send a gift** and **View projects**.
- Empty state explains invite-only; `/join` link for new codes.

### 6.2 The wall — `/app/circle/[childId]`
- Header: hero band (avatar, ages, N fans, cheered-so-far), **Send a cheer**.
- Feed: approved builds with kid's note, ★ points, screenshot/link,
  “Parent approved ✓” and per-post **Cheer for this** buttons.
- Right rail: **Your impact** (your running total) + “Why kids love Fridays” note.

### 6.3 Sending a cheer → **PayMob lifecycle** (EGP, with the platform fee)
1. Donor picks a preset (EGP 50 / 100 / 200 / 500) or types their own (EGP 50
   min), adds a message (≤140 chars, signed with their relation label). The
   modal shows the transparent breakdown before paying:
   **jar gets net · FC-Junior fee (10%, capped EGP 50) · you pay gross**.
2. `POST /api/payments/intention` (server):
   - **Fan-club gate**: only circle members (or the parent) can cheer — enforced
     on the server regardless of mode.
   - **DEMO** (PayMob keys absent): donation created directly as
     `PENDING_PAYOUT`, provider `DEMO` — practice money, instant confirmation.
   - **LIVE**: donation created as `PENDING_PAYMENT`, provider `PAYMOB`;
     PayMob **Intention API** called (card + Apple Pay integration ids,
     `extras.donation_id`, redirect + notification URLs) → returns unified
     checkout URL with client secret.
3. **LIVE redirect** → PayMob unified checkout (hosted — card, Apple Pay,
   wallets; installments possible via additional integration ids).
4. PayMob calls `/api/webhooks/paymob?hmac=…` — signature verified
   (HMAC-SHA-512 over the documented 20-field ordered concatenation);
   success → `PENDING_PAYOUT` + `paidAt`; failure → `FAILED`. Idempotent.
5. Browser lands on `/payments/return?donation=<id>` which polls
   `GET /api/payments/[id]/status` (2.5s) → **Success** (“Your cheer is in the
   jar…”), **Declined**, or **Confirming…** (30s graceful give-up).

### 6.4 Friday
The parent batches the week's funded cheers; donors see their totals in
“Your impact”; kids see the jar jump on their board.

---

## 7 · State models

### Submission (a shared build)
`PENDING` → `APPROVED` (on the wall)  
`PENDING` → `CHANGES_REQUESTED` (parent note → kid re-shares → `PENDING` again)

### Donation (a cheer)
```
DEMO  mode:            PENDING_PAYOUT → PAID_OUT
PAYMOB mode:           PENDING_PAYMENT ──(webhook success)──▶ PENDING_PAYOUT → PAID_OUT
                                    └──(webhook failure)──▶ FAILED
```
`PENDING_PAYMENT` never counts toward jars/history anywhere — only funded
cheers do.

### Payout
Created by the Friday batch (`POST /api/payouts/run`): one per child per run,
sum of that child's `PENDING_PAYOUT` donations; those rows flip to `PAID_OUT`.

### Child profile (privacy)
First name, exact age (8–17), derived age group, selected challenge categories,
accent color, weekly goal. Exact age is kept from supporters, who only see the
age group. No child email, login, photo requirement, location, or public profile.

---

## 8 · Screen map

| Path | Role | Purpose |
|------|------|---------|
| `/` | public | Landing: hero + loop + roles + quests + safety + CTA (all CSS, zero icons) |
| `/sign-in` / `/sign-up` | public | Split-screen auth |
| `/join` | public | Enter invite code with live preview |
| `/invite/[code]` | public | Invite landing + join form |
| `/app/overview` | parent | Family overview |
| `/app/children/new` | parent | Add a child, age, and challenge categories |
| `/app/children/[id]` | parent | Child admin: circle, invites, goal, history |
| `/app/approvals` | parent | Thumbs-up inbox |
| `/app/payouts` | parent | Friday payday + history |
| `/app/kid/[childId]` | kid (via parent) | Category-filterable challenge board and badges |
| `/app/kid/[childId]/tasks/[taskId]` | kid (via parent) | Challenge detail, test cases, and share form |
| `/app/circle` | donor | Fan-club home |
| `/app/circle/[childId]` | donor (+ parent) | The wall (feed) + cheer modal |
| `/payments/return` | donor | Post-checkout confirmation (polls status) |
| `/.well-known/apple-developer-merchantid-domain-association` | Apple/PayMob | Apple Pay domain verification file (from env) |

API surface adds: `POST /api/payments/intention`, `GET /api/payments/[id]/status`,
`POST /api/webhooks/paymob`. The old demo `POST /api/donations` is removed.

---

## 9 · Admin console (role: ADMIN)

- `/admin` — overview KPIs: GMV & platform fee revenue (all-time + this week),
  effective take rate, weekly GMV bars, provider split, ops counts; auto-refresh.
- `/admin/revenue` — the audit ledger: every cheer with gross/fee/net, provider,
  status, week; filterable with totals.
- `/admin/challenges` — add/deactivate categories, create age-banded challenges
  with checklists and optional test cases, and publish or unpublish challenges.
- Guardrails: ADMIN is redirected away from the family app; PARENT/DONOR get
  403 on admin APIs. Admins never see unmoderated child content personally.

## 10 · Trust & safety invariants (unchanged, hard rules)

1. No stranger can see a child, a build, or send money — circle gate on every
   query (children don't even show up as 403; they're 404).
2. Nothing is visible until a parent approves it.
3. Money moves only through the parent's umbrella: cheers (EGP, minus the
   transparent 10% capped fee) → weekly batch → parent. PayMob processing is
   PCI-hosted; FC-Junior never touches card data.
4. Child data minimization: custodial profiles only; supporters see a first
   name and age group, while exact age is only available to the parent and the
   parent-controlled child workspace.
