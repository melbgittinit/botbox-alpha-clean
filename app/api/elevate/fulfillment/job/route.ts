import { prisma } from "../../../../../lib/prisma";
import { resolveHubUser } from "../../../../../lib/hub-auth/session";

export async function GET(request: Request) {
  const user = await resolveHubUser(request);
  if (!user) return Response.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const url = new URL(request.url);
  const jobId = url.searchParams.get("job") || "";
  const job = await prisma.elevatePrintJob.findFirst({
    where: { id: jobId, userId: user.id },
    select: {
      id: true,
      format: true,
      status: true,
      quantity: true,
      quoteCents: true,
      retailCents: true,
      providerOrderId: true,
      artworkUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!job) return Response.json({ error: "PRINT_JOB_NOT_FOUND" }, { status: 404 });
  return Response.json({ ok: true, job }, { headers: { "cache-control": "no-store" } });
}
