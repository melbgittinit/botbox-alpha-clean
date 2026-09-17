import { randomInt } from 'crypto';
import { NextResponse } from 'next/server';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_AGENT_X_SUPABASE_URL;
  const publishableKey = process.env.AGENT_X_SUPABASE_PUBLISHABLE_KEY;
  const bridgeSecret = process.env.AGENT_X_COMMERCE_BRIDGE_SECRET;
  const resendKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.AGENT_X_EMAIL_FROM;

  if (!supabaseUrl || !publishableKey || !bridgeSecret) {
    return NextResponse.json({ error: 'server_not_configured' }, { status: 503 });
  }
  if (!resendKey || !emailFrom) {
    return NextResponse.json({ error: 'email_delivery_not_configured' }, { status: 503 });
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
  const rpc = await fetch(`${supabaseUrl}/rest/v1/rpc/agent_x_issue_purchase_claim_bridge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
    },
    body: JSON.stringify({
      p_secret: bridgeSecret,
      p_email: email,
      p_order_name: orderName,
      p_code: code,
    }),
    cache: 'no-store',
  });

  let claim: any = null;
  try { claim = await rpc.json(); } catch { claim = null; }
  if (!rpc.ok) {
    return NextResponse.json({ error: 'claim_request_failed' }, { status: 502 });
  }

  // Always return a generic success for unmatched purchases to avoid account/order enumeration.
  if (!claim?.matched || claim?.rate_limited || !claim?.challenge_id) {
    return NextResponse.json({
      ok: true,
      message: 'If the purchase details match an eligible Agent X order, a code will be sent shortly.',
    });
  }

  const mail = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: emailFrom,
      to: [email],
      subject: 'Your Agent X activation code',
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;color:#10131a"><div style="font-size:12px;letter-spacing:.18em;font-weight:700;color:#566075">AGENT X · HIRE INTELLIGENCE</div><h1 style="font-size:26px;margin:18px 0 8px">Activate your AI workforce</h1><p style="line-height:1.6">Use this one-time code to continue your Agent X activation:</p><div style="font-size:36px;letter-spacing:.22em;font-weight:800;padding:20px 0">${code}</div><p style="line-height:1.6">This code expires in 10 minutes. If you did not request this code, you can ignore this email.</p><hr style="border:0;border-top:1px solid #e6e8ec;margin:28px 0"><p style="font-size:12px;color:#727987">Human-led AI. Intelligence With Accountability.</p></div>`,
      text: `Agent X activation code: ${code}\n\nThis one-time code expires in 10 minutes. If you did not request it, ignore this email.`,
    }),
    cache: 'no-store',
  });

  if (!mail.ok) {
    return NextResponse.json({ error: 'email_delivery_failed' }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    challengeId: claim.challenge_id,
    expiresInSeconds: Number(claim.expires_in_seconds || 600),
    message: 'If the purchase details match an eligible Agent X order, a code will be sent shortly.',
  });
}
