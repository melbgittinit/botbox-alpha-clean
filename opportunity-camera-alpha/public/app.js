const $ = (s) => document.querySelector(s);
let imageDataUrl = null;
let currentOpportunity = null;
let memberProfileToken = null;
let memberProfile = null;
const BAG_KEY = 'earn_mode_opportunity_bag_alpha_v1';

function loadBag(){ try{return JSON.parse(localStorage.getItem(BAG_KEY)||'[]')}catch{return []} }
function writeBag(items){ localStorage.setItem(BAG_KEY,JSON.stringify(items)); renderBag(); }
function esc(s){ return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function renderBag(){
  const items=loadBag();
  const el=$('#bagList');
  if(!el) return;
  if(!items.length){ el.innerHTML='<div class="actionCard"><strong>No saved opportunities yet.</strong><p class="hint">Scan something useful, then tap Save to My Bag.</p></div>'; return; }
  el.innerHTML=items.map((x,i)=>`<div class="actionCard"><span>${esc(x.environmentLabel||x.environment||'Opportunity')}</span><strong>${esc(x.offer||'Saved opportunity')}</strong><p class="hint">${esc(x.action||'')}</p><div class="micro">Saved ${esc(new Date(x.savedAt).toLocaleString())}</div><button class="ghost bagRemove" data-index="${i}" style="margin-top:10px">Remove</button></div>`).join('');
  document.querySelectorAll('.bagRemove').forEach(btn=>btn.onclick=()=>{const items=loadBag();items.splice(Number(btn.dataset.index),1);writeBag(items)});
}

async function boot() {
  const config = await fetch('/api/config').then(r => r.json());
  $('#heroImage').src = config.heroUrl;
  const params = new URLSearchParams(location.search);
  const token = params.get('profile');
  if (token) {
    try {
      const response = await fetch('/api/opportunity-camera/member-profile',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({member_profile_token:token})
      });
      if (response.ok) {
        memberProfileToken = token;
        memberProfile = await response.json();
        localStorage.setItem('earn_mode_opportunity_profile_alpha', token);
      }
    } catch {}
  }
  if (!memberProfileToken) {
    const stored = localStorage.getItem('earn_mode_opportunity_profile_alpha');
    if (stored) {
      try {
        const response = await fetch('/api/opportunity-camera/member-profile',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({member_profile_token:stored})
        });
        if (response.ok) {
          memberProfileToken = stored;
          memberProfile = await response.json();
        } else {
          localStorage.removeItem('earn_mode_opportunity_profile_alpha');
        }
      } catch {}
    }
  }
  const status = $('#memberStatus');
  if (status) {
    status.textContent = memberProfile
      ? `Beta Earn Mode profile • ${memberProfile.tier.replace('_',' ')} • ${memberProfile.commissionRateLabel} • ${memberProfile.camera?.looksRemaining ?? '?'} looks left`
      : 'Beta mode • personalized commission not connected';
  }
  renderBag();
}

$('#openCamera').onclick = () => $('#cameraPanel').classList.remove('hidden');
$('#closeCamera').onclick = () => $('#cameraPanel').classList.add('hidden');

$('#cameraInput').addEventListener('change', () => {
  const file = $('#cameraInput').files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    imageDataUrl = reader.result;
    $('#preview').src = imageDataUrl;
    $('#preview').classList.remove('hidden');
    $('#scanButton').classList.remove('hidden');
    $('#scanStatus').textContent = '';
  };
  reader.readAsDataURL(file);
});

$('#scanButton').onclick = async () => {
  if (!imageDataUrl) return;
  $('#scanButton').disabled = true;
  $('#scanStatus').textContent = 'Opportunity Brain is looking…';

  try {
    const response = await fetch('/api/opportunity-camera/scan', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        image_data_url: imageDataUrl,
        member_profile_token: memberProfileToken
      })
    });
    const data = await response.json();

    if (!response.ok) {
      $('#scanStatus').textContent = data.message || 'Scan unavailable.';
      if (data.camera && $('#memberStatus')) {
        $('#memberStatus').textContent = `${data.camera.label || 'Opportunity Camera'} • ${data.camera.looksRemaining ?? 0} looks left`;
      }
      return;
    }

    if (data.nextMemberProfileToken) {
      memberProfileToken = data.nextMemberProfileToken;
      localStorage.setItem('earn_mode_opportunity_profile_alpha', memberProfileToken);
    }
    if (data.camera) {
      memberProfile = {...(memberProfile||{}),camera:data.camera};
      if ($('#memberStatus')) {
        $('#memberStatus').textContent = `Beta Earn Mode profile • ${memberProfile.tier?.replace('_',' ') || ''} • ${memberProfile.commissionRateLabel || ''} • ${data.camera.looksRemaining} looks left`;
      }
    }

    currentOpportunity = data.opportunity || null;
    $('#qrCard')?.classList.add('hidden');
    $('#resultState').textContent = String(data.result || '').replace('_',' ').toUpperCase();
    $('#resultState').dataset.state = data.result || '';
    $('#resultHeadline').textContent = data.headline || 'Opportunity result';
    $('#sceneLabel').textContent = (data.scene?.environment || 'Unknown').replaceAll('_',' ');
    $('#offerLabel').textContent = data.opportunity?.offer || 'No approved match yet';
    $('#actionLabel').textContent = data.opportunity?.action || data.message || 'Keep looking.';
    $('#whyLabel').textContent = data.opportunity?.why || data.message || 'The Brain did not find a strong approved match.';
    $('#difficultyLabel').textContent = data.opportunity?.difficulty || '—';
    $('#scoreLabel').textContent = Number.isFinite(data.opportunity?.score) ? data.opportunity.score + '/100' : '—';
    $('#scriptLabel').textContent = data.opportunity?.scripts?.friendly || data.opportunity?.scripts?.quick || 'No script needed yet.';
    const alternatives = Array.isArray(data.alternatives) ? data.alternatives : [];
    if (alternatives.length) {
      $('#alternativesLabel').textContent = alternatives.map(x => x.offerName).join(' • ');
      $('#alternativesCard').classList.remove('hidden');
    } else {
      $('#alternativesCard').classList.add('hidden');
    }
    $('#moneyLabel').textContent = data.money?.message || 'Verified amounts appear only from live commerce + commission data.';
    $('#resultPanel').classList.remove('hidden');
    $('#resultPanel').scrollIntoView({behavior:'smooth'});
  } catch {
    $('#scanStatus').textContent = 'The scan could not be completed.';
  } finally {
    $('#scanButton').disabled = false;
  }
};

$('#scanAgain').onclick = () => {
  imageDataUrl = null;
  $('#cameraInput').value = '';
  $('#preview').classList.add('hidden');
  $('#scanButton').classList.add('hidden');
  $('#resultPanel').classList.add('hidden');
  $('#alternativesCard')?.classList.add('hidden');
  $('#cameraPanel').classList.remove('hidden');
  $('#cameraPanel').scrollIntoView({behavior:'smooth'});
};

boot();
$('#makeQr').onclick = async () => {
  if (!currentOpportunity?.pathKey) return;
  $('#makeQr').disabled = true;
  $('#makeQr').textContent = 'Creating QR…';
  try {
    const response = await fetch('/api/opportunity-camera/create-action-link', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        pathKey:currentOpportunity.pathKey,
        member_profile_token:memberProfileToken
      })
    });
    const data = await response.json();
    if (!response.ok) {
      $('#qrNote').textContent = data.message || 'This opportunity is not ready for tracked sharing yet.';
      $('#qrCard').classList.remove('hidden');
      return;
    }
    $('#qrImage').src = data.qrDataUrl;
    $('#trackedLink').href = data.trackedUrl;
    $('#trackedLink').textContent = data.trackedUrl;
    $('#qrNote').textContent = data.note || 'Tracked Opportunity QR ready.';
    $('#qrCard').classList.remove('hidden');
    $('#qrCard').scrollIntoView({behavior:'smooth',block:'center'});
  } catch {
    $('#qrNote').textContent = 'QR creation is temporarily unavailable.';
    $('#qrCard').classList.remove('hidden');
  } finally {
    $('#makeQr').disabled = false;
    $('#makeQr').textContent = 'Make My QR';
  }
};

$('#saveBag').onclick = () => {
  if (!currentOpportunity?.pathKey) return;
  const items = loadBag();
  const exists = items.some(x => x.pathKey === currentOpportunity.pathKey && x.offer === currentOpportunity.offer);
  if (!exists) {
    items.unshift({
      pathKey: currentOpportunity.pathKey,
      offer: currentOpportunity.offer,
      action: currentOpportunity.action,
      difficulty: currentOpportunity.difficulty,
      environment: $('#sceneLabel').textContent,
      environmentLabel: $('#sceneLabel').textContent,
      savedAt: new Date().toISOString()
    });
    writeBag(items.slice(0,50));
  }
  $('#bagPanel').scrollIntoView({behavior:'smooth'});
};

$('#clearBag').onclick = () => {
  localStorage.removeItem(BAG_KEY);
  renderBag();
};
