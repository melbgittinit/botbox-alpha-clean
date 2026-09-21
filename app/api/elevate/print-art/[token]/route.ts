import QRCode from "qrcode";
import { prisma } from "../../../../../lib/prisma";

function esc(value: unknown) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrap(text: string, maxChars: number, maxLines: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? line + " " + word : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
      if (lines.length >= maxLines) break;
    } else {
      line = next;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

const layouts = {
  card: { width: 1125, height: 675, headline: 72, body: 34, cta: 38, qr: 240 },
  flyer: { width: 2625, height: 3375, headline: 150, body: 62, cta: 78, qr: 560 },
  "qr-card": { width: 1275, height: 1875, headline: 88, body: 42, cta: 48, qr: 620 },
  postcard: { width: 1875, height: 1275, headline: 110, body: 48, cta: 58, qr: 380 },
} as const;

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const job = await prisma.elevatePrintJob.findFirst({ where: { artworkToken: token } });
  if (!job || !job.artworkPayload) return new Response("Not found", { status: 404 });

  const format = job.format as keyof typeof layouts;
  const layout = layouts[format];
  if (!layout) return new Response("Unsupported format", { status: 400 });

  const payload = job.artworkPayload as Record<string, unknown>;
  const title = String(payload.title || "");
  const message = String(payload.message || "");
  const cta = String(payload.cta || "");
  const destination = String(payload.destination || "");

  const titleLines = wrap(title, format === "flyer" ? 28 : 24, 3);
  const bodyLines = wrap(message, format === "flyer" ? 56 : 42, format === "flyer" ? 12 : 8);
  const hasQr = Boolean(destination);
  const qrData = hasQr
    ? await QRCode.toDataURL(destination, { width: layout.qr, margin: 1, errorCorrectionLevel: "M" })
    : "";

  const left = Math.round(layout.width * 0.08);
  const top = Math.round(layout.height * 0.1);
  const textWidth = hasQr ? Math.round(layout.width * 0.56) : Math.round(layout.width * 0.84);
  const titleGap = Math.round(layout.headline * 1.16);
  const bodyStart = top + titleLines.length * titleGap + Math.round(layout.headline * 0.55);
  const bodyGap = Math.round(layout.body * 1.42);
  const ctaY = Math.min(
    layout.height - Math.round(layout.cta * 2.0),
    bodyStart + bodyLines.length * bodyGap + Math.round(layout.body * 1.3)
  );

  const titleSvg = titleLines.map((line, i) =>
    `<text x="${left}" y="${top + i * titleGap}" font-family="Arial, Helvetica, sans-serif" font-size="${layout.headline}" font-weight="800" fill="#17142d">${esc(line)}</text>`
  ).join("");

  const bodySvg = bodyLines.map((line, i) =>
    `<text x="${left}" y="${bodyStart + i * bodyGap}" font-family="Arial, Helvetica, sans-serif" font-size="${layout.body}" fill="#332f47">${esc(line)}</text>`
  ).join("");

  const qrX = layout.width - layout.qr - Math.round(layout.width * 0.07);
  const qrY = Math.round(layout.height * 0.25);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}">
  <rect width="100%" height="100%" fill="#fbfaf7"/>
  <rect x="0" y="0" width="100%" height="${Math.round(layout.height * 0.035)}" fill="#6e4bf5"/>
  <circle cx="${Math.round(layout.width * 0.92)}" cy="${Math.round(layout.height * 0.12)}" r="${Math.round(layout.height * 0.025)}" fill="#e6b94d"/>
  ${titleSvg}
  ${bodySvg}
  <rect x="${left}" y="${ctaY - Math.round(layout.cta * 1.05)}" rx="${Math.round(layout.cta * 0.6)}" ry="${Math.round(layout.cta * 0.6)}" width="${Math.min(textWidth, Math.max(320, cta.length * layout.cta * 0.62))}" height="${Math.round(layout.cta * 1.65)}" fill="#17142d"/>
  <text x="${left + Math.round(layout.cta * 0.65)}" y="${ctaY}" font-family="Arial, Helvetica, sans-serif" font-size="${layout.cta}" font-weight="700" fill="#ffffff">${esc(cta)}</text>
  ${hasQr ? `<rect x="${qrX - 18}" y="${qrY - 18}" width="${layout.qr + 36}" height="${layout.qr + 36}" rx="24" fill="#ffffff"/><image href="${qrData}" x="${qrX}" y="${qrY}" width="${layout.qr}" height="${layout.qr}"/><text x="${qrX + layout.qr/2}" y="${qrY + layout.qr + Math.round(layout.body*1.3)}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(layout.body*0.8)}" fill="#332f47">SCAN HERE</text>` : ""}
  <text x="${left}" y="${layout.height - Math.round(layout.body * 0.9)}" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(layout.body * 0.7)}" fill="#777285">Elevate Me Bot • Make It Real</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
