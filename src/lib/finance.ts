/**
 * FC-Junior's business model, in one place.
 *
 * Platform fee: 10% of every cheer, capped at EGP 50.
 *  - Percentage (not flat) because flat fees punish the most common
 *    small cheers (10 EGP on a 50 EGP cheer = 20%) and under-earn on
 *    large gifts.
 *  - The cap keeps big birthday-style gifts feeling fair.
 *  - Minimum cheer is 50 EGP, so the fee is always exactly 10% at the floor.
 * Everything below the fee is PayMob gateway cost (separately absorbed).
 */
export const PLATFORM_FEE_PCT = 10;
export const PLATFORM_FEE_CAP_CENTS = 5_000; // EGP 50 (amounts are in piastres)
export const MIN_CHEER_CENTS = 5_000; // EGP 50 minimum donation
export const MAX_CHEER_CENTS = 500_000; // EGP 5,000 maximum donation
export const CURRENCY = "EGP";

export function platformFeeCents(amountCents: number): number {
  return Math.min(Math.round((amountCents * PLATFORM_FEE_PCT) / 100), PLATFORM_FEE_CAP_CENTS);
}

export function netCheerCents(amountCents: number, feeCents: number): number {
  return Math.max(0, amountCents - feeCents);
}
