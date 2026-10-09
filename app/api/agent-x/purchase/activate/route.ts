import { createHmac } from 'crypto';
import { NextResponse } from 'next/server';

const COOKIE_NAME = 'ax_workspace';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function signWorkspace(organizationId: string, secret: string) {
  const issuedAt = Math.floor(Date.now() / 1000).toString();
  const payload = `${organizationId}.${issuedAt}`;
  const signature = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_AGENT_X_SUPABASE_URL;
  const bridgeSecret = process.env.AGENT_X_COMMERCE_BRIDGE_SECRET;
  const workspaceSecret = process.env.AGENT_X_PREVIEW_SECRET;

  if (!supabaseUrl || !bridgeSecret || !workspaceSecret) {
    return NextResponse.json({ error: 'server_not_configured' }, { status: 503 });
  }

  let body: any;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  const entitlementId = String(body?.entitlementId || '').trim();
  const email = String(body?.email || '').trim().toLowerCase();
  const businessName = String(body?.businessName || '').trim();
  if (!entitlementId || !email || !businessName) {
    return NextResponse.json({ error: 'missing_required_fields' }, { status: 400 });
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/agent-x-commerce-bridge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-agent-x-commerce-secret': bridgeSecret,
    },
    body: JSON.stringify({
      action: 'activate_entitlement',
      payload: {
        entitlementId,
        email,
        firstName: body?.firstName || null,
        businessName,
        role: body?.role || 'business',
        industry: body?.industry || 'other',
        mission: body?.mission || 'organize',
        challenge: body?.challenge || 'need_systems',
      },
    }),
    cache: 'no-store',
  });

  let envelope: any = null;
  try { envelope = await response.json(); } catch { envelope = null; }
  const data = envelope?.data;
  if (!response.ok || !envelope?.ok || !data?.ok) {
    return NextResponse.json({ error: 'purchase_activation_failed' }, { status: response.status || 500 });
  }

  const organizationId = String(data?.organization?.id || data?.organization_id || '');
  if (!organizationId) {
    return NextResponse.json({ error: 'activation_missing_workspace' }, { status: 500 });
  }

  const outgoing = NextResponse.json({ ok: true, data });
  outgoing.cookies.set({
    name: COOKIE_NAME,
    value: signWorkspace(organizationId, workspaceSecret),
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
  return outgoing;
}
