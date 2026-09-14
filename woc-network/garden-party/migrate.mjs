import pg from 'pg';
import {readFile} from 'node:fs/promises';
if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is required for the WOC migration.');
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL});
try{await pool.query(await readFile(new URL('./schema.sql',import.meta.url),'utf8'));console.log('WOC Garden Party schema ready.');}finally{await pool.end();}
