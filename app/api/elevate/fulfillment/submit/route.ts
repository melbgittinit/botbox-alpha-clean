import { prisma } from "../../../../../lib/prisma";
import { resolveHubUser } from "../../../../../lib/hub-auth/session";
import { submitElevatePrintJob } from "../../../../../lib/elevate-fulfillment";

export async function POST(request: Request) {
  const user = await resolveHubUser(request);
  if (!user) return Response.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const profile = await prisma.elevateProfile.findUnique({ where: { userId: user.id } });
  if (!profile?.makeItReal) return Response.json({ error: "MAKE_IT_REAL_REQUIRED" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const jobId = String(body?.jobId || "");

  try {
    const job = await submitElevatePrintJob(jobId, user.id);
    return Response.json({
      ok: true,
      jobId: job.id,
      status: job.status,
      providerOrderId: job.providerOrderId,
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "PRINT_SUBMISSION_FAILED";
    const status =
      code === "PRINT_JOB_NOT_FOUND" ? 404 :
      code === "PRINT_JOB_NOT_PAID" ? 409 :
      code === "LIVE_FULFILLMENT_DISABLED" || code === "PRINT_PROVIDER_NOT_CONNECTED" ? 503 :
      400;
    return Response.json({ error: code }, { status });
  }
}
