const express = require("express");
const path = require("path");
const crypto = require("crypto");
const { Pool } = require("pg");
const { getTemplate, getMatchPlan } = require("./lib/productCatalog");

const app = express();
const PORT = process.env.PORT || 10000;
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : null;
const memory = new Map();

app.use(function(req,res,next){
  res.setHeader("X-Content-Type-Options","nosniff");
  res.setHeader("X-Frame-Options","DENY");
  res.setHeader("Referrer-Policy","strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy","camera=(), geolocation=(), microphone=(self)");
  res.setHeader("Strict-Transport-Security","max-age=31536000; includeSubDomains");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: https://cdn.shopify.com; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https://lcuvhizjhccvzprpuoij.supabase.co https://agent-qr-system.onrender.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  );
  next();
});

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

function clean(v) { return String(v || "").trim(); }

function smartDrop(input) {
  const t = [input.businessType, input.brandName, input.audience, input.useCase]
    .filter(Boolean).join(" ").toLowerCase();
  let rows;
  if (/bakery|food|restaurant|chef|cater|bbq/.test(t)) {
    rows = [["Tote",92,"Useful, visible, easy first test"],["Tumbler",88,"Higher ticket and repeat visibility"],["Apron",86,"Excellent business fit"],["Tee",75,"Good brand builder"],["Hoodie",61,"Higher-cost test item"]];
  } else if (/salon|beauty|barber|spa|hair/.test(t)) {
    rows = [["Tumbler",93,"Strong lifestyle fit"],["Crewneck",88,"Premium staff/customer crossover"],["Tote",84,"Easy visible brand extension"],["Tee",78,"Broad but crowded"],["Poster",56,"Better in-store than first retail"]];
  } else if (/church|ministry|choir|faith/.test(t)) {
    rows = [["Tee",94,"Broad participation and event fit"],["Tumbler",88,"Strong keepsake"],["Tote",86,"Useful fundraiser add-on"],["Crewneck",80,"Premium follow-on"],["Poster",72,"Supporting event item"]];
  } else if (/music|artist|singer|dj|album|song|band/.test(t)) {
    rows = [["Poster",94,"Collector-friendly visual product"],["Tee",90,"Strong wearable identity"],["Hoodie",84,"Premium fan item"],["Tumbler",70,"Good when the visual world translates"],["Tote",68,"Supporting product"]];
  } else if (/realtor|real estate|consult|attorney|broker|professional/.test(t)) {
    rows = [["Tumbler",92,"Useful premium client gift"],["Tote",86,"Practical event/open-house item"],["Mug",82,"Easy office/client gift"],["Crewneck",67,"Secondary brand item"],["Tee",52,"Usually not the best first choice"]];
  } else {
    rows = [["Tee",86,"Flexible first item"],["Tumbler",84,"Useful with a good retail ceiling"],["Tote",82,"Visible low-complexity brand builder"],["Hoodie",76,"Premium but higher-cost"],["Mug",74,"Easy gift/add-on"]];
  }
  const audience=String(input.audience||"").toLowerCase();
  if(audience.includes("staff")){
    rows=rows.map(r=>[r[0],r[1]+(["Apron","Crewneck","Tee"].includes(r[0])?5:0),r[2]]);
  }
  if(audience.includes("gift")){
    rows=rows.map(r=>[r[0],r[1]+(["Tumbler","Mug","Tote"].includes(r[0])?5:0),r[2]]);
  }
  rows.sort((a,b)=>b[1]-a[1]);

  function fitLabel(score,index){
    if(index===0 && score>=88) return "EXCELLENT FIT";
    if(score>=82) return "STRONG FIT";
    if(score>=72) return "TEST FIRST";
    return "HIGHER RISK";
  }

  return {
    top: rows[0][0],
    items: rows.map(function(r,i) {
      return {
        product:r[0],
        score:r[1],
        fitLabel:fitLabel(r[1],i),
        reason:r[2],
        status:i===0?"MAKE FIRST":(i<3?"DROP NEXT":"HOLD FOR NOW")
      };
    })
  };
}

function concepts(input, product) {
  const brand = clean(input.brandName) || "YOUR BRAND";
  const phrase = clean(input.textRequest);
  const chosen = clean(input.productChoice) && input.productChoice !== "MB Choose" ? input.productChoice : product;
  return [
    { id:1, name:"PREMIUM MINIMAL", product:chosen, description:"Refined typography and one memorable mark for " + brand + ".", bestFor:"Premium, useful merchandise that does not feel overly promotional." },
    { id:2, name:"BIG STATEMENT", product:chosen, description:"A bolder phrase-led direction" + (phrase ? " built around “" + phrase + "”." : "."), bestFor:"Events, attention and strong readability." },
    { id:3, name:"SIGNATURE ART", product:chosen, description:"A more distinctive illustrated direction that gives " + brand + " its own merch language.", bestFor:"Drops, gifting, music/story worlds and collector appeal." }
  ];
}

async function initDb() {
  if (!pool) return;
  await pool.query("CREATE TABLE IF NOT EXISTS merch_jobs (id TEXT PRIMARY KEY, client_id TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), status TEXT NOT NULL, payload JSONB NOT NULL)");
  await pool.query("CREATE INDEX IF NOT EXISTS merch_jobs_client_idx ON merch_jobs(client_id, created_at DESC)");
}

async function save(job) {
  memory.set(job.id, job);
  if (pool) {
    await pool.query(
      "INSERT INTO merch_jobs (id, client_id, status, payload) VALUES ($1,$2,$3,$4::jsonb) ON CONFLICT (id) DO UPDATE SET updated_at=NOW(), status=EXCLUDED.status, payload=EXCLUDED.payload",
      [job.id, job.clientId, job.status, JSON.stringify(job)]
    );
  }
}

async function getJob(id) {
  if (pool) {
    const q = await pool.query("SELECT payload FROM merch_jobs WHERE id=$1", [id]);
    if (q.rows[0]) return q.rows[0].payload;
  }
  return memory.get(id) || null;
}

app.get("/health", function(req,res) {
  res.json({ ok:true, service:"merch-bot-v1", persistence:pool ? "postgres" : "memory" });
});

app.get("/api/jobs", async function(req,res) {
  try {
    const clientId = clean(req.query.clientId);
    if (!clientId) return res.status(400).json({ error:"clientId_required" });
    if (pool) {
      const q = await pool.query("SELECT payload FROM merch_jobs WHERE client_id=$1 ORDER BY created_at DESC LIMIT 30", [clientId]);
      return res.json({ jobs:q.rows.map(function(x){return x.payload;}) });
    }
    const jobs = Array.from(memory.values()).filter(function(j){return j.clientId===clientId;});
    res.json({ jobs:jobs.reverse() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error:"jobs_unavailable" });
  }
});

app.post("/api/jobs", async function(req,res) {
  try {
    const input = req.body || {};
    if (!clean(input.clientId) || !clean(input.brandName)) return res.status(400).json({ error:"client_and_brand_required" });
    const rec = smartDrop(input);
    const job = {
      id:"mb_" + crypto.randomUUID(),
      clientId:clean(input.clientId),
      createdAt:new Date().toISOString(),
      status:"WAITING_SELECTION",
      mode:clean(input.mode) || "BEST_SELLER",
      brandName:clean(input.brandName),
      businessType:clean(input.businessType),
      audience:clean(input.audience),
      useCase:clean(input.useCase),
      style:clean(input.style),
      productChoice:clean(input.productChoice) || "MB Choose",
      textRequest:clean(input.textRequest),
      brandLock:clean(input.brandLock) || "elevate",
      rightsConfirmed:clean(input.rightsConfirmed) === "yes",
      recommendation:rec,
      concepts:concepts(input, rec.top),
      selectedConcept:null
    };
    await save(job);
    res.status(201).json(job);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error:"create_failed" });
  }
});

app.get("/api/product-guidance", function(req,res) {
  const product=clean(req.query.product);
  const production=getTemplate(product);
  if(!production) return res.status(404).json({error:"unsupported_product"});
  res.json({product,production,matchPlan:getMatchPlan(product)});
});

app.post("/api/jobs/:id/select", async function(req,res) {
  try {
    const job = await getJob(req.params.id);
    if (!job) return res.status(404).json({ error:"not_found" });
    const n = Number(req.body && req.body.conceptId);
    if (![1,2,3].includes(n)) return res.status(400).json({ error:"invalid_concept" });
    job.selectedConcept = n;
    job.status = "DESIGN_PREVIEW_READY";
    const selected = job.concepts.find(function(x){ return x.id===n; });
    const product = selected?.product || job.recommendation?.top || "";
    job.production = getTemplate(product);
    job.matchPlan = getMatchPlan(product);
    await save(job);
    res.json(job);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error:"select_failed" });
  }
});

app.get("/api/jobs/:id/preview.svg", async function(req,res) {
  const job = await getJob(req.params.id);
  if (!job || !job.selectedConcept) return res.status(404).send("Preview not ready");
  const c = job.concepts.find(function(x){return x.id===job.selectedConcept;});
  const safe = function(v){return String(v||"").replace(/[<>&"]/g,"").slice(0,42);};
  const brand = safe(job.brandName);
  const phrase = safe(job.textRequest || "DESIGNED WITH MB");
  const product = safe(c.product || job.recommendation.top);
  const direction = safe(c.name);
  const svg = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900">',
    '<defs><linearGradient id="g"><stop stop-color="#9d7429"/><stop offset=".5" stop-color="#f0cf71"/><stop offset="1" stop-color="#9d7429"/></linearGradient></defs>',
    '<rect width="1200" height="900" fill="#0b0b0d"/>',
    '<text x="70" y="100" font-family="Arial" font-size="72" font-weight="700" fill="url(#g)">MB</text>',
    '<text x="70" y="145" font-family="Arial" font-size="28" fill="#f4f1e9">MERCH BOT — DESIGN PREVIEW</text>',
    '<rect x="330" y="205" width="540" height="510" rx="50" fill="#17171b" stroke="#d3aa45" stroke-width="3"/>',
    '<path d="M390 300 L475 250 L525 300 L675 300 L725 250 L810 300 L770 390 L725 365 L725 650 L475 650 L475 365 L430 390 Z" fill="#0f0f12" stroke="#eee8da" stroke-width="6"/>',
    '<text x="600" y="450" text-anchor="middle" font-family="Arial" font-size="44" font-weight="700" fill="#e5c05f">' + brand + '</text>',
    '<text x="600" y="505" text-anchor="middle" font-family="Arial" font-size="25" fill="#f4f1e9">' + phrase + '</text>',
    '<text x="600" y="600" text-anchor="middle" font-family="Arial" font-size="20" font-weight="700" fill="#c99e3e">' + direction + '</text>',
    '<text x="70" y="790" font-family="Arial" font-size="30" font-weight="700" fill="#f4f1e9">' + product + '</text>',
    '<text x="70" y="832" font-family="Arial" font-size="20" fill="#a8a8ad">Concept visualization only — final production art comes after rendering + preflight.</text>',
    '</svg>'
  ].join("");
  res.type("image/svg+xml").send(svg);
});

app.post("/api/checkout", async function(req,res) {
  try {
    const body=req.body||{};
    const visitorToken=clean(body.visitorToken);
    const jobId=clean(body.jobId);
    const conceptId=Number(body.conceptId);
    if(!visitorToken||!jobId||![1,2,3].includes(conceptId)) {
      return res.status(400).json({error:"checkout_context_required"});
    }
    const upstream=await fetch("https://lcuvhizjhccvzprpuoij.supabase.co/functions/v1/tbs-checkout-context",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        action:"create",
        visitor_token:visitorToken,
        bot_slug:"merch-bot",
        tier_key:"POWER",
        action_key:"make_one",
        return_path:"/",
        state_payload:{merch_job_id:jobId,concept_id:conceptId}
      })
    });
    const text=await upstream.text();
    let data={};
    try{data=JSON.parse(text)}catch{data={error:"checkout_response_invalid"}}
    return res.status(upstream.status).json(data);
  } catch(e) {
    console.error("MB checkout error",e);
    res.status(502).json({error:"checkout_bridge_unavailable"});
  }
});

app.post("/api/verify-purchase", async function(req,res) {
  try {
    const contextToken=clean(req.body && req.body.contextToken);
    if(!contextToken) return res.status(400).json({error:"context_token_required"});
    const upstream=await fetch("https://agent-qr-system.onrender.com/tbs/merch-bot/verify-purchase",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({context_token:contextToken})
    });
    const text=await upstream.text();
    let data={};
    try{data=JSON.parse(text)}catch{data={error:"verification_response_invalid"}}
    return res.status(upstream.status).json(data);
  } catch(e) {
    console.error("MB purchase verification error",e);
    res.status(502).json({error:"purchase_verification_unavailable"});
  }
});

app.post("/api/entitlement-status", async function(req,res) {
  try {
    const visitorToken=clean(req.body && req.body.visitorToken);
    if(!visitorToken) return res.status(400).json({error:"visitor_token_required"});
    const upstream=await fetch("https://lcuvhizjhccvzprpuoij.supabase.co/functions/v1/mb-entitlement",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"status",visitor_token:visitorToken})
    });
    const text=await upstream.text();
    let data={};
    try{data=JSON.parse(text)}catch{data={error:"entitlement_response_invalid"}}
    return res.status(upstream.status).json(data);
  } catch(e) {
    console.error("MB entitlement status error",e);
    res.status(502).json({error:"entitlement_status_unavailable"});
  }
});

app.get("*", function(req,res) {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

initDb().then(function() {
  app.listen(PORT, "0.0.0.0", function(){ console.log("Merch Bot V1 listening on " + PORT); });
}).catch(function(err) {
  console.error("DB init failed; memory fallback:", err.message);
  app.listen(PORT, "0.0.0.0", function(){ console.log("Merch Bot V1 listening on " + PORT + " (memory)"); });
});
