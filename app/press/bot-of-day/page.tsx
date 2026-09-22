import Link from "next/link";
import styles from "../press.module.css";
import { stories } from "../media";

export default function BotDay(){
  const day = Math.floor(Date.now()/86400000);
  const story = stories[day % stories.length];
  return <main className={styles.press}><div className={styles.wrap}>
    <nav className={styles.nav}><Link className={styles.brand} href="/press">THE BOT STORES • MEDIA FLOOR</Link><div className={styles.navlinks}><Link href="/press/fresh">Fresh Dings</Link><Link href="/press/headlines">Headline Bell</Link></div></nav>
    <section className={styles.hero}><div className={styles.eyebrow}>🤖 BOT OF THE DAY™</div><h1>{story.bot}</h1><p>{story.summary}</p></section>
    <section className={styles.split}>
      <article className={styles.card}><div className={styles.meta}>WHY TODAY</div><h2>{story.title}</h2><p>{story.why}</p><div className={styles.pills}>{story.beat.map(x=><span className={styles.pill} key={x}>{x}</span>)}</div></article>
      <article className={styles.card}><div className={styles.meta}>30-SECOND PRESS STARTER</div><h2>{story.feature}</h2><p><b>What it is:</b> {story.summary}</p><p><b>Status:</b> {story.state}</p><p><b>Zone:</b> {story.zone}</p></article>
    </section>
    <section className={styles.section}><div className={styles.panel}><div className={styles.meta}>MEDIA ACTIONS</div><p><Link className={styles.button} href={"/press/headlines?story="+story.id}>Tailor a headline</Link> <Link className={styles.button+" "+styles.dark} href={"/press/interview?topic="+encodeURIComponent(story.bot)}>Get a statement</Link></p><p className={styles.small}>Bot of the Day is recurring editorial programming. A featured bot does not need to be newly launched; Fresh Dings are reserved for genuine new developments.</p></div></section>
  </div></main>
}