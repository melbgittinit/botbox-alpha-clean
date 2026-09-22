"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
import styles from "../press.module.css";
export default function Control(){
 const [data,setData]=useState<any>(null);
 useEffect(()=>{fetch("/api/media/control").then(r=>r.json()).then(setData)},[]);
 return <main className={styles.press}><div className={styles.wrap}><nav className={styles.nav}><Link className={styles.brand} href="/press">THE BOT STORES • MEDIA FLOOR</Link><div className={styles.navlinks}><Link href="/press/fresh">Fresh Dings</Link></div></nav>
 <section className={styles.hero}><div className={styles.eyebrow}>MEDIA CONTROL ROOM™ • ALPHA</div><h1>WHAT IS GETTING ATTENTION?</h1><p>Aggregate alpha activity only. Reporter identity and email are intentionally not displayed here.</p></section>
 {data&&<><section className={styles.grid}>{Object.entries(data.totals).map(([k,v])=><article className={styles.card} key={k}><div className={styles.meta}>{k.replaceAll("_"," ")}</div><h2>{String(v)}</h2></article>)}</section>
 <section className={styles.section}><div className={styles.panel}><h2>Hot topics</h2>{data.hot_topics.length?data.hot_topics.map((x:any)=><p key={x.topic}><b>{x.topic}</b> — {x.count}</p>):<p>No interaction signals yet.</p>}<p className={styles.small}>Alpha storage: {data.alpha_storage}. Durable Postgres storage is the production target.</p></div></section></>}
 </div></main>
}