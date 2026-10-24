import { NextResponse } from 'next/server';

/**
 * Baseera API Rate Limiter
 * Token-bucket / sliding window in-memory rate limiting with automatic TTL cleanup.
 * Defends against DoS attacks, bot spam, and fake click inflation.
 */

interface RateLimitRecord {
  timestamps: number[];
}

// Global in-memory storage for IP rate limit counters
const rateLimitMap = new Map<string, RateLimitRecord>();

// Periodic cleanup every 5 minutes to prevent memory leaks
let lastCleanup = Date.now();
function cleanupExpiredRecords(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < 60000) return; // Clean at most once a minute
  lastCleanup = now;

  for (const [key, record] of rateLimitMap.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
    if (record.timestamps.length === 0) {
      rateLimitMap.delete(key);
    }
  }
}

/**
 * Extracts client IP from standard proxy headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    // Return first IP in comma-separated list
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp.trim();
  }
  return '127.0.0.1';
}

export interface RateLimitOptions {
  limit: number; // Max requests allowed
  windowSec: number; // Time window in seconds
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number; // UNIX timestamp in ms when window resets
}

/**
 * Checks whether an IP has exceeded its allowed quota for a specific action.
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions = { limit: 60, windowSec: 60 }
): RateLimitResult {
  const { limit, windowSec } = options;
  const windowMs = windowSec * 1000;
  const now = Date.now();

  cleanupExpiredRecords(windowMs);

  let record = rateLimitMap.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(key, record);
  }

  // Filter timestamps within current sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const oldestTimestamp = record.timestamps[0];
    const resetTime = oldestTimestamp + windowMs;
    return {
      success: false,
      limit,
      remaining: 0,
      resetTime,
    };
  }

  record.timestamps.push(now);
  const remaining = Math.max(0, limit - record.timestamps.length);
  const resetTime = now + windowMs;

  return {
    success: true,
    limit,
    remaining,
    resetTime,
  };
}

/**
 * Helper to construct an HTTP 429 Too Many Requests response with standard Retry-After headers.
 */
export function rateLimitExceededResponse(result: RateLimitResult, customMessage?: string) {
  const retryAfterSec = Math.max(1, Math.ceil((result.resetTime - Date.now()) / 1000));
  return NextResponse.json(
    {
      error: customMessage || 'Too many requests. Please slow down and try again shortly.',
      retryAfterSeconds: retryAfterSec,
    },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfterSec.toString(),
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
      },
    }
  );
}
