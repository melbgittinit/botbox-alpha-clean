#!/usr/bin/env bash
set -euo pipefail

rm -rf creator-college-junior-v9
mkdir -p creator-college-junior-v9/app/api/health

cat > creator-college-junior-v9/package.json <<'JSON'
{
  "name": "creator-college-junior-staging-shell",
  "private": true,
  "scripts": {
    "build": "next build",
    "start": "next start -p ${PORT:-3000}"
  },
  "dependencies": {
    "next": "14.2.35",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  }
}
JSON

cat > creator-college-junior-v9/app/layout.js <<'JS'
export const metadata = {
  title: 'Creator College Junior — Staging',
  description: 'Creator College Junior staging environment'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Arial, sans-serif', background: '#070b16', color: '#f7f8fb' }}>
        {children}
      </body>
    </html>
  );
}
JS

cat > creator-college-junior-v9/app/page.js <<'JS'
const card = {
  background: 'linear-gradient(145deg, rgba(255,255,255,.08), rgba(255,255,255,.035))',
  border: '1px solid rgba(255,255,255,.12)',
  borderRadius: 24,
  padding: 24,
  boxShadow: '0 24px 80px rgba(0,0,0,.35)'
};

export default function Home() {
  const supabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const shopify = Boolean(process.env.SHOPIFY_SEMESTER_ONE_VARIANT_ID);
  return (
    <main style={{ minHeight: '100vh', padding: '48px 20px', background: 'radial-gradient(circle at 20% 0%, #16336f 0, transparent 32%), radial-gradient(circle at 90% 10%, #552479 0, transparent 30%), #070b16' }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div style={{ fontSize: 14, letterSpacing: 3, color: '#f5c86a', fontWeight: 800 }}>CREATOR COLLEGE JUNIOR</div>
        <h1 style={{ fontSize: 'clamp(42px,8vw,84px)', lineHeight: .95, margin: '16px 0 18px' }}>Learn to Create<br />in an AI World.</h1>
        <p style={{ maxWidth: 700, fontSize: 20, lineHeight: 1.55, color: '#cbd5eb' }}>This is the isolated staging front door for the Creator College Junior build. The full V9 semester package remains separate while staging services are activated safely.</p>

        <section style={{ ...card, marginTop: 34 }}>
          <div style={{ color: '#7ee3ff', fontWeight: 800, marginBottom: 8 }}>STAGING STATUS</div>
          <h2 style={{ marginTop: 0 }}>Open House shell is online.</h2>
          <p style={{ color: '#cbd5eb' }}>No production HUB pages or main branches are modified by this environment.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 14, marginTop: 22 }}>
            <div style={card}><strong>Shopify</strong><div style={{ marginTop: 8, color: shopify ? '#9ff2b8' : '#ffc98a' }}>{shopify ? 'Draft Semester One variant wired' : 'Not configured'}</div></div>
            <div style={card}><strong>Supabase</strong><div style={{ marginTop: 8, color: supabase ? '#9ff2b8' : '#ffc98a' }}>{supabase ? 'Configured' : 'Awaiting staging project'}</div></div>
            <div style={card}><strong>AI Lab</strong><div style={{ marginTop: 8, color: '#9ff2b8' }}>Deterministic fallback available</div></div>
          </div>
        </section>

        <section style={{ marginTop: 28, ...card }}>
          <div style={{ color: '#f5c86a', fontWeight: 800 }}>SEMESTER ONE</div>
          <h2>I Can Create</h2>
          <p style={{ color: '#cbd5eb' }}>Creator Identity → First Show → First Product → Story World → Build With AI → Creator Showcase → Graduation</p>
        </section>
      </div>
    </main>
  );
}
JS

cat > creator-college-junior-v9/app/api/health/route.js <<'JS'
import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    ok: true,
    app: 'creator-college-junior',
    environment: 'staging',
    supabaseConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    shopifyConfigured: Boolean(process.env.SHOPIFY_SEMESTER_ONE_VARIANT_ID),
    checkoutSigningConfigured: Boolean(process.env.CHECKOUT_ASSOCIATION_SECRET)
  });
}
JS

cd creator-college-junior-v9
npm install
npm run build
