import { readFile } from "node:fs/promises";

const checklist=JSON.parse(await readFile(new URL("../config/activation-checklist.json",import.meta.url),"utf8"));
const required=["OPENAI_API_KEY","DATABASE_URL","REVIEW_TOKEN","SESSION_SIGNING_SECRET","INVITE_CODES_SHA256"];
const envReady=required.every(name=>Boolean(process.env[name]));
const active=process.env.BRIDGE1_ACTIVE==="true";
const report={
  decision:"HOLD",
  environment_credentials:envReady?"present-not-validated":"pending",
  voice_activation:active?"enabled":"paused",
  technical_gates:checklist.technical_gates.map(gate=>({gate,status:"requires deployment evidence"})),
  behavior_gates:checklist.behavior_gates.map(gate=>({gate,status:"requires supervised test"})),
  approvals:checklist.approvals.map(role=>({role,status:"pending"}))
};
console.log(JSON.stringify(report,null,2));
