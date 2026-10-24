'use server';

import { createClient } from '@supabase/supabase-js';
import { localProvidersOverrides } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export interface UpdateProviderParams {
  id: string;
  status?: 'pending' | 'published' | 'suspended';
  seo_index?: boolean;
  is_featured?: boolean;
  is_verified?: boolean;
}

export async function updateProviderAction(params: UpdateProviderParams) {
  const { id, status, seo_index, is_featured, is_verified } = params;
  if (!id) return { success: false, error: 'Provider ID is required' };

  const updates: Record<string, any> = {};
  if (status !== undefined) {
    updates.status = status;
    if (status === 'published') updates.is_available = true;
    if (status === 'suspended') updates.is_available = false;
  }
  if (seo_index !== undefined) updates.seo_index = Boolean(seo_index);
  if (is_featured !== undefined) updates.is_featured = Boolean(is_featured);
  if (is_verified !== undefined) updates.is_verified = Boolean(is_verified);

  // In-memory override update
  const existing = localProvidersOverrides.get(id) || {};
  localProvidersOverrides.set(id, { ...existing, ...updates });

  // Supabase update
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      await supabase
        .from('providers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch (e: any) {
      console.warn('Supabase update note in action:', e?.message);
    }
  }

  revalidatePath('/[lang]/admin/providers', 'page');
  return { success: true, updates };
}
