"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
import styles from "../press.module.css";
export default function Control(){
 const [data,setData]=useState<any>(null);
 useEffect(()=>{fetch("/api/media/control").then(r=>r.json()).then(setData)},[]);
 return <main className={styles.press}><div className={styles.wrap}><nav className={styles.nav}><Link className={styles.brand} href="/press">THE BOT STORES • MEDIA FLOOR</Link><div className={styles.navlinks}><Link href="/press/fresh">Fresh Dings</Link></div></nav>
 <section className={styles.hero}><div className={styles.eyebrow}>MEDIA CONTROL ROOM™ • ALPHA</div><h1>DING-TO-COVERAGE RATE™</h1><p>The Media Swarm is judged by whether real Fresh Dings become verified media coverage—not by how many pitches it sends.</p></section>
 {data&&<><section className={styles.grid}>
 <article className={styles.card}><div className={styles.meta}>DING-TO-COVERAGE RATE™</div><h2>{data.swarm_performance.ding_to_coverage_rate_pct}%</h2><p>{data.swarm_performance.covered_dings} of {data.swarm_performance.published_dings} published Dings produced verified coverage.</p></article>
 <article className={styles.card}><div className={styles.meta}>VERIFIED COVERAGE</div><h2>{data.swarm_performance.verified_coverage_pieces}</h2><p>Confirmed articles, podcasts, broadcasts or qualifying media placements tied to a Ding.</p></article>
 <article className={styles.card}><div className={styles.meta}>COVERAGE PIECES / DING</div><h2>{data.swarm_performance.coverage_pieces_per_ding}</h2><p>Kept separate so multiple placements for one hit do not inflate the conversion rate.</p></article>
 <article className={styles.card}><div className={styles.meta}>FORMULA</div><h2>Covered ÷ Published</h2><p>{data.swarm_performance.formula}</p></article>
 </section>
 <section className={styles.section}><h2>Ding conversion board</h2>{data.ding_performance.map((d:any)=><article className={styles.card} key={d.story_id} style={{marginBottom:12}}>
 <div className={styles.meta}>🔔 {d.ding} • {d.state}</div><h2>{d.bot}</h2><p>{d.title}</p>
 <div className={styles.pills}><span className={styles.pill}>MATCHED {d.matched}</span><span className={styles.pill}>OUTREACH {d.outreach}</span><span className={styles.pill}>HEADLINES {d.headline_bells}</span><span className={styles.pill}>INTERVIEWS {d.interviews}</span><span className={styles.pill}>COVERAGE {d.verified_coverage}</span><span className={styles.pill}>OUTLETS {d.unique_outlets}</span></div>
 <p><b>{d.converted_to_coverage?"COVERAGE CONVERTED ✓":"NOT YET CONVERTED"}</b></p>
 </article>)}</section>
 <section className={styles.section}><div className={styles.panel}><h2>Hot topics</h2>{data.hot_topics.length?data.hot_topics.map((x:any)=><p key={x.topic}><b>{x.topic}</b> — {x.count}</p>):<p>No interaction signals yet.</p>}<p className={styles.small}>Alpha storage: {data.alpha_storage}. Durable Postgres storage remains required before production reporting.</p></div></section></>}
 </div></main>
}