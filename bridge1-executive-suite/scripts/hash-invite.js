import { hashInviteCode } from "../src/access-control.js";
const code=process.argv[2];if(!code){console.error("Usage: npm run hash-invite -- <private-code>");process.exit(1);}console.log(hashInviteCode(code));
