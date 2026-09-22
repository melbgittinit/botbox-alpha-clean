import Link from "next/link";
import styles from "../../press.module.css";
import { mediaState } from "../../store";

export default async function Verify({params}:{params:Promise<{receipt:string}>}){
 const {receipt}=await params;
 const item=mediaState.receipts.find(x=>x.id===receipt);
 return <main className={styles.press}><div className={styles.wrap}><nav className={styles.nav}><Link className={styles.brand} href="/press">THE BOT STORES • MEDIA FLOOR</Link></nav>
 <section className={styles.hero}><div className={styles.eyebrow}>MEDIA USE RECEIPT™</div><h1>{item?"VERIFIED ALPHA RECEIPT":"RECEIPT NOT FOUND"}</h1><p>{item?"Issued by The Bot Stores Official Information Director™.":"This alpha uses process-memory storage, so receipts reset when the preview service restarts or redeploys."}</p></section>
 {item&&<section className={styles.panel}><span className={styles.status}>EDITORIAL USE</span><h2>{item.topic}</h2><p>{item.transcript}</p><p><b>Duration target:</b> {item.duration} sec</p><p><b>Allowed edits:</b> {item.allowedEdits}</p><p><b>Paid advertising:</b> Not authorized</p><p><b>Voice cloning:</b> Not authorized</p><p><b>Synthetic alteration:</b> Not authorized</p><p className={styles.small}>Receipt {item.id} • {item.createdAt}</p></section>}
 </div></main>
}