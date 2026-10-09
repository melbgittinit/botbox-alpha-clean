import { randomInt } from 'crypto';
import { NextResponse } from 'next/server';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_AGENT_X_SUPABASE_URL;
  const bridgeSecret = process.env.AGENT_X_COMMERCE_BRIDGE_SECRET;

  if (!supabaseUrl || !bridgeSecret) {
    return NextResponse.json({ error: 'server_not_configured' }, { status: 503 });
  }

  let body: any;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  const email = String(body?.email || '').trim().toLowerCase();
  const orderName = String(body?.orderName || '').trim();
  if (!EMAIL_PATTERN.test(email) || !orderName || orderName.length > 64) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
  const rpc = await fetch(`${supabaseUrl}/functions/v1/agent-x-commerce-bridge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-agent-x-commerce-secret': bridgeSecret },
    body: JSON.stringify({
      action: 'issue_claim',
      payload: { email, orderName, code },
    }),
    cache: 'no-store',
  });

  let envelope: any = null;
  try { envelope = await rpc.json(); } catch { envelope = null; }
  const claim = envelope?.data;
  if (!rpc.ok || !envelope?.ok) {
    return NextResponse.json({ error: 'claim_request_failed' }, { status: 502 });
  }

  // Do not expose purchase matches or codes. Delivery is intentionally gated.
  return NextResponse.json({
    ok: true,
    deliveryReady: Boolean(process.env.RESEND_API_KEY && process.env.AGENT_X_EMAIL_FROM),
    challengeId: claim?.challenge_id || null,
    expiresInSeconds: Number(claim?.expires_in_seconds || 600),
    message: 'If the purchase details match an eligible Agent X order, the activation process will continue.',
  });
}
