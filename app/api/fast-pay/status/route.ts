import { fastPayStatus } from "../../../../lib/fast-pay/core";

export async function GET() {
  const status = fastPayStatus();
  return Response.json(status, { status: status.liveReady ? 200 : 503 });
}
