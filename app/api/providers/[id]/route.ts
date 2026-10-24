import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SEED_PROVIDERS, localProvidersOverrides } from '@/lib/db';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = (id || '').replace(/[^a-zA-Z0-9_-]/g, '').trim();
    if (!cleanId) {
      return NextResponse.json({ error: 'Valid provider ID or slug is required' }, { status: 400 });
    }

    let updatedViews = 1;

    // 1. Update in-memory local provider overrides
    const override = localProvidersOverrides.get(cleanId) || {};
    override.profile_views = (override.profile_views || 20) + 1;
    localProvidersOverrides.set(cleanId, override);
    updatedViews = override.profile_views;

    // Also update seed provider reference if matched
    const seed = SEED_PROVIDERS.find((p) => p.id === cleanId || p.slug === cleanId);
    if (seed) {
      seed.profile_views = (seed.profile_views || 20) + 1;
      updatedViews = seed.profile_views;
    }

    // 2. Increment in Supabase database
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

        // Fetch current profile_views using safe sanitized identifier
        const { data: existing } = await supabase
          .from('providers')
          .select('id, profile_views')
          .or(`id.eq.${cleanId},slug.eq.${cleanId}`)
          .maybeSingle();

        if (existing) {
          const newViews = (existing.profile_views || 0) + 1;
          const { error: updateErr } = await supabase
            .from('providers')
            .update({ profile_views: newViews })
            .eq('id', existing.id);

          if (!updateErr) {
            updatedViews = newViews;
          }
        }
      } catch (dbErr) {
        console.warn('Profile view increment DB error:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      provider_id: id,
      profile_views: updatedViews,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to increment profile views' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cleanId = (id || '').replace(/[^a-zA-Z0-9_-]/g, '').trim();
  const shouldIncrement = req.nextUrl.searchParams.get('inc') === '1' || req.nextUrl.searchParams.get('increment') === 'true';

  if (shouldIncrement) {
    return POST(req, { params });
  }

  // Return provider details
  const seed = SEED_PROVIDERS.find((p) => p.id === cleanId || p.slug === cleanId);
  const override = localProvidersOverrides.get(cleanId);
  const views = override?.profile_views ?? seed?.profile_views ?? 25;

  return NextResponse.json({
    provider_id: cleanId,
    profile_views: views,
  });
}
