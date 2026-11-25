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

export type UserRole = 'SUPER_ADMIN' | 'MODERATOR' | 'PROVIDER';

export interface AdminSession {
  email: string;
  role: UserRole | 'admin' | 'moderator';
  exp: number; // UNIX timestamp in ms
  userId?: string;
  name?: string;
}

/**
 * Normalizes any role representation into one of the canonical UserRole enum values.
 */
export function normalizeRole(role?: string): UserRole {
  if (!role) return 'PROVIDER';
  const upper = role.toUpperCase();
  if (upper === 'SUPER_ADMIN' || upper === 'ADMIN') return 'SUPER_ADMIN';
  if (upper === 'MODERATOR') return 'MODERATOR';
  return 'PROVIDER';
}

/**
 * Returns true if the session belongs to a SUPER_ADMIN.
 */
export function isSuperAdmin(session?: AdminSession | null): boolean {
  if (!session) return false;
  return normalizeRole(session.role) === 'SUPER_ADMIN';
}

/**
 * Returns true if the session belongs to a SUPER_ADMIN or MODERATOR.
 */
export function isModeratorOrAbove(session?: AdminSession | null): boolean {
  if (!session) return false;
  const role = normalizeRole(session.role);
  return role === 'SUPER_ADMIN' || role === 'MODERATOR';
}

/**
 * RBAC Gate: Only SUPER_ADMIN is permitted to perform hard deletes or modify sensitive platform settings.
 */
export function canDelete(session?: AdminSession | null): boolean {
  return isSuperAdmin(session);
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
  role: UserRole | 'admin' | 'moderator' = 'SUPER_ADMIN',
  durationMs: number = 7 * 24 * 60 * 60 * 1000,
  extra?: { userId?: string; name?: string }
): Promise<string> {
  const payload: AdminSession = {
    email: email.trim().toLowerCase(),
    role,
    exp: Date.now() + durationMs,
    ...(extra?.userId ? { userId: extra.userId } : {}),
    ...(extra?.name ? { name: extra.name } : {}),
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

/**
 * Server-side session extractor for Server Actions and Route Handlers.
 */
export async function getAdminSessionFromCookies(): Promise<{ valid: boolean; session?: AdminSession }> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    return await verifyAdminToken(token);
  } catch (err) {
    return { valid: false };
  }
}
