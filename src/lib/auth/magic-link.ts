import crypto from 'crypto';

export function generatePassword(length = 12): string {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let retVal = '';
  for (let i = 0, n = charset.length; i < length; ++i) {
    const randomIndex = Math.floor(Math.random() * n);
    retVal += charset.charAt(randomIndex);
  }
  return retVal;
}

export function signMagicToken(payload: { email: string; password: string }) {
  const secret =
    process.env.AUTH_LINK_SECRET ||
    (process.env.NODE_ENV !== 'production' ? 'local-dev-secret' : undefined);
  if (!secret) {
    throw new Error('AUTH_LINK_SECRET is not configured');
  }

  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
  const data = { ...payload, exp };
  const json = JSON.stringify(data);
  const base64 = Buffer.from(json).toString('base64url');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(base64);
  const signature = hmac.digest('base64url');
  return `${base64}.${signature}`;
}

export function verifyMagicToken(token: string) {
  const secret =
    process.env.AUTH_LINK_SECRET ||
    (process.env.NODE_ENV !== 'production' ? 'local-dev-secret' : undefined);
  if (!secret) {
    throw new Error('AUTH_LINK_SECRET is not configured');
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [payloadPart, signaturePart] = parts as [string, string];

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payloadPart);
  const expectedSignature = hmac.digest('base64url');

  const signatureBuffer = Buffer.from(signaturePart, 'base64url');
  const expectedBuffer = Buffer.from(expectedSignature, 'base64url');

  if (signatureBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  let payload: { email: string; password: string; exp: number };
  try {
    const json = Buffer.from(payloadPart, 'base64url').toString('utf8');
    payload = JSON.parse(json);
  } catch {
    return null;
  }

  if (!payload.email || !payload.password || !payload.exp) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    return null;
  }

  return payload;
}
