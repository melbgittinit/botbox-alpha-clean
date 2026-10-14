import Link from "next/link";
import styles from "../../bot-factory.module.css";

const steps=[
 {n:"01",title:"Detect the storm signal",copy:"Monitor approved weather intelligence to identify areas where wind, hail or falling debris may have created roof risk. A signal is not a confirmed damage claim."},
 {n:"02",title:"Prioritize the neighborhood",copy:"Rank likely impact areas and create a focused review queue so the sales team knows where attention may be warranted first."},
 {n:"03",title:"Prepare approved outreach",copy:"Create timely homeowner messaging only through permitted, compliant channels and approved contact lists. Human review remains in the loop."},
 {n:"04",title:"Put a real rep at the door",copy:"Route the opportunity to a salesperson for inspection, explanation, estimate and agreement. The bot supports the rep—it does not replace the human relationship."}
];

export default function RoofWeatherRadarDoorKnocker(){
 return <main className={styles.page}>
   <div className={styles.stage}>ALPHA PRODUCT EXPERIENCE — LIVE WEATHER FEEDS, PROPERTY DATA, CRM, OUTREACH AND CHECKOUT ARE NOT CONNECTED YET.</div>
   <div className={styles.wrap}>
     <header className={styles.radarHero}>
       <div>
         <div className={styles.eyebrow}>THE BOT STORES • STORM-TO-DOOR OPPORTUNITY BOT</div>
         <h1>Roof Weather <span>Radar</span><br/>Door Knocker™</h1>
         <p className={styles.radarLead}>When weather hits, <b>opportunity knocks.</b></p>
         <p className={styles.muted}>Storm intelligence → neighborhood prioritization → approved outreach → real salesperson → real homeowner conversation.</p>
         <div className={styles.actions}>
           <a className={styles.btn+" "+styles.primary} href="#workflow">SEE HOW IT WORKS</a>
           <Link className={styles.btn+" "+styles.light} href="/">RETURN TO BOT FACTORY</Link>
         </div>
         <div className={styles.trustPromise}><b>HUMAN-CONTROLLED</b><span>Remote storm signals indicate likely impact. They do not confirm roof damage.</span></div>
       </div>
       <div className={styles.radarMark}>
         <div className={styles.radarRing}><span>RADAR</span><b>DOOR<br/>KNOCKER</b><small>SCAN • PRIORITIZE • CONNECT</small></div>
       </div>
     </header>

     <section id="workflow" className={styles.work}>
       <div className={styles.heading}><div><span className={styles.eyebrow}>STORM-TO-DOOR WORKFLOW</span><h2>One clear job from signal to salesperson.</h2></div></div>
       <div className={styles.grid}>{steps.map(s=><article className={styles.card} key={s.n}>
         <div className={styles.mark}>{s.n}</div><h3>{s.title}</h3><p className={styles.desc}>{s.copy}</p>
       </article>)}</div>
     </section>

     <section className={styles.work} style={{marginTop:40}}>
       <div className={styles.heading}><div><span className={styles.eyebrow}>WHAT THE REP GETS</span><h2>Prioritized opportunity—not another dashboard.</h2></div></div>
       <div className={styles.grid}>
         {[
           ["Storm-impact watchlist","Areas worth reviewing based on approved weather intelligence."],
           ["Neighborhood priority map","A simple way to see where the strongest likely impact signals cluster."],
           ["Property review queue","Homes to investigate—not homes falsely labeled as damaged."],
           ["Approved outreach queue","Contacts and channels cleared for use under the business's compliance rules."],
           ["Rep-ready handoff","Context a salesperson can use when a real human conversation begins."],
           ["Mission status","What was scanned, reviewed, contacted and handed to a rep."]
         ].map(([t,c])=><article className={styles.card} key={t}><h3>{t}</h3><p className={styles.desc}>{c}</p></article>)}
       </div>
     </section>

     <section className={styles.work} style={{marginTop:40}}>
       <div className={styles.heading}><div><span className={styles.eyebrow}>BOT TRUST CARD™</span><h2>Know exactly where the bot stops.</h2></div></div>
       <div className={styles.trustCard}>
         <div className={styles.trustGrid}>
           <div><span>IDENTITY</span><p>Roof Weather Radar Door Knocker™ — identity status: DECLARED.</p></div>
           <div><span>WORKS FOR</span><p>The roofing/home-service business operating the bot, under its customer-contact and compliance rules.</p></div>
           <div><span>ACCESS</span><p>Approved weather feeds, permitted property information, company CRM data and approved contact channels when production integrations are connected.</p></div>
           <div><span>CAN ACT ALONE?</span><p>It may rank signals and prepare queues. It does not independently claim damage, promise repairs, issue estimates, sign contracts or close a sale.</p></div>
           <div><span>HUMAN APPROVAL</span><p>Required before property-specific claims, outbound contact, appointments, estimates, contracts and other consequential actions.</p></div>
           <div><span>SPENDING</span><p>No spending authority by default.</p></div>
         </div>
         <div className={styles.trustLimits}><span>LIMITS</span>
           <p>• Storm and radar signals indicate likely impact, not confirmed roof damage.</p>
           <p>• A qualified inspection or other reliable verification is required before representing that damage exists.</p>
           <p>• Outreach must follow applicable consent, telemarketing, privacy and do-not-contact rules.</p>
           <p>• No guaranteed leads, appointments, sales, insurance outcomes or repair needs.</p>
         </div>
       </div>
     </section>

     <section className={styles.work} style={{marginTop:40}}>
       <div className={styles.heading}><div><span className={styles.eyebrow}>PRODUCT STATUS</span><h2>Premium demo now. Production connections next.</h2></div></div>
       <div className={styles.blueprint}>
         <article><h2>Demo-ready</h2><p className={styles.muted}>Brand identity, bot character, storm-to-door workflow, neighborhood-radar concept, homeowner scene, dispenser story and short hero video package.</p></article>
         <aside><span className={styles.badge}>NOT YET CONNECTED</span><h2>Production integrations</h2><p className={styles.muted}>Live weather feed, property intelligence, CRM, consent/compliance rules, outbound messaging, scheduling, contractor account setup and payment/entitlement.</p></aside>
       </div>
     </section>

     <section className={styles.work} style={{marginTop:40}}>
       <div className={styles.note}><b>POSITIONING:</b> Storms create needs. The bot helps organize where a roofing team may be able to help—without confusing a weather signal with a verified damage claim.</div>
       <div className={styles.actions}>
         <span className={styles.btn+" "+styles.primary}>PILOT ACCESS — COMING NEXT</span>
         <Link className={styles.btn} href="/press/interview?topic=Roof%20Weather%20Radar%20Door%20Knocker">MEDIA STATEMENT</Link>
       </div>
     </section>
   </div>
 </main>;
}
