const express = require("express");
const path = require("path");
const crypto = require("crypto");
const { validateCatalog, getTemplate, getMatchPlan } = require("./lib/productCatalog");

const app = express();
const PORT = process.env.PORT || 10000;
const catalogCheck=validateCatalog();
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

const rateBuckets=new Map();
function rateLimit(name,limit,windowMs){
  return function(req,res,next){
    const now=Date.now();
    const key=name+":"+req.ip;
    const bucket=rateBuckets.get(key)||[];
    const fresh=bucket.filter(ts=>now-ts<windowMs);
    if(fresh.length>=limit){
      res.setHeader("Retry-After",String(Math.ceil(windowMs/1000)));
      return res.status(429).json({error:"rate_limited"});
    }
    fresh.push(now);
    rateBuckets.set(key,fresh);
    next();
  };
}

app.use("/api",function(req,res,next){
  res.setHeader("Cache-Control","no-store");
  next();
});

app.use(express.static(path.join(__dirname, "public")));

function clean(v,max=300) { return String(v || "").trim().slice(0,max); }

const ALLOWED_AUDIENCES=new Set(["Customers","Fans","Staff","Members","Event guests","Gifts","To sell for profit","Mixed"]);
const ALLOWED_USES=new Set(["Retail / sell it","Brand building","Staff","Gift / giveaway","Event","Launch / drop"]);
const ALLOWED_STYLES=new Set(["MB Choose","Luxury","Street","Bold","Elegant","Fun","Minimal","Vintage"]);
const ALLOWED_PRODUCTS=new Set(["MB Choose","Tee","Hoodie","Crewneck","Tote","Mug","Tumbler","Hat","Apron","Pillow","Poster"]);
const ALLOWED_BRAND_LOCKS=new Set(["elevate","locked","explore"]);
const ALLOWED_MODES=new Set(["BEST_SELLER","MAKE_THIS"]);

function allowed(value,set,fallback){
  const v=clean(value,80);
  return set.has(v)?v:fallback;
}

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

app.get("/health", function(req,res) {
  res.json({ ok:true, service:"merch-bot-v1", persistence:"browser-plus-mb-vault", productCatalog:catalogCheck });
});

app.get("/api/jobs", function(req,res) {
  res.status(410).json({error:"deprecated_use_mb_job_vault"});
});

app.post("/api/jobs", rateLimit("jobs",30,10*60*1000), async function(req,res) {
  try {
    const input = req.body || {};
    const clientId=clean(input.clientId,100);
    const brandName=clean(input.brandName,100);
    if (!clientId || !brandName) return res.status(400).json({ error:"client_and_brand_required" });
    if (clean(input.rightsConfirmed,10)!=="yes") return res.status(400).json({ error:"commercial_rights_confirmation_required" });

    const normalized={
      clientId,
      brandName,
      businessType:clean(input.businessType,160),
      audience:allowed(input.audience,ALLOWED_AUDIENCES,"Customers"),
      useCase:allowed(input.useCase,ALLOWED_USES,"Retail / sell it"),
      style:allowed(input.style,ALLOWED_STYLES,"MB Choose"),
      productChoice:allowed(input.productChoice,ALLOWED_PRODUCTS,"MB Choose"),
      textRequest:clean(input.textRequest,120),
      brandLock:allowed(input.brandLock,ALLOWED_BRAND_LOCKS,"elevate"),
      rightsConfirmed:true,
      mode:allowed(input.mode,ALLOWED_MODES,"BEST_SELLER")
    };

    const rec = smartDrop(normalized);
    const job = {
      id:"mb_" + crypto.randomUUID(),
      clientId:normalized.clientId,
      createdAt:new Date().toISOString(),
      status:"WAITING_SELECTION",
      mode:normalized.mode,
      brandName:normalized.brandName,
      businessType:normalized.businessType,
      audience:normalized.audience,
      useCase:normalized.useCase,
      style:normalized.style,
      productChoice:normalized.productChoice,
      textRequest:normalized.textRequest,
      brandLock:normalized.brandLock,
      rightsConfirmed:true,
      recommendation:rec,
      concepts:concepts(normalized, rec.top),
      selectedConcept:null
    };
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

app.post("/api/jobs/:id/select", function(req,res) {
  res.status(410).json({error:"deprecated_selection_is_client_vault_managed"});
});

app.get("/api/jobs/:id/preview.svg", function(req,res) {
  res.status(410).send("Deprecated: preview is rendered from the saved MB job in the client.");
});

app.post("/api/checkout", rateLimit("checkout",10,10*60*1000), async function(req,res) {
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

app.post("/api/verify-purchase", rateLimit("verify",20,10*60*1000), async function(req,res) {
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

app.post("/api/entitlement-status", rateLimit("entitlement",30,10*60*1000), async function(req,res) {
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

app.listen(PORT, "0.0.0.0", function(){ console.log("Merch Bot V1 listening on " + PORT); });
