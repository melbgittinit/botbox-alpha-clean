import Link from "next/link";
import styles from "../../bot-factory.module.css";

const steps=[
 {n:"01",title:"Detect the storm signal",copy:"Monitor approved weather intelligence to identify areas where wind, hail or falling debris may have created roof risk. A signal is not a confirmed damage claim."},
 {n:"02",title:"Prioritize the neighborhood",copy:"Rank likely impact areas and create a focused review queue so the sales team knows where attention may be warranted first."},
 {n:"03",title:"Prepare approved outreach",copy:"Create timely homeowner messaging only through permitted, compliant channels and approved contact lists. Human review remains in the loop."},
 {n:"04",title:"Put a real rep at the door",copy:"Route the opportunity to a salesperson for inspection, explanation, estimate and agreement. The bot supports the rep—it does not replace the human relationship."}
];

export default async function RoofWeatherRadarDoorKnocker({searchParams}:{searchParams:Promise<{submitted?:string;error?:string}>}){ const q=await searchParams;
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

     <section className={styles.radarMedia}>
       <div className={styles.radarMediaMain}>
         <img src="https://cdn.shopify.com/s/files/1/1982/3607/files/roof-weather-radar-dispenser.png?v=1791944115" alt="Roof Weather Radar Door Knocker inside The Bot Factory dispenser" />
         <div className={styles.radarMediaCaption}><span>01</span><b>DISPENSER READY</b><small>Deploy the specialist when the storm signal matters.</small></div>
       </div>
       <div className={styles.radarMediaSide}>
         <img src="https://cdn.shopify.com/s/files/1/1982/3607/files/roof-weather-radar-neighborhood-alerts.png?v=1791944099" alt="Roof Weather Radar Door Knocker scanning a storm-affected neighborhood" />
         <div className={styles.radarMediaCaption}><span>02</span><b>NEIGHBORHOOD RADAR</b><small>Prioritize likely impact areas before the field team moves.</small></div>
       </div>
     </section>

     <section className={styles.proofStrip}>
       <div><b>SCAN</b><span>Storm signals</span></div>
       <div><b>PRIORITIZE</b><span>Likely impact areas</span></div>
       <div><b>CONNECT</b><span>Approved outreach</span></div>
       <div><b>HUMAN CLOSE</b><span>Real rep • real homeowner</span></div>
     </section>

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

     <section className={styles.radarAgreement}>
       <img src="https://cdn.shopify.com/s/files/1/1982/3607/files/roof-weather-radar-homeowner-agreement.png?v=1791944108" alt="Roof Weather Radar Door Knocker supporting a salesperson and satisfied homeowners" />
       <div>
         <span className={styles.eyebrow}>THE HUMAN HANDOFF</span>
         <h2>The bot finds the moment. A real person earns the customer.</h2>
         <p className={styles.muted}>The customer-facing finish is intentionally human. The salesperson inspects, explains, answers questions, presents the estimate and earns the agreement. The bot stays in a support role.</p>
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


     <section id="pilot" className={styles.pilotSection}>
       <div className={styles.pilotIntro}>
         <span className={styles.eyebrow}>ROOFING COMPANY PILOT</span>
         <h2>Start with one market. Prove the workflow.</h2>
         <p className={styles.muted}>We are looking for roofing and storm-response teams willing to test the storm-to-door workflow with human review at every consequential step.</p>
         <div className={styles.pilotGets}>
           <div><b>STORM WATCHLIST</b><span>Prioritized likely-impact areas</span></div>
           <div><b>NEIGHBORHOOD MAP</b><span>Focused territory review</span></div>
           <div><b>REP HANDOFF</b><span>Context for real salespeople</span></div>
           <div><b>TRUST CONTROLS</b><span>Approval and claim boundaries</span></div>
           <div><b>PILOT REPORT</b><span>What worked, what converted, what needs tuning</span></div>
         </div>
       </div>
       <div className={styles.pilotFormWrap}>
         {q.submitted==="1" ? <div className={styles.pilotSuccess}><b>PILOT REQUEST RECEIVED ✓</b><p>Thank you. Your company information has been recorded for review.</p></div> : null}
         {q.error ? <div className={styles.pilotError}><b>WE COULDN'T COMPLETE THAT REQUEST.</b><p>{q.error==="required" ? "Please complete the required company, contact, email and territory fields." : "The pilot request service is temporarily unavailable. Please try again shortly."}</p></div> : null}
         <form className={styles.pilotForm} action="/api/roof-radar/pilot" method="post">
           <label>Roofing company *<input name="company" required /></label>
           <label>Contact person *<input name="contact" required /></label>
           <div className={styles.pilotTwo}><label>Work email *<input name="email" type="email" required /></label><label>Phone<input name="phone" type="tel" /></label></div>
           <label>Service territory / ZIP codes *<textarea name="territory" rows={2} required placeholder="Example: South Atlanta, 30213, 30291, 30349" /></label>
           <div className={styles.pilotTwo}><label>Number of sales reps<input name="reps" inputMode="numeric" /></label><label>CRM used<input name="crm" placeholder="JobNimbus, AccuLynx, HubSpot, other" /></label></div>
           <label>Preferred homeowner outreach channels<select name="outreach" defaultValue=""><option value="">Choose one</option><option>Phone / text</option><option>Email</option><option>Door-to-door only</option><option>Mixed channels</option><option>Not sure yet</option></select></label>
           <label>Do you already use weather / storm intelligence?<select name="weather" defaultValue=""><option value="">Choose one</option><option>Yes — actively</option><option>Sometimes</option><option>No</option><option>Evaluating tools now</option></select></label>
           <label>What would make this pilot valuable?<textarea name="notes" rows={3} /></label>
           <input className={styles.honeypot} name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
           <button className={styles.btn+" "+styles.primary} type="submit">REQUEST PILOT ACCESS</button>
           <p className={styles.formFine}>Submitting this form requests a pilot conversation; it does not authorize homeowner outreach or autonomous action.</p>
         </form>
       </div>
     </section>

     <section className={styles.work} style={{marginTop:40}}>
       <div className={styles.note}><b>POSITIONING:</b> Storms create needs. The bot helps organize where a roofing team may be able to help—without confusing a weather signal with a verified damage claim.</div>
       <div className={styles.actions}>
         <a className={styles.btn+" "+styles.primary} href="#pilot">START A PILOT</a>
         <Link className={styles.btn} href="/press/interview?topic=Roof%20Weather%20Radar%20Door%20Knocker">MEDIA STATEMENT</Link>
       </div>
     </section>
   </div>
 </main>;
}
