import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';

const VARIANT_ID = process.env.SHOPIFY_SEMESTER_ONE_VARIANT_ID || process.env.NEXT_PUBLIC_SHOPIFY_SEMESTER_ONE_VARIANT_ID || '53746665226533';
const SHOP_ORIGIN = (process.env.NEXT_PUBLIC_SHOPIFY_STORE_ORIGIN || 'https://urbanspirit.biz').replace(/\/$/, '');

function toBase64Url(value) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 });

  let body = {};
  try { body = await request.json(); } catch {}
  const creatorId = typeof body?.creatorId === 'string' ? body.creatorId : '';
  if (!creatorId) return NextResponse.json({ error: 'creator_required' }, { status: 400 });

  const { data, error } = await supabase.rpc('create_checkout_association', {
    p_creator_id: creatorId,
    p_variant_id: VARIANT_ID,
  });

  if (error) {
    return NextResponse.json({ error: 'association_failed', detail: error.message }, { status: 403 });
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.checkout_token || !row?.association_id) {
    return NextResponse.json({ error: 'association_missing' }, { status: 500 });
  }

  const properties = toBase64Url(JSON.stringify({ _ccj_token: row.checkout_token }));
  const checkoutUrl = `${SHOP_ORIGIN}/cart/${VARIANT_ID}:1?properties=${encodeURIComponent(properties)}`;

  return NextResponse.json({
    ok: true,
    associationId: row.association_id,
    expiresAt: row.expires_at,
    checkoutUrl,
  });
}
