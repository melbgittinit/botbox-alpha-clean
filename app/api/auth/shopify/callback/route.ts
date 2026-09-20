import { prisma } from "../../../../../lib/prisma";
import { createHubSessionToken, getCookie, sessionCookieHeader } from "../../../../../lib/hub-auth/session";
import { fetchWmrEntitlements } from "../../../../../lib/wmr-entitlements";
import {
  OAUTH_NONCE_COOKIE,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  authConfig,
  clearOauthCookie,
  discoverCustomerApi,
  discoverOidc,
  exchangeAuthorizationCode,
  fetchShopifyCustomer,
} from "../../../../../lib/hub-auth/shopify";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = getCookie(request, OAUTH_STATE_COOKIE);
  const verifier = getCookie(request, OAUTH_VERIFIER_COOKIE);

  if (!code || !state || !expectedState || state !== expectedState || !verifier) {
    return Response.json({ error: "INVALID_OAUTH_RESPONSE", message: "The sign-in response could not be verified." }, { status: 400 });
  }

  try {
    const { shopDomain, clientId, origin, callbackUrl } = authConfig();
    const [oidc, customerApi] = await Promise.all([
      discoverOidc(shopDomain),
      discoverCustomerApi(shopDomain),
    ]);
    const token = await exchangeAuthorizationCode({
      tokenEndpoint: oidc.token_endpoint,
      clientId,
      code,
      redirectUri: callbackUrl,
      verifier,
      origin,
    });
    const identity = await fetchShopifyCustomer(customerApi.graphql_api, token.access_token);
    let wmrEntitlements = { wmrBase: false, forReal: false, bwfPassport: false, vipMe: false };
    try {
      wmrEntitlements = await fetchWmrEntitlements(customerApi.graphql_api, token.access_token);
    } catch (error) {
      console.warn("WMR entitlement refresh skipped", error);
    }

    const user = await prisma.user.upsert({
      where: { email: identity.email },
      update: { displayName: identity.displayName || undefined },
      create: { email: identity.email, displayName: identity.displayName },
    });

    await prisma.wmrProfile.upsert({
      where: { userId: user.id },
      update: {
        wmrBase: wmrEntitlements.wmrBase,
        forReal: wmrEntitlements.forReal,
        bwfPassport: wmrEntitlements.bwfPassport,
        vipMe: wmrEntitlements.vipMe,
        entitlementCheckedAt: new Date(),
      },
      create: {
        userId: user.id,
        wmrBase: wmrEntitlements.wmrBase,
        forReal: wmrEntitlements.forReal,
        bwfPassport: wmrEntitlements.bwfPassport,
        vipMe: wmrEntitlements.vipMe,
        entitlementCheckedAt: new Date(),
      },
    });

    const sessionToken = createHubSessionToken(user.id);
    const successPath = process.env.HUB_AUTH_SUCCESS_PATH || "/hub";
    const redirectTo = new URL(successPath, origin).toString();
    const headers = new Headers({ location: redirectTo, "cache-control": "no-store" });
    headers.append("set-cookie", sessionCookieHeader(sessionToken));
    headers.append("set-cookie", clearOauthCookie(OAUTH_STATE_COOKIE));
    headers.append("set-cookie", clearOauthCookie(OAUTH_VERIFIER_COOKIE));
    headers.append("set-cookie", clearOauthCookie(OAUTH_NONCE_COOKIE));
    return new Response(null, { status: 302, headers });
  } catch (error) {
    console.error("HUB auth callback failed", error);
    return Response.json({ error: "AUTH_FAILED", message: "We could not complete HUB sign-in." }, { status: 502 });
  }
}
