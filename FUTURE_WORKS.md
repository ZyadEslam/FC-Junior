# FC-Junior — Future Works: Scaling Roadmap

Version 1 · September 2026
Phased plan from family MVP → a durable, safe kids-earn platform.
Each phase lists its *why*, the concrete work, and what unblocks next.

---

## Phase 0 — What exists today (baseline)

- Full weekly loop in production-quality UI (icon-free editorial design).
- Custodial child profiles, invite-only circles, parent moderation.
- PayMob live-mode path (Intention API, HMAC webhook, unified checkout,
  Apple Pay domain wiring) with graceful demo fallback.
- Weekly payout batching (book-keeping level).

---

## Phase 1 — “Real money, real trust” (0–3 months)

**Goal:** every cheer is a real, compliant transaction; every parent can
actually receive it.

**Payments & compliance**
1. PayMob **payouts** — connect the Friday batch to real disbursement into
   the parent's verified account/wallet (PayMob Payouts or bank partner).
2. **Parent KYC** — collect full name, national ID/passport, mobile wallet
   number or IBAN at first payout request; block payouts until verified.
3. **Fee transparency** — display PayMob processing fee + FC-Junior's service
   fee on the cheer screen (“$10 → kid's jar gets $9.××”).
4. **Refunds & chargebacks** — refund endpoint + webhook handling
   (`is_refunded`), support runbook.
5. **Installments** — enable PayMob installments integration id for
   higher-value cheers (gift-like occasions); guardrails: caps + parent opt-in.
6. **COPPA/GDPR-K program** — verifiable parental consent record, DPA with
   PayMob and every processor, data-retention policy, child data export/delete
   self-service for parents (GDPR-K Art. 20/17).
7. Rate limiting on auth/payment endpoints, request logging, anomaly alerts
   (e.g. > N cheers/min from one account).

**Foundation**
8. Idempotency keys on all money mutations; audit log table for
   every payment-state change.
9. Move `proofImage` from Postgres data-URLs to **S3/R2 with signed URLs**
   + content-type sniffing and size caps.

---

## Phase 2 — “The product families love weekly” (3–6 months)

**Engagement**
1. **Email/push digests** (Resend/SNS): “Maya shared something”, Friday recap,
   “Grandma haven't cheered in 3 weeks” — strict double opt-in.
2. **In-app notifications** + badge counts on parent/donor shells.
3. **Streaks & season quests** (Eid, summer, back-to-school) with bonus ★.
4. **Quest creation studio for parents** — template editor (“build & count
   your [coins/books/etc]”) so the board personalizes per kid.
5. **Comment/reaction layer** on wall posts (still family-only; parent
   moderation reused).

**Kid experience**
6. **In-app builders**: embed a Scratch-like block editor (Blockly) plus a
   sandboxed runtime so “build” happens inside FC-Junior, not on external links —
   auto-attachable proof.
7. Kid-facing language toggles (EN/AR with full RTL).

---

## Phase 3 — “Scale the platform” (6–12 months)

**Infrastructure**
1. Background **queue** (BullMQ/SQS) for webhooks, emails, payouts — retries,
   dead-letter, replay tooling.
2. Read models / caching (Redis) for wall feeds and leaderboards; move feed
   pagination to cursor-based.
3. **Multi-currency** — EGP first-class, then USD/SAR/AED; FX policy at
   intention time; display formatting per locale.
4. CDN + edge caching for public assets; image pipeline (resize/moderation
   via a provider like Sift/Amazon Rekognition Custom Labels).
5. Observability: OpenTelemetry traces, Sentry, structured logs; SLO for
   payment webhook latency (< 60s end-to-end).

**Growth**
6. **School/club mode (B2B2C)** — teachers run supervised “class circles”
   (parent approves enrollment), turning FC-Junior into after-school clubs and
   coding bootcamps with built-in family funding. Requires sub-admin roles and
   scoped visibility (class-wide wall, no cross-class discovery).
7. Referral program: invite-codes attribution → perk credits.
8. Marketing site: SEO content (“teaching kids money with code”), embeddable
   demo, pre-launch waitlist per country.

**AI layer (carefully, behind parents)**
9. **Coach hints** — age-appropriate, deterministic-first AI hints during
   quests (“try changing the color block”) — never chat, never free-form;
   parent toggle, full logging.
10. **Auto-checklist grading assist** — parent still confirms; AI pre-checks
    checklist items from the proof artifact (speeds approval ~70%).
11. Quest recommendation per kid (age band + history), cold-start via
    editorial defaults.

---

## Phase 4 — “The first bank they ever use” (12+ months)

1. **Custodial child wallet** — kids see a virtual balance, goal-saving
   (“save toward a headset”), parent-controlled spending via wishlist
   approvals. In Egypt: ride mobile-wallet rails (Vodafone Cash et al., via
   PayMob) or co-branded custodial prepaid cards with a licensed issuer.
2. **Chore marketplace inside the family** — parents post paid family chores
   with same approval loop.
3. **Native apps** (Expo/React Native) — Apple Pay native (in addition to
   web), push, camera-first build proof.
4. Open **creator track**: vetted quest authors, revenue share.
5. Regional expansion: Egypt → Gulf → wider MENA; per-country PSP/KYC matrix
   (Stripe/Checkout.com where PayMob doesn't cover).

---

## Metrics to instrument along the way

| North star | Supporting KPIs |
|------------|-----------------|
| Kids who complete ≥ 1 quest/week | activation (first quest < 3 days), approval latency (parent time-to-thumbs-up < 24h), cheers/post median, Friday-batch success rate, payment webhook success ≥ 99.5%, donor retention W4, churn of parent accounts, NPS of kids (parent-proxied) |

Kill-switches rehearsed: pause payments, pause new circles, freeze a child
profile — all feature-flag-driven.

---

## Explicitly NOT planned (dropped after review)

- Public marketplace/browse of children (contradicts privacy stance).
- Child-to-child messaging (compliance + safety cost far outweighs the value).
- Uncapped direct pay-per-task “gig labor” framing (regulator risk of child
  labor perception) — FC-Junior stays **family-funded celebration**, not a job board.
