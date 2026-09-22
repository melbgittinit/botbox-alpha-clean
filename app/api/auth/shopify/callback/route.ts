import { prisma } from "../../../../../lib/prisma";
import { createHubSessionToken, getCookie, sessionCookieHeader } from "../../../../../lib/hub-auth/session";
import { fetchWmrEntitlements } from "../../../../../lib/wmr-entitlements";
import { fetchPgpOrderGrants } from "../../../../../lib/pgp-entitlements";
import { syncPgpPurchaseGrants } from "../../../../../lib/pgp-access";
import { fetchElevateEntitlements } from "../../../../../lib/elevate-entitlements";
import { recordElevateEvent } from "../../../../../lib/elevate-events";
import {
  OAUTH_NONCE_COOKIE,
  OAUTH_RETURN_COOKIE,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  authConfig,
  clearOauthCookie,
  discoverCustomerApi,
  discoverOidc,
  exchangeAuthorizationCode,
  fetchShopifyCustomer,
  safeReturnPath,
} from "../../../../../lib/hub-auth/shopify";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = getCookie(request, OAUTH_STATE_COOKIE);
  const verifier = getCookie(request, OAUTH_VERIFIER_COOKIE);
  const requestedReturnPath = safeReturnPath(getCookie(request, OAUTH_RETURN_COOKIE));

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
    let wmrEntitlements: Awaited<ReturnType<typeof fetchWmrEntitlements>> | null = null;
    let elevateEntitlements: Awaited<ReturnType<typeof fetchElevateEntitlements>> | null = null;
    try {
      wmrEntitlements = await fetchWmrEntitlements(customerApi.graphql_api, token.access_token);
    } catch (error) {
      console.warn("WMR entitlement refresh skipped", error);
    }
    try {
      elevateEntitlements = await fetchElevateEntitlements(customerApi.graphql_api, token.access_token);
    } catch (error) {
      console.warn("Elevate entitlement refresh skipped", error);
    }

    const user = await prisma.user.upsert({
      where: { email: identity.email },
      update: { displayName: identity.displayName || undefined },
      create: { email: identity.email, displayName: identity.displayName },
    });

    if (wmrEntitlements) {
      const existing = await prisma.wmrProfile.findUnique({ where: { userId: user.id } });
      await prisma.wmrProfile.upsert({
        where: { userId: user.id },
        update: {
          wmrBase: Boolean(existing?.wmrBase || wmrEntitlements.wmrBase),
          forReal: Boolean(existing?.forReal || wmrEntitlements.forReal),
          bwfPassport: Boolean(existing?.bwfPassport || wmrEntitlements.bwfPassport),
          vipMe: Boolean(existing?.vipMe || wmrEntitlements.vipMe),
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
    }

    if (pgpGrants) {
      try {
        await syncPgpPurchaseGrants(user.id, pgpGrants);
      } catch (error) {
        console.warn("PGP purchase grant sync skipped", error);
      }
    }

    if (elevateEntitlements) {
      const existingElevate = await prisma.elevateProfile.findUnique({ where: { userId: user.id } });
      await prisma.elevateProfile.upsert({
        where: { userId: user.id },
        update: {
          activated: elevateEntitlements.activated,
          powerUp: elevateEntitlements.powerUp,
          makeItReal: elevateEntitlements.makeItReal,
          giftCreditsPurchased: elevateEntitlements.giftCreditsPurchased,
          entitlementCheckedAt: new Date(),
        },
        create: {
          userId: user.id,
          activated: elevateEntitlements.activated,
          powerUp: elevateEntitlements.powerUp,
          makeItReal: elevateEntitlements.makeItReal,
          giftCreditsPurchased: elevateEntitlements.giftCreditsPurchased,
          entitlementCheckedAt: new Date(),
        },
      });

      await recordElevateEvent({
        userId: user.id,
        eventType: "entitlement_sync",
        success: true,
        channel: "shopify",
        source: "shopify_customer_account",
        payload: {
          activated: elevateEntitlements.activated,
          powerUp: elevateEntitlements.powerUp,
          makeItReal: elevateEntitlements.makeItReal,
          giftCreditsPurchased: elevateEntitlements.giftCreditsPurchased,
        },
      });

      const verified: Array<{ offer: string; amountCents: number }> = [];
      if (!existingElevate?.activated && elevateEntitlements.activated) verified.push({ offer: "activate", amountCents: 100 });
      if (!existingElevate?.powerUp && elevateEntitlements.powerUp) verified.push({ offer: "power", amountCents: 299 });
      if (!existingElevate?.makeItReal && elevateEntitlements.makeItReal) verified.push({ offer: "real", amountCents: 799 });
      const giftDelta = elevateEntitlements.giftCreditsPurchased - (existingElevate?.giftCreditsPurchased || 0);
      if (giftDelta > 0) verified.push({ offer: "gift", amountCents: 199 * giftDelta });

      for (const conversion of verified) {
        await recordElevateEvent({
          userId: user.id,
          eventType: "purchase_verified",
          offer: conversion.offer,
          amountCents: conversion.amountCents,
          success: true,
          channel: "shopify",
          source: "shopify_customer_account",
        });
      }

      const removed: string[] = [];
      if (existingElevate?.activated && !elevateEntitlements.activated) removed.push("activate");
      if (existingElevate?.powerUp && !elevateEntitlements.powerUp) removed.push("power");
      if (existingElevate?.makeItReal && !elevateEntitlements.makeItReal) removed.push("real");
      if (giftDelta < 0) removed.push("gift");

      for (const offer of removed) {
        await recordElevateEvent({
          userId: user.id,
          eventType: "entitlement_removed",
          offer,
          success: true,
          channel: "shopify",
          source: "shopify_customer_account",
          payload: offer === "gift" ? { giftCreditDelta: giftDelta } : undefined,
        });
      }
    }

    const sessionToken = createHubSessionToken(user.id);
    const successPath = requestedReturnPath || process.env.HUB_AUTH_SUCCESS_PATH || "/hub";
    const redirectTo = new URL(successPath, origin).toString();
    const headers = new Headers({ location: redirectTo, "cache-control": "no-store" });
    headers.append("set-cookie", sessionCookieHeader(sessionToken));
    headers.append("set-cookie", clearOauthCookie(OAUTH_STATE_COOKIE));
    headers.append("set-cookie", clearOauthCookie(OAUTH_VERIFIER_COOKIE));
    headers.append("set-cookie", clearOauthCookie(OAUTH_NONCE_COOKIE));
    headers.append("set-cookie", clearOauthCookie(OAUTH_RETURN_COOKIE));
    return new Response(null, { status: 302, headers });
  } catch (error) {
    console.error("HUB auth callback failed", error);
    return Response.json({ error: "AUTH_FAILED", message: "We could not complete HUB sign-in." }, { status: 502 });
  }
}
