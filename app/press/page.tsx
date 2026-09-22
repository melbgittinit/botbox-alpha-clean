import Link from "next/link";
import styles from "./press.module.css";

export default function Page(){
  return <main className={styles.press}><div className={styles.wrap}>
    <nav className={styles.nav}><Link className={styles.brand} href="/press">THE BOT STORES • MEDIA FLOOR</Link><div className={styles.navlinks}><Link href="/press/fresh">Fresh Dings</Link><Link href="/press/bot-of-day">Bot of the Day</Link><Link href="/press/headlines">Headline Bell</Link><Link href="/press/interview">Information Director</Link><Link href="/press/executive">Executive Floor</Link></div></nav>

<section className={styles.hero}><div className={styles.eyebrow}>THE BOT STORES</div><h1>MEDIA FLOOR™</h1><p>Fresh stories. Fresh bots. Authorized answers. Covering AI? Don’t wait for a press release. Come inside.</p></section>
<section className={styles.grid}>
<article className={styles.card}><div className={styles.eyebrow}>🔔 FRESH DINGS™</div><h2>What actually changed?</h2><p>New bots, meaningful upgrades, new use cases and story-worthy developments—without recycling old announcements as breaking news.</p><Link className={styles.button} href="/press/fresh">See what dinged</Link></article>
<article className={styles.card}><div className={styles.eyebrow}>🤖 BOT OF THE DAY™</div><h2>One bot. One clean story.</h2><p>A recurring media package with purpose, audience, status, limitations and direct routes to an approved statement.</p><Link className={styles.button} href="/press/bot-of-day">Meet today’s bot</Link></article>
<article className={styles.card}><div className={styles.eyebrow}>📰 HEADLINE BELL™</div><h2>Find your angle.</h2><p>Choose your beat and story style. Headline Bell uses approved Bot Stores information to produce story directions—not invented claims.</p><Link className={styles.button} href="/press/headlines">Ring the bell</Link></article>
<article className={styles.card}><div className={styles.eyebrow}>🎙️ INFORMATION DIRECTOR™</div><h2>Need a quote?</h2><p>Ask the official AI media representative for a short authorized response suitable for print, radio, podcast or broadcast preparation.</p><Link className={styles.button} href="/press/interview">Ask a question</Link></article>
<article className={styles.card}><div className={styles.eyebrow}>↩ REVERSE PITCH™</div><h2>Tell us what you cover.</h2><p>The Media Floor finds the most relevant Bot Stores story instead of spraying every announcement at every reporter—and can return no fit.</p><Link className={styles.button} href="/press/pitch">Find my angle</Link></article>
<article className={styles.card}><div className={styles.eyebrow}>MEDIA PASS™</div><h2>Protected press access.</h2><p>Request review for protected media features while keeping public facts and Fresh Dings openly accessible.</p><Link className={styles.button} href="/press/pass">Request pass</Link></article>
<article className={styles.card}><div className={styles.eyebrow}>🏢 EXECUTIVE FLOOR™</div><h2>Beyond the shelf.</h2><p>BrandBridge™, Agent X™ and custom organizational concepts live here, clearly separated from the consumer showroom.</p><Link className={styles.button} href="/press/executive">Go upstairs</Link></article>
<article className={styles.card}><div className={styles.eyebrow}>PRESS TRUST LAYER</div><h2>What can it actually say?</h2><p>Approved facts, explicit product status, visible limitations, human escalation and Media Use Receipts sit underneath every automated media response.</p></article>
</section>

    <footer className={styles.footer}>Official Bot Stores media environment • AI-assisted • Authorized information only • THEBOTSTORES.com</footer>
  </div></main>
}