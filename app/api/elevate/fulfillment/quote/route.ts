import { prisma } from "../../../../../lib/prisma";
import { resolveHubUser } from "../../../../../lib/hub-auth/session";
import { printifyConfigured, printifyShippingQuote } from "../../../../../lib/elevate-printify";

const mappings = {
  card: ["PRINTIFY_ELEVATE_CARD_PRODUCT_ID", "PRINTIFY_ELEVATE_CARD_VARIANT_ID"],
  flyer: ["PRINTIFY_ELEVATE_FLYER_PRODUCT_ID", "PRINTIFY_ELEVATE_FLYER_VARIANT_ID"],
  "qr-card": ["PRINTIFY_ELEVATE_QR_CARD_PRODUCT_ID", "PRINTIFY_ELEVATE_QR_CARD_VARIANT_ID"],
  postcard: ["PRINTIFY_ELEVATE_POSTCARD_PRODUCT_ID", "PRINTIFY_ELEVATE_POSTCARD_VARIANT_ID"],
} as const;

function clean(value: unknown, max = 160) {
  return String(value || "").trim().slice(0, max);
}

export async function POST(request: Request) {
  const user = await resolveHubUser(request);
  if (!user) return Response.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const profile = await prisma.elevateProfile.findUnique({ where: { userId: user.id } });
  if (!profile?.makeItReal) return Response.json({ error: "MAKE_IT_REAL_REQUIRED" }, { status: 403 });
  if (!printifyConfigured()) return Response.json({ error: "PRINT_PROVIDER_NOT_CONNECTED" }, { status: 503 });

  const body = await request.json().catch(() => null);
  const format = String(body?.format || "") as keyof typeof mappings;
  const map = mappings[format];
  if (!map) return Response.json({ error: "INVALID_FORMAT" }, { status: 400 });

  const productId = process.env[map[0]];
  const variantId = Number(process.env[map[1]]);
  if (!productId || !Number.isFinite(variantId)) {
    return Response.json({ error: "FORMAT_NOT_MAPPED_TO_PROVIDER" }, { status: 503 });
  }

  const quantity = Math.max(1, Math.min(500, Number(body?.quantity || 1)));
  const address = {
    first_name: clean(body?.address?.firstName),
    last_name: clean(body?.address?.lastName),
    email: clean(body?.address?.email),
    phone: clean(body?.address?.phone),
    country: clean(body?.address?.country, 2).toUpperCase(),
    region: clean(body?.address?.region),
    address1: clean(body?.address?.address1),
    address2: clean(body?.address?.address2),
    city: clean(body?.address?.city),
    zip: clean(body?.address?.zip),
  };

  if (!address.first_name || !address.last_name || !address.email || !address.country || !address.address1 || !address.city || !address.zip) {
    return Response.json({ error: "SHIPPING_ADDRESS_REQUIRED" }, { status: 400 });
  }

  const quotes = await printifyShippingQuote({ productId, variantId, quantity, address });
  const standard = Number(quotes.standard || 0);

  const job = await prisma.elevatePrintJob.create({
    data: {
      userId: user.id,
      format,
      status: "QUOTED",
      provider: "PRINTIFY",
      providerProductId: productId,
      providerVariantId: variantId,
      quantity,
      shippingMethod: 1,
      quoteCents: standard,
      recipient: address,
    },
  });

  return Response.json({
    ok: true,
    jobId: job.id,
    shippingQuotesCents: quotes,
    productionCostStatus: "Provider product cost still requires retail-price mapping before checkout.",
    orderStatus: "NOT_SUBMITTED",
  }, { headers: { "cache-control": "no-store" } });
}
