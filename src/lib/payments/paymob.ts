import "server-only";
import crypto from "node:crypto";

/* ══════════════════════════════════════════════════════════════
   PayMob (accept.paymob.com) — Intention API + webhook verification
   Docs: https://docs.paymob.com

   Required env for LIVE mode (anything missing → DEMO mode):
     PAYMOB_SECRET_KEY          server-side secret (Token auth)
     PAYMOB_PUBLIC_KEY          used to build the unified checkout URL
     PAYMOB_INTEGRATION_ID_CARD payment method id for cards
   Optional:
     PAYMOB_INTEGRATION_ID_APPLE_PAY   payment method id for Apple Pay
     PAYMOB_CURRENCY                   e.g. EGP or USD (default USD)
     PAYMOB_HMAC_SECRET                webhook verification secret
     PAYMOB_APPLE_DOMAIN_ASSOC         contents of Apple's merchantid
                                       domain-association file (base64 or text)
     APP_URL                           e.g. https://app.giglet.com
   ══════════════════════════════════════════════════════════════ */

const BASE = "https://accept.paymob.com";

export function paymobConfigured(): boolean {
  return Boolean(
    process.env.PAYMOB_SECRET_KEY &&
      process.env.PAYMOB_PUBLIC_KEY &&
      process.env.PAYMOB_INTEGRATION_ID_CARD
  );
}

export function paymobMethods(): string[] {
  const methods = ["Card"];
  if (process.env.PAYMOB_INTEGRATION_ID_APPLE_PAY) methods.push("Apple Pay");
  methods.push("Mobile wallets");
  return methods;
}

const appUrl = () => process.env.APP_URL ?? "http://localhost:3000";

interface IntentionResponse {
  id: string;
  client_secret?: string;
  payment_keys?: { key: string }[];
}

export async function createPaymobIntention(opts: {
  donationId: string;
  amountCents: number;
  customerName: string;
  customerEmail: string;
}): Promise<{ intentionId: string; checkoutUrl: string }> {
  const [firstName, ...rest] = opts.customerName.split(" ");
  const integrationIds = [process.env.PAYMOB_INTEGRATION_ID_CARD];
  if (process.env.PAYMOB_INTEGRATION_ID_APPLE_PAY) {
    integrationIds.push(process.env.PAYMOB_INTEGRATION_ID_APPLE_PAY);
  }

  const res = await fetch(`${BASE}/v1/intention/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.PAYMOB_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: opts.amountCents,
      currency: process.env.PAYMOB_CURRENCY ?? "EGP",
      payment_methods: integrationIds,
      items: [
        {
          name: "FC-Junior family cheer",
          amount: opts.amountCents,
          description: "A cheer for a kid's finished quest",
          quantity: 1,
        },
      ],
      billing_data: {
        first_name: firstName || "Family",
        last_name: rest.join(" ") || "Fan",
        email: opts.customerEmail,
        phone_number: "NA",
        apartment: "NA",
        floor: "NA",
        street: "NA",
        building: "NA",
        city: "NA",
        state: "NA",
        country: "EG",
        postal_code: "NA",
      },
      customer: {
        first_name: firstName || "Family",
        last_name: rest.join(" ") || "Fan",
        email: opts.customerEmail,
      },
      delivery_needed: false,
      extras: { donation_id: opts.donationId },
      redirection_url: `${appUrl()}/payments/return?donation=${opts.donationId}`,
      notification_url: `${appUrl()}/api/webhooks/paymob`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayMob intention failed (${res.status}): ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as IntentionResponse;
  const clientSecret = data.client_secret ?? data.payment_keys?.[0]?.key;
  if (!clientSecret) throw new Error("PayMob returned no client secret.");

  const checkoutUrl = `${BASE}/unifiedcheckout/?publicKey=${process.env.PAYMOB_PUBLIC_KEY}&clientSecret=${clientSecret}`;
  return { intentionId: data.id, checkoutUrl };
}

/* ── Webhook HMAC verification (processed callback) ─────────── */

type Tx = Record<string, unknown> & {
  order?: { id?: number | string; merchant_order_id?: string };
  source_data?: Record<string, unknown>;
  extras?: { donation_id?: string };
  success?: boolean | string;
};

const HMAC_FIELDS: ((t: Tx) => unknown)[] = [
  (t) => t.amount_cents,
  (t) => t.created_at,
  (t) => t.currency,
  (t) => t.error_occured,
  (t) => t.has_parent_transaction,
  (t) => t.id,
  (t) => t.integration_id,
  (t) => t.is_3d_secure,
  (t) => t.is_auth,
  (t) => t.is_capture,
  (t) => t.is_refunded,
  (t) => t.is_standalone_payment,
  (t) => t.is_voided,
  (t) => t.order?.id,
  (t) => t.owner,
  (t) => t.pending,
  (t) => t.source_data?.pan,
  (t) => t.source_data?.sub_type,
  (t) => t.source_data?.type,
  (t) => t.success,
];

export function verifyPaymobHmac(tx: Tx, receivedHmac: string): boolean {
  const secret = process.env.PAYMOB_HMAC_SECRET;
  if (!secret) return false;
  const concatenated = HMAC_FIELDS.map((f) => {
    const v = f(tx);
    if (v === undefined || v === null) return "";
    if (typeof v === "boolean") return v ? "true" : "false";
    return String(v);
  }).join("");

  const computed = crypto.createHmac("sha512", secret).update(concatenated).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(receivedHmac));
  } catch {
    return false;
  }
}

export function extractDonationId(tx: Tx): string | null {
  const raw = tx as Record<string, unknown>;
  const nested =
    tx.extras?.donation_id ??
    (raw.order as { extras?: { donation_id?: string } } | undefined)?.extras?.donation_id ??
    tx.order?.merchant_order_id;
  return typeof nested === "string" && nested.length > 0 ? nested : null;
}
