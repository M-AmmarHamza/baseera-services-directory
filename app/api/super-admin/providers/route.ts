import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import {
  verifyAdminToken,
  ADMIN_COOKIE_NAME,
  isModeratorOrAbove,
  isSuperAdmin,
  canDelete,
} from '@/lib/admin-auth';
import {
  SEED_PROVIDERS,
  Provider,
  localProvidersOverrides,
  localImportedProviders,
  getNextPublicId,
  syncPublicIdCounter,
  CITIES,
} from '@/lib/db';
import { generateEnglishSlug } from '@/lib/transliterate';
import { recordAuditLog } from '@/lib/audit';
import {
  ProviderCreateSchema,
  ProviderUpdateSchema,
} from '@/lib/super-admin-schemas';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid, session } = await verifyAdminToken(token);
  if (!valid || !isModeratorOrAbove(session)) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin or Moderator access required.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const statusFilter = searchParams.get('status') || 'all';
  const seoFilter = searchParams.get('seo') || 'all';
  const featuredFilter = searchParams.get('featured') || 'all';
  const verifiedFilter = searchParams.get('verified') || 'all';
  const premiumFilter = searchParams.get('premium') || 'all';
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
        allProviders = data.map((p) => {
          const rawPublicId =
            p.publicId !== undefined && p.publicId !== null
              ? Number(p.publicId)
              : p.public_id !== undefined && p.public_id !== null
              ? Number(p.public_id)
              : undefined;

          if (rawPublicId) syncPublicIdCounter(rawPublicId);

          const rawStatus = p.status || (p.is_verified ? 'published' : 'pending');
          const normalizedStatus =
            rawStatus === 'approved' ? 'published' : rawStatus === 'rejected' ? 'suspended' : rawStatus;

          return {
            id: p.id,
            publicId: rawPublicId,
            name: p.name,
            fullName: p.name,
            slug: p.slug,
            trade_title: p.trade_title || p.name,
            category_id: p.category_id,
            categoryId: p.category_id,
            city_slug: p.cities?.slug || p.city_id || 'karachi',
            cityId: p.cities?.slug || p.city_id || 'karachi',
            cityName: p.cities?.name || p.city_id || 'Karachi',
            country_code: p.countries?.code || p.country_id || 'pk',
            district: p.district || '',
            target_areas: Array.isArray(p.service_area) ? p.service_area : (p.target_areas || []),
            whatsapp_number: p.whatsapp_number,
            whatsappNumber: p.whatsapp_number,
            phone_number: p.phone_number || p.whatsapp_number,
            status: normalizedStatus,
            seo_index: Boolean(p.seo_index),
            is_verified: Boolean(p.is_verified),
            is_featured: Boolean(p.is_featured),
            is_available: Boolean(p.is_available),
            is_premium: Boolean(p.is_premium),
            avatar_url: p.avatar_url || p.profile_picture || '',
            profile_picture: p.profile_picture || p.avatar_url || '',
            bio: p.bio || p.short_bio || '',
            short_bio: p.short_bio || p.bio || '',
            starting_price: p.starting_price || 0,
            visiting_charges: p.starting_price || 0,
            experience: p.experience || '5+ Years',
            response_time: p.response_time || '15 mins',
            gallery_images: p.gallery_images || [],
            certificates: p.certificates || [],
            google_map_url: p.google_map_url || '',
            rating: p.rating || 5.0,
            review_count: p.review_count || 1,
            total_leads: p.total_leads || 0,
            profile_views: p.profile_views || 0,
            whatsapp_clicks: p.whatsapp_clicks || 0,
            created_at: p.created_at || new Date().toISOString(),
          };
        });
      }
    } catch (err) {
      console.warn('Supabase fetch failed in super-admin providers:', err);
    }
  }

  // Fallback to local memory / seed data if Supabase is offline or empty
  if (allProviders.length === 0) {
    allProviders = [...SEED_PROVIDERS, ...localImportedProviders].map((p, idx) => {
      const override = localProvidersOverrides.get(p.id) || localProvidersOverrides.get(p.slug) || {};
      if ((override as any)._deleted) return null;

      const rawStatus = (p as any).status || (idx === 1 ? 'pending' : idx === 3 ? 'suspended' : 'published');
      const normalizedStatus =
        rawStatus === 'approved' ? 'published' : rawStatus === 'rejected' ? 'suspended' : rawStatus;

      const baseStatus = (override as any).status || normalizedStatus;
      const baseSeo = (override as any).seo_index !== undefined ? Boolean((override as any).seo_index) : (baseStatus === 'published');
      const baseFeatured = (override as any).is_featured !== undefined ? Boolean((override as any).is_featured) : (idx === 0 || idx === 2);
      const baseVerified = (override as any).is_verified !== undefined ? Boolean((override as any).is_verified) : p.is_verified;
      const basePremium = (override as any).is_premium !== undefined ? Boolean((override as any).is_premium) : Boolean(p.is_premium || idx < 3);

      const assignedPublicId = p.publicId || (override as any).publicId || (1001 + idx);
      syncPublicIdCounter(assignedPublicId);

      return {
        id: p.id,
        publicId: assignedPublicId,
        name: (override as any).name || (override as any).fullName || p.name,
        fullName: (override as any).name || (override as any).fullName || p.name,
        slug: (override as any).slug || p.slug,
        trade_title: (override as any).trade_title || p.trade_title || p.name,
        category_id: (override as any).category_id || p.category_id,
        categoryId: (override as any).category_id || p.category_id,
        city_slug: (override as any).city_slug || p.city_slug,
        cityId: (override as any).city_slug || p.city_slug,
        cityName: p.city_slug.charAt(0).toUpperCase() + p.city_slug.slice(1),
        country_code: p.country_code || 'pk',
        district: p.district || '',
        target_areas: (override as any).target_areas || p.target_areas || p.service_area || [],
        whatsapp_number: (override as any).whatsapp_number || (override as any).whatsappNumber || p.whatsapp_number,
        whatsappNumber: (override as any).whatsapp_number || (override as any).whatsappNumber || p.whatsapp_number,
        phone_number: (override as any).phone_number || p.phone_number || p.whatsapp_number,
        status: baseStatus,
        seo_index: baseSeo,
        is_verified: baseVerified,
        is_featured: baseFeatured,
        is_available: baseStatus === 'published',
        is_premium: basePremium,
        avatar_url: (override as any).avatar_url || (override as any).profile_picture || p.avatar_url || p.profile_picture || '',
        profile_picture: (override as any).profile_picture || (override as any).avatar_url || p.profile_picture || p.avatar_url || '',
        bio: (override as any).bio || (override as any).short_bio || p.bio || p.short_bio || '',
        short_bio: (override as any).short_bio || (override as any).bio || p.short_bio || p.bio || '',
        starting_price: (override as any).starting_price || p.starting_price || 0,
        visiting_charges: (override as any).visiting_charges || (override as any).starting_price || p.starting_price || 0,
        experience: (override as any).experience || '8+ Years',
        response_time: (override as any).response_time || '15 mins',
        gallery_images: (override as any).gallery_images || p.gallery_images || [],
        certificates: (override as any).certificates || p.certificates || [],
        google_map_url: (override as any).google_map_url || p.google_map_url || '',
        rating: p.rating || 5.0,
        review_count: p.review_count || 1,
        total_leads: p.total_leads || 0,
        profile_views: (override as any).profile_views || p.profile_views || 120,
        whatsapp_clicks: (override as any).whatsapp_clicks || p.whatsapp_clicks || 34,
        created_at: (p as any).created_at || '2026-03-01T00:00:00.000Z',
      };
    }).filter(Boolean);
  }

  // Summary KPI Calculations
  const stats = {
    total: allProviders.length,
    published: allProviders.filter((p) => p.status === 'published').length,
    pending: allProviders.filter((p) => p.status === 'pending').length,
    suspended: allProviders.filter((p) => p.status === 'suspended').length,
    seoIndexed: allProviders.filter((p) => p.seo_index).length,
    featured: allProviders.filter((p) => p.is_featured).length,
    verified: allProviders.filter((p) => p.is_verified).length,
    premium: allProviders.filter((p) => p.is_premium).length,
  };

  // Filter Pipeline
  let filtered = [...allProviders];

  if (statusFilter !== 'all') {
    filtered = filtered.filter((p) => p.status === statusFilter);
  }
  if (seoFilter !== 'all') {
    filtered = filtered.filter((p) => (seoFilter === 'indexed' ? p.seo_index : !p.seo_index));
  }
  if (featuredFilter !== 'all') {
    filtered = filtered.filter((p) => (featuredFilter === 'featured' ? p.is_featured : !p.is_featured));
  }
  if (verifiedFilter !== 'all') {
    filtered = filtered.filter((p) => (verifiedFilter === 'verified' ? p.is_verified : !p.is_verified));
  }
  if (premiumFilter !== 'all') {
    filtered = filtered.filter((p) => (premiumFilter === 'premium' ? p.is_premium : !p.is_premium));
  }
  if (categoryFilter !== 'all') {
    filtered = filtered.filter(
      (p) => (p.category_id || p.categoryId || '').toLowerCase() === categoryFilter
    );
  }
  if (cityFilter !== 'all') {
    filtered = filtered.filter(
      (p) => (p.city_slug || p.cityId || p.cityName || '').toLowerCase() === cityFilter
    );
  }

  // Search Filter: Searches #PublicID (1001+), Name, Trade Title, WhatsApp, City, Category
  if (searchQuery) {
    const cleanSearchId = searchQuery.replace(/^#/, '').trim();
    const isIdQuery = /^\d+$/.test(cleanSearchId);

    filtered = filtered.filter((p) => {
      const matchesPublicId = p.publicId !== undefined && String(p.publicId) === cleanSearchId;
      const partialPublicId = p.publicId !== undefined && String(p.publicId).includes(cleanSearchId);

      return (
        matchesPublicId ||
        (isIdQuery && partialPublicId) ||
        p.name?.toLowerCase().includes(searchQuery) ||
        p.fullName?.toLowerCase().includes(searchQuery) ||
        p.trade_title?.toLowerCase().includes(searchQuery) ||
        p.slug?.toLowerCase().includes(searchQuery) ||
        p.whatsapp_number?.toLowerCase().includes(searchQuery) ||
        p.category_id?.toLowerCase().includes(searchQuery) ||
        p.city_slug?.toLowerCase().includes(searchQuery) ||
        p.cityName?.toLowerCase().includes(searchQuery)
      );
    });

    if (isIdQuery) {
      filtered.sort((a, b) => {
        const aExact = a.publicId !== undefined && String(a.publicId) === cleanSearchId ? 1 : 0;
        const bExact = b.publicId !== undefined && String(b.publicId) === cleanSearchId ? 1 : 0;
        return bExact - aExact;
      });
    }
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedProviders = filtered.slice(startIndex, startIndex + limit);

  return NextResponse.json({
    success: true,
    providers: paginatedProviders,
    total,
    page,
    limit,
    totalPages,
    stats,
  });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid, session } = await verifyAdminToken(token);
  if (!valid || !isModeratorOrAbove(session)) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin or Moderator access required.' }, { status: 401 });
  }

  try {
    const rawBody = await req.json();
    const parseResult = ProviderCreateSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const publicId = getNextPublicId();
    const baseSlug = generateEnglishSlug(data.fullName) || 'service-provider';
    const finalSlug = `${baseSlug}-${publicId}`;

    const targetAreasArray = Array.isArray(data.target_areas)
      ? data.target_areas
      : typeof data.target_areas === 'string'
      ? data.target_areas.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const certificatesArray = Array.isArray(data.certificates)
      ? data.certificates
      : typeof data.certificates === 'string'
      ? data.certificates.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const cityRecord = CITIES.find(
      (c) => c.slug.toLowerCase() === data.cityId.toLowerCase()
    );
    const resolvedCountryCode = cityRecord?.countryCode || 'pk';

    const newProvider: Provider = {
      id: crypto.randomUUID(),
      publicId,
      name: data.fullName,
      slug: finalSlug,
      profile_type: 'individual',
      category_id: data.categoryId,
      trade_title: data.trade_title,
      city_slug: data.cityId,
      country_code: resolvedCountryCode,
      district: targetAreasArray[0] || '',
      service_area: targetAreasArray,
      target_areas: targetAreasArray,
      whatsapp_number: data.whatsappNumber,
      phone_number: data.phoneNumber || data.whatsappNumber,
      avatar_url: data.profile_picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      profile_picture: data.profile_picture || '',
      short_bio: data.bio?.slice(0, 160) || `${data.trade_title} serving ${data.cityId}.`,
      bio: data.bio || '',
      starting_price: data.visiting_charges || 0,
      rating: 5.0,
      review_count: 0,
      total_leads: 0,
      is_verified: data.is_verified,
      is_available: data.status === 'published',
      is_premium: data.is_premium,
      is_featured: data.is_featured,
      seo_index: data.seo_index,
      status: data.status,
      gallery_images: data.gallery_images || [],
      certificates: certificatesArray,
      google_map_url: data.google_map_url || '',
      profile_views: 0,
      whatsapp_clicks: 0,
    };

    // Store in-memory
    localImportedProviders.unshift(newProvider);
    localProvidersOverrides.set(newProvider.id, newProvider);

    // Persist to Supabase if connected
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        await supabase.from('providers').insert({
          id: newProvider.id,
          public_id: publicId,
          name: newProvider.name,
          slug: newProvider.slug,
          profile_type: newProvider.profile_type,
          category_id: newProvider.category_id,
          trade_title: newProvider.trade_title,
          city_id: newProvider.city_slug,
          country_id: newProvider.country_code,
          district: newProvider.district,
          service_area: newProvider.service_area,
          whatsapp_number: newProvider.whatsapp_number,
          phone_number: newProvider.phone_number,
          avatar_url: newProvider.avatar_url,
          profile_picture: newProvider.profile_picture,
          short_bio: newProvider.short_bio,
          bio: newProvider.bio,
          starting_price: newProvider.starting_price,
          status: newProvider.status,
          seo_index: newProvider.seo_index,
          is_verified: newProvider.is_verified,
          is_featured: newProvider.is_featured,
          is_premium: newProvider.is_premium,
          is_available: newProvider.is_available,
          gallery_images: newProvider.gallery_images,
          certificates: newProvider.certificates,
          google_map_url: newProvider.google_map_url,
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Supabase provider insert note:', err);
      }
    }

    // Record in AuditLog
    await recordAuditLog({
      adminId: session.email,
      adminEmail: session.email,
      action: 'CREATE_PROVIDER',
      entityType: 'PROVIDER',
      entityId: newProvider.id,
      details: {
        publicId,
        fullName: data.fullName,
        slug: finalSlug,
        city: data.cityId,
        category: data.categoryId,
        status: data.status,
      },
    });

    revalidatePath('/[lang]/super-admin/providers', 'page');
    revalidatePath('/[lang]/admin/providers', 'page');
    try {
      revalidatePath('/sitemap.xml');
      revalidatePath('/', 'layout');
    } catch (e) {
      // Safe fallback
    }

    return NextResponse.json({
      success: true,
      message: 'Provider created successfully',
      provider: newProvider,
    });
  } catch (err: any) {
    console.error('Create provider error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to create provider' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid, session } = await verifyAdminToken(token);
  if (!valid || !isModeratorOrAbove(session)) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin or Moderator access required.' }, { status: 401 });
  }

  try {
    const rawBody = await req.json();
    const parseResult = ProviderUpdateSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { id, fullName, ...otherUpdates } = parseResult.data;
    const updates: Record<string, any> = { ...otherUpdates };

    if (fullName) {
      updates.name = fullName;
      updates.fullName = fullName;
    }

    if (updates.target_areas && typeof updates.target_areas === 'string') {
      updates.target_areas = updates.target_areas.split(',').map((s: string) => s.trim()).filter(Boolean);
      updates.service_area = updates.target_areas;
    }

    if (updates.certificates && typeof updates.certificates === 'string') {
      updates.certificates = updates.certificates.split(',').map((s: string) => s.trim()).filter(Boolean);
    }

    if (updates.visiting_charges !== undefined) {
      updates.starting_price = updates.visiting_charges;
    }

    if (updates.whatsappNumber) {
      updates.whatsapp_number = updates.whatsappNumber;
    }

    if (updates.cityId) {
      updates.city_slug = updates.cityId;
    }

    if (updates.categoryId) {
      updates.category_id = updates.categoryId;
    }

    if (updates.status !== undefined) {
      if (updates.status === 'published') updates.is_available = true;
      if (updates.status === 'suspended') updates.is_available = false;
    }

    // Persist in memory override
    const existingOverride = localProvidersOverrides.get(id) || {};
    localProvidersOverrides.set(id, { ...existingOverride, ...updates });

    // Update if in local imported list
    const foundIndex = localImportedProviders.findIndex((p) => p.id === id);
    if (foundIndex !== -1) {
      localImportedProviders[foundIndex] = { ...localImportedProviders[foundIndex], ...updates };
    }

    // Update in Supabase
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        const supabaseUpdates: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };

        if (updates.name) supabaseUpdates.name = updates.name;
        if (updates.trade_title) supabaseUpdates.trade_title = updates.trade_title;
        if (updates.whatsapp_number) supabaseUpdates.whatsapp_number = updates.whatsapp_number;
        if (updates.phone_number) supabaseUpdates.phone_number = updates.phone_number;
        if (updates.city_slug) supabaseUpdates.city_id = updates.city_slug;
        if (updates.category_id) supabaseUpdates.category_id = updates.category_id;
        if (updates.bio !== undefined) {
          supabaseUpdates.bio = updates.bio;
          supabaseUpdates.short_bio = updates.bio.slice(0, 160);
        }
        if (updates.target_areas) supabaseUpdates.service_area = updates.target_areas;
        if (updates.starting_price !== undefined) supabaseUpdates.starting_price = updates.starting_price;
        if (updates.status !== undefined) supabaseUpdates.status = updates.status;
        if (updates.seo_index !== undefined) supabaseUpdates.seo_index = updates.seo_index;
        if (updates.is_verified !== undefined) supabaseUpdates.is_verified = updates.is_verified;
        if (updates.is_featured !== undefined) supabaseUpdates.is_featured = updates.is_featured;
        if (updates.is_premium !== undefined) supabaseUpdates.is_premium = updates.is_premium;
        if (updates.is_available !== undefined) supabaseUpdates.is_available = updates.is_available;
        if (updates.profile_picture !== undefined) {
          supabaseUpdates.profile_picture = updates.profile_picture;
          supabaseUpdates.avatar_url = updates.profile_picture;
        }
        if (updates.gallery_images !== undefined) supabaseUpdates.gallery_images = updates.gallery_images;
        if (updates.certificates !== undefined) supabaseUpdates.certificates = updates.certificates;
        if (updates.google_map_url !== undefined) supabaseUpdates.google_map_url = updates.google_map_url;

        await supabase.from('providers').update(supabaseUpdates).eq('id', id);
      } catch (err) {
        console.warn('Supabase provider update note:', err);
      }
    }

    // Audit log
    await recordAuditLog({
      adminId: session.email,
      adminEmail: session.email,
      action: 'UPDATE_PROVIDER',
      entityType: 'PROVIDER',
      entityId: id,
      details: updates,
    });

    revalidatePath('/[lang]/super-admin/providers', 'page');
    revalidatePath('/[lang]/admin/providers', 'page');
    try {
      revalidatePath('/sitemap.xml');
      revalidatePath('/', 'layout');
    } catch (e) {
      // Safe fallback
    }

    return NextResponse.json({
      success: true,
      message: 'Provider updated successfully',
      updates,
    });
  } catch (err: any) {
    console.error('Update provider error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to update provider' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid, session } = await verifyAdminToken(token);

  if (!valid || !isModeratorOrAbove(session)) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin or Moderator access required.' }, { status: 401 });
  }

  // RBAC Hard Rule: Hard deletes are strictly restricted to SUPER_ADMIN
  if (!canDelete(session)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden: Hard delete permissions are strictly restricted to SUPER_ADMIN role.',
      },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  let id = searchParams.get('id');

  if (!id) {
    try {
      const body = await req.json();
      id = body?.id;
    } catch {
      // ignore JSON parse if no body
    }
  }

  if (!id) {
    return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
  }

  // Delete from in-memory
  localProvidersOverrides.set(id, {
    _deleted: true,
    status: 'suspended',
    is_available: false,
  } as any);

  const idx = localImportedProviders.findIndex((p) => p.id === id);
  if (idx !== -1) {
    localImportedProviders.splice(idx, 1);
  }

  // Delete from Supabase
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      await supabase.from('providers').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase provider delete note:', err);
    }
  }

  // Record Audit Log
  await recordAuditLog({
    adminId: session.email,
    adminEmail: session.email,
    action: 'DELETE_PROVIDER',
    entityType: 'PROVIDER',
    entityId: id,
    details: {
      deletedBy: session.email,
      role: session.role,
    },
  });

  revalidatePath('/[lang]/super-admin/providers', 'page');
  revalidatePath('/[lang]/admin/providers', 'page');
  try {
    revalidatePath('/sitemap.xml');
    revalidatePath('/', 'layout');
  } catch (e) {
    // Safe fallback
  }

  return NextResponse.json({
    success: true,
    message: 'Provider permanently deleted.',
  });
}
