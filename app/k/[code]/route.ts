import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const api = new URL(
    "/api/pgp-alpha/keys?code=" + encodeURIComponent(code),
    request.url
  ).toString();

  try {
    const response = await fetch(api, { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.redirect(new URL("/pgp?key=not-found", request.url));
    }

    const data = await response.json();
    const destination = String(data?.key?.destination || "/pgp");
    const safeDestination = destination.startsWith("/") ? destination : "/pgp";
    return NextResponse.redirect(new URL(safeDestination, request.url));
  } catch {
    return NextResponse.redirect(new URL("/pgp?key=unavailable", request.url));
  }
}
