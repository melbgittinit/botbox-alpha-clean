import { prisma } from "../../../../lib/prisma";
import { resolveHubUser } from "../../../../lib/hub-auth/session";
import { recordElevateEvent } from "../../../../lib/elevate-events";
import { resolveElevateCycle } from "../../../../lib/elevate-attribution";

function clean(value: unknown, max = 3000) {
  return String(value || "").trim().slice(0, max);
}

type Format = "card" | "flyer" | "qr-card" | "postcard";

const formatMap: Record<Format, { label: string; dimensions: string; bleed: string; notes: string[] }> = {
  card: {
    label: "Business / Promo Card",
    dimensions: "3.5 × 2 in",
    bleed: "3.75 × 2.25 in with bleed",
    notes: ["Keep the CTA short.", "Use one QR destination.", "Keep critical text inside safe margins."],
  },
  flyer: {
    label: "Flyer",
    dimensions: "8.5 × 11 in",
    bleed: "8.75 × 11.25 in with bleed",
    notes: ["Lead with one headline.", "Use one primary action.", "Keep body copy scannable."],
  },
  "qr-card": {
    label: "QR Action Card",
    dimensions: "4 × 6 in",
    bleed: "4.25 × 6.25 in with bleed",
    notes: ["Make QR the visual anchor.", "State exactly what happens after the scan.", "Include a backup short URL."],
  },
  postcard: {
    label: "Postcard",
    dimensions: "6 × 4 in",
    bleed: "6.25 × 4.25 in with bleed",
    notes: ["Front: one promise.", "Back: short proof + CTA.", "Reserve address/mail space if mailing."],
  },
};

export async function POST(request: Request) {
  const user = await resolveHubUser(request);
  if (!user) return Response.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const profile = await prisma.elevateProfile.findUnique({ where: { userId: user.id } });
  const cycleKey = resolveElevateCycle(request, profile);
  if (!profile?.makeItReal) {
    return Response.json({ error: "MAKE_IT_REAL_REQUIRED" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const format = String(body?.format || "") as Format;
  if (!formatMap[format]) return Response.json({ error: "INVALID_FORMAT" }, { status: 400 });

  const title = clean(body?.title, 120);
  const message = clean(body?.message, 1600);
  const cta = clean(body?.cta, 160);
  const destination = clean(body?.destination, 500);
  const audience = clean(body?.audience, 160);

  if (!title || !message || !cta) {
    return Response.json({ error: "TITLE_MESSAGE_CTA_REQUIRED" }, { status: 400 });
  }

  const spec = formatMap[format];

  await recordElevateEvent({
    userId: user.id,
    cycleKey,
    eventType: "make_it_real_used",
    offer: "real",
    amountCents: 799,
    success: true,
    payload: { format },
  });

  return Response.json({
    ok: true,
    package: {
      format,
      label: spec.label,
      dimensions: spec.dimensions,
      bleed: spec.bleed,
      front: {
        headline: title,
        body: message,
        cta,
      },
      qr: destination ? {
        destination,
        label: `Scan to ${cta.replace(/[.!?]+$/, "").toLowerCase()}`,
        backupText: destination,
      } : null,
      audience: audience || "general audience",
      printNotes: [
        ...spec.notes,
        "Export final art at 300 DPI when raster output is used.",
        "Use CMYK or printer-recommended color settings for commercial printing.",
        "Proofread names, dates, prices and URLs before print.",
      ],
      handoff: {
        digitalOnly: "Use the package as a printer-ready production brief and create/export final art.",
        myPrinter: "Send the dimensions, copy, QR destination and print notes to your existing printer.",
        localPrint: "Use a compatible local print shop after confirming their file requirements.",
        fulfillmentStatus: "Automated print-and-ship fulfillment is not connected yet.",
      },
    },
  }, { headers: { "cache-control": "no-store" } });
}
