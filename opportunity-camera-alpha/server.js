import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

    const demoMap = {
      church: ['Women of the Bible for Women of Color', 'prepare', 'Ask for the appropriate ministry or resource leader.'],
      beauty_salon: ['Women of Color — The Network', 'go', 'Ask whether you may display your personal QR.'],
      bookstore: ['Women of Color Books & Bibles', 'prepare', 'Ask for the buyer or resource manager.'],
      community_event: ['Earn Mode / HUB campaign', 'go', 'Find the organizer or approved display area.'],
      vendor_market: ['The Bot Stores / HUB Merch', 'go', 'Check the vendor or QR-sharing opportunity.'],
      womens_organization: ['Women of Color — The Network', 'go', 'Offer the group resource QR.'],
      school_learning: ['Creator College', 'prepare', 'Approach an adult organizer or administrator.'],
      coffee_cafe: ['Community QR opportunity', 'prepare', 'Check for a community board or manager-approved display.'],
      retail_store: ['WOC Books / Merch', 'prepare', 'Ask for the buyer or manager.'],
      community_center: ['Creator College', 'prepare', 'Ask about program or resource partnerships.'],
      senior_organization: ['WOC Books & Devotionals', 'prepare', 'Ask the program/resource coordinator.'],
      professional_office: ['Agent X', 'prepare', 'Prepare a short business-use demo before approaching.'],
      apartment_community: ['Creator College / Community programs', 'prepare', 'Ask the leasing or resident-events team.'],
      conference_venue: ['Bot Stores / Earn Mode', 'prepare', 'Identify the event organizer or vendor opportunity.']
    };

    const [offer, state, action] = demoMap[scene.environment] || ['No approved match yet', 'keep_looking', 'Keep looking.'];

    return res.json({
      result: state,
      headline: state === 'go' ? "There's one." : state === 'prepare' ? 'Good opportunity — prepare first.' : 'Keep looking.',
      scene,
      opportunity: { offer, action },
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
