const requirements=[["OPENAI_API_KEY",24],["DATABASE_URL",12],["REVIEW_TOKEN",24],["SESSION_SIGNING_SECRET",32],["INVITE_CODES_SHA256",64]],failures=[];
for(const[name,min]of requirements){if((process.env[name]||"").length<min)failures.push(`${name} is missing or too short`);}
if(process.env.INVITE_REQUIRED!=="true")failures.push("INVITE_REQUIRED must be true");if(process.env.BRIDGE1_ACTIVE!=="true")failures.push("BRIDGE1_ACTIVE must be explicitly true");
if(failures.length){console.error("BRIDGE-1 deployment audit: FAIL\n- "+failures.join("\n- "));process.exit(1);}console.log("BRIDGE-1 deployment audit: PASS");
