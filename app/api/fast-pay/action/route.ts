import {
  commitReservation,
  errorResponse,
  quoteAction,
  releaseReservation,
  reserveAction,
} from "../../../../lib/fast-pay/core";
import { resolveFastPayAccount } from "../../../../lib/fast-pay/session-account";

export async function GET(request: Request) {
  try {
    const { account } = await resolveFastPayAccount(request);
    const url = new URL(request.url);
    const actionKey = url.searchParams.get("actionKey") || "";
    const quote = await quoteAction(account.id, actionKey);
    return Response.json({ quote });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { account } = await resolveFastPayAccount(request);
    const body = await request.json();
    const command = body?.command;

    if (command === "reserve") {
      const reservation = await reserveAction(
        account.id,
        String(body.actionKey || ""),
        String(body.idempotencyKey || ""),
        body.cost === undefined ? undefined : Number(body.cost)
      );
      const quote = await quoteAction(account.id, reservation.actionKey);
      return Response.json({ reservation, quote });
    }

    if (command === "commit") {
      const reservation = await commitReservation(account.id, String(body.reservationId || ""));
      const quote = await quoteAction(account.id, reservation.actionKey);
      return Response.json({ reservation, quote });
    }

    if (command === "release") {
      const reservation = await releaseReservation(account.id, String(body.reservationId || ""));
      const quote = await quoteAction(account.id, reservation.actionKey);
      return Response.json({ reservation, quote });
    }

    return Response.json({ error: "INVALID_COMMAND", message: "Use reserve, commit, or release." }, { status: 400 });
  } catch (error) {
    return errorResponse(error);
  }
}
