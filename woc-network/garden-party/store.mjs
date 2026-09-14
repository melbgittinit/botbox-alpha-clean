import {randomUUID} from 'node:crypto';
export class PostgresStore {
 constructor(pool){this.pool=pool;}
 async health(){await this.pool.query('SELECT 1 FROM woc_garden.members LIMIT 0');}
 async rate(key,limit){const bucket=Math.floor(Date.now()/3600000);const r=await this.pool.query('INSERT INTO woc_garden.rate_limits(key_hash,bucket,hits) VALUES($1,$2,1) ON CONFLICT(key_hash,bucket) DO UPDATE SET hits=woc_garden.rate_limits.hits+1 RETURNING hits',[key,bucket]);return r.rows[0].hits<=limit;}
 async pending(id,tokenHash,input){await this.pool.query('INSERT INTO woc_garden.access_requests(id,token_hash,email,first_name,mobile,zip_code,plan,expires_at,permission_version) VALUES($1,$2,$3,$4,$5,$6,$7,now()+interval \'20 minutes\',$8)',[id,tokenHash,input.email,input.firstName,input.mobile,input.zipCode,JSON.stringify(input.plan),input.permissionVersion]);}
 async accepted(id){await this.pool.query('UPDATE woc_garden.access_requests SET delivery_accepted=true WHERE id=$1',[id]);}
 async discard(id){await this.pool.query('DELETE FROM woc_garden.access_requests WHERE id=$1 AND consumed_at IS NULL',[id]);}
 async resumePending(id,tokenHash,email){const r=await this.pool.query('INSERT INTO woc_garden.access_requests(id,token_hash,email,first_name,mobile,zip_code,plan,expires_at,permission_version,existing_party_id) SELECT $1,$2,m.email,m.first_name,m.mobile,m.zip_code,p.plan,now()+interval \'20 minutes\',\'host-access-v1\',p.id FROM woc_garden.members m JOIN woc_garden.parties p ON p.host_id=m.id WHERE m.email=$3 AND p.status=\'saved\' ORDER BY p.updated_at DESC LIMIT 1 RETURNING first_name',[id,tokenHash,email]);return r.rows[0]||null;}
 async redeem(tokenHash,sessionHash){
  const db=await this.pool.connect();try{await db.query('BEGIN');const r=await db.query('SELECT * FROM woc_garden.access_requests WHERE token_hash=$1 AND consumed_at IS NULL AND delivery_accepted=true AND expires_at>now() FOR UPDATE',[tokenHash]);if(!r.rowCount){await db.query('ROLLBACK');return null;}
   const a=r.rows[0];const member=await db.query('INSERT INTO woc_garden.members(id,email,first_name,mobile,zip_code) VALUES($1,$2,$3,$4,$5) ON CONFLICT(email) DO UPDATE SET first_name=EXCLUDED.first_name,mobile=EXCLUDED.mobile,zip_code=EXCLUDED.zip_code RETURNING id',[randomUUID(),a.email,a.first_name,a.mobile,a.zip_code]);
   const memberId=member.rows[0].id,partyId=a.existing_party_id||randomUUID();
   if(!a.existing_party_id)await db.query('INSERT INTO woc_garden.parties(id,host_id,plan) VALUES($1,$2,$3)',[partyId,memberId,JSON.stringify(a.plan)]);
   await db.query('INSERT INTO woc_garden.sessions(token_hash,member_id,party_id,expires_at) VALUES($1,$2,$3,now()+interval \'7 days\')',[sessionHash,memberId,partyId]);
   await db.query('INSERT INTO woc_garden.permissions(id,member_id,party_id,purpose,wording_version,source) VALUES($1,$2,$3,\'passwordless_host_access\',$4,\'garden-party-save\')',[randomUUID(),memberId,partyId,a.permission_version]);
   await db.query('UPDATE woc_garden.access_requests SET consumed_at=now(),plan=\'{}\',email=\'\',first_name=\'\',mobile=\'\',zip_code=\'\' WHERE id=$1',[a.id]);await db.query('COMMIT');return {partyId};
  }catch(error){await db.query('ROLLBACK');throw error;}finally{db.release();}
 }
 async session(sessionHash){const r=await this.pool.query('SELECT member_id,party_id FROM woc_garden.sessions WHERE token_hash=$1 AND expires_at>now()',[sessionHash]);return r.rows[0]||null;}
 async party(id,memberId){const r=await this.pool.query('SELECT id,plan,version,status FROM woc_garden.parties WHERE id=$1 AND host_id=$2',[id,memberId]);return r.rows[0]||null;}
 async update(id,memberId,version,plan){const r=await this.pool.query('UPDATE woc_garden.parties SET plan=$4,version=version+1,updated_at=now() WHERE id=$1 AND host_id=$2 AND version=$3 AND status=\'saved\' RETURNING id,version',[id,memberId,version,JSON.stringify(plan)]);return r.rows[0]||null;}
 async remove(id,memberId){await this.pool.query('DELETE FROM woc_garden.parties WHERE id=$1 AND host_id=$2',[id,memberId]);}
 async logout(sessionHash){await this.pool.query('DELETE FROM woc_garden.sessions WHERE token_hash=$1',[sessionHash]);}
 async cleanup(){await this.pool.query('DELETE FROM woc_garden.access_requests WHERE expires_at<now()');await this.pool.query('DELETE FROM woc_garden.sessions WHERE expires_at<now()');await this.pool.query('DELETE FROM woc_garden.rate_limits WHERE bucket<$1',[Math.floor(Date.now()/3600000)-48]);}
}
