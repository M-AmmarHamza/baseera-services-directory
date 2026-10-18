import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/admin-auth';
import { SEED_PROVIDERS, Provider, localProvidersOverrides, localImportedProviders } from '@/lib/db';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(req: NextRequest) {
  // Check admin session
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid } = await verifyAdminToken(token);
  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const statusFilter = searchParams.get('status') || 'all'; // all | pending | approved | rejected | suspended
  const searchQuery = (searchParams.get('search') || '').toLowerCase().trim();
  const categoryFilter = (searchParams.get('category') || 'all').toLowerCase().trim();
  const cityFilter = (searchParams.get('city') || 'all').toLowerCase().trim();

  let allProviders: Array<any> = [];

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data, error } = await supabase
        .from('providers')
        .select('*, cities(name, slug), countries(name, code)')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        allProviders = data.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          profile_type: p.profile_type || 'individual',
          category_id: p.category_id,
          trade_title: p.trade_title || p.name,
          city_slug: p.cities?.slug || p.city_id || 'karachi',
          cityName: p.cities?.name || p.city_id || 'Karachi',
          country_code: p.countries?.code || p.country_id || 'pk',
          district: p.district || '',
          whatsapp_number: p.whatsapp_number,
          phone_number: p.phone_number || p.whatsapp_number,
          status: p.status || (p.is_verified ? 'approved' : 'pending'),
          is_verified: Boolean(p.is_verified),
          is_featured: Boolean(p.is_featured),
          is_available: Boolean(p.is_available),
          avatar_url: p.avatar_url,
          starting_price: p.starting_price || 0,
          rating: p.rating || 5.0,
          review_count: p.review_count || 1,
          total_leads: p.total_leads || 0,
          created_at: p.created_at || new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch failed in admin providers, using seed fallback:', err);
    }
  }

  // If Supabase has no providers or is offline, use SEED_PROVIDERS + localImportedProviders
  if (allProviders.length === 0) {
    allProviders = [...SEED_PROVIDERS, ...localImportedProviders].map((p, idx) => {
      const override = localProvidersOverrides.get(p.id) || localProvidersOverrides.get(p.slug) || {};
      const defaultStatus = (p as any).status || (idx === 1 ? 'pending' : idx === 3 ? 'suspended' : 'approved');
      return {
        ...p,
        cityName: p.city_slug ? p.city_slug.charAt(0).toUpperCase() + p.city_slug.slice(1) : 'Karachi',
        status: (override as any).status || defaultStatus,
        is_featured: (override as any).is_featured ?? (idx === 0 || idx === 2),
        is_verified: (override as any).is_verified ?? p.is_verified,
        created_at: (p as any).created_at || new Date(Date.now() - idx * 3600 * 24 * 1000).toISOString(),
        ...override,
      };
    });
  } else {
    // Apply any in-memory local overrides
    allProviders = allProviders.map((p) => {
      const override = localProvidersOverrides.get(p.id) || localProvidersOverrides.get(p.slug);
      return override ? { ...p, ...override } : p;
    });

    // Also prepend local imported providers if not already present in Supabase
    const existingIds = new Set(allProviders.map((p) => p.id || p.slug));
    for (const imp of localImportedProviders) {
      if (!existingIds.has(imp.id) && !existingIds.has(imp.slug)) {
        allProviders.unshift({
          ...imp,
          cityName: imp.city_slug ? imp.city_slug.charAt(0).toUpperCase() + imp.city_slug.slice(1) : 'Karachi',
          created_at: (imp as any).created_at || new Date().toISOString(),
        });
        existingIds.add(imp.id);
      }
    }
  }

  // Filter by status
  let filtered = allProviders;
  if (statusFilter !== 'all') {
    filtered = filtered.filter((p) => {
      const pStatus = (p.status || (p.is_verified ? 'approved' : 'pending')).toLowerCase();
      return pStatus === statusFilter.toLowerCase();
    });
  }

  // Filter by category
  if (categoryFilter !== 'all') {
    filtered = filtered.filter((p) => p.category_id?.toLowerCase() === categoryFilter);
  }

  // Filter by city
  if (cityFilter !== 'all') {
    filtered = filtered.filter(
      (p) => (p.city_slug || p.cityName || '').toLowerCase() === cityFilter
    );
  }

  // Search filter
  if (searchQuery) {
    filtered = filtered.filter((p) => {
      return (
        p.name?.toLowerCase().includes(searchQuery) ||
        p.whatsapp_number?.toLowerCase().includes(searchQuery) ||
        p.category_id?.toLowerCase().includes(searchQuery) ||
        p.city_slug?.toLowerCase().includes(searchQuery) ||
        p.cityName?.toLowerCase().includes(searchQuery)
      );
    });
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedProviders = filtered.slice(startIndex, startIndex + limit);

  return NextResponse.json({
    providers: paginatedProviders,
    total,
    page,
    limit,
    totalPages,
  });
}

export async function PATCH(req: NextRequest) {
  // Check admin session
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid } = await verifyAdminToken(token);
  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status, is_verified, is_featured, is_available } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
    }

    const updates: Record<string, any> = {};

    if (status !== undefined) {
      updates.status = status;
      // Keep is_verified in sync with status
      if (status === 'approved') {
        updates.is_verified = true;
        updates.is_available = true;
      } else if (status === 'rejected' || status === 'suspended') {
        updates.is_verified = false;
        updates.is_available = false;
      } else if (status === 'pending') {
        updates.is_verified = false;
      }
    }

    if (is_verified !== undefined) {
      updates.is_verified = Boolean(is_verified);
      if (updates.status === undefined) {
        updates.status = is_verified ? 'approved' : 'pending';
      }
    }

    if (is_featured !== undefined) {
      updates.is_featured = Boolean(is_featured);
    }

    if (is_available !== undefined) {
      updates.is_available = Boolean(is_available);
    }

    // Persist in local memory override store
    const existingOverride = localProvidersOverrides.get(id) || {};
    localProvidersOverrides.set(id, { ...existingOverride, ...updates });

    // Update in Supabase if available
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        await supabase
          .from('providers')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase provider update note:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Provider updated successfully',
      updates,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  // Check admin session
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid } = await verifyAdminToken(token);
  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
  }

  // Delete from in-memory overrides
  localProvidersOverrides.delete(id);

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      await supabase.from('providers').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase provider delete note:', err);
    }
  }

  return NextResponse.json({ success: true, message: 'Provider deleted' });
}
