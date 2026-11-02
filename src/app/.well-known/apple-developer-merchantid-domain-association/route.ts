/**
 * Apple Pay domain verification.
 * Apple (and PayMob's Apple Pay enablement flow) fetch this exact path to
 * prove you control the domain. Download the file for your merchant from
 * PayMob's dashboard (Apple Pay settings) and paste its contents into the
 * PAYMOB_APPLE_DOMAIN_ASSOC env variable. Without it, Apple Pay simply
 * won't appear in the unified checkout.
 */
export function GET() {
  const contents = process.env.PAYMOB_APPLE_DOMAIN_ASSOC;
  if (!contents) {
    return new Response(
      "APPLE PAY DOMAIN ASSOCIATION NOT CONFIGURED — set PAYMOB_APPLE_DOMAIN_ASSOC.",
      { status: 404, headers: { "Content-Type": "text/plain" } }
    );
  }
  return new Response(contents, {
    headers: { "Content-Type": "text/plain", "Cache-Control": "public, max-age=3600" },
  });
}
