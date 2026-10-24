import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  CATEGORIES,
  SEED_PROVIDERS,
  localProvidersOverrides,
  getCategoryName,
  getCategoryBySlug,
  getLocalizedCityName,
  Provider,
} from '@/lib/db';
import {
  isFuzzyMatch,
  normalizeString,
  searchCategoriesSmart,
  CATEGORY_ALIASES,
} from '@/lib/smart-search';
import { transliterate } from '@/lib/transliterate';
import { getClientIp, checkRateLimit, rateLimitExceededResponse } from '@/lib/rate-limit';
import { sanitizeText } from '@/lib/security';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(req: NextRequest) {
  // Rate limiting to prevent bot spam and DoS
  const clientIp = getClientIp(req);
  const rateLimitResult = checkRateLimit(`search:${clientIp}`, { limit: 60, windowSec: 60 });
  if (!rateLimitResult.success) {
    return rateLimitExceededResponse(
      rateLimitResult,
      'Search rate limit exceeded. Please slow down.'
    );
  }

  const { searchParams } = req.nextUrl;
  const rawQuery = sanitizeText(searchParams.get('q') || '').trim();
  const cityFilter = sanitizeText(searchParams.get('city') || '').toLowerCase().trim();
  const countryFilter = sanitizeText(searchParams.get('country') || '').toLowerCase().trim();
  const lang = sanitizeText(searchParams.get('lang') || 'en');
  const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '8', 10)));

  // Fast return for queries shorter than 3 characters (Requirement 1: debounced API calls after 3 characters)
  if (rawQuery.length < 3) {
    return NextResponse.json({
      query: rawQuery,
      providers: [],
      categories: [],
    });
  }

  const normalizedQ = normalizeString(rawQuery);
  const transliteratedQ = normalizeString(transliterate(rawQuery));

  // 1. MATCH CATEGORIES FIRST (Typeahead category suggestions)
  const matchedCategories = searchCategoriesSmart(rawQuery, CATEGORIES).slice(0, 4).map((cat) => ({
    id: cat.id,
    name: getCategoryName(cat, lang),
    icon: cat.icon,
    url: `/${lang}/${countryFilter || 'pk'}/${cityFilter || 'karachi'}/${cat.id}`,
  }));

  // 2. QUERY PROVIDERS (Multi-field simultaneous check & Fuzzy matching)
  // Gather all known providers (Supabase + Local Seeds + Overrides)
  const allProvidersMap = new Map<string, Provider>();

  // A. Add SEED_PROVIDERS & Overrides
  for (const seed of SEED_PROVIDERS) {
    const override = localProvidersOverrides.get(seed.id) || localProvidersOverrides.get(seed.slug);
    const combined = override ? { ...seed, ...override } : { ...seed };
    allProvidersMap.set(combined.slug.toLowerCase(), combined);
  }

  // B. Query Supabase Database if available
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      const cleanTerm = rawQuery.replace(/[%_]/g, '');

      // Check fullName, trade_title, category_id in Supabase
      const { data: dbRows } = await supabase
        .from('providers')
        .select('*, cities!inner(slug,name), countries!inner(code,name)')
        .or(`name.ilike.%${cleanTerm}%,trade_title.ilike.%${cleanTerm}%,category_id.ilike.%${cleanTerm}%,short_bio.ilike.%${cleanTerm}%`)
        .limit(25);

      if (Array.isArray(dbRows)) {
        for (const row of dbRows) {
          const pSlug = (row.slug || '').toLowerCase();
          const targetAreas = Array.isArray(row.target_areas) && row.target_areas.length > 0
            ? row.target_areas
            : Array.isArray(row.service_area) ? row.service_area : [];

          const mapped: Provider = {
            id: row.id,
            name: row.name,
            slug: row.slug,
            profile_type: row.profile_type || 'individual',
            category_id: row.category_id,
            trade_title: row.trade_title || `${row.name} - Verified Professional`,
            city_slug: row.cities?.slug || cityFilter || 'karachi',
            country_code: row.countries?.code?.toLowerCase() || countryFilter || 'pk',
            district: targetAreas[0] || 'Karachi',
            service_area: targetAreas,
            target_areas: targetAreas,
            whatsapp_number: row.whatsapp_number,
            avatar_url: row.profile_picture || row.avatar_url || '',
            short_bio: row.bio || row.short_bio || '',
            starting_price: Number(row.starting_price) || 500,
            rating: Number(row.rating) || 4.8,
            review_count: Number(row.review_count) || 5,
            total_leads: Number(row.total_leads) || 10,
            is_verified: Boolean(row.is_verified),
            is_available: Boolean(row.is_available),
            is_premium: Boolean(row.is_premium),
          };
          allProvidersMap.set(pSlug, mapped);
        }
      }
    } catch (err) {
      console.warn('Search query DB fallback note:', err);
    }
  }

  // 3. MULTI-FIELD MATCHING & TYPO TOLERANCE SCORING
  // Multi-field check covers simultaneously:
  // - fullName (p.name)
  // - trade_title (p.trade_title)
  // - categoryName (localized category name + category slug + aliases)
  // - target_areas (p.target_areas + p.service_area)
  const scoredProviders: Array<{ provider: Provider; score: number }> = [];

  for (const provider of allProvidersMap.values()) {
    // City filter if specified
    if (cityFilter && provider.city_slug.toLowerCase() !== cityFilter) {
      continue;
    }

    const catObj = getCategoryBySlug(provider.category_id);
    const catNameLocalized = catObj ? getCategoryName(catObj, lang).toLowerCase() : '';
    const catNameEn = catObj ? catObj.name.toLowerCase() : '';
    const catId = provider.category_id.toLowerCase();
    const areas = [...(provider.target_areas || []), ...(provider.service_area || [])];

    let score = 0;

    // A. Check fullName
    const fullNameNorm = normalizeString(provider.name);
    if (fullNameNorm.includes(normalizedQ) || fullNameNorm.includes(transliteratedQ)) {
      score += 100;
    } else if (isFuzzyMatch(rawQuery, provider.name) || isFuzzyMatch(transliteratedQ, provider.name)) {
      score += 60; // Typo tolerance on name
    }

    // B. Check trade_title
    const tradeTitleNorm = normalizeString(provider.trade_title);
    if (tradeTitleNorm.includes(normalizedQ) || tradeTitleNorm.includes(transliteratedQ)) {
      score += 80;
    } else if (isFuzzyMatch(rawQuery, provider.trade_title) || isFuzzyMatch(transliteratedQ, provider.trade_title)) {
      score += 50; // Typo tolerance on trade title
    }

    // C. Check categoryName & categoryId & aliases
    const canonicalAlias = CATEGORY_ALIASES[normalizedQ] || CATEGORY_ALIASES[transliteratedQ];
    if (
      catId === normalizedQ ||
      catId === canonicalAlias ||
      catNameLocalized.includes(normalizedQ) ||
      catNameEn.includes(normalizedQ)
    ) {
      score += 90;
    } else if (
      isFuzzyMatch(rawQuery, catNameEn) ||
      isFuzzyMatch(rawQuery, catId) ||
      isFuzzyMatch(transliteratedQ, catId)
    ) {
      score += 55; // Typo tolerance on category (e.g. "electrcian" -> matches electrician category)
    }

    // D. Check target_areas
    const areaMatch = areas.some((area) => {
      const areaNorm = normalizeString(area);
      return areaNorm.includes(normalizedQ) || isFuzzyMatch(rawQuery, area);
    });
    if (areaMatch) {
      score += 70;
    }

    if (score > 0) {
      // Prioritize verified and premium specialists
      if (provider.is_premium) score += 15;
      if (provider.is_verified) score += 10;
      scoredProviders.push({ provider, score });
    }
  }

  // Sort descending by score, then review count
  scoredProviders.sort((a, b) => b.score - a.score || b.provider.review_count - a.provider.review_count);

  const matchedProviders = scoredProviders.slice(0, limit).map(({ provider }) => {
    const cat = getCategoryBySlug(provider.category_id);
    const categoryName = cat ? getCategoryName(cat, lang) : provider.category_id;
    const cityName = getLocalizedCityName(provider.city_slug, lang);

    return {
      id: provider.id,
      name: provider.name,
      slug: provider.slug,
      trade_title: provider.trade_title,
      category_id: provider.category_id,
      category_name: categoryName,
      city_slug: provider.city_slug,
      city_name: cityName,
      country_code: provider.country_code,
      avatar_url: provider.profile_picture || provider.avatar_url,
      rating: provider.rating,
      review_count: provider.review_count,
      starting_price: provider.starting_price,
      target_areas: provider.target_areas || provider.service_area || [],
      is_verified: provider.is_verified,
      is_premium: provider.is_premium,
      url: `/${lang}/${provider.country_code.toLowerCase()}/${provider.city_slug.toLowerCase()}/${provider.category_id.toLowerCase()}/${provider.slug}`,
    };
  });

  return NextResponse.json({
    query: rawQuery,
    categories: matchedCategories,
    providers: matchedProviders,
  });
}
