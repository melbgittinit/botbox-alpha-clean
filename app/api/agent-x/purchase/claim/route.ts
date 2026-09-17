import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_AGENT_X_SUPABASE_URL;
  const publishableKey = process.env.AGENT_X_SUPABASE_PUBLISHABLE_KEY;
  const bridgeSecret = process.env.AGENT_X_COMMERCE_BRIDGE_SECRET;

  if (!supabaseUrl || !publishableKey || !bridgeSecret) {
    return NextResponse.json({ error: 'server_not_configured' }, { status: 503 });
  }

  let body: any;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  const rpc = await fetch(`${supabaseUrl}/rest/v1/rpc/agent_x_claim_and_activate_purchase_bridge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
    },
    body: JSON.stringify({
      p_secret: bridgeSecret,
      p_challenge_id: body?.challengeId,
      p_email: body?.email,
      p_code: body?.code,
      p_first_name: body?.firstName || null,
      p_business_name: body?.businessName,
      p_role: body?.role || 'business',
      p_industry: body?.industry || 'other',
      p_mission: body?.mission || 'organize',
      p_challenge: body?.challenge || 'need_systems',
    }),
    cache: 'no-store',
  });

  let data: any = null;
  try { data = await rpc.json(); } catch { data = null; }
  if (!rpc.ok || !data?.claim_verified) {
    return NextResponse.json({ error: 'claim_failed' }, { status: 400 });
  }

  return NextResponse.json({ ok: true, data });
}
