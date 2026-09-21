import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../../../../../lib/prisma";
import { resolveHubUser } from "../../../../../lib/hub-auth/session";
import {
  printifyConfigured,
  printifyShippingQuoteCustom,
  printifyVariantCost,
} from "../../../../../lib/elevate-printify";

const mappings = {
  card: ["PRINTIFY_ELEVATE_CARD_BLUEPRINT_ID", "PRINTIFY_ELEVATE_CARD_PROVIDER_ID", "PRINTIFY_ELEVATE_CARD_VARIANT_ID"],
  flyer: ["PRINTIFY_ELEVATE_FLYER_BLUEPRINT_ID", "PRINTIFY_ELEVATE_FLYER_PROVIDER_ID", "PRINTIFY_ELEVATE_FLYER_VARIANT_ID"],
  "qr-card": ["PRINTIFY_ELEVATE_QR_CARD_BLUEPRINT_ID", "PRINTIFY_ELEVATE_QR_CARD_PROVIDER_ID", "PRINTIFY_ELEVATE_QR_CARD_VARIANT_ID"],
  postcard: ["PRINTIFY_ELEVATE_POSTCARD_BLUEPRINT_ID", "PRINTIFY_ELEVATE_POSTCARD_PROVIDER_ID", "PRINTIFY_ELEVATE_POSTCARD_VARIANT_ID"],
} as const;

function clean(value: unknown, max = 160) {
  return String(value || "").trim().slice(0, max);
}

function positiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function retailQuote(providerCostCents: number) {
  const targetMarginPct = Math.min(80, positiveNumber(process.env.ELEVATE_PRINT_MARGIN_PCT, 40));
  const paymentFeePct = Math.min(15, positiveNumber(process.env.ELEVATE_PAYMENT_FEE_PCT, 3));
  const paymentFeeFixed = Math.round(positiveNumber(process.env.ELEVATE_PAYMENT_FEE_FIXED_CENTS, 30));
  const denominator = 1 - (targetMarginPct + paymentFeePct) / 100;
  const retailCents = Math.max(
    providerCostCents + paymentFeeFixed + 1,
    Math.ceil((providerCostCents + paymentFeeFixed) / Math.max(0.1, denominator))
  );
  const estimatedPaymentFee = Math.ceil(retailCents * (paymentFeePct / 100)) + paymentFeeFixed;
  const expectedGrossProfit = retailCents - providerCostCents - estimatedPaymentFee;
  return {
    retailCents,
    targetMarginPct,
    estimatedPaymentFee,
    expectedGrossProfit,
  };
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

  const blueprintId = Number(process.env[map[0]]);
  const printProviderId = Number(process.env[map[1]]);
  const variantId = Number(process.env[map[2]]);
  if (![blueprintId, printProviderId, variantId].every(Number.isFinite)) {
    return Response.json({ error: "FORMAT_NOT_MAPPED_TO_PROVIDER" }, { status: 503 });
  }

  const quantity = Math.max(1, Math.min(500, Math.floor(Number(body?.quantity || 1))));
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

  const artworkPayload = {
    title: clean(body?.artwork?.title, 140),
    message: clean(body?.artwork?.message, 1600),
    cta: clean(body?.artwork?.cta, 180),
    destination: clean(body?.artwork?.destination, 500),
    audience: clean(body?.artwork?.audience, 180),
    format,
  };
  if (!artworkPayload.title || !artworkPayload.message || !artworkPayload.cta) {
    return Response.json({ error: "ARTWORK_CONTENT_REQUIRED" }, { status: 400 });
  }

  const [shippingQuotes, variant] = await Promise.all([
    printifyShippingQuoteCustom({ blueprintId, printProviderId, variantId, quantity, address }),
    printifyVariantCost({ blueprintId, printProviderId, variantId }),
  ]);

  const shippingCents = Number(shippingQuotes.standard || shippingQuotes.economy || 0);
  const productionCents = variant.cost * quantity;
  const providerCostCents = productionCents + shippingCents;
  const pricing = retailQuote(providerCostCents);
  const artworkToken = crypto.randomBytes(24).toString("base64url");

  const job = await prisma.elevatePrintJob.create({
    data: {
      userId: user.id,
      format,
      status: "QUOTED",
      provider: "PRINTIFY",
      blueprintId,
      printProviderId,
      providerVariantId: variantId,
      quantity,
      shippingMethod: shippingQuotes.standard != null ? 1 : 4,
      quoteCents: providerCostCents,
      retailCents: pricing.retailCents,
      recipient: address as Prisma.InputJsonValue,
      artworkPayload: artworkPayload as Prisma.InputJsonValue,
      artworkToken,
    },
  });

  return Response.json({
    ok: true,
    jobId: job.id,
    provider: "PRINTIFY",
    providerVariantTitle: variant.title,
    productionCents,
    shippingCents,
    providerCostCents,
    retailCents: pricing.retailCents,
    expectedGrossProfitCents: pricing.expectedGrossProfit,
    estimatedPaymentFeeCents: pricing.estimatedPaymentFee,
    targetMarginPct: pricing.targetMarginPct,
    shippingQuotesCents: shippingQuotes,
    orderStatus: "QUOTED_NOT_PAID",
  }, { headers: { "cache-control": "no-store" } });
}
