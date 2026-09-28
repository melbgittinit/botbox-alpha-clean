import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENVIRONMENTS, evaluateOpportunity, getKnowledgeSummary } from './knowledgeBase.js';

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
      money: {
        status: 'not_verified_in_alpha',
        message: 'Price and commission will appear only after Shopify and Earn Mode commission sources are connected.'
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'SCAN_FAILED', message: 'The scan could not be completed safely.' });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Opportunity Camera alpha listening on :${port}`));
