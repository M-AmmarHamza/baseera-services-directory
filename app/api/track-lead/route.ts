import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jkdzlunnrtfdmhgsmxyu.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ZWex7txUSkCUoSmlDdDQvg__cT_i9gI';

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

    const {
      provider_id,
      category_id,
      city_id,
      click_type = 'whatsapp',
    } = body;

    if (!provider_id) {
      return NextResponse.json(
        { error: 'provider_id is required' },
        { status: 400 }
      );
    }

    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    const userAgent = req.headers.get('user-agent') || '';

    if (SUPABASE_URL && SUPABASE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

      // 1. Try to record in lead_clicks table
      const { error: clickError } = await supabase.from('lead_clicks').insert({
        provider_id,
        category_id: category_id || null,
        city_id: city_id || null,
        click_type: click_type || 'whatsapp',
        client_ip: clientIp.slice(0, 50),
        user_agent: userAgent.slice(0, 200),
      });

      // 2. If lead_clicks table is not yet migrated, fallback to existing leads table
      if (clickError) {
        console.warn('lead_clicks insert notice (falling back to leads):', clickError.message);
        try {
          await supabase.from('leads').insert({
            provider_id,
            lead_type: click_type === 'call' ? 'call' : 'whatsapp',
            service_requested: category_id || null,
            client_ip: clientIp.slice(0, 50),
          });
        } catch {
          // Fallback error safe to ignore
        }
      }

      // 3. Increment provider total_leads if RPC or direct update is available
      try {
        await supabase.rpc('record_lead_and_increment', {
          p_provider_id: provider_id,
          p_category_id: category_id || null,
          p_city_id: city_id || null,
          p_click_type: click_type || 'whatsapp',
        });
      } catch {
        // RPC might not exist yet; safe to ignore
      }
    }

    return NextResponse.json({
      success: true,
      logged: {
        provider_id,
        category_id,
        city_id,
        click_type,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('Lead click logging exception:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to record lead' },
      { status: 500 }
    );
  }
}
