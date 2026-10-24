const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

const clientId=(()=>{
  let id=localStorage.getItem("mb_client_id");
  if(!id){id="client_"+crypto.randomUUID();localStorage.setItem("mb_client_id",id)}
  return id;
})();

const visitorToken=(()=>{
  let v=localStorage.getItem("mb_tbs_visitor");
  if(!v){v="mbv_"+crypto.randomUUID();localStorage.setItem("mb_tbs_visitor",v)}
  return v;
})();

const localJobsKey="mb_local_jobs_"+clientId;
let currentJob=null;

async function track(eventName, metadata={}){
  try{
    await fetch("https://lcuvhizjhccvzprpuoij.supabase.co/functions/v1/mb-usage",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({visitor_token:visitorToken,event_name:eventName,metadata})
    });
  }catch{}
}

function esc(v=""){
  return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));
}
function readLocalJobs(){
  try{return JSON.parse(localStorage.getItem(localJobsKey)||"[]")}catch{return[]}
}
function saveLocalJob(job){
  const jobs=readLocalJobs().filter(j=>j.id!==job.id);
  jobs.unshift(job);
  localStorage.setItem(localJobsKey,JSON.stringify(jobs.slice(0,30)));
  saveVaultJob(job);
}

async function vaultRequest(action,payload={}){
  try{
    const res=await fetch("https://lcuvhizjhccvzprpuoij.supabase.co/functions/v1/mb-job-vault",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action,visitor_token:visitorToken,...payload})
    });
    if(!res.ok)return null;
    return await res.json();
  }catch{return null}
}

async function saveVaultJob(job){
  await vaultRequest("save",{job});
}

$$("[data-mode]").forEach(btn=>btn.addEventListener("click",()=>{
  $("#mode").value=btn.dataset.mode;
  $("#intake").scrollIntoView({behavior:"smooth"});
}));

$("#merch-form").addEventListener("submit",async e=>{
  e.preventDefault();
  const button=e.submitter;
  button.disabled=true;
  button.textContent="MB IS THINKING…";
  try{
    const data=Object.fromEntries(new FormData(e.currentTarget).entries());
    data.clientId=clientId;
    const res=await fetch("/api/jobs",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
    if(!res.ok)throw new Error();
    currentJob=await res.json();
    saveLocalJob(currentJob);
    renderJob(currentJob);
    await loadMyMerch();
    $("#results").classList.remove("hidden");
    $("#results").scrollIntoView({behavior:"smooth"});
  }catch{
    alert("MB could not start this job yet. Please try again.");
  }finally{
    button.disabled=false;
    button.textContent="MERCH ME — V1 PREVIEW";
  }
});

function previewSvgData(job){
  const c=job.concepts?.find(x=>x.id===job.selectedConcept);
  const safe=v=>String(v||"").replace(/[<>&"]/g,"").slice(0,42);
  const brand=safe(job.brandName||"YOUR BRAND");
  const phrase=safe(job.textRequest||"DESIGNED WITH MB");
  const product=safe(c?.product||job.recommendation?.top||"Merch");
  const direction=safe(c?.name||"MB DESIGN");
  const svg=[
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900">',
    '<defs><linearGradient id="g"><stop stop-color="#9d7429"/><stop offset=".5" stop-color="#f0cf71"/><stop offset="1" stop-color="#9d7429"/></linearGradient></defs>',
    '<rect width="1200" height="900" fill="#0b0b0d"/>',
    '<text x="70" y="100" font-family="Arial" font-size="72" font-weight="700" fill="url(#g)">MB</text>',
    '<text x="70" y="145" font-family="Arial" font-size="28" fill="#f4f1e9">MERCH BOT — DESIGN PREVIEW</text>',
    '<rect x="330" y="205" width="540" height="510" rx="50" fill="#17171b" stroke="#d3aa45" stroke-width="3"/>',
    '<path d="M390 300 L475 250 L525 300 L675 300 L725 250 L810 300 L770 390 L725 365 L725 650 L475 650 L475 365 L430 390 Z" fill="#0f0f12" stroke="#eee8da" stroke-width="6"/>',
    '<text x="600" y="450" text-anchor="middle" font-family="Arial" font-size="44" font-weight="700" fill="#e5c05f">'+brand+'</text>',
    '<text x="600" y="505" text-anchor="middle" font-family="Arial" font-size="25" fill="#f4f1e9">'+phrase+'</text>',
    '<text x="600" y="600" text-anchor="middle" font-family="Arial" font-size="20" font-weight="700" fill="#c99e3e">'+direction+'</text>',
    '<text x="70" y="790" font-family="Arial" font-size="30" font-weight="700" fill="#f4f1e9">'+product+'</text>',
    '<text x="70" y="832" font-family="Arial" font-size="20" fill="#a8a8ad">Concept visualization only — final production art comes after rendering + preflight.</text>',
    '</svg>'
  ].join("");
  return "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);
}

function renderJob(job){
  $("#smart-drop").innerHTML=job.recommendation.items.slice(0,5).map((item,i)=>
    `<article class="card ${i===0?"active":""}">
      <div class="rank">${esc(item.status)}</div>
      <h3>${esc(item.product)}</h3>
      <span class="badge">${esc(item.fitLabel||"MB FIT")}</span>
      <p>${esc(item.reason)}</p>
      ${i===0?'<p><strong>If we only make one thing today, I’d start here.</strong></p>':""}
    </article>`
  ).join("");
  $("#concepts").innerHTML=job.concepts.map(c=>
    `<article class="card"><div class="rank">DIRECTION ${c.id}</div><h3>${esc(c.name)}</h3><p>${esc(c.description)}</p><p><strong>Best for:</strong> ${esc(c.bestFor)}</p><button class="primary choose" data-id="${c.id}">CHOOSE THIS</button></article>`
  ).join("");
  $$(".choose").forEach(btn=>btn.addEventListener("click",()=>selectConcept(Number(btn.dataset.id))));
}

async function selectConcept(id){
  const res=await fetch(`/api/jobs/${currentJob.id}/select`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({conceptId:id})});
  if(!res.ok)return alert("Could not save that direction.");
  currentJob=await res.json();
  saveLocalJob(currentJob);
  const c=currentJob.concepts.find(x=>x.id===id);
  $("#preview-title").textContent=currentJob.brandName+" — "+c.name;
  const exactText=currentJob.textRequest||currentJob.brandName;
  $("#text-confirm-copy").textContent='I confirm MB should use exactly: "'+exactText+'"';
  $("#text-confirm").checked=false;
  $("#finish-design").disabled=true;
  $("#checkout-note").textContent="Confirm the exact wording above before any paid finish action.";
  $("#preview-img").src=previewSvgData(currentJob);
  $("#preview").classList.remove("hidden");
  $("#next-offers").classList.remove("hidden");
  $("#money").classList.remove("hidden");
  calculateMoney();
  $("#preview").scrollIntoView({behavior:"smooth"});
  await loadMyMerch();
}

$("#new-job").addEventListener("click",()=>{
  $("#merch-form").reset();
  $("#results").classList.add("hidden");
  $("#preview").classList.add("hidden");
  $("#next-offers").classList.add("hidden");
  $("#money").classList.add("hidden");
  $("#intake").scrollIntoView({behavior:"smooth"});
});

function calculateMoney(){
  const cost=Number($("#calc-cost").value)||0;
  const price=Number($("#calc-price").value)||0;
  const qty=Math.max(0,Number($("#calc-qty").value)||0);
  const other=Number($("#calc-other").value)||0;
  const revenue=price*qty;
  const total=(cost+other)*qty;
  const spread=revenue-total;
  $("#calc-revenue").textContent="$"+revenue.toFixed(2);
  $("#calc-total").textContent="$"+total.toFixed(2);
  $("#calc-spread").textContent="$"+spread.toFixed(2);
  $("#calc-per-item").textContent="$"+(qty?spread/qty:0).toFixed(2);
}
["calc-cost","calc-price","calc-qty","calc-other"].forEach(id=>$("#"+id).addEventListener("input",calculateMoney));

$("#printer-pack").addEventListener("click",()=>{
  track("PRINTER_BRIEF_DOWNLOADED",{job_id:currentJob?.id||null});
  if(!currentJob||!currentJob.selectedConcept)return;
  const c=currentJob.concepts.find(x=>x.id===currentJob.selectedConcept);
  const lines=[
    "MB — MERCH BOT™ PRINTER BRIEF",
    "",
    "Brand: "+currentJob.brandName,
    "Business / project: "+(currentJob.businessType||""),
    "Audience: "+(currentJob.audience||""),
    "Use: "+(currentJob.useCase||""),
    "Product: "+(c?.product||currentJob.recommendation?.top||""),
    "Direction: "+(c?.name||""),
    "Requested wording: "+(currentJob.textRequest||"(none)"),
    "Brand handling: "+(currentJob.brandLock||"elevate"),
    "Commercial rights confirmed: "+(currentJob.rightsConfirmed?"Yes":"No"),
    "",
    "STATUS: DESIGN DIRECTION APPROVED — FINAL VENDOR TEMPLATE REQUIRED",
    "",
    "Printer: Please confirm the final blank/SKU, exact print area, production method, color handling, file format, resolution, bleed/safe-zone requirements, and any specialty preparation before manufacturing.",
    "",
    "This preview packet is a production brief, not final print-ready art."
  ];
  const blob=new Blob([lines.join("\n")],{type:"text/plain"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download=(currentJob.brandName||"merch").replace(/[^a-z0-9]+/gi,"-").toLowerCase()+"-mb-printer-brief.txt";
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),500);
});

$("#text-confirm").addEventListener("change",()=>{
  const ready=$("#text-confirm").checked;
  $("#finish-design").disabled=!ready;
  $("#checkout-note").textContent=ready
    ?"Wording confirmed. Paid finishing remains gated until fulfillment verification is complete."
    :"Confirm the exact wording above before any paid finish action.";
});

$("#finish-design").addEventListener("click",async()=>{
  if(!currentJob||!currentJob.selectedConcept||!$("#text-confirm").checked)return;
  const btn=$("#finish-design");
  const note=$("#checkout-note");
  btn.disabled=true;
  btn.textContent="PREPARING CHECKOUT…";
  note.textContent="";
  try{
    const res=await fetch("/api/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      visitorToken,
      jobId:currentJob.id,
      conceptId:currentJob.selectedConcept
    })});
    const data=await res.json().catch(()=>({}));
    if(res.ok&&data.checkout_url){
      localStorage.setItem("mb_checkout_context",JSON.stringify({
        token:data.context_token,jobId:currentJob.id,conceptId:currentJob.selectedConcept
      }));
      const purchaseWindow=window.open(data.checkout_url,"_blank","noopener");
      $("#check-purchase").classList.remove("hidden");
      note.textContent=purchaseWindow
        ?"Shopify checkout opened in a new tab. After payment, come back here and tap Check My Purchase."
        :"Your checkout is ready. Open it, complete payment, then tap Check My Purchase.";
      track("CHECKOUT_OPENED",{job_id:currentJob.id,concept_id:currentJob.selectedConcept});
      return;
    }
    if(data.error==="checkout_temporarily_unavailable"){
      note.textContent="Payment activation is in final verification. Your selected direction is saved; no charge was attempted.";
      track("CHECKOUT_BLOCKED",{reason:"global_checkout_gate",job_id:currentJob.id});
    }else{
      note.textContent="Checkout is not available yet. Your selected direction is saved.";
    }
  }catch{
    note.textContent="Checkout connection is temporarily unavailable. Your selected direction is saved.";
  }finally{
    btn.disabled=false;
    btn.textContent="FINISH THIS DESIGN — $1.99";
  }
});

async function loadMyMerch(){
  let remote=[];
  const vault=await vaultRequest("list");
  if(vault?.jobs?.length) remote.push(...vault.jobs);
  try{
    const res=await fetch(`/api/jobs?clientId=${encodeURIComponent(clientId)}`);
    if(res.ok){const data=await res.json();remote=data.jobs||[]}
  }catch{}
  const merged=[...remote,...readLocalJobs()].filter((j,i,a)=>a.findIndex(x=>x.id===j.id)===i);
  localStorage.setItem(localJobsKey,JSON.stringify(merged.slice(0,30)));
  $("#my-merch").innerHTML=merged.length?merged.map(job=>{
    const selected=job.concepts?.find(c=>c.id===job.selectedConcept);
    return `<article class="card">
      <div class="rank">${esc(job.status)}</div>
      <h3>${esc(job.brandName)}</h3>
      <p>${esc(selected?.name||"Direction not selected yet")}</p>
      <p><strong>MB pick:</strong> ${esc(job.recommendation?.top||"")}</p>
      <div class="action-stack">
        <button class="secondary reopen-job" data-job-id="${esc(job.id)}">REOPEN</button>
        ${job.selectedConcept?`<a class="link" href="/api/jobs/${job.id}/preview.svg" target="_blank">View preview</a>`:""}
      </div>
    </article>`;
  }).join(""):`<article class="card"><p>Your saved MB jobs will appear here.</p></article>`;

  document.querySelectorAll(".reopen-job").forEach(btn=>btn.addEventListener("click",()=>{
    const job=merged.find(x=>x.id===btn.dataset.jobId);
    if(!job)return;
    currentJob=job;
    renderJob(job);
    $("#results").classList.remove("hidden");
    if(job.selectedConcept){
      const c=job.concepts.find(x=>x.id===job.selectedConcept);
      $("#preview-title").textContent=job.brandName+" — "+(c?.name||"Selected Direction");
      $("#preview-img").src=previewSvgData(job);
      const exactText=job.textRequest||job.brandName;
      $("#text-confirm-copy").textContent='I confirm MB should use exactly: "'+exactText+'"';
      $("#text-confirm").checked=false;
      $("#finish-design").disabled=true;
      $("#preview").classList.remove("hidden");
      $("#money").classList.remove("hidden");
      calculateMoney();
      $("#preview").scrollIntoView({behavior:"smooth"});
    }else{
      $("#results").scrollIntoView({behavior:"smooth"});
    }
  }));
}

loadMyMerch();

$("#share-brief").addEventListener("click",async()=>{
  if(!currentJob||!currentJob.selectedConcept)return;
  const c=currentJob.concepts.find(x=>x.id===currentJob.selectedConcept);
  const text=[
    "MB — MERCH BOT™",
    currentJob.brandName+" — "+(c?.name||"Selected Direction"),
    "Product: "+(c?.product||currentJob.recommendation?.top||""),
    currentJob.textRequest?"Wording: "+currentJob.textRequest:"",
    "MB Pick: "+(currentJob.recommendation?.top||""),
    "",
    "Design direction approved. Final production art requires vendor/template preflight."
  ].filter(Boolean).join("\n");
  try{
    if(navigator.share){
      await navigator.share({title:"MB Merch Brief — "+currentJob.brandName,text});
    }else{
      await navigator.clipboard.writeText(text);
      alert("Merch brief copied.");
    }
    track("MERCH_BRIEF_SHARED",{job_id:currentJob.id,product:c?.product||null});
  }catch{}
});

let calcTracked=false;
["calc-cost","calc-price","calc-qty","calc-other"].forEach(id=>{
  $("#"+id).addEventListener("change",()=>{
    if(!calcTracked){
      calcTracked=true;
      track("PROFIT_CALCULATOR_USED",{job_id:currentJob?.id||null});
    }
  });
});

const examples={
  bakery:{brandName:"Midnight Bakery",businessType:"upscale neighborhood bakery",audience:"Customers",useCase:"Retail / sell it",style:"Elegant",productChoice:"MB Choose",textRequest:"Baked After Dark"},
  salon:{brandName:"Glow House Beauty",businessType:"beauty salon",audience:"Customers",useCase:"Retail / sell it",style:"Luxury",productChoice:"MB Choose",textRequest:"Glow Is The Standard"},
  church:{brandName:"New Hope Community Church",businessType:"church ministry",audience:"Members",useCase:"Event",style:"Bold",productChoice:"MB Choose",textRequest:"Faith In Motion"},
  music:{brandName:"After Midnight",businessType:"music artist",audience:"Fans",useCase:"Launch / drop",style:"Street",productChoice:"MB Choose",textRequest:"After Midnight"}
};
document.querySelectorAll(".example-chip").forEach(btn=>btn.addEventListener("click",()=>{
  const ex=examples[btn.dataset.example];
  if(!ex)return;
  const form=$("#merch-form");
  Object.entries(ex).forEach(([k,v])=>{
    const el=form.elements.namedItem(k);
    if(el)el.value=v;
  });
  $("#mode").value="BEST_SELLER";
  form.scrollIntoView({behavior:"smooth",block:"center"});
}));


const mbSections=[
  {id:"how-it-works",label:"How MB Works"},
  {id:"intake",label:"Make Something"},
  {id:"results",label:"Smart Drop"},
  {id:"preview",label:"Your Merch"},
  {id:"next-offers",label:"What Could This Become?"},
  {id:"money",label:"If I Sell This"},
  {id:"my-merch-section",label:"My Merch"},
  {id:"mb-footer",label:"Finish"}
];

function visibleMbSections(){
  return mbSections.filter(s=>{
    const el=document.getElementById(s.id);
    return el && !el.classList.contains("hidden");
  });
}

function currentSectionIndex(){
  const sections=visibleMbSections();
  let best=0;
  let bestDist=Infinity;
  sections.forEach((s,i)=>{
    const el=document.getElementById(s.id);
    const r=el.getBoundingClientRect();
    const dist=Math.abs(r.top-110);
    if(dist<bestDist){bestDist=dist;best=i}
  });
  return {sections,index:best};
}

function goSection(delta){
  const {sections,index}=currentSectionIndex();
  const target=Math.max(0,Math.min(sections.length-1,index+delta));
  document.getElementById(sections[target].id)?.scrollIntoView({behavior:"smooth",block:"start"});
}

function updateScrollUi(){
  const max=document.documentElement.scrollHeight-window.innerHeight;
  const pct=max>0?(window.scrollY/max)*100:0;
  const bar=document.getElementById("scroll-progress-bar");
  if(bar)bar.style.width=Math.max(0,Math.min(100,pct))+"%";

  const {sections,index}=currentSectionIndex();
  const label=document.getElementById("mb-section-label");
  if(label && sections[index]) label.textContent=sections[index].label;
}
window.addEventListener("scroll",updateScrollUi,{passive:true});
window.addEventListener("resize",updateScrollUi);
updateScrollUi();

document.getElementById("mb-next")?.addEventListener("click",()=>goSection(1));
document.getElementById("mb-back")?.addEventListener("click",()=>goSection(-1));
document.getElementById("mb-top")?.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));

function currentSectionText(){
  const {sections,index}=currentSectionIndex();
  const el=sections[index]?document.getElementById(sections[index].id):null;
  if(!el)return "Merch Bot is ready.";
  const raw=el.innerText||"";
  return raw.replace(/\s+/g," ").trim().slice(0,1200);
}

function speak(text){
  if(!("speechSynthesis" in window))return false;
  window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.rate=.98;
  u.pitch=1;
  u.onstart=()=>document.getElementById("mb-voice-dot")?.classList.add("speaking");
  u.onend=()=>document.getElementById("mb-voice-dot")?.classList.remove("speaking");
  window.speechSynthesis.speak(u);
  return true;
}
document.getElementById("mb-read")?.addEventListener("click",()=>{
  const ok=speak(currentSectionText());
  const status=document.getElementById("mb-voice-status");
  if(status)status.textContent=ok?"Reading this section aloud.":"Voice playback is not available in this browser.";
});

const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
let recognition=null;
if(SpeechRecognition){
  recognition=new SpeechRecognition();
  recognition.continuous=false;
  recognition.interimResults=false;
  recognition.lang="en-US";

  recognition.onstart=()=>{
    document.getElementById("mb-voice-dot")?.classList.add("listening");
    const s=document.getElementById("mb-voice-status");
    if(s)s.textContent="Listening…";
  };
  recognition.onend=()=>{
    document.getElementById("mb-voice-dot")?.classList.remove("listening");
  };
  recognition.onerror=()=>{
    const s=document.getElementById("mb-voice-status");
    if(s)s.textContent="I didn’t catch that. You can use the buttons anytime.";
  };
  recognition.onresult=e=>{
    const phrase=String(e.results?.[0]?.[0]?.transcript||"").toLowerCase().trim();
    handleVoiceCommand(phrase);
  };
}

function useExample(key){
  const ex=examples[key];
  if(!ex)return false;
  const form=document.getElementById("merch-form");
  Object.entries(ex).forEach(([k,v])=>{
    const el=form.elements.namedItem(k);
    if(el)el.value=v;
  });
  document.getElementById("mode").value="BEST_SELLER";
  form.scrollIntoView({behavior:"smooth",block:"center"});
  return true;
}

const entryParams=new URLSearchParams(location.search);
const entryExample=entryParams.get("example");
if(entryExample&&examples[entryExample]){
  useExample(entryExample);
  if(entryParams.get("autorun")!=="0"){
    setTimeout(()=>document.getElementById("merch-form")?.requestSubmit(),500);
  }
}

function handleVoiceCommand(phrase){
  const status=document.getElementById("mb-voice-status");
  let response="";
  if(/\b(next|forward|keep going)\b/.test(phrase)){
    goSection(1); response="Moving to the next section.";
  }else if(/\b(back|previous|go back)\b/.test(phrase)){
    goSection(-1); response="Going back one section.";
  }else if(/\b(top|home|start over)\b/.test(phrase)){
    window.scrollTo({top:0,behavior:"smooth"}); response="Going to the top.";
  }else if(/\b(read|read this|tell me about this)\b/.test(phrase)){
    speak(currentSectionText()); response="Reading this section.";
  }else if(/\b(start|try free|begin|make something)\b/.test(phrase)){
    document.getElementById("intake")?.scrollIntoView({behavior:"smooth",block:"start"}); response="Opening the free preview.";
  }else if(/\bbakery\b/.test(phrase)){
    useExample("bakery"); response="I loaded the bakery example.";
  }else if(/\b(salon|beauty)\b/.test(phrase)){
    useExample("salon"); response="I loaded the salon example.";
  }else if(/\b(church|ministry)\b/.test(phrase)){
    useExample("church"); response="I loaded the church example.";
  }else if(/\b(music|artist|singer)\b/.test(phrase)){
    useExample("music"); response="I loaded the music artist example.";
  }else{
    response='Try saying “start”, “bakery”, “salon”, “church”, “music artist”, “next”, “back”, “read this”, or “top”.';
  }
  if(status)status.textContent=response;
}

document.getElementById("mb-talk")?.addEventListener("click",()=>{
  const status=document.getElementById("mb-voice-status");
  if(!recognition){
    if(status)status.textContent="Voice commands are not supported in this browser. Use Next, Back, Read, or Top.";
    return;
  }
  try{recognition.start()}catch{}
});

async function verifySavedPurchase(){
  const saved=JSON.parse(localStorage.getItem("mb_checkout_context")||"null");
  const note=$("#checkout-note");
  const btn=$("#check-purchase");
  if(!saved?.token){
    note.textContent="No purchase is waiting to be checked.";
    return;
  }
  btn.disabled=true;
  btn.textContent="CHECKING…";
  note.textContent="Checking The Bot Stores for your paid order…";
  try{
    const verifyRes=await fetch("/api/verify-purchase",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({contextToken:saved.token})
    });
    const verify=await verifyRes.json().catch(()=>({}));
    if(!verifyRes.ok){
      note.textContent="Purchase verification is temporarily unavailable. Your selected direction is still saved.";
      return;
    }
    if(!verify.paid){
      note.textContent="No completed $1.99 order found yet. If you just paid, wait a moment and check again.";
      return;
    }
    const entRes=await fetch("/api/entitlement-status",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({visitorToken})
    });
    const ent=await entRes.json().catch(()=>({}));
    if(entRes.ok&&ent.make_one_available){
      note.textContent="Payment verified. Your Finish One credit is ready.";
      btn.classList.add("hidden");
      $("#finish-design").textContent="FINISH CREDIT READY";
      $("#finish-design").disabled=true;
      localStorage.setItem("mb_paid_finish_ready","1");
      track("PURCHASE_VERIFIED",{job_id:saved.jobId||null,order_id:verify.orderId||null});
    }else{
      note.textContent="Payment is verified. Your finish credit is being attached; check again shortly.";
    }
  }catch{
    note.textContent="Could not verify the purchase right now. Your selected direction remains saved.";
  }finally{
    btn.disabled=false;
    btn.textContent="CHECK MY PURCHASE";
  }
}

$("#check-purchase").addEventListener("click",verifySavedPurchase);

const savedCheckout=JSON.parse(localStorage.getItem("mb_checkout_context")||"null");
if(savedCheckout?.token && localStorage.getItem("mb_paid_finish_ready")!=="1"){
  $("#check-purchase")?.classList.remove("hidden");
}

function selectedProduct(){
  if(!currentJob?.selectedConcept)return currentJob?.recommendation?.top||"Merch";
  return currentJob.concepts.find(x=>x.id===currentJob.selectedConcept)?.product||currentJob.recommendation?.top||"Merch";
}

function matchPlan(product){
  const easy={
    "Tee":["Hoodie","Tote","Poster"],
    "Hoodie":["Tee","Tote","Crewneck"],
    "Crewneck":["Tee","Hoodie","Tote"],
    "Tote":["Tee","Poster","Mug"],
    "Mug":["Tumbler","Tote","Poster"],
    "Tumbler":["Mug","Tote","Poster"],
    "Hat":["Apron","Tote","Tee"],
    "Apron":["Tote","Tee","Mug"],
    "Pillow":["Poster","Tote","Mug"],
    "Poster":["Tee","Tote","Mug"]
  };
  const options=easy[product]||["Tee","Tumbler","Tote"];
  return options.map((p,i)=>({
    product:p,
    fit:i===0?"EASY MATCH":i===1?"GOOD MATCH":"RECOMPOSE",
    note:i===2?"Layout should be adapted rather than copied directly.":"The approved direction can transfer with light adaptation."
  }));
}

$("#preview-match")?.addEventListener("click",()=>{
  if(!currentJob)return;
  const product=selectedProduct();
  const rows=matchPlan(product);
  $("#match-preview").innerHTML=
    '<div class="offer-line"><strong>Starting from '+esc(product)+'</strong></div>'+
    rows.map(r=>'<div class="offer-line"><strong>'+esc(r.product)+' · '+esc(r.fit)+'</strong><br>'+esc(r.note)+'</div>').join("");
});

$("#preview-three")?.addEventListener("click",()=>{
  if(!currentJob)return;
  const items=(currentJob.recommendation?.items||[]).slice(0,3);
  $("#three-preview").innerHTML=items.map((x,i)=>
    '<div class="offer-line"><strong>'+(i+1)+'. '+esc(x.product)+'</strong><br>'+esc(x.fitLabel||x.status||"MB pick")+' · '+esc(x.reason||"")+'</div>'
  ).join("");
});

$("#preview-smallbiz")?.addEventListener("click",()=>{
  if(!currentJob)return;
  const items=(currentJob.recommendation?.items||[]);
  const fallback=["Tee","Tumbler","Tote","Hoodie","Poster"];
  const products=[...items.map(x=>x.product),...fallback].filter((v,i,a)=>a.indexOf(v)===i).slice(0,5);
  const roles=["HERO SELLER","EASY ADD-ON","BRAND BUILDER","HIGHER-TICKET","SPECIAL / DIFFERENT"];
  $("#smallbiz-preview").innerHTML=products.map((p,i)=>
    '<div class="offer-line"><strong>'+roles[i]+' · '+esc(p)+'</strong><br>'+(
      i===0?"Start here first.":
      i===1?"Easy second purchase or gift.":
      i===2?"Keeps the brand visible.":
      i===3?"Raises the potential order value.":
      "Gives the line one less-expected item."
    )+'</div>'
  ).join("");
});
