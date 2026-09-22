import Link from "next/link";
import styles from "../press.module.css";
import { stories } from "../media";
export default function Fresh(){
return <main className={styles.press}><div className={styles.wrap}>
<nav className={styles.nav}><Link className={styles.brand} href="/press">THE BOT STORES • MEDIA FLOOR</Link><div className={styles.navlinks}><Link href="/press/headlines">Headline Bell</Link><Link href="/press/interview">Information Director</Link></div></nav>
<section className={styles.hero}><div className={styles.eyebrow}>🔔 FRESH DINGS™</div><h1>A NEW STORY JUST DINGED.</h1><p>Real developments from The Bot Stores, with freshness status and approved context.</p></section>
<section className={styles.section}>
{stories.map((s,i)=><article key={s.id} className={styles.card} style={{marginBottom:12}}>
<div className={styles.ding}><div><div className={styles.dingNo}>{s.ding}</div><span className={styles.status}>{s.state}</span></div><div>
<div className={styles.meta}>{s.zone} • {s.bot}</div><h2>{s.title}</h2><p><b>What happened:</b> {s.summary}</p><p><b>Why it may matter:</b> {s.why}</p><div className={styles.pills}>{s.beat.map(b=><span className={styles.pill} key={b}>{b}</span>)}</div><p><b>Straight:</b> {s.straight}</p><p><b>Feature:</b> {s.feature}</p><div><Link className={styles.button} href={"/press/headlines?story="+s.id}>Get tailored headlines</Link> <Link className={styles.button+" "+styles.dark} href={"/press/interview?topic="+encodeURIComponent(s.bot)}>Get statement</Link></div>
</div></div></article>)}
</section>
<footer className={styles.footer}>Freshness states prevent old announcements from being presented as new.</footer>
</div></main>}