import {randomBytes,createHash,createHmac} from 'node:crypto';
export const token=()=>randomBytes(32).toString('base64url');
export const hash=value=>createHash('sha256').update(value).digest('hex');
export const rateKey=(value,secret)=>createHmac('sha256',secret).update(value).digest('hex');
export class Problem extends Error {constructor(status,message){super(message);this.status=status;}}
export function text(value,max,required=false){if(typeof value!=='string'||value.length>max||(required&&!value.trim()))throw new Problem(400,'Please check the highlighted details and try again.');return value.trim();}
export function normalizePlan(plan){
 if(!plan||typeof plan!=='object'||Array.isArray(plan))throw new Problem(400,'Your party plan is missing.');
 const result={};
 for(const [key,max] of Object.entries({partyTitle:180,description:800,locationType:60,preferredDate:10,preferredTime:5,hostNote:600,budgetNote:1000,photoSuggestion:1000,groupType:60,gatheringType:60,mood:60,reason:60,foodMethod:60,indoorOutdoor:60})) result[key]=text(plan[key]??'',max,key==='partyTitle');
 for(const [key,min,max] of [['guestCount',2,40],['durationMinutes',15,720],['estimatedBudgetLow',0,100000],['estimatedBudgetHigh',0,100000]]){const n=plan[key];if(typeof n!=='number'||!Number.isFinite(n)||n<min||n>max)throw new Problem(400,'Please check your party size, time and budget.');if(['guestCount','durationMinutes'].includes(key)&&!Number.isInteger(n))throw new Problem(400,'Use a whole number for party size and duration.');result[key]=n;}
 if(result.estimatedBudgetHigh<result.estimatedBudgetLow)throw new Problem(400,'The upper budget must be at least the lower budget.');
 if(result.preferredDate&&(!/^\d{4}-\d{2}-\d{2}$/.test(result.preferredDate)||!Number.isFinite(Date.parse(result.preferredDate))||new Date(result.preferredDate).toISOString().slice(0,10)!==result.preferredDate))throw new Problem(400,'Please choose a valid date.');
 if(result.preferredTime&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(result.preferredTime))throw new Problem(400,'Please choose a valid time.');
 const zone=text(plan.timeZone||'America/New_York',100,true);try{new Intl.DateTimeFormat('en',{timeZone:zone});}catch{throw new Problem(400,'Please choose a valid timezone.');}result.timeZone=zone;
 for(const key of ['menu','shoppingList','contributionSuggestions','checklist','conversationQuestions']){if(!Array.isArray(plan[key])||plan[key].length>60)throw new Problem(400,'Please shorten your plan.');result[key]=plan[key].map(value=>text(value,600));}
 result.scripture={reference:text(plan.scripture?.reference??'',200),text:text(plan.scripture?.text??'',1000)};
 result.sourceStoryId=plan.sourceStoryId?text(plan.sourceStoryId,1000):null;
 // Explicit allowlist: client-supplied owner IDs, account roles and permissions are ignored.
 return result;
}
export function normalizeSave(input){
 if(input.passwordlessPermission!==true)throw new Problem(400,'Please allow us to email your private access link.');
 const email=text(input.email,254,true).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Problem(400,'Please enter a valid email address.');
 const zip=text(input.zipCode,10,true);if(!/^\d{5}(-\d{4})?$/.test(zip))throw new Problem(400,'Please enter a five-digit ZIP code.');
 return {email,firstName:text(input.firstName,80,true),mobile:text(input.mobile??'',30),zipCode:zip,plan:normalizePlan(input.plan),permissionVersion:'host-access-v1'};
}
export function sessionFrom(req){const cookie=req.headers.cookie||'';const match=cookie.match(/(?:^|;\s*)woc_host=([A-Za-z0-9_-]{43})(?:;|$)/);return match?match[1]:null;}
