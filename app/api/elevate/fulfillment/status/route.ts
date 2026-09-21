import { printifyConfigured } from "../../../../../lib/elevate-printify";

function mapped(prefix: string) {
  return Boolean(
    process.env[`PRINTIFY_ELEVATE_${prefix}_BLUEPRINT_ID`] &&
    process.env[`PRINTIFY_ELEVATE_${prefix}_PROVIDER_ID`] &&
    process.env[`PRINTIFY_ELEVATE_${prefix}_VARIANT_ID`]
  );
}

export async function GET() {
  return Response.json({
    provider: "PRINTIFY",
    configured: printifyConfigured(),
    liveOrderingEnabled: process.env.ELEVATE_FULFILLMENT_LIVE === "true",
    mappings: {
      card: mapped("CARD"),
      flyer: mapped("FLYER"),
      qrCard: mapped("QR_CARD"),
      postcard: mapped("POSTCARD"),
    },
  }, { headers: { "cache-control": "no-store" } });
}
