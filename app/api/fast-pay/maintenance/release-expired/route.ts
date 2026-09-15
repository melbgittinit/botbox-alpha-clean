import { errorResponse, requireInternalRequest } from "../../../../../lib/fast-pay/core";
import { releaseExpiredFastPayReservations } from "../../../../../lib/fast-pay/maintenance";

export async function POST(request: Request) {
  try {
    requireInternalRequest(request);
    const result = await releaseExpiredFastPayReservations();
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
