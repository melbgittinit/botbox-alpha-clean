import http from 'node:http';

const port = Number(process.env.PORT || 10000);
const hero = 'https://cdn.shopify.com/s/files/1/1982/3607/files/earn-mode-opportunity-camera-hero.png?v=1789848430';

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#092b22">
<title>Earn Mode Opportunity Camera — Alpha</title>
<style>
:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#071c17;color:#f8f3df;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.wrap{max-width:860px;margin:auto;padding:18px}.hero{width:100%;border-radius:24px;border:1px solid #315346;box-shadow:0 20px 70px #0008}.card{background:#0c2a22;border:1px solid #315346;border-radius:22px;padding:22px;margin:18px 0}.eyebrow{letter-spacing:.16em;font-size:.75rem;color:#d7b768}.badge{display:inline-block;background:#143c30;border:1px solid #3c735e;padding:7px 10px;border-radius:999px;font-size:.8rem}.button{display:block;width:100%;padding:16px 18px;border:0;border-radius:16px;font-weight:800;font-size:1rem;background:#d9b85f;color:#102018;margin-top:12px}.preview{width:100%;max-height:440px;object-fit:cover;border-radius:18px;margin-top:14px;display:none}.muted{color:#b8c7c1;line-height:1.55}.status{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:14px}.status div{background:#102f27;border-radius:14px;padding:13px}.status b{display:block;color:#e6c96f;margin-bottom:4px}@media(min-width:700px){.status{grid-template-columns:repeat(4,1fr)}} 
</style>
</head>
<body><main class="wrap">
<p class="eyebrow">SERIOUSLY SATISFYING HUB · EARN MODE</p>
<img class="hero" src="${hero}" alt="Earn Mode Opportunity Camera hero">
<section class="card">
<span class="badge">ALPHA MOBILE CHECK</span>
<h1>Opportunity Camera™</h1>
<p class="muted">See it. Scan it. Earn from it. This isolated alpha verifies HTTPS, the mobile camera handoff, hero delivery, and the staging service before the Opportunity Brain and earnings database are attached.</p>
<label class="button" for="camera">📷 OPEN CAMERA</label>
<input id="camera" type="file" accept="image/*" capture="environment" hidden>
<img id="preview" class="preview" alt="Camera preview">
<p id="msg" class="muted">Aim at a storefront, public sign, display, booth, or event information — not people.</p>
</section>
<section class="card">
<h2>Staging readiness</h2>
<div class="status">
<div><b>HTTPS</b><span>Ready</span></div>
<div><b>Hero CDN</b><span>Ready</span></div>
<div><b>Camera handoff</b><span>Test here</span></div>
<div><b>Opportunity Brain</b><span>Next attach</span></div>
</div>
</section>
</main>
<script>
const input=document.querySelector('#camera'),preview=document.querySelector('#preview'),msg=document.querySelector('#msg');
input.addEventListener('change',()=>{const f=input.files&&input.files[0];if(!f)return;preview.src=URL.createObjectURL(f);preview.style.display='block';msg.textContent='Camera handoff worked. This photo stays in your browser in this smoke-test build and is not uploaded.';});
</script>
</body></html>`;

const server = http.createServer((req,res)=>{
  if(req.url === '/health'){res.writeHead(200,{'content-type':'application/json'});return res.end(JSON.stringify({ok:true,service:'opportunity-camera-alpha',mode:'smoke'}));}
  res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});
  res.end(page);
});
server.listen(port,'0.0.0.0',()=>console.log(`Opportunity Camera alpha listening on ${port}`));
