const $ = (s) => document.querySelector(s);
let imageDataUrl = null;

async function boot() {
  const config = await fetch('/api/config').then(r => r.json());
  $('#heroImage').src = config.heroUrl;
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
      body: JSON.stringify({ image_data_url: imageDataUrl })
    });
    const data = await response.json();

    if (!response.ok) {
      $('#scanStatus').textContent = data.message || 'Scan unavailable.';
      return;
    }

    $('#resultState').textContent = String(data.result || '').replace('_',' ').toUpperCase();
    $('#resultState').dataset.state = data.result || '';
    $('#resultHeadline').textContent = data.headline || 'Opportunity result';
    $('#sceneLabel').textContent = (data.scene?.environment || 'Unknown').replaceAll('_',' ');
    $('#offerLabel').textContent = data.opportunity?.offer || 'No approved match yet';
    $('#actionLabel').textContent = data.opportunity?.action || data.message || 'Keep looking.';
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
  $('#cameraPanel').classList.remove('hidden');
  $('#cameraPanel').scrollIntoView({behavior:'smooth'});
};

boot();