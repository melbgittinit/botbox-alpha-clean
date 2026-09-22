"use client";
import Link from "next/link";
import { useState } from "react";
import styles from "../press.module.css";
export default function Interview(){
 const [topic,setTopic]=useState("The Bot Stores"),[question,setQuestion]=useState("What is different about The Bot Stores?"),[seconds,setSeconds]=useState(30),[result,setResult]=useState<any>(null),[loading,setLoading]=useState(false);
 async function run(){setLoading(true);const r=await fetch("/api/media/interview",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({topic,question,target_length:seconds})});setResult(await r.json());setLoading(false);}
 return <main className={styles.press}><div className={styles.wrap}><nav className={styles.nav}><Link className={styles.brand} href="/press">THE BOT STORES • MEDIA FLOOR</Link><div className={styles.navlinks}><Link href="/press/fresh">Fresh Dings</Link><Link href="/press/headlines">Headline Bell</Link></div></nav>
 <section className={styles.hero}><div className={styles.eyebrow}>🎙️ OFFICIAL INFORMATION DIRECTOR™</div><h1>AUTHORIZED ANSWERS. BRIEF ENOUGH TO USE.</h1><p>AI media representative • Not Mel Banks II • Media use only</p></section>
 <section className={styles.split}><div className={styles.panel}><div className={styles.form}>
 <label>Topic<input value={topic} onChange={e=>setTopic(e.target.value)}/></label>
 <label>Your question<textarea rows={5} value={question} onChange={e=>setQuestion(e.target.value)}/></label>
 <label>Length<select value={seconds} onChange={e=>setSeconds(Number(e.target.value))}><option value={15}>15 sec</option><option value={30}>30 sec</option><option value={60}>60 sec</option><option value={120}>2 min</option></select></label>
 <button className={styles.button} onClick={run} disabled={loading}>{loading?"Checking authorization…":"GET AUTHORIZED RESPONSE"}</button>
 </div></div><div className={styles.panel}>{result?<><span className={styles.status}>✓ {result.authorization_status}</span><div className={styles.quote} style={{marginTop:16}}>{result.response}</div><p className={styles.small}>Source as: The Bot Stores Official Information Director™, AI media representative.</p><p className={styles.small}>Receipt: {result.receipt_id}</p><p className={styles.small}>Paid advertising, voice cloning and synthetic alteration are not authorized by this alpha receipt.</p></>:<p>Ask a question to generate a Truth Vault-grounded media response.</p>}</div></section>
 </div></main>}