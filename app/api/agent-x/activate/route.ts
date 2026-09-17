import { createHmac } from 'crypto';
import { NextResponse } from 'next/server';

const COOKIE_NAME = 'ax_workspace';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const CUSTOM_ROLES = new Set(['executive', 'organization']);

function signWorkspace(organizationId: string, secret: string) {
  const issuedAt = Math.floor(Date.now() / 1000).toString();
  const payload = `${organizationId}.${issuedAt}`;
  const signature = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export async function POST(request: Request) {
  try {
    const edgeUrl = process.env.AGENT_X_EDGE_URL;
    const secret = process.env.AGENT_X_PREVIEW_SECRET;
    if (!edgeUrl || !secret) {
      return NextResponse.json({ error: 'server_not_configured' }, { status: 500 });
    }

    const body = await request.json();
    const role = typeof body?.role === 'string' ? body.role.trim().toLowerCase() : '';
    const industry = typeof body?.industry === 'string' ? body.industry.trim().toLowerCase() : '';

    if (CUSTOM_ROLES.has(role) || industry === 'organization') {
      return NextResponse.json(
        {
          ok: false,
          error: 'custom_organization_workforce_required',
          next: 'https://thebotstores.com/pages/contact',
        },
        { status: 422 }
      );
    }

    const response = await fetch(edgeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-agent-x-secret': secret,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await response.json();
    const outgoing = NextResponse.json(data, { status: response.status });

    const organizationId = data?.data?.organization?.id;
    if (response.ok && data?.ok && typeof organizationId === 'string') {
      outgoing.cookies.set({
        name: COOKIE_NAME,
        value: signWorkspace(organizationId, secret),
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: MAX_AGE_SECONDS,
      });
    }

    return outgoing;
  } catch (error) {
    console.error('Agent X activation proxy error', error);
    return NextResponse.json({ error: 'proxy_failed' }, { status: 500 });
  }
}
