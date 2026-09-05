import { NextResponse } from 'next/server';

const ALLOWED = new Set([
  'open_house_viewed','open_house_started','grownup_checkin_complete','creator_created','quiz_completed','creator_id_created','mission_completed','campus_viewed','locker_viewed','parent_handoff_viewed','schools_viewed','demo_reset'
]);

export async function POST(request) {
  try {
    const body = await request.json();
    const event = typeof body?.event === 'string' ? body.event : '';
    const step = Number.isFinite(Number(body?.step)) ? Number(body.step) : null;
    const sessionId = typeof body?.sessionId === 'string' ? body.sessionId.slice(0,80) : 'unknown';
    if (!ALLOWED.has(event)) return NextResponse.json({ok:false},{status:400});
    console.log(JSON.stringify({type:'ccj_funnel',event,step,sessionId,at:new Date().toISOString()}));
    return NextResponse.json({ok:true});
  } catch {
    return NextResponse.json({ok:false},{status:400});
  }
}
