import Link from "next/link";
import styles from "./press.module.css";

export default function Page(){
  return <main className={styles.press}><div className={styles.wrap}>
    <nav className={styles.nav}><Link className={styles.brand} href="/press">THE BOT STORES • MEDIA FLOOR</Link><div className={styles.navlinks}><Link href="/press/fresh">Fresh Dings</Link><Link href="/press/headlines">Headline Bell</Link><Link href="/press/interview">Information Director</Link><Link href="/press/executive">Executive Floor</Link></div></nav>
    
<section className={styles.hero}><div className={styles.eyebrow}>THE BOT STORES</div><h1>EXECUTIVE FLOOR™</h1><p>Some bots don’t come off the shelf. This area separates organizational and brand concepts from the consumer showroom.</p></section>
<section className={styles.grid}>
<article className={styles.card}><div className={styles.eyebrow}>BRANDBRIDGE™</div><h2>Brand-specific systems.</h2><p>Concept layer for major-brand and enterprise demonstrations. A concept demonstration is not a customer partnership unless explicitly identified as an authorized case.</p><Link className={styles.button} href="/press/interview?topic=BrandBridge">Get approved statement</Link></article>
<article className={styles.card}><div className={styles.eyebrow}>AGENT X™</div><h2>Industry and organizational agents.</h2><p>Advanced agent concepts for industries and organizations, kept distinct from the everyday Bot Stores showroom.</p><Link className={styles.button} href="/press/interview?topic=Agent%20X">Ask Information Director</Link></article>
</section>
<section className={styles.section}><div className={styles.panel}><div className={styles.eyebrow}>MEDIA RULE</div><h2>CONCEPT DEMO ≠ CLIENT CLAIM</h2><p>Every enterprise example must be visibly labeled as Concept Demonstration, Active Product, or Authorized Client Case. The system does not infer partnerships.</p></div></section>

    <footer className={styles.footer}>Official Bot Stores media environment • AI-assisted • Authorized information only • THEBOTSTORES.com</footer>
  </div></main>
}