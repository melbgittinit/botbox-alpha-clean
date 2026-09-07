import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { verifyCoreAccessToken } from "../../../../lib/core-access";

export async function GET(request:NextRequest){
  if(!process.env.DATABASE_URL || process.env.BOT_FACTORY_DB_IDENTITY!=="bot-factory-revenue"){
    return NextResponse.json({ok:false,error:"factory_database_not_ready"},{status:503});
  }
  const token=request.nextUrl.searchParams.get("token")||"";
  const payload=verifyCoreAccessToken(token);
  if(!payload) return NextResponse.json({ok:false,error:"invalid_or_expired_core_token"},{status:401});

  const entitlement=await prisma.botEntitlement.findUnique({where:{id:payload.entitlementId}});
  if(!entitlement) return NextResponse.json({ok:false,error:"entitlement_not_found"},{status:404});

  const status=entitlement.status;
  const core={
    identity:["CONFIGURING","TEST_REQUIRED","CERTIFIED","ACTIVE"].includes(status)?"READY":"PENDING",
    skills:["TEST_REQUIRED","CERTIFIED","ACTIVE"].includes(status)?"READY":"PENDING",
    personalization:["TEST_REQUIRED","CERTIFIED","ACTIVE"].includes(status)?"READY":"PENDING",
    test:["CERTIFIED","ACTIVE"].includes(status)?"PASSED":status==="TEST_REQUIRED"?"REQUIRED":"PENDING",
    certification:["CERTIFIED","ACTIVE"].includes(status)?"CERTIFIED":"PENDING",
    launch:status==="ACTIVE"?"ACTIVE":status==="CERTIFIED"?"READY":"LOCKED",
  };

  return NextResponse.json({ok:true,entitlementId:entitlement.id,botId:entitlement.botId,status,core},{headers:{"Cache-Control":"no-store"}});
}
