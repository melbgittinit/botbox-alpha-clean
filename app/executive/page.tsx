import Link from "next/link";
import styles from "../bot-factory.module.css";

const cards=[
 {mark:"BB",title:"BrandBridge™",promise:"Give the brand an agent presence of its own.",description:"Concept and pilot layer for brand-specific agents, governed access and ongoing customer relationships.",href:"/press/executive",status:"CONCEPT / EXECUTIVE"},
 {mark:"AX",title:"Agent X™",promise:"Advanced agents for industries and organizations.",description:"Industry-focused systems where identity, access, approval, audit and control matter as much as raw capability.",href:"/press/interview?topic=Agent%20X",status:"EXECUTIVE"},
 {mark:"CS",title:"Custom Systems",promise:"When the bot you need does not come off the shelf.",description:"Opportunity framing, pilot design and custom multi-agent/system concepts for organizations.",href:"/press/interview?topic=Custom%20Systems",status:"SCOPED"},
];

export default function ExecutiveRoom(){
 return <main className={styles.page}><div className={styles.stage}>UNPUBLISHED ALPHA — EXECUTIVE FLOOR • concept demonstrations do not imply customer relationships.</div><div className={styles.wrap}>
 <header className={styles.hero}><div className={styles.eyebrow}>THE EXECUTIVE FLOOR™</div><h1>Identity. Access. Approval. Audit. Control.</h1><p>A quieter room for organizations whose agent does not come off the shelf.</p><div className={styles.actions}><Link className={styles.btn+" "+styles.light} href="/">RETURN TO BOT FACTORY</Link><Link className={styles.btn+" "+styles.primary} href="/press/executive">MEDIA / EXECUTIVE BRIEFING</Link></div></header>
 <section className={styles.grid}>{cards.map(card=><article className={styles.card} key={card.title}><div className={styles.mark}>{card.mark}</div><div className={styles.meta}>{card.status}</div><h3>{card.title}</h3><p className={styles.promise}>{card.promise}</p><p className={styles.desc}>{card.description}</p><Link className={styles.btn} href={card.href}>OPEN BRIEFING</Link></article>)}</section>
 <section className={styles.work} style={{marginTop:36}}><div className={styles.note}><b>EXECUTIVE GOVERNANCE STANDARD:</b> every serious deployment must define agent identity, authorized resources, approval level, audit trail, human involvement, delegated authority, revoke/stop control and what happens when something goes wrong.</div></section>
 </div></main>
}