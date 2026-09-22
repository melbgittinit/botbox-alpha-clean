"use client";
import Link from "next/link";
import { useState } from "react";
import styles from "../press.module.css";
export default function Pitch(){
 const [coverage,setCoverage]=useState("I am covering AI agents for small businesses and entrepreneurs.");
 const [result,setResult]=useState<any>(null);
 async function run(){const r=await fetch("/api/media/pitch",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({coverage})});setResult(await r.json());}
 return <main className={styles.press}><div className={styles.wrap}><nav className={styles.nav}><Link className={styles.brand} href="/press">THE BOT STORES • MEDIA FLOOR</Link><div className={styles.navlinks}><Link href="/press/fresh">Fresh Dings</Link><Link href="/press/headlines">Headline Bell</Link></div></nav>
 <section className={styles.hero}><div className={styles.eyebrow}>REVERSE PITCH™</div><h1>WHAT ARE YOU COVERING?</h1><p>Tell the Media Floor your story. We will look for a relevant Bot Stores angle instead of sending you everything.</p></section>
 <section className={styles.panel}><div className={styles.form}><label>Your story / beat<textarea rows={5} value={coverage} onChange={e=>setCoverage(e.target.value)}/></label><button className={styles.button} onClick={run}>FIND MY BOT STORES ANGLE</button></div>
 {result?.matches&&<div className={styles.section}>{result.matches.map((m:any)=><article className={styles.card} key={m.id} style={{marginBottom:12}}><div className={styles.meta}>{m.bot}</div><h2>{m.title}</h2><p>{m.why}</p><p><b>Possible angle:</b> {m.suggested_headline}</p><Link className={styles.link} href={"/press/headlines?story="+m.id}>Open in Headline Bell</Link></article>)}</div>}</section>
 </div></main>
}