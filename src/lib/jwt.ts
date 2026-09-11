import { createHmac } from 'crypto';

function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function signJwt(secret: string, payload: Record<string, unknown>, ttlSeconds = 86400): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const body = { iss: 'supabase', aud: 'authenticated', iat: now, exp: now + ttlSeconds, ...payload };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedBody = base64url(JSON.stringify(body));
  const signature = base64url(createHmac('sha256', secret).update(`${encodedHeader}.${encodedBody}`).digest());
  return `${encodedHeader}.${encodedBody}.${signature}`;
}