"use client";
import Link from "next/link";
import { useState } from "react";
import styles from "../press.module.css";
import { stories } from "../media";
export default function Headlines(){
 const [storyId,setStoryId]=useState(stories[0].id),[beat,setBeat]=useState("AI"),[format,setFormat]=useState("Straight News"),[result,setResult]=useState<any>(null),[loading,setLoading]=useState(false);
 async function run(){setLoading(true);const r=await fetch("/api/media/headlines",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({story_id:storyId,beat,format})});setResult(await r.json());setLoading(false);}
 return <main className={styles.press}><div className={styles.wrap}><nav className={styles.nav}><Link className={styles.brand} href="/press">THE BOT STORES • MEDIA FLOOR</Link><div className={styles.navlinks}><Link href="/press/fresh">Fresh Dings</Link><Link href="/press/interview">Information Director</Link></div></nav>
 <section className={styles.hero}><div className={styles.eyebrow}>📰 HEADLINE BELL™</div><h1>FIND YOUR ANGLE.</h1><p>Tailored headlines grounded in the current approved media story.</p></section>
 <section className={styles.panel}><div className={styles.form}>
 <label>Story<select value={storyId} onChange={e=>setStoryId(e.target.value)}>{stories.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select></label>
 <label>I cover<select value={beat} onChange={e=>setBeat(e.target.value)}>{["AI","Technology","Business","Entrepreneurship","Government","Enterprise","Creators","Culture","General"].map(x=><option key={x}>{x}</option>)}</select></label>
 <label>Style<select value={format} onChange={e=>setFormat(e.target.value)}>{["Straight News","Feature","Question","Broadcast","Newsletter","Fun / Cultural"].map(x=><option key={x}>{x}</option>)}</select></label>
 <button className={styles.button} onClick={run} disabled={loading}>{loading?"Ringing…":"RING THE BELL 🔔"}</button>
 </div>{result&&<div className={styles.result}><div className={styles.meta}>AUTHORIZED ANGLE</div><div className={styles.quote}>{result.headline}</div><p>{result.angle}</p><div className={styles.small}>Supported by: {result.supporting_fact_ids?.join(", ")}</div></div>}</section>
 </div></main>}