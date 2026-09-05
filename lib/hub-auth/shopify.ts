import crypto from "crypto";

const OAUTH_COOKIE_TTL_SECONDS = 10 * 60;

export const OAUTH_STATE_COOKIE = "hub_oauth_state";
export const OAUTH_VERIFIER_COOKIE = "hub_oauth_verifier";
export const OAUTH_NONCE_COOKIE = "hub_oauth_nonce";

export type ShopifyOidcConfig = {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint?: string;
  jwks_uri?: string;
  issuer?: string;
};

export type ShopifyCustomerApiConfig = {
  graphql_api: string;
};

export function authConfig() {
  const shopDomain = process.env.SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;
  const origin = process.env.HUB_AUTH_ORIGIN?.replace(/\/$/, "");
  if (!shopDomain || !clientId || !origin) {
    throw new Error("Shopify HUB authentication is not configured.");
  }
  return { shopDomain, clientId, origin, callbackUrl: `${origin}/api/auth/shopify/callback` };
}

export function randomUrlSafe(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function pkceChallenge(verifier: string) {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

export function oauthCookie(name: string, value: string) {
  return `${name}=${encodeURIComponent(value)}; Path=/api/auth/shopify; Max-Age=${OAUTH_COOKIE_TTL_SECONDS}; HttpOnly; Secure; SameSite=Lax`;
}

export function clearOauthCookie(name: string) {
  return `${name}=; Path=/api/auth/shopify; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  if (!response.ok) throw new Error(`Shopify authentication request failed (${response.status}).`);
  return response.json() as Promise<T>;
}

export async function discoverOidc(shopDomain: string) {
  return fetchJson<ShopifyOidcConfig>(`https://${shopDomain}/.well-known/openid-configuration`);
}

export async function discoverCustomerApi(shopDomain: string) {
  return fetchJson<ShopifyCustomerApiConfig>(`https://${shopDomain}/.well-known/customer-account-api`);
}

export async function exchangeAuthorizationCode(args: {
  tokenEndpoint: string;
  clientId: string;
  code: string;
  redirectUri: string;
  verifier: string;
  origin: string;
}) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: args.clientId,
    redirect_uri: args.redirectUri,
    code: args.code,
    code_verifier: args.verifier,
  });

  return fetchJson<{ access_token: string; id_token?: string; expires_in: number }>(args.tokenEndpoint, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      origin: args.origin,
      "user-agent": "Seriously-Satisfying-HUB/1.0",
    },
    body,
  });
}

export async function fetchShopifyCustomer(graphqlEndpoint: string, accessToken: string) {
  const response = await fetch(graphqlEndpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: accessToken,
      "user-agent": "Seriously-Satisfying-HUB/1.0",
    },
    body: JSON.stringify({
      query: `query HubIdentity { customer { id firstName lastName emailAddress { emailAddress } } }`,
    }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`Shopify customer lookup failed (${response.status}).`);
  const payload = await response.json() as {
    data?: { customer?: { id?: string; firstName?: string | null; lastName?: string | null; emailAddress?: { emailAddress?: string | null } | null } | null };
    errors?: Array<{ message?: string }>;
  };
  if (payload.errors?.length) throw new Error("Shopify customer lookup returned an error.");

  const customer = payload.data?.customer;
  const email = customer?.emailAddress?.emailAddress?.trim().toLowerCase();
  if (!customer || !email) throw new Error("Shopify customer identity did not include an email address.");
  return {
    shopifyCustomerId: customer.id || null,
    email,
    displayName: [customer.firstName, customer.lastName].filter(Boolean).join(" ") || null,
  };
}
