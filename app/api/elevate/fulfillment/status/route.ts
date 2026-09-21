import { printifyConfigured } from "../../../../../lib/elevate-printify";

export async function GET() {
  return Response.json({
    provider: "PRINTIFY",
    configured: printifyConfigured(),
    liveOrderingEnabled: process.env.ELEVATE_FULFILLMENT_LIVE === "true",
    mappings: {
      card: Boolean(process.env.PRINTIFY_ELEVATE_CARD_PRODUCT_ID && process.env.PRINTIFY_ELEVATE_CARD_VARIANT_ID),
      flyer: Boolean(process.env.PRINTIFY_ELEVATE_FLYER_PRODUCT_ID && process.env.PRINTIFY_ELEVATE_FLYER_VARIANT_ID),
      qrCard: Boolean(process.env.PRINTIFY_ELEVATE_QR_CARD_PRODUCT_ID && process.env.PRINTIFY_ELEVATE_QR_CARD_VARIANT_ID),
      postcard: Boolean(process.env.PRINTIFY_ELEVATE_POSTCARD_PRODUCT_ID && process.env.PRINTIFY_ELEVATE_POSTCARD_VARIANT_ID),
    },
  }, { headers: { "cache-control": "no-store" } });
}
