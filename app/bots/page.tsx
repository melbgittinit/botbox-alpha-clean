import Link from "next/link";
import styles from "../bot-factory.module.css";
import { priorityBots } from "./priority-bots";

export default function PriorityIndex(){
 return <main className={styles.page}><div className={styles.wrap}>
 <header className={styles.hero}><div className={styles.eyebrow}>PRIORITY BOT PAGES</div><h1>Meet the specialists.</h1><p>Standalone destinations for the bots most likely to lead customer understanding, media interest and early demand.</p><div className={styles.actions}><Link className={styles.btn+" "+styles.light} href="/">RETURN TO BOT FACTORY</Link></div></header>
 <section className={styles.grid}>{priorityBots.map(bot=><article className={styles.card} key={bot.id}><div className={styles.meta}>{bot.status}</div><h3>{bot.name}</h3><p className={styles.promise}>{bot.promise}</p><p className={styles.desc}>{bot.summary}</p><Link className={styles.btn} href={"/bots/"+bot.id}>OPEN PRODUCT PAGE</Link></article>)}</section>
 </div></main>
}