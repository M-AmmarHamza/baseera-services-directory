/**
 * Baseera Admin Authentication & Session Management
 * Universal HMAC-SHA256 token verification using Web Crypto API.
 * Compatible with Next.js Edge Middleware and Node.js Server Runtimes.
 */

export const ADMIN_COOKIE_NAME = 'baseera_admin_token';
export const ADMIN_SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET || 'baseera-super-secret-admin-session-salt-2026-secure';

export const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@baseera.com';
export const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'BaseeraAdmin2026!';

export interface AdminSession {
  email: string;
  role: 'admin' | 'moderator';
  exp: number; // UNIX timestamp in ms
}

async function getHmacKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(ADMIN_SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

/**
 * Creates a cryptographically signed session token for authenticated admin users.
 * Valid for 7 days by default.
 */
export async function createAdminToken(
  email: string,
  role: 'admin' | 'moderator' = 'admin',
  durationMs: number = 7 * 24 * 60 * 60 * 1000
): Promise<string> {
  const payload: AdminSession = {
    email: email.trim().toLowerCase(),
    role,
    exp: Date.now() + durationMs,
  };

  const enc = new TextEncoder();
  const payloadStr = JSON.stringify(payload);
  const base64Payload = Buffer.from(payloadStr, 'utf-8').toString('base64url');

  const key = await getHmacKey();
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(base64Payload));
  const hexSignature = bufferToHex(signatureBuffer);

  return `${base64Payload}.${hexSignature}`;
}

/**
 * Verifies the integrity and expiration of an admin session token.
 */
export async function verifyAdminToken(
  token?: string | null
): Promise<{ valid: boolean; session?: AdminSession }> {
  if (!token || typeof token !== 'string') {
    return { valid: false };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false };
  }

  const [base64Payload, hexSignature] = parts;
  if (!base64Payload || !hexSignature) {
    return { valid: false };
  }

  try {
    const key = await getHmacKey();
    const enc = new TextEncoder();
    const signatureBuffer = hexToBuffer(hexSignature);

    const isSignatureValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      enc.encode(base64Payload)
    );

    if (!isSignatureValid) {
      return { valid: false };
    }

    const jsonStr = Buffer.from(base64Payload, 'base64url').toString('utf-8');
    const session: AdminSession = JSON.parse(jsonStr);

    if (Date.now() > session.exp) {
      return { valid: false }; // Expired session
    }

    return { valid: true, session };
  } catch (err) {
    console.warn('Admin token verification error:', err);
    return { valid: false };
  }
}
