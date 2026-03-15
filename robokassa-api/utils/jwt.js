const crypto = require('crypto');

function base64UrlEncode(input) {
  const buffer = Buffer.isBuffer(input)
    ? input
    : Buffer.from(String(input), 'utf8');
  return buffer
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecodeToBuffer(input) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad =
    normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + pad, 'base64');
}

function signHs256(data, secret) {
  return crypto.createHmac('sha256', secret).update(data).digest();
}

function timingSafeEqual(a, b) {
  const aBuf = Buffer.isBuffer(a) ? a : Buffer.from(a);
  const bBuf = Buffer.isBuffer(b) ? b : Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function signJwt(payload, expiresInSeconds) {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) {
    throw new Error('AUTH_JWT_SECRET is not set');
  }

  const header = { alg: 'HS256', typ: 'JWT' };
  const exp =
    Math.floor(Date.now() / 1000) + (expiresInSeconds ?? 60 * 60 * 24 * 30);
  const fullPayload = { ...payload, exp };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = signHs256(signingInput, secret);
  const encodedSignature = base64UrlEncode(signature);

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

function verifyJwt(token) {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) {
    throw new Error('AUTH_JWT_SECRET is not set');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;

  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = signHs256(signingInput, secret);
  const expectedEncodedSignature = base64UrlEncode(expectedSignature);

  if (!timingSafeEqual(expectedEncodedSignature, encodedSignature)) {
    throw new Error('Invalid token signature');
  }

  const payloadBuffer = base64UrlDecodeToBuffer(encodedPayload);
  const payloadJson = payloadBuffer.toString('utf8');
  const payload = JSON.parse(payloadJson);

  if (typeof payload.exp !== 'number') {
    throw new Error('Invalid token payload');
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) {
    throw new Error('Token expired');
  }

  return payload;
}

module.exports = {
  signJwt,
  verifyJwt,
};
