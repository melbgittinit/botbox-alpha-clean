const auth = document.querySelector("#auth");
const dashboard = document.querySelector("#dashboard");
const queue = document.querySelector("#queue");
const mediaQueue = document.querySelector("#mediaQueue");
let token = "";

function esc(value="") { const node=document.createElement("span"); node.textContent=String(value ?? ""); return node.innerHTML; }
async function api(path, options={}) {
  const response = await fetch(path, { ...options, headers:{ ...(options.headers||{}), "Authorization":`Bearer ${token}`, "Content-Type":"application/json" } });
  if (response.status === 401) throw new Error("The review token was not accepted.");
  if (!response.ok) throw new Error("The review action could not be completed.");
  return response.json();
}
function render(items) {
  document.querySelector("#total").textContent=items.length;
  document.querySelector("#high").textContent=items.filter(i=>i.priority==="high").length;
  document.querySelector("#pending").textContent=items.filter(i=>i.handoff_status==="pending-human-review").length;
  queue.innerHTML=items.length ? items.map(item=>`<article class="card ${item.priority==='high'?'high':''}">
    <header><div><span class="badge ${item.priority==='high'?'high':''}">${esc(item.priority)} priority</span><h3>${esc(item.organization||'Organization pending')}</h3><span>${esc(item.recommended_agent||'Agent recommendation pending')}</span></div><span class="badge">${esc(item.handoff_status)}</span></header>
    <div class="grid"><div><h4>Opportunity</h4><p>${esc(item.brief?.diagnosed_gap)}</p><h4>Pilot</h4><p>${esc(item.brief?.pilot_scope)}</p><h4>Commercial class</h4><p>${esc(item.investment_class)}</p></div>
    <div><h4>Authorized contact</h4><p>${esc(item.participant?.name)}<br>${esc(item.participant?.role)}<br>${esc(item.participant?.business_email||'Email not supplied')}<br>Preferred: ${esc(item.participant?.preferred_contact||'unspecified')}</p><h4>Success measures</h4><ul>${(item.brief?.success_measures||[]).map(v=>`<li>${esc(v)}</li>`).join('')}</ul></div></div>
    <div class="actions"><button data-id="${esc(item.session_id)}" data-status="accepted-for-discovery">Accept for discovery</button><button data-id="${esc(item.session_id)}" data-status="deferred">Defer</button><button data-id="${esc(item.session_id)}" data-status="closed-not-fit">Close—not fit</button></div>
  </article>`).join("") : "<p>No executive opportunities are waiting for review.</p>";
}
function renderMetrics(metrics) {
  const percent = value => `${Math.round((Number(value)||0)*100)}%`;
  document.querySelector("#started").textContent=metrics.sessions_started||0;
  document.querySelector("#completed").textContent=metrics.sessions_completed||0;
  document.querySelector("#briefs").textContent=metrics.briefs_prepared||0;
  document.querySelector("#reviews").textContent=metrics.human_review_requests||0;
  document.querySelector("#reviewRate").textContent=percent(metrics.review_request_rate);
  const started=Math.max(1,Number(metrics.sessions_started)||0);
  document.querySelector("#completionBar").style.width=`${Math.min(100,(Number(metrics.sessions_completed)||0)/started*100)}%`;
  document.querySelector("#briefBar").style.width=`${Math.min(100,(Number(metrics.briefs_prepared)||0)/started*100)}%`;
  document.querySelector("#reviewBar").style.width=`${Math.min(100,(Number(metrics.human_review_requests)||0)/started*100)}%`;
  document.querySelector("#metricTime").textContent=`Updated ${new Date(metrics.generated_at).toLocaleString()}`;
}
function renderMedia(items) {
  mediaQueue.innerHTML=items.length ? items.map(item=>`<article class="card media-card">
    <header><div><span class="badge">${esc(item.request_type)}</span><h3>${esc(item.outlet)}</h3><span>${esc(item.name)}</span></div><span class="badge">${esc(item.status)}</span></header>
    <div class="grid"><div><h4>Reporting focus</h4><p>${esc(item.reporting_focus)}</p><p class="request-meta">Requested ${esc(new Date(item.created_at).toLocaleString())}<br>Reference: ${esc(item.id)}</p></div>
    <div><h4>Authorized contact</h4><p>${esc(item.name)}<br>${esc(item.business_email)}<br>${esc(item.outlet)}</p><h4>Consent</h4><p>${item.contact_consent?'Contact authorized for this request':'Not authorized'}</p></div></div>
    <div class="actions"><button data-media-id="${esc(item.id)}" data-media-status="approved-for-scheduling">Approve to schedule</button><button data-media-id="${esc(item.id)}" data-media-status="invitation-issued">Mark invitation issued</button><button data-media-id="${esc(item.id)}" data-media-status="completed">Complete</button><button data-media-id="${esc(item.id)}" data-media-status="declined">Decline</button></div>
  </article>`).join("") : "<p>No media preview requests are waiting for review.</p>";
}
function renderMediaMetrics(metrics) {
  document.querySelector("#mediaTotal").textContent=metrics.total_requests||0;
  document.querySelector("#mediaPending").textContent=metrics.pending_review||0;
  document.querySelector("#mediaApproved").textContent=metrics.approved_for_scheduling||0;
  document.querySelector("#mediaInvited").textContent=metrics.invitations_issued||0;
}
async function load() {
  document.querySelector("#dashboardError").textContent="";
  try { const [queueData,metrics,mediaData,mediaMetrics]=await Promise.all([api("/api/review-queue"),api("/api/executive-metrics"),api("/api/media-requests"),api("/api/media-metrics")]); render(queueData.opportunities); renderMetrics(metrics); renderMedia(mediaData.requests); renderMediaMetrics(mediaMetrics); }
  catch(error) { document.querySelector("#dashboardError").textContent=error.message; throw error; }
}
document.querySelector("#authForm").addEventListener("submit",async event=>{event.preventDefault(); token=document.querySelector("#token").value; try{await load();auth.hidden=true;dashboard.hidden=false;}catch(error){document.querySelector("#authError").textContent=error.message;}});
document.querySelector("#refresh").addEventListener("click",load);
document.querySelector("#lock").addEventListener("click",()=>{token="";dashboard.hidden=true;auth.hidden=false;document.querySelector("#token").value="";});
queue.addEventListener("click",async event=>{const button=event.target.closest("[data-status]");if(!button)return;await api(`/api/review-queue/${button.dataset.id}`,{method:"POST",body:JSON.stringify({status:button.dataset.status})});await load();});
mediaQueue.addEventListener("click",async event=>{const button=event.target.closest("[data-media-status]");if(!button)return;await api(`/api/media-requests/${button.dataset.mediaId}`,{method:"POST",body:JSON.stringify({status:button.dataset.mediaStatus})});await load();});
setInterval(()=>{if(token&&!dashboard.hidden)load().catch(()=>{});},60000);
