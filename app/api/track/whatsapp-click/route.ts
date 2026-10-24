import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SEED_PROVIDERS, localProvidersOverrides } from '@/lib/db';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      const text = await req.text();
      try {
        body = JSON.parse(text);
      } catch {
        body = {};
      }
    }

    const providerId = body.provider_id || body.providerId || body.id;
    const clickType = body.click_type || body.clickType || 'whatsapp';

    if (!providerId) {
      return NextResponse.json(
        { error: 'provider_id is required' },
        { status: 400 }
      );
    }

    let updatedClicks = 1;

    // 1. Update in-memory local override
    const override = localProvidersOverrides.get(providerId) || {};
    override.whatsapp_clicks = (override.whatsapp_clicks || 0) + 1;
    override.total_leads = (override.total_leads || 0) + 1;
    localProvidersOverrides.set(providerId, override);
    updatedClicks = override.whatsapp_clicks;

    // Also update seed provider if matched
    const seed = SEED_PROVIDERS.find((p) => p.id === providerId || p.slug === providerId);
    if (seed) {
      seed.whatsapp_clicks = (seed.whatsapp_clicks || seed.total_leads || 0) + 1;
      seed.total_leads = (seed.total_leads || 0) + 1;
      updatedClicks = seed.whatsapp_clicks;
    }

    // 2. Increment in Supabase database
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

        const { data: existing } = await supabase
          .from('providers')
          .select('id, whatsapp_clicks, total_leads')
          .or(`id.eq.${providerId},slug.eq.${providerId}`)
          .maybeSingle();

        if (existing) {
          const newClicks = (existing.whatsapp_clicks ?? existing.total_leads ?? 0) + 1;
          const { error: updateErr } = await supabase
            .from('providers')
            .update({
              whatsapp_clicks: newClicks,
              total_leads: newClicks,
            })
            .eq('id', existing.id);

          if (!updateErr) {
            updatedClicks = newClicks;
          }
        }

        // Also record outbound lead event
        const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
        await supabase.from('lead_clicks').insert({
          provider_id: existing?.id || providerId,
          click_type: clickType,
          client_ip: clientIp.slice(0, 50),
        });
      } catch (dbErr) {
        console.warn('WhatsApp click tracking DB note:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      provider_id: providerId,
      whatsapp_clicks: updatedClicks,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to track WhatsApp click' },
      { status: 500 }
    );
  }
}
