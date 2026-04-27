// Web Crypto API 사용 - Edge Runtime(proxy/middleware)과 Node.js 모두 호환

const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8시간

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

async function computeHmac(secret: string, data: string): Promise<string> {
  const key = await getHmacKey(secret);
  const enc = new TextEncoder();
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return Buffer.from(sig).toString('hex');
}

export async function createSessionToken(password: string): Promise<string> {
  const timestamp = Date.now().toString();
  const secret = process.env.ADMIN_SESSION_SECRET!;
  const hmac = await computeHmac(secret, `${password}:${timestamp}`);
  return `${timestamp}.${hmac}`;
}

export async function validateSession(token: string): Promise<boolean> {
  try {
    const dotIndex = token.indexOf('.');
    if (dotIndex === -1) return false;

    const timestamp = token.slice(0, dotIndex);
    const providedHmac = token.slice(dotIndex + 1);

    if (!timestamp || !providedHmac) return false;

    // 토큰 만료 검사
    if (Date.now() - parseInt(timestamp) > SESSION_MAX_AGE_MS) return false;

    const secret = process.env.ADMIN_SESSION_SECRET;
    const password = process.env.ADMIN_PASSWORD;
    if (!secret || !password) return false;

    const expectedHmac = await computeHmac(secret, `${password}:${timestamp}`);

    // 상수시간 비교 (Web Crypto verify 사용)
    const key = await getHmacKey(secret);
    const enc = new TextEncoder();
    const sig = Buffer.from(expectedHmac, 'hex');
    return crypto.subtle.verify(
      'HMAC',
      key,
      sig,
      enc.encode(`${password}:${timestamp}`)
    );
  } catch {
    return false;
  }
}

export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // 길이 노출로 인한 타이밍 공격은 비밀번호가 같은 길이일 때만 위협적이므로
  // 길이가 다르면 조기 반환 대신 동일한 시간을 소비하도록 패딩
  const inputBuf = new TextEncoder().encode(input.padEnd(Math.max(input.length, expected.length)));
  const expectedBuf = new TextEncoder().encode(expected.padEnd(Math.max(input.length, expected.length)));
  let diff = 0;
  for (let i = 0; i < inputBuf.length; i++) {
    diff |= inputBuf[i] ^ expectedBuf[i];
  }
  return diff === 0 && input.length === expected.length;
}

export const SESSION_COOKIE_NAME = 'admin_session';
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 8;
