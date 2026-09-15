import { clearSessionCookieHeader, resolveHubUser } from "../../../../lib/hub-auth/session";

export async function GET(request: Request) {
  const user = await resolveHubUser(request);
  if (!user) return Response.json({ authenticated: false }, { status: 401 });
  return Response.json({ authenticated: true, user: { id: user.id, email: user.email, displayName: user.displayName } });
}

export async function DELETE() {
  return new Response(null, {
    status: 204,
    headers: { "set-cookie": clearSessionCookieHeader(), "cache-control": "no-store" },
  });
}
