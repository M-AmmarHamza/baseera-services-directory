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

    // Update is_verified = true in providers table
    const { data, error } = await supabase
      .from('providers')
      .update({ is_verified: true, updated_at: new Date().toISOString() })
      .eq('id', provider_id)
      .select();

    if (error) {
      console.error('Approval DB error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, provider: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
