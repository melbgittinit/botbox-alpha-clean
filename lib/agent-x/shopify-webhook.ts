import { createHmac, timingSafeEqual } from 'crypto';

export function verifyShopifyWebhook(rawBody: Buffer, providedHmac: string, secret: string) {
  const computed = createHmac('sha256', secret).update(rawBody).digest('base64');
  try {
    const left = Buffer.from(providedHmac || '', 'base64');
    const right = Buffer.from(computed, 'base64');
    return left.length === right.length && timingSafeEqual(left, right);
  } catch {
    return false;
  }
}
