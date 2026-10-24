import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/admin-auth';
import { localProvidersOverrides } from '@/lib/db';
import { sanitizeText } from '@/lib/security';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: NextRequest) {
  // Enforce Admin Authentication (OWASP A01: Broken Access Control)
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid } = await verifyAdminToken(token);
  if (!valid) {
    return NextResponse.json(
      { error: 'Unauthorized: Admin authentication required.' },
      { status: 401 }
    );
  }

  try {
    const { provider_id } = await req.json();
    const cleanId = sanitizeText(provider_id);

    if (!cleanId) {
      return NextResponse.json({ error: 'provider_id is required' }, { status: 400 });
    }

    // Update in local memory overrides
    const existing = localProvidersOverrides.get(cleanId) || {};
    localProvidersOverrides.set(cleanId, {
      ...existing,
      status: 'published',
      is_verified: true,
      seo_index: true,
    });

    if (SUPABASE_URL && SUPABASE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

      // Update is_verified = true and status = 'published' in providers table
      const { data, error } = await supabase
        .from('providers')
        .update({
          is_verified: true,
          status: 'published',
          seo_index: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cleanId)
        .select();

      if (error) {
        console.error('Approval DB error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, provider: data });
    }

    return NextResponse.json({
      success: true,
      provider: { id: cleanId, is_verified: true, status: 'published' },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
