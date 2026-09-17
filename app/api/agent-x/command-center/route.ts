import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'ax_workspace';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const getConfig = () => ({
  edgeUrl: process.env.AGENT_X_COMMAND_CENTER_EDGE_URL,
  secret: process.env.AGENT_X_PREVIEW_SECRET,
});

function authorized(request: NextRequest, organizationId: string, secret: string) {
  const raw = request.cookies.get(COOKIE_NAME)?.value;
  if (!raw) return false;
  const parts = raw.split('.');
  if (parts.length !== 3) return false;
  const [cookieOrg, issuedAt, signature] = parts;
  if (cookieOrg !== organizationId) return false;
  const issued = Number(issuedAt);
  if (!Number.isFinite(issued) || Math.floor(Date.now() / 1000) - issued > MAX_AGE_SECONDS) return false;
  const payload = `${cookieOrg}.${issuedAt}`;
  const expected = createHmac('sha256', secret).update(payload).digest('base64url');
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  const { edgeUrl, secret } = getConfig();
  if (!edgeUrl || !secret) return NextResponse.json({ error: 'server_not_configured' }, { status: 500 });

  const organizationId = request.nextUrl.searchParams.get('organization_id');
  if (!organizationId) return NextResponse.json({ error: 'organization_id_required' }, { status: 400 });
  if (!authorized(request, organizationId, secret)) return NextResponse.json({ error: 'workspace_unauthorized' }, { status: 401 });

  try {
    const url = `${edgeUrl}?organization_id=${encodeURIComponent(organizationId)}`;
    const response = await fetch(url, {
      headers: { 'x-agent-x-secret': secret },
      cache: 'no-store',
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Agent X command center proxy GET error', error);
    return NextResponse.json({ error: 'proxy_failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { edgeUrl, secret } = getConfig();
  if (!edgeUrl || !secret) return NextResponse.json({ error: 'server_not_configured' }, { status: 500 });

  try {
    const body = await request.json();
    const organizationId = body?.organizationId;
    if (!organizationId || typeof organizationId !== 'string') return NextResponse.json({ error: 'organization_id_required' }, { status: 400 });
    if (!authorized(request, organizationId, secret)) return NextResponse.json({ error: 'workspace_unauthorized' }, { status: 401 });

    const response = await fetch(edgeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-agent-x-secret': secret },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Agent X command center proxy POST error', error);
    return NextResponse.json({ error: 'proxy_failed' }, { status: 500 });
  }
}
