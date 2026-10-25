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
  const button=e.submitter||$("#merch-form button[type='submit']");
  const note=$("#form-note");
  if(button){button.disabled=true;button.textContent="MB IS THINKING…";}
  if(note)note.textContent="";
  try{
    const data=Object.fromEntries(new FormData(e.currentTarget).entries());
    data.clientId=clientId;
    const res=await fetch("/api/jobs",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
    if(!res.ok){
      const problem=await res.json().catch(()=>({}));
      const err=new Error(problem.error||"create_failed");
      err.code=problem.error||"create_failed";
      throw err;
    }
    currentJob=await res.json();
    saveLocalJob(currentJob);
    renderJob(currentJob);
    renderBusinessPlaybook(currentJob);
    renderMissionGuidance(currentJob);
    renderContextDesk(currentJob);
    updateStudioRail();
    await loadMyMerch();
    $("#results").classList.remove("hidden");
    $("#results").scrollIntoView({behavior:"smooth"});
  }catch(err){
    if(note){
      const messages={
        client_and_brand_required:"Please enter your brand or business name.",
        commercial_rights_confirmation_required:"Please confirm that you own or have commercial permission for anything you provide.",
        create_failed:"MB could not create the preview yet. Your form has not been charged or submitted for paid production."
      };
      note.textContent=messages[err?.code]||"MB could not start this preview yet. Please try again.";
    }
  }finally{
    if(button){button.disabled=false;button.textContent="MERCH ME — FREE PREVIEW";}
  }
});

function productShapeSvg(product){
  const common='fill="#101013" stroke="#eee8da" stroke-width="6"';
  switch(product){
    case "Hoodie":
      return '<path d="M470 315 Q600 205 730 315 L790 370 L748 430 L715 400 L715 665 L485 665 L485 400 L452 430 L410 370 Z" '+common+'/>'+
             '<path d="M520 315 Q600 235 680 315" fill="none" stroke="#d3aa45" stroke-width="6"/>'+
             '<path d="M535 545 Q600 585 665 545" fill="none" stroke="#55515b" stroke-width="4"/>';
    case "Crewneck":
      return '<path d="M430 315 L500 270 Q600 305 700 270 L770 315 L735 390 L700 370 L700 665 L500 665 L500 370 L465 390 Z" '+common+'/>'+
             '<path d="M555 290 Q600 335 645 290" fill="none" stroke="#d3aa45" stroke-width="5"/>';
    case "Tote":
      return '<rect x="435" y="335" width="330" height="330" rx="22" '+common+'/>'+
             '<path d="M505 350 Q505 250 600 250 Q695 250 695 350" fill="none" stroke="#eee8da" stroke-width="10"/>';
    case "Mug":
      return '<rect x="420" y="345" width="315" height="245" rx="38" '+common+'/>'+
             '<path d="M735 390 Q860 385 850 485 Q845 560 735 540" fill="none" stroke="#eee8da" stroke-width="22"/>';
    case "Tumbler":
      return '<path d="M485 270 L715 270 L680 665 Q600 700 520 665 Z" '+common+'/>'+
             '<rect x="505" y="230" width="190" height="52" rx="18" fill="#1b1b20" stroke="#d3aa45" stroke-width="5"/>';
    case "Hat":
      return '<path d="M430 470 Q455 315 600 300 Q745 315 770 470 Q650 515 430 470 Z" '+common+'/>'+
             '<path d="M430 470 Q315 485 300 550 Q470 545 610 505" fill="#17171b" stroke="#eee8da" stroke-width="6"/>'+
             '<path d="M600 305 L600 470" fill="none" stroke="#55515b" stroke-width="4"/>';
    case "Apron":
      return '<path d="M505 300 L695 300 L745 665 L455 665 Z" '+common+'/>'+
             '<path d="M540 300 Q540 210 600 210 Q660 210 660 300" fill="none" stroke="#eee8da" stroke-width="10"/>'+
             '<path d="M455 385 L365 455 M745 385 L835 455" fill="none" stroke="#eee8da" stroke-width="8"/>'+
             '<rect x="525" y="530" width="150" height="80" rx="10" fill="#17171b" stroke="#55515b" stroke-width="4"/>';
    case "Pillow":
      return '<rect x="410" y="270" width="380" height="380" rx="65" '+common+'/>'+
             '<path d="M440 310 Q600 355 760 310 M440 610 Q600 565 760 610" fill="none" stroke="#33323a" stroke-width="4"/>';
    case "Poster":
      return '<rect x="415" y="225" width="370" height="470" rx="8" fill="#f4f1e9" stroke="#d3aa45" stroke-width="12"/>'+
             '<rect x="445" y="255" width="310" height="410" rx="2" fill="#111114"/>';
    case "Tee":
    default:
      return '<path d="M390 300 L475 250 L525 300 L675 300 L725 250 L810 300 L770 390 L725 365 L725 650 L475 650 L475 365 L430 390 Z" '+common+'/>';
  }
}

function productTextPosition(product){
  if(product==="Hat") return {brandY:405,phraseY:442,directionY:610};
  if(product==="Mug") return {brandY:445,phraseY:490,directionY:640};
  if(product==="Tumbler") return {brandY:445,phraseY:490,directionY:700};
  if(product==="Poster") return {brandY:420,phraseY:470,directionY:735};
  return {brandY:450,phraseY:505,directionY:735};
}

function previewSvgData(job){
  const c=job.concepts?.find(x=>x.id===job.selectedConcept);
  const safe=v=>String(v||"").replace(/[<>&"]/g,"").slice(0,42);
  const brand=safe(job.brandName||"YOUR BRAND");
  const phrase=safe(job.textRequest||"DESIGNED WITH MB");
  const product=safe(c?.product||job.recommendation?.top||"Merch");
  const direction=safe(c?.name||"MB DESIGN");
  const pos=productTextPosition(product);
  const artFill=product==="Poster"?"#f0cf71":"#e5c05f";
  const svg=[
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900">',
    '<defs><linearGradient id="g"><stop stop-color="#9d7429"/><stop offset=".5" stop-color="#f0cf71"/><stop offset="1" stop-color="#9d7429"/></linearGradient></defs>',
    '<rect width="1200" height="900" fill="#0b0b0d"/>',
    '<text x="70" y="100" font-family="Arial" font-size="72" font-weight="700" fill="url(#g)">MB</text>',
    '<text x="70" y="145" font-family="Arial" font-size="28" fill="#f4f1e9">MERCH BOT — PRODUCT PREVIEW</text>',
    '<circle cx="600" cy="465" r="330" fill="#141419" stroke="#2f2c25" stroke-width="2"/>',
    productShapeSvg(product),
    '<text x="600" y="'+pos.brandY+'" text-anchor="middle" font-family="Arial" font-size="42" font-weight="700" fill="'+artFill+'">'+brand+'</text>',
    '<text x="600" y="'+pos.phraseY+'" text-anchor="middle" font-family="Arial" font-size="24" fill="#f4f1e9">'+phrase+'</text>',
    '<text x="600" y="'+pos.directionY+'" text-anchor="middle" font-family="Arial" font-size="20" font-weight="700" fill="#c99e3e">'+direction+'</text>',
    '<text x="70" y="790" font-family="Arial" font-size="30" font-weight="700" fill="#f4f1e9">'+product+'</text>',
    '<text x="70" y="832" font-family="Arial" font-size="20" fill="#a8a8ad">Concept visualization only — product-specific vendor/template preflight is still required.</text>',
    '</svg>'
  ].join("");
  return "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);
}



function money(v){return "$"+Number(v||0).toFixed(2)}

function renderContextDesk(job){
  const section=$("#context-desk");
  const cards=$("#context-tool-cards");
  const workspace=$("#context-tool-workspace");
  const tools=job?.contextTools||[];
  if(!section||!cards||!tools.length)return;
  section.classList.remove("hidden");
  cards.innerHTML=tools.map(t=>`
    <article class="card">
      <div class="rank">${esc(t.kind||"TOOL")}</div>
      <h3>${esc(t.label)}</h3>
      <p>${esc(t.description||"")}</p>
      <button class="secondary context-tool-open" data-tool="${esc(t.key)}">OPEN TOOL</button>
    </article>`
  ).join("");
  workspace.classList.add("hidden");
  workspace.innerHTML="";
  cards.querySelectorAll(".context-tool-open").forEach(btn=>btn.addEventListener("click",()=>{
    openContextTool(btn.dataset.tool,job);
  }));
}

function openContextTool(key,job){
  const workspace=$("#context-tool-workspace");
  if(!workspace)return;
  workspace.classList.remove("hidden");
  const selected=job?.concepts?.find(c=>c.id===job.selectedConcept);
  const product=selected?.product||job?.recommendation?.top||"Merch";

  if(key==="fundraiser"){
    workspace.innerHTML=`
      <div class="rank">FUNDRAISER GOAL</div>
      <h3>How many units need to sell?</h3>
      <div class="form-grid">
        <label><span>Fundraising goal</span><input id="ctx-goal" type="number" min="0" step="1" value="1000"></label>
        <label><span>Estimated spread per item</span><input id="ctx-profit" type="number" min="0" step=".01" value="15"></label>
        <div class="wide status-list"><div><span>Units needed</span><b id="ctx-result">—</b></div></div>
      </div>`;
    const calc=()=>{
      const goal=Number($("#ctx-goal").value)||0;
      const profit=Number($("#ctx-profit").value)||0;
      $("#ctx-result").textContent=profit>0?Math.ceil(goal/profit)+" units":"Enter a positive spread";
    };
    ["ctx-goal","ctx-profit"].forEach(id=>$("#"+id).addEventListener("input",calc)); calc();
  }else if(key==="deadline"){
    workspace.innerHTML=`
      <div class="rank">DEADLINE GUARD</div>
      <h3>Work backward before the event.</h3>
      <div class="form-grid">
        <label><span>Event date</span><input id="ctx-event-date" type="date"></label>
        <label><span>Printer/POD production days</span><input id="ctx-production-days" type="number" min="1" step="1" value="7"></label>
        <label><span>Shipping/buffer days</span><input id="ctx-buffer-days" type="number" min="1" step="1" value="7"></label>
        <div class="wide status-list"><div><span>Recommended artwork lock date</span><b id="ctx-deadline-result">—</b></div></div>
      </div>`;
    const calc=()=>{
      const raw=$("#ctx-event-date").value;
      const prod=Number($("#ctx-production-days").value)||0;
      const buffer=Number($("#ctx-buffer-days").value)||0;
      if(!raw){$("#ctx-deadline-result").textContent="Choose an event date";return;}
      const d=new Date(raw+"T12:00:00");
      d.setDate(d.getDate()-(prod+buffer));
      $("#ctx-deadline-result").textContent=d.toLocaleDateString();
    };
    ["ctx-event-date","ctx-production-days","ctx-buffer-days"].forEach(id=>$("#"+id).addEventListener("input",calc));
  }else if(key==="gift_budget"){
    workspace.innerHTML=`
      <div class="rank">CLIENT GIFT BUDGET</div>
      <h3>Turn the total budget into a per-client target.</h3>
      <div class="form-grid">
        <label><span>Total budget</span><input id="ctx-budget" type="number" min="0" step=".01" value="500"></label>
        <label><span>Recipients</span><input id="ctx-recipients" type="number" min="1" step="1" value="20"></label>
        <label><span>Packaging/shipping per recipient</span><input id="ctx-gift-extra" type="number" min="0" step=".01" value="5"></label>
        <div class="wide status-list"><div><span>Target merchandise cost per recipient</span><b id="ctx-gift-result">—</b></div></div>
      </div>`;
    const calc=()=>{
      const budget=Number($("#ctx-budget").value)||0;
      const people=Math.max(1,Number($("#ctx-recipients").value)||1);
      const extra=Number($("#ctx-gift-extra").value)||0;
      $("#ctx-gift-result").textContent=money(Math.max(0,budget/people-extra));
    };
    ["ctx-budget","ctx-recipients","ctx-gift-extra"].forEach(id=>$("#"+id).addEventListener("input",calc)); calc();
  }else if(key==="staff_retail"||key==="role_split"){
    workspace.innerHTML=`
      <div class="rank">ROLE SPLIT</div>
      <h3>Keep different merchandise jobs separate.</h3>
      <div class="cards">
        <article class="card"><div class="rank">OPERATIONAL</div><h3>Staff / team</h3><p>Optimize fit, consistency, reorder simplicity and role identification.</p></article>
        <article class="card"><div class="rank">CUSTOMER / FUNDRAISER</div><h3>Retail / public</h3><p>Optimize desirability, margin, giftability and visible brand value.</p></article>
        <article class="card"><div class="rank">CURRENT MB PICK</div><h3>${esc(product)}</h3><p>Decide whether this product belongs in one lane, both lanes, or neither before ordering.</p></article>
      </div>`;
  }else if(key==="bundle"||key==="reader_bundle"){
    const items=(job?.recommendation?.items||[]).slice(0,3);
    workspace.innerHTML=`
      <div class="rank">BUNDLE BUILDER</div>
      <h3>Keep the bundle easy to understand.</h3>
      <div class="cards">
        ${items.map((x,i)=>`<article class="card"><div class="rank">${i===0?"HERO":"ADD-ON"}</div><h3>${esc(x.product)}</h3><p>${esc(x.reason||"")}</p></article>`).join("")}
      </div>
      <p class="micro">Start with one hero product plus one useful add-on. Add a third item only if it materially improves perceived value or average order value.</p>`;
  }else if(key==="clean_house"){
    workspace.innerHTML=`
      <div class="rank">KEEP / PUSH / CHANGE / STOP</div>
      <h3>Audit an existing merch SKU.</h3>
      <div class="form-grid">
        <label><span>Sales / demand</span><select id="ctx-demand"><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label>
        <label><span>Margin</span><select id="ctx-margin"><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label>
        <label><span>Brand fit</span><select id="ctx-fit"><option value="high">Strong</option><option value="medium">Okay</option><option value="low">Weak</option></select></label>
        <div class="wide status-list"><div><span>MB action</span><b id="ctx-audit-result">—</b></div></div>
      </div>`;
    const calc=()=>{
      const d=$("#ctx-demand").value,m=$("#ctx-margin").value,f=$("#ctx-fit").value;
      let result="CHANGE";
      if(d==="high"&&m!=="low"&&f==="high") result="PUSH";
      else if(d==="high"&&f!=="low") result="KEEP";
      else if(d==="low"&&m==="low") result="STOP";
      else if(f==="low") result="CHANGE";
      $("#ctx-audit-result").textContent=result;
    };
    ["ctx-demand","ctx-margin","ctx-fit"].forEach(id=>$("#"+id).addEventListener("change",calc)); calc();
  }else{
    const items=(job?.recommendation?.items||[]).slice(0,3);
    workspace.innerHTML=`
      <div class="rank">MERCH DESK</div>
      <h3>Keep the first test focused.</h3>
      <div class="cards">
        ${items.map((x,i)=>`<article class="card"><div class="rank">${i===0?"TEST FIRST":"NEXT"}</div><h3>${esc(x.product)}</h3><p>${esc(x.reason||"")}</p></article>`).join("")}
      </div>`;
  }
  workspace.scrollIntoView({behavior:"smooth",block:"nearest"});
}

function renderMissionGuidance(job){
  const mission=job?.mission;
  const note=$("#mission-money-note");
  const next=$("#mission-next-action");
  if(note){
    note.textContent=mission?.moneyPrompt
      ? mission.moneyPrompt+" Replace estimates with a live vendor price or actual printer quote when available."
      : "Estimate only. Replace unit cost with a live vendor price or your actual printer quote when available.";
  }
  if(next)next.textContent=mission?.nextAction||"Use Smart Drop to decide what to test first.";
}

function renderBusinessPlaybook(job){
  const p=job?.playbook;
  const section=$("#business-playbook");
  if(!section||!p)return;
  section.classList.remove("hidden");
  $("#playbook-title").textContent=(p.label||"Business")+" playbook";
  const mission=job?.mission;
  const missionLabel=$("#mission-label");
  if(missionLabel)missionLabel.textContent=mission?("Mission: "+mission.label):"Merch mission";
  $("#playbook-copy").textContent="MB inferred this lane from your current project and adjusted the advice underneath.";
  const renderList=items=>(items||[]).map(x=>'<p>• '+esc(x)+'</p>').join("");
  $("#playbook-priorities").innerHTML=renderList(p.priorities);
  $("#playbook-cautions").innerHTML=renderList(p.cautions);
  $("#playbook-next").innerHTML=renderList(p.nextMoves);
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
  if(!currentJob)return;
  const c=currentJob.concepts.find(x=>x.id===id);
  if(!c)return;
  let production=null;
  let matchPlan=[];
  try{
    const res=await fetch("/api/product-guidance?product="+encodeURIComponent(c.product||currentJob.recommendation?.top||""));
    if(res.ok){
      const data=await res.json();
      production=data.production||null;
      matchPlan=data.matchPlan||[];
    }
  }catch{}
  currentJob={...currentJob,selectedConcept:id,status:"DESIGN_PREVIEW_READY",production,matchPlan};
  saveLocalJob(currentJob);
  $("#preview-title").textContent=currentJob.brandName+" — "+c.name;
  renderProductionGuidance(currentJob);
  const proofBrand=currentJob.brandName||"";
  const proofPhrase=currentJob.textRequest||"";
  $("#text-confirm-copy").textContent=proofPhrase
    ? 'I confirm the printed text exactly as shown — Brand: "'+proofBrand+'" · Phrase: "'+proofPhrase+'"'
    : 'I confirm the printed text exactly as shown — Brand: "'+proofBrand+'"';
  $("#text-confirm").checked=false;
  $("#finish-design").disabled=true;
  $("#checkout-note").textContent="Confirm the exact wording above before any paid finish action.";
  $("#preview-img").src=previewSvgData(currentJob);
  $("#preview").classList.remove("hidden");
  $("#next-offers").classList.remove("hidden");
  $("#money").classList.remove("hidden");
  calculateMoney();
  updateStudioRail();
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

function renderProductionGuidance(job){
  const box=$("#production-guidance");
  if(!box)return;
  const p=job.production;
  if(!p){
    box.innerHTML='<div class="rank">PRODUCTION</div><p class="micro">Product-specific production guidance is not available yet.</p>';
    return;
  }
  box.innerHTML=
    '<div class="rank">PRODUCTION GUIDANCE</div>'+
    '<h3 style="margin:.4em 0">'+esc(p.product)+'</h3>'+
    '<p><strong>Preferred methods:</strong> '+esc((p.preferredMethods||[]).join(" · "))+'</p>'+
    '<p><strong>Status:</strong> DESIGN READY</p>'+
    '<p><strong>Before PRINT READY:</strong> '+esc(p.printStatusRule||"Vendor/template preflight required.")+'</p>'+
    ((p.specialtyRisks||[]).length
      ? '<p><strong>Watch for:</strong> '+esc(p.specialtyRisks.join(" · "))+'</p>'
      : '');
}

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
  const source=$("#calc-source")?.value||"estimate";
  const labels={estimate:"MB ESTIMATE",quote:"CUSTOMER-ENTERED QUOTE",live:"LIVE VENDOR PRICE"};
  $("#calc-source-label").textContent=labels[source]||"MB ESTIMATE";
  updateStudioRail();
}
["calc-cost","calc-price","calc-qty","calc-other","calc-source"].forEach(id=>$("#"+id).addEventListener("input",calculateMoney));

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
    "Preferred production methods: "+((currentJob.production?.preferredMethods||[]).join(", ")||"Vendor review required"),
    "Production warnings: "+((currentJob.production?.specialtyRisks||[]).join(" | ")||"None listed"),
    "",
    "STATUS: DESIGN READY — FINAL VENDOR TEMPLATE / METHOD PREFLIGHT REQUIRED",
    "",
    "Printer: "+(currentJob.production?.printStatusRule||"Please confirm the final blank/SKU, exact print area, production method, color handling, file format, resolution, bleed/safe-zone requirements, and any specialty preparation before manufacturing."),
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
        
      </div>
    </article>`;
  }).join(""):`<article class="card"><p>Your saved MB jobs will appear here.</p></article>`;

  document.querySelectorAll(".reopen-job").forEach(btn=>btn.addEventListener("click",async()=>{
    const job=merged.find(x=>x.id===btn.dataset.jobId);
    if(!job)return;
    currentJob=job;
    if(currentJob.selectedConcept && !currentJob.production){
      const selected=currentJob.concepts?.find(x=>x.id===currentJob.selectedConcept);
      const product=selected?.product||currentJob.recommendation?.top||currentJob.productChoice||"";
      try{
        const res=await fetch("/api/product-guidance?product="+encodeURIComponent(product));
        if(res.ok){
          const data=await res.json();
          currentJob={...currentJob,production:data.production||null,matchPlan:data.matchPlan||[]};
          saveLocalJob(currentJob);
        }
      }catch{}
    }
    renderJob(currentJob);
    renderBusinessPlaybook(currentJob);
    renderMissionGuidance(currentJob);
    renderContextDesk(currentJob);
    $("#results").classList.remove("hidden");
    if(currentJob.selectedConcept){
      const c=currentJob.concepts.find(x=>x.id===currentJob.selectedConcept);
      $("#preview-title").textContent=currentJob.brandName+" — "+(c?.name||"Selected Direction");
      renderProductionGuidance(currentJob);
      $("#preview-img").src=previewSvgData(currentJob);
      const proofBrand=currentJob.brandName||"";
      const proofPhrase=currentJob.textRequest||"";
      $("#text-confirm-copy").textContent=proofPhrase
        ? 'I confirm the printed text exactly as shown — Brand: "'+proofBrand+'" · Phrase: "'+proofPhrase+'"'
        : 'I confirm the printed text exactly as shown — Brand: "'+proofBrand+'"';
      $("#text-confirm").checked=false;
      $("#finish-design").disabled=true;
      $("#preview").classList.remove("hidden");
      $("#next-offers").classList.remove("hidden");
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
  {id:"business-playbook",label:"Your Business Playbook"},
  {id:"context-desk",label:"MB Merch Desk"},
  {id:"preview",label:"Your Merch"},
  {id:"next-offers",label:"What Could This Become?"},
  {id:"money",label:"If I Sell This"},
  {id:"privacy-facts",label:"Privacy Facts"},
  {id:"trust-standards",label:"BOTS BUILT BETTER™"},
  {id:"offer-ladder",label:"Your MB Options"},
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
  if(currentJob?.matchPlan?.length){
    return currentJob.matchPlan.slice().sort((a,b)=>{
      const rank={EASY:0,RECOMPOSE:1,SIMPLIFY:2,HARD:3};
      return (rank[a.ease]??9)-(rank[b.ease]??9);
    });
  }
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
    rows.slice(0,5).map(r=>{
      const label=r.ease||r.fit||"MATCH";
      return '<div class="offer-line"><strong>'+esc(r.product)+' · '+esc(label)+'</strong><br>'+esc(r.note)+'</div>';
    }).join("");
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

async function loadTrustStatus(){
  try{
    const res=await fetch("https://lcuvhizjhccvzprpuoij.supabase.co/functions/v1/mb-trust-status");
    if(!res.ok)throw new Error();
    const data=await res.json();
    const c=data.certification||{};
    $("#bbb-cert-status").textContent=(c.name||"BOTS BUILT BETTER™")+" — "+(c.status||"STATUS UNKNOWN");
    $("#bbb-gates-passed").textContent=String(c.passed_required??"—");
    $("#bbb-gates-total").textContent=String(c.required_total??"—");
    $("#bbb-progress").textContent=(c.progress_percent??0)+"%";
    $("#bbb-certified").textContent=c.certified?"YES":"NO";
    $("#bbb-cert-statement").textContent=c.statement||"Certification facts unavailable.";

    const levels=data.release_levels||{};
    const order=["preview","commerce","production","fulfillment"];
    $("#bbb-release-levels").innerHTML=order.map(key=>{
      const level=levels[key]||{};
      const status=level.certified?"CERTIFIED":"NOT YET CERTIFIED";
      return `<article class="card ${level.certified?"active":""}">
        <div class="rank">${status}</div>
        <h3>${esc(level.name||key)}</h3>
        <p><strong>${level.passed??0} of ${level.total??0}</strong> required gates passed · ${level.progress_percent??0}%</p>
        <p class="micro">${level.certified?"This release level has passed all of its required BOTS BUILT BETTER™ gates.":"Higher release capabilities are not implied until every required gate for this level passes."}</p>
      </article>`;
    }).join("");

    const gates=data.gates||[];
    $("#bbb-gates").innerHTML=gates.map(g=>`
      <article class="card ${g.passed?"active":""}">
        <div class="rank">${esc(g.status||"UNKNOWN")}</div>
        <h3>${esc(g.display_name)}</h3>
        <p>${esc(g.customer_fact||"")}</p>
        ${g.evidence_note?`<p class="micro"><strong>Evidence:</strong> ${esc(g.evidence_note)}</p>`:""}
      </article>
    `).join("");

    const ext=data.external_assurance||{};
    const labels={
      nist_ai_rmf:"NIST AI RMF",
      iso_27001:"ISO/IEC 27001",
      iso_27701_2025:"ISO/IEC 27701:2025",
      iso_42001:"ISO/IEC 42001",
      soc_2:"SOC 2"
    };
    $("#external-assurance").innerHTML=Object.entries(ext).map(([k,v])=>`
      <article class="card">
        <div class="rank">EXTERNAL / SEPARATE</div>
        <h3>${esc(labels[k]||k)}</h3>
        <p>${esc(v)}</p>
      </article>
    `).join("");
  }catch{
    $("#bbb-cert-status").textContent="BOTS BUILT BETTER™ — status temporarily unavailable";
    $("#bbb-cert-statement").textContent="Trust facts could not be loaded right now. No certification claim is made when status cannot be verified.";
  }
}

loadTrustStatus();


$("#delete-saved-work")?.addEventListener("click",async()=>{
  const note=$("#delete-saved-work-note");
  const ok=confirm("Delete the saved MB preview jobs for this browser from local storage and the MB job vault?");
  if(!ok)return;
  note.textContent="Deleting saved MB work…";
  localStorage.removeItem(localJobsKey);
  const result=await vaultRequest("delete_all");
  if(result?.ok){
    currentJob=null;
    $("#my-merch").innerHTML='<article class="card"><p>Your saved MB jobs have been deleted for this browser.</p></article>';
    $("#results")?.classList.add("hidden");
    $("#preview")?.classList.add("hidden");
    $("#next-offers")?.classList.add("hidden");
    $("#money")?.classList.add("hidden");
    note.textContent="Saved preview jobs deleted from this browser and the MB job vault.";
  }else{
    note.textContent="Local saved work was cleared, but the vault could not be confirmed. Try again before assuming remote deletion is complete.";
  }
});


function updateAdaptiveMode(){
  const wide=window.matchMedia("(min-width: 1200px)").matches;
  document.body.classList.toggle("mb-studio",wide);
  const label=document.getElementById("mb-mode-label");
  if(label)label.textContent=wide?"STUDIO":"POCKET";
}
window.addEventListener("resize",updateAdaptiveMode);
updateAdaptiveMode();

async function openMbCompanion(){
  const status=document.getElementById("mb-voice-status");
  if(!("documentPictureInPicture" in window)){
    if(status)status.textContent="Always-on-top companion mode is not supported in this browser. The floating MB dock will stay with you here.";
    return;
  }
  try{
    const pip=await window.documentPictureInPicture.requestWindow({width:360,height:520});
    pip.document.title="MB — Take With You";
    const mainMode=document.getElementById("mb-mode-label");
    if(mainMode)mainMode.textContent="COMPANION";
    const style=pip.document.createElement("style");
    style.textContent=`
      body{margin:0;background:#0b0b0d;color:#f7f5ef;font-family:system-ui,-apple-system,sans-serif;padding:16px}
      .mbc{display:grid;gap:12px}
      .rank{font-size:12px;letter-spacing:.14em;color:#f0d47e;font-weight:800}
      h2{font-size:22px;margin:0}
      p{color:#c8c4bb;line-height:1.45}
      button{border:0;border-radius:12px;padding:12px;font-weight:800;cursor:pointer}
      .primary{background:linear-gradient(135deg,#b8872d,#f0d47e);color:#111}
      .secondary{background:#24242a;color:#f7f5ef;border:1px solid #3a3940}
      .row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    `;
    pip.document.head.appendChild(style);
    const wrap=pip.document.createElement("div");
    wrap.className="mbc";
    wrap.innerHTML='<div class="rank">TAKE MB WITH YOU™</div><h2>MB Companion</h2><p id="mbc-section"></p><button class="primary" id="mbc-read">READ THIS</button><div class="row"><button class="secondary" id="mbc-back">← BACK</button><button class="secondary" id="mbc-next">NEXT →</button></div><button class="secondary" id="mbc-top">TOP ↑</button>';
    pip.document.body.appendChild(wrap);

    const sync=()=>{
      const s=currentSectionIndex();
      const section=s.sections[s.index];
      const el=pip.document.getElementById("mbc-section");
      if(el)el.textContent=section?"Current: "+section.label:"MB is ready.";
    };
    sync();
    window.addEventListener("scroll",sync,{passive:true});

    pip.document.getElementById("mbc-read").onclick=()=>speak(currentSectionText());
    pip.document.getElementById("mbc-back").onclick=()=>{goSection(-1);sync();};
    pip.document.getElementById("mbc-next").onclick=()=>{goSection(1);sync();};
    pip.document.getElementById("mbc-top").onclick=()=>{window.scrollTo({top:0,behavior:"smooth"});setTimeout(sync,250);};

    pip.addEventListener("pagehide",()=>{
      window.removeEventListener("scroll",sync);
      updateAdaptiveMode();
    });
    if(status)status.textContent="MB Companion is open in an always-on-top window.";
  }catch{
    if(status)status.textContent="Companion mode could not open. The floating MB dock is still available.";
  }
}
document.getElementById("mb-companion")?.addEventListener("click",openMbCompanion);


function updateStudioRail(){
  const section=currentSectionIndex?.();
  const selected=currentJob?.concepts?.find(c=>c.id===currentJob?.selectedConcept);
  const spread=$("#calc-spread")?.textContent||"—";
  const jobs=readLocalJobs();
  const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value||"—";};
  set("studio-brand",currentJob?.brandName||"No active merch job");
  set("studio-lane",currentJob?.playbook?.label||"General");
  set("studio-mission",currentJob?.mission?.label||"—");
  set("studio-top-pick",currentJob?.recommendation?.top||"—");
  set("studio-product",selected?.product||currentJob?.productChoice||"—");
  set("studio-production",currentJob?.selectedConcept?(currentJob?.production?"DESIGN READY":"GUIDANCE PENDING"):"PREVIEW");
  set("studio-spread",spread);
  set("studio-saved",String(jobs.length));
  set("studio-section",section?.sections?.[section.index]?.label||"How MB Works");
}

document.getElementById("studio-read")?.addEventListener("click",()=>speak(currentSectionText()));
document.getElementById("studio-companion")?.addEventListener("click",openMbCompanion);
window.addEventListener("scroll",updateStudioRail,{passive:true});
window.addEventListener("resize",updateStudioRail);

updateStudioRail();


const MB_CONTEXT_KEY="mb_ui_context_v1";
let lastViewportMode=null;

function viewportMode(){
  if(window.matchMedia("(min-width: 1200px)").matches)return "studio";
  if(window.matchMedia("(max-width: 480px)").matches)return "pocket";
  return "standard";
}

function saveUiContext(){
  try{
    const state=currentSectionIndex();
    const section=state.sections[state.index];
    localStorage.setItem(MB_CONTEXT_KEY,JSON.stringify({
      sectionId:section?.id||null,
      scrollY:window.scrollY,
      viewportMode:viewportMode(),
      jobId:currentJob?.id||null,
      selectedConcept:currentJob?.selectedConcept||null,
      savedAt:Date.now()
    }));
  }catch{}
}

function restoreUiContext({forceSection=false}={}){
  try{
    const saved=JSON.parse(localStorage.getItem(MB_CONTEXT_KEY)||"null");
    if(!saved)return;
    if(forceSection&&saved.sectionId){
      const el=document.getElementById(saved.sectionId);
      if(el&&!el.classList.contains("hidden")){
        el.scrollIntoView({behavior:"auto",block:"start"});
        return;
      }
    }
    if(Number.isFinite(saved.scrollY))window.scrollTo({top:saved.scrollY,behavior:"auto"});
  }catch{}
}

function handleViewportTransition(){
  const next=viewportMode();
  const changed=lastViewportMode&&lastViewportMode!==next;
  saveUiContext();
  lastViewportMode=next;
  updateAdaptiveMode();
  updateStudioRail();
  if(changed)setTimeout(()=>restoreUiContext({forceSection:true}),60);
}

window.addEventListener("orientationchange",()=>setTimeout(handleViewportTransition,120));
window.addEventListener("resize",()=>{
  clearTimeout(window.__mbResizeTimer);
  window.__mbResizeTimer=setTimeout(handleViewportTransition,120);
});
document.addEventListener("visibilitychange",()=>{
  if(document.visibilityState==="hidden")saveUiContext();
  else setTimeout(()=>restoreUiContext(),50);
});
window.addEventListener("pagehide",saveUiContext);
lastViewportMode=viewportMode();
setTimeout(()=>restoreUiContext(),50);


let mbInstallPrompt=null;
const installBtn=document.getElementById("mb-install");
const installNote=document.getElementById("mb-install-note");

function isStandaloneMode(){
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone===true;
}

function isAppleMobile(){
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function updateInstallUi(){
  if(!installBtn)return;
  if(isStandaloneMode()){
    installBtn.classList.add("hidden");
    if(installNote)installNote.textContent="MB is already installed on this device.";
    return;
  }
  installBtn.classList.remove("hidden");
  if(mbInstallPrompt){
    installBtn.textContent="INSTALL MB";
    if(installNote)installNote.textContent="Install MB for faster access and a standalone app window.";
  }else if(isAppleMobile()){
    installBtn.textContent="ADD MB TO HOME SCREEN";
    if(installNote)installNote.textContent="On iPhone/iPad: use the Share menu, then choose Add to Home Screen.";
  }else{
    installBtn.textContent="KEEP MB HANDY";
    if(installNote)installNote.textContent="Your browser may offer Install or Add to Home Screen from its menu.";
  }
}

window.addEventListener("beforeinstallprompt",event=>{
  event.preventDefault();
  mbInstallPrompt=event;
  updateInstallUi();
});

window.addEventListener("appinstalled",()=>{
  mbInstallPrompt=null;
  updateInstallUi();
});

installBtn?.addEventListener("click",async()=>{
  if(isStandaloneMode())return;
  if(mbInstallPrompt){
    mbInstallPrompt.prompt();
    await mbInstallPrompt.userChoice.catch(()=>null);
    mbInstallPrompt=null;
    updateInstallUi();
    return;
  }
  if(isAppleMobile()){
    if(installNote)installNote.textContent="Tap Share in Safari, then Add to Home Screen. MB will open in a standalone app-like view.";
  }else{
    if(installNote)installNote.textContent="Open your browser menu and look for Install app or Add to Home Screen.";
  }
});

updateInstallUi();

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>{
    navigator.serviceWorker.register("/service-worker.js").catch(()=>{});
  });
}
