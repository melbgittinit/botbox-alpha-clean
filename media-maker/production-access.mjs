import {createHash,timingSafeEqual} from 'node:crypto';
export function productionAccess(header,key=process.env.MEDIA_MAKER_SERVICE_KEY){
 if(!key||key.length<32)return {ok:false,status:503,error:'Production service is not configured'};
 const match=typeof header==='string'&&header.match(/^Bearer ([^\s]+)$/);
 if(!match||match[1].length>512)return {ok:false,status:401,error:'Authorization required'};
 const hash=value=>createHash('sha256').update(value).digest();
 if(!timingSafeEqual(hash(match[1]),hash(key)))return {ok:false,status:401,error:'Authorization required'};
 return {ok:true};
}
