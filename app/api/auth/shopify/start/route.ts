import {
  OAUTH_NONCE_COOKIE,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  authConfig,
  discoverOidc,
  oauthCookie,
  pkceChallenge,
  randomUrlSafe,
} from "../../../../../lib/hub-auth/shopify";

export async function GET() {
  try {
    const { shopDomain, clientId, callbackUrl } = authConfig();
    const oidc = await discoverOidc(shopDomain);
    const state = randomUrlSafe();
    const nonce = randomUrlSafe();
    const verifier = randomUrlSafe(48);

    const authorizationUrl = new URL(oidc.authorization_endpoint);
    authorizationUrl.searchParams.set("scope", "openid email customer-account-api:full");
    authorizationUrl.searchParams.set("client_id", clientId);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("redirect_uri", callbackUrl);
    authorizationUrl.searchParams.set("state", state);
    authorizationUrl.searchParams.set("nonce", nonce);
    authorizationUrl.searchParams.set("code_challenge", pkceChallenge(verifier));
    authorizationUrl.searchParams.set("code_challenge_method", "S256");

    const headers = new Headers({ location: authorizationUrl.toString(), "cache-control": "no-store" });
    headers.append("set-cookie", oauthCookie(OAUTH_STATE_COOKIE, state));
    headers.append("set-cookie", oauthCookie(OAUTH_NONCE_COOKIE, nonce));
    headers.append("set-cookie", oauthCookie(OAUTH_VERIFIER_COOKIE, verifier));
    return new Response(null, { status: 302, headers });
  } catch (error) {
    console.error("HUB auth start failed", error);
    return Response.json({ error: "AUTH_NOT_READY", message: "HUB sign-in is not configured yet." }, { status: 503 });
  }
}
