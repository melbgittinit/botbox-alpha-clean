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

function renderJob(job){
  $("#smart-drop").innerHTML=job.recommendation.items.slice(0,3).map((item,i)=>
    `<article class="card ${i===0?"active":""}"><div class="rank">${esc(item.status)}</div><h3>${esc(item.product)}</h3><div class="score">${item.score}</div><span class="badge">MB FIT</span><p>${esc(item.reason)}</p></article>`
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
  $("#preview-img").src=`/api/jobs/${currentJob.id}/preview.svg?t=${Date.now()}`;
  $("#preview").classList.remove("hidden");
  $("#money").classList.remove("hidden");
  calculateMoney();
  $("#preview").scrollIntoView({behavior:"smooth"});
  await loadMyMerch();
}

$("#new-job").addEventListener("click",()=>{
  $("#merch-form").reset();
  $("#results").classList.add("hidden");
  $("#preview").classList.add("hidden");
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

$("#printer-pack").addEventListener("click",()=>{\n  track("PRINTER_BRIEF_DOWNLOADED",{job_id:currentJob?.id||null});
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

$("#finish-design").addEventListener("click",async()=>{
  if(!currentJob||!currentJob.selectedConcept)return;
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
      location.href=data.checkout_url;
      return;
    }
    if(data.error==="checkout_temporarily_unavailable"){
      note.textContent="Payment activation is in final verification. Your selected direction is saved; no charge was attempted.";\n      track("CHECKOUT_BLOCKED",{reason:"global_checkout_gate",job_id:currentJob.id});
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
  try{
    const res=await fetch(`/api/jobs?clientId=${encodeURIComponent(clientId)}`);
    if(res.ok){const data=await res.json();remote=data.jobs||[]}
  }catch{}
  const merged=[...remote,...readLocalJobs()].filter((j,i,a)=>a.findIndex(x=>x.id===j.id)===i);
  localStorage.setItem(localJobsKey,JSON.stringify(merged.slice(0,30)));
  $("#my-merch").innerHTML=merged.length?merged.map(job=>{
    const selected=job.concepts?.find(c=>c.id===job.selectedConcept);
    return `<article class="card"><div class="rank">${esc(job.status)}</div><h3>${esc(job.brandName)}</h3><p>${esc(selected?.name||"Direction not selected yet")}</p><p><strong>MB pick:</strong> ${esc(job.recommendation?.top||"")}</p>${job.selectedConcept?`<a class="link" href="/api/jobs/${job.id}/preview.svg" target="_blank">View preview</a>`:""}</article>`;
  }).join(""):`<article class="card"><p>Your saved MB jobs will appear here.</p></article>`;
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
