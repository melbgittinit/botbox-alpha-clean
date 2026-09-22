export const ELEVATE_CYCLE_COOKIE = "elevate_cycle";
export const ELEVATE_ATTRIBUTION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

const CYCLE_PATTERN = /^ELV-\d{8}-[A-Z0-9]{2,12}$/;

export function normalizeElevateCycleKey(value: unknown) {
  const candidate = String(value || "").trim().toUpperCase();
  return CYCLE_PATTERN.test(candidate) ? candidate : null;
}

export function elevateCycleCookie(cycleKey: string) {
  const safe = normalizeElevateCycleKey(cycleKey);
  if (!safe) throw new Error("INVALID_ELEVATE_CYCLE_KEY");
  return `${ELEVATE_CYCLE_COOKIE}=${encodeURIComponent(safe)}; Path=/; Max-Age=${ELEVATE_ATTRIBUTION_MAX_AGE_SECONDS}; HttpOnly; Secure; SameSite=Lax`;
}

function cookieValue(request: Request, name: string) {
  const cookie = request.headers.get("cookie") || "";
  for (const part of cookie.split(";")) {
    const [rawName, ...rest] = part.trim().split("=");
    if (rawName === name) return decodeURIComponent(rest.join("=") || "");
  }
  return null;
}

export function elevateCycleFromRequest(request: Request) {
  return normalizeElevateCycleKey(cookieValue(request, ELEVATE_CYCLE_COOKIE));
}

export function elevateCycleFromReturnPath(path: string | null | undefined) {
  if (!path) return null;
  try {
    const url = new URL(path, "https://hub.local");
    return normalizeElevateCycleKey(
      url.searchParams.get("elv") ||
      url.searchParams.get("elv_cycle") ||
      url.searchParams.get("utm_campaign")
    );
  } catch {
    return null;
  }
}

export function activeElevateCycleFromProfile(
  profile: { lastCycleKey?: string | null; lastCycleAt?: Date | string | null } | null | undefined
) {
  const cycleKey = normalizeElevateCycleKey(profile?.lastCycleKey);
  if (!cycleKey || !profile?.lastCycleAt) return null;
  const at = new Date(profile.lastCycleAt);
  if (!Number.isFinite(at.getTime())) return null;
  const ageMs = Date.now() - at.getTime();
  if (ageMs < 0 || ageMs > ELEVATE_ATTRIBUTION_MAX_AGE_SECONDS * 1000) return null;
  return cycleKey;
}

export function resolveElevateCycle(
  request: Request,
  profile?: { lastCycleKey?: string | null; lastCycleAt?: Date | string | null } | null
) {
  return elevateCycleFromRequest(request) || activeElevateCycleFromProfile(profile);
}
