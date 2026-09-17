import { NextRequest, NextResponse } from 'next/server';

const getConfig = () => ({
  edgeUrl: process.env.AGENT_X_COMMAND_CENTER_EDGE_URL,
  secret: process.env.AGENT_X_PREVIEW_SECRET,
});

export async function GET(request: NextRequest) {
  const { edgeUrl, secret } = getConfig();
  if (!edgeUrl || !secret) return NextResponse.json({ error: 'server_not_configured' }, { status: 500 });

  const organizationId = request.nextUrl.searchParams.get('organization_id');
  if (!organizationId) return NextResponse.json({ error: 'organization_id_required' }, { status: 400 });

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
