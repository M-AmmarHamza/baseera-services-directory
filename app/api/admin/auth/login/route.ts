import { NextRequest, NextResponse } from 'next/server';
import {
  createAdminToken,
  ADMIN_COOKIE_NAME,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
} from '@/lib/admin-auth';
import { getClientIp, checkRateLimit, rateLimitExceededResponse } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  // Anti-Brute Force Rate Limiting (5 attempts / min per IP)
  const clientIp = getClientIp(req);
  const rateLimitResult = checkRateLimit(`admin_login:${clientIp}`, { limit: 5, windowSec: 60 });
  if (!rateLimitResult.success) {
    return rateLimitExceededResponse(
      rateLimitResult,
      'Too many login attempts. Please wait 60 seconds before trying again.'
    );
  }

  try {
    const { email, password } = await req.json();

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    // Verify credentials against admin env/defaults
    const isValidCredentials =
      cleanEmail === DEFAULT_ADMIN_EMAIL.toLowerCase() &&
      cleanPassword === DEFAULT_ADMIN_PASSWORD;

    if (!isValidCredentials) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin email or password.' },
        { status: 401 }
      );
    }

    // Generate signed HMAC session token
    const token = await createAdminToken(cleanEmail, 'admin');

    const res = NextResponse.json({
      success: true,
      message: 'Admin authentication successful.',
      user: {
        email: cleanEmail,
        role: 'admin',
      },
    });

    // Set secure HTTP-only cookie
    res.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return res;
  } catch (err: any) {
    console.error('Admin login error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Authentication error.' },
      { status: 500 }
    );
  }
}
