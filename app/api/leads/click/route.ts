import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jkdzlunnrtfdmhgsmxyu.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ZWex7txUSkCUoSmlDdDQvg__cT_i9gI';

export async function POST(req: NextRequest) {
  try {
    const { provider_id } = await req.json();

    if (!provider_id) {
      return NextResponse.json({ error: 'provider_id is required' }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // 1. Insert into lead_clicks table
    const { error: clickError } = await supabase.from('lead_clicks').insert({
      provider_id,
    });

    // 2. Fallback to existing leads table if lead_clicks table is not yet migrated
    if (clickError) {
      await supabase.from('leads').insert({
        provider_id,
        lead_type: 'whatsapp',
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Lead click logging error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
