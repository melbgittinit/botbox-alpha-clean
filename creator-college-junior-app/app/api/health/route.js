import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    ok: true,
    app: 'creator-college-junior',
    environment: 'staging',
    experience: 'interactive-open-house',
    next: '15.5.25',
    supabaseConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    shopifyConfigured: Boolean(process.env.SHOPIFY_SEMESTER_ONE_VARIANT_ID),
    checkoutSigningConfigured: Boolean(process.env.CHECKOUT_ASSOCIATION_SECRET)
  });
}
