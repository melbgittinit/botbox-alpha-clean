import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "../../bot-factory.module.css";
import { getPriorityBot, priorityBots } from "../priority-bots";

export function generateStaticParams(){ return priorityBots.map(bot=>({id:bot.id})); }

export default async function PriorityBotPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const bot=getPriorityBot(id);
  if(!bot) notFound();
  return <main className={styles.page}>
    <div className={styles.stage}>UNPUBLISHED ALPHA — PRIORITY BOT PRODUCT PAGE • live transactions and full production automation are not enabled yet.</div>
    <div className={styles.wrap}>
      <header className={styles.hero}>
        <div className={styles.eyebrow}>{bot.eyebrow}</div>
        <h1>{bot.name}</h1>
        <p>{bot.promise}</p>
        <div className={styles.trustPromise}><b>{bot.status}</b><span>Standalone product page • media-ready structure • trust boundaries visible</span></div>
        <div className={styles.actions}><Link className={styles.btn+" "+styles.light} href="/">RETURN TO THE BOT FACTORY</Link></div>
      </header>

      <section className={styles.coreGrid}>
        <article className={styles.twin}><span className={styles.eyebrow}>WHAT IT DOES</span><h2>One job. Clear output.</h2><p>{bot.summary}</p></article>
        <div className={styles.core}><div className={styles.coreInner}><span>BOT</span><strong>{bot.name.split(" ")[0]}</strong><small>SPECIALIST • BOUNDED • HUMAN-CONTROLLED</small></div></div>
        <article className={styles.twin}><span className={styles.eyebrow}>VIDEO PLAN</span><h2>{bot.videoMode.replace("-"," ").toUpperCase()}</h2><p>{bot.videoBrief}</p></article>
      </section>

      <section className={styles.work}>
        <div className={styles.heading}><div><span className={styles.eyebrow}>RESULTS</span><h2>What this bot should produce</h2></div></div>
        <div className={styles.grid}>{bot.outputs.map((o,i)=><article className={styles.card} key={o}><div className={styles.mark}>{i+1}</div><h3>{o}</h3></article>)}</div>
      </section>

      <section className={styles.work} style={{marginTop:36}}>
        <div className={styles.heading}><div><span className={styles.eyebrow}>BOT TRUST CARD™</span><h2>Know the boundary before activation.</h2></div></div>
        <div className={styles.trustCard}>
          <div className={styles.trustGrid}>
            <div><span>IDENTITY</span><p>{bot.name} — identity status: DECLARED.</p></div>
            <div><span>ACCESS</span><p>{bot.access}</p></div>
            <div><span>CAN ACT ALONE?</span><p>{bot.autonomy}</p></div>
            <div><span>HUMAN APPROVAL</span><p>{bot.approval}</p></div>
            <div><span>SPENDING</span><p>{bot.spending}</p></div>
            <div><span>WORKS FOR</span><p>The customer using the bot, unless a future organizational deployment explicitly states otherwise.</p></div>
          </div>
          <div className={styles.trustLimits}><span>LIMITATIONS</span>{bot.limitations.map(x=><p key={x}>• {x}</p>)}</div>
        </div>
      </section>

      <section className={styles.work} style={{marginTop:36}}>
        <div className={styles.note}><b>MEDIA ANGLE:</b> {bot.mediaAngle}</div>
        <div className={styles.actions}><Link className={styles.btn+" "+styles.primary} href={"/press/interview?topic="+encodeURIComponent(bot.name)}>GET APPROVED MEDIA STATEMENT</Link><Link className={styles.btn} href="/press">MEDIA FLOOR</Link></div>
      </section>
    </div>
  </main>;
}
