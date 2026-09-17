import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const edgeUrl = process.env.AGENT_X_EDGE_URL;
    const secret = process.env.AGENT_X_PREVIEW_SECRET;
    if (!edgeUrl || !secret) {
      return NextResponse.json({ error: 'server_not_configured' }, { status: 500 });
    }

    const body = await request.json();
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
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Agent X activation proxy error', error);
    return NextResponse.json({ error: 'proxy_failed' }, { status: 500 });
  }
}
