import express from 'express';
import crypto from 'node:crypto';
import QRCode from 'qrcode';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENVIRONMENTS, OPPORTUNITY_PATHS, evaluateOpportunity, getKnowledgeSummary } from './knowledgeBase.js';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '12mb' }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'earn-mode-opportunity-camera-alpha',
    visionConfigured: Boolean(process.env.OPENAI_API_KEY),
    commerceConfigured: Boolean(process.env.SHOPIFY_ADMIN_TOKEN)
  });
});

app.get('/api/opportunity-camera/knowledge', (_req, res) => {
  res.json(getKnowledgeSummary());
});

app.get('/api/opportunity-camera/paths', (_req, res) => {
  res.json({
    paths: OPPORTUNITY_PATHS.map(path => ({
      pathKey: path.pathKey,
      name: path.name,
      environment: path.environment,
      environmentLabel: ENVIRONMENTS[path.environment]?.label || path.environment,
      offerKey: path.offerKey,
      offerName: path.offerName,
      category: path.category,
      status: path.status,
      cameraApproved: path.cameraApproved,
      difficulty: path.difficulty,
      baseFit: path.baseFit,
      minConfidence: path.minConfidence,
      minReadiness: path.minReadiness,
      recommendedState: path.recommendedState,
      action: path.action,
      why: path.why,
      scripts: path.scripts,
      guardrail: path.guardrail,
      trainingKey: path.trainingKey,
      commerce: path.commerce || null
    }))
  });
});


function moneyFromPath(pathDef) {
  const snapshot = pathDef?.commerce?.snapshot;
  const trustedRate = Number(process.env.ALPHA_MEMBER_COMMISSION_RATE || '');
  if (!snapshot?.priceCents) {
    return {
      status: pathDef?.commerce?.kind === 'network' ? 'community_path' : 'unavailable',
      message: pathDef?.commerce?.kind === 'network'
        ? 'This is a tracked community-growth path, not a direct product commission path.'
        : 'No verified commerce price is available for this path.'
    };
  }

  const base = {
    status: Number.isFinite(trustedRate) && trustedRate >= 0 && trustedRate <= 1 ? 'snapshot_verified_with_trusted_rate' : 'snapshot_verified_price_only',
    priceCents: snapshot.priceCents,
    currency: snapshot.currency || 'USD',
    verifiedAt: snapshot.verifiedAt,
    inventorySnapshot: snapshot.inventory ?? null,
    priceLabel: new Intl.NumberFormat('en-US',{style:'currency',currency:snapshot.currency || 'USD'}).format(snapshot.priceCents/100)
  };

  if (!Number.isFinite(trustedRate) || trustedRate < 0 || trustedRate > 1) {
    return {
      ...base,
      message: `Verified store price snapshot: ${base.priceLabel} (checked ${snapshot.verifiedAt}). Connect a trusted Earn Mode rate to display potential commission.`
    };
  }

  const commissionCents = Math.round(snapshot.priceCents * trustedRate);
  return {
    ...base,
    commissionRate: trustedRate,
    commissionCents,
    commissionLabel: new Intl.NumberFormat('en-US',{style:'currency',currency:snapshot.currency || 'USD'}).format(commissionCents/100),
    message: `Store price snapshot ${base.priceLabel} • trusted staging rate ${(trustedRate*100).toFixed(0)}% • potential qualifying commission ${new Intl.NumberFormat('en-US',{style:'currency',currency:snapshot.currency || 'USD'}).format(commissionCents/100)}.`
  };
}

function actionLinkSecret() {
  return process.env.OPPORTUNITY_LINK_SECRET || '';
}

function signOpportunityPayload(payload) {
  const secret = actionLinkSecret();
  if (!secret) return null;
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifyOpportunityToken(token) {
  const secret = actionLinkSecret();
  if (!secret || !token || !token.includes('.')) return null;
  const [body,sig] = token.split('.');
  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a,b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body,'base64url').toString('utf8'));
    if (!payload?.pathKey || !payload?.destinationUrl) return null;
    return payload;
  } catch {
    return null;
  }
}

app.post('/api/opportunity-camera/create-action-link', async (req, res) => {
  const { pathKey } = req.body || {};
  const pathDef = OPPORTUNITY_PATHS.find(p => p.pathKey === pathKey && p.cameraApproved);
  if (!pathDef) return res.status(404).json({ error:'PATH_NOT_FOUND' });
  if (!pathDef.destinationUrl) return res.status(409).json({ error:'DESTINATION_NOT_READY', message:'This opportunity is not ready for tracked sharing yet.' });
  if (!actionLinkSecret()) return res.status(503).json({ error:'LINK_SIGNING_NOT_CONFIGURED' });

  const payload = {
    pathKey:pathDef.pathKey,
    offerKey:pathDef.offerKey,
    destinationUrl:pathDef.destinationUrl,
    createdAt:new Date().toISOString()
  };
  const token = signOpportunityPayload(payload);
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const trackedUrl = `${baseUrl}/go/${token}`;
  const qrDataUrl = await QRCode.toDataURL(trackedUrl,{margin:1,width:480,errorCorrectionLevel:'M'});

  res.json({
    pathKey:pathDef.pathKey,
    offer:pathDef.offerName,
    trackedUrl,
    qrDataUrl,
    money:moneyFromPath(pathDef),
    note:'This alpha link tracks the Opportunity Camera pathway. Production member attribution will be added when Earn Mode authentication is connected.'
  });
});

app.get('/go/:token', (req,res) => {
  const payload = verifyOpportunityToken(req.params.token);
  if (!payload) return res.status(400).send('Invalid or expired Opportunity Camera link.');
  console.log(JSON.stringify({
    event:'opportunity_link_click',
    pathKey:payload.pathKey,
    offerKey:payload.offerKey,
    at:new Date().toISOString()
  }));
  return res.redirect(302,payload.destinationUrl);
});

app.get('/api/config', (_req, res) => {
  res.json({
    heroUrl: 'https://cdn.shopify.com/s/files/1/1982/3607/files/earn-mode-opportunity-camera-hero.png?v=1789848430',
    priceLabel: '$1.99 / 30-Day Pass',
    freeLooks: 3,
    visionConfigured: Boolean(process.env.OPENAI_API_KEY),
    commerceConfigured: Boolean(process.env.SHOPIFY_ADMIN_TOKEN)
  });
});

app.post('/api/opportunity-camera/scan', async (req, res) => {
  const requiredSecret = process.env.PGP_CAMERA_WORKER_SECRET;
  if (requiredSecret && req.get('x-pgp-worker-secret') !== requiredSecret) {
    return res.status(401).json({ error: 'WORKER_AUTH_REQUIRED' });
  }

  const { image_data_url: imageDataUrl } = req.body || {};
  if (!imageDataUrl || !imageDataUrl.startsWith('data:image/')) {
    return res.status(400).json({ error: 'IMAGE_REQUIRED' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({
      error: 'VISION_NOT_CONFIGURED',
      message: 'Alpha UI is live. Add the OpenAI API key to enable real opportunity scans.'
    });
  }

  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      environment: {
        type: 'string',
        enum: [
          'church','beauty_salon','bookstore','community_event','vendor_market',
          'womens_organization','school_learning','coffee_cafe','retail_store',
          'community_center','senior_organization','professional_office',
          'apartment_community','conference_venue','other_unknown'
        ]
      },
      confidence: { type: 'number', minimum: 0, maximum: 1 },
      people_primary_subject: { type: 'boolean' },
      private_information_visible: { type: 'boolean' },
      reason: { type: 'string' }
    },
    required: [
      'environment','confidence','people_primary_subject',
      'private_information_visible','reason'
    ]
  };

  const body = {
    model: process.env.OPENAI_VISION_MODEL || 'gpt-5.6-luna',
    input: [{
      role: 'user',
      content: [
        {
          type: 'input_text',
          text: 'Classify this public scene for the Earn Mode Opportunity Camera. Focus on the place/context, not personal traits. Do not infer race, religion, health, income, age, or other sensitive traits from people. If people are the primary subject, flag that so the camera can ask the user to re-aim toward a storefront, sign, booth, display, or public information.'
        },
        { type: 'input_image', image_url: imageDataUrl }
      ]
    }],
    text: {
      format: {
        type: 'json_schema',
        name: 'opportunity_scene',
        strict: true,
        schema
      }
    }
  };

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(502).json({ error: 'VISION_FAILED', detail: data?.error?.message || 'Vision request failed.' });
    }

    const raw = data.output_text || data.output?.flatMap?.(x => x.content || []).find?.(x => x.type === 'output_text')?.text;
    const scene = JSON.parse(raw);

    if (scene.people_primary_subject || scene.private_information_visible) {
      return res.json({
        result: 'keep_looking',
        headline: 'Try another view.',
        message: 'Aim toward the storefront, sign, display, booth, or public information rather than people.',
        scene
      });
    }

    if (scene.confidence < 0.70 || scene.environment === 'other_unknown') {
      return res.json({
        result: 'keep_looking',
        headline: 'Keep looking.',
        message: 'I do not see a strong enough opportunity yet.',
        scene
      });
    }

    const readiness = ['new','active','advanced'].includes(req.body?.member_readiness)
      ? req.body.member_readiness
      : 'new';

    const match = evaluateOpportunity({
      environment: scene.environment,
      confidence: scene.confidence,
      readiness
    });

    if (match.result === 'keep_looking') {
      return res.json({
        result: 'keep_looking',
        headline: match.headline,
        message: match.message,
        scene: {
          ...scene,
          label: ENVIRONMENTS[scene.environment]?.label || ENVIRONMENTS.other_unknown.label
        },
        alternatives: []
      });
    }

    const primary = match.primary;

    return res.json({
      result: match.result,
      headline: match.headline,
      scene: {
        ...scene,
        label: ENVIRONMENTS[scene.environment]?.label || ENVIRONMENTS.other_unknown.label
      },
      opportunity: {
        pathKey: primary.pathKey,
        name: primary.name,
        offerKey: primary.offerKey,
        offer: primary.offerName,
        category: primary.category,
        difficulty: primary.difficulty,
        score: primary.score,
        action: primary.action,
        why: primary.why,
        scripts: primary.scripts,
        guardrail: primary.guardrail,
        trainingKey: primary.trainingKey,
        commerce: primary.commerce || null
      },
      alternatives: match.alternatives,
      money: moneyFromPath(primary)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'SCAN_FAILED', message: 'The scan could not be completed safely.' });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Opportunity Camera alpha listening on :${port}`));
