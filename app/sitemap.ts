import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { CATEGORIES, CITIES, COUNTRIES, getAllProviders, Provider } from '@/lib/db';
import { getSiteUrl } from '@/lib/site-url';

const DOMAIN = getSiteUrl();
const SUPPORTED_LOCALES = ['en', 'ur', 'ar'];
const PROVIDER_CHUNK_SIZE = 1000;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jkdzlunnrtfdmhgsmxyu.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ZWex7txUSkCUoSmlDdDQvg__cT_i9gI';

interface SitemapProps {
  id: Promise<{ id: string | number }> | { id: string | number } | string | number;
}

/**
 * 1. Define Sitemap Chunks for App Router Scale & Pagination
 * ID 0: Core Pages (Home, Static, Countries, Cities, and Category Silos)
 * ID 1..N: Approved Providers (Chunked by 1,000 per sitemap)
 */
export async function generateSitemaps() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { count } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .or('is_verified.eq.true,status.eq.approved');

    const totalProviders = count && count > 0 ? count : 30;
    const providerChunks = Math.max(1, Math.ceil(totalProviders / PROVIDER_CHUNK_SIZE));

    const sitemaps = [{ id: 0 }];
    for (let i = 1; i <= providerChunks; i++) {
      sitemaps.push({ id: i });
    }
    return sitemaps;
  } catch {
    return [{ id: 0 }, { id: 1 }];
  }
}

/**
 * Helper to build multi-lingual hreflang alternates including x-default (pointing to EN)
 */
function buildHreflangAlternates(basePath: string) {
  const languages: Record<string, string> = {};
  for (const locale of SUPPORTED_LOCALES) {
    languages[locale] = `${DOMAIN}/${locale}${basePath}`;
  }
  languages['x-default'] = `${DOMAIN}/en${basePath}`;
  return { languages };
}

/**
 * 2. Dynamic Sitemap Generator Handler
 */
export default async function sitemap(props: SitemapProps): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [];
  const currentDate = new Date().toISOString();

  // Resolve ID across synchronous or Promise parameters
  let resolvedId: any = props;
  if (props && typeof props === 'object') {
    if ('then' in props) {
      const awaited = await props;
      resolvedId = awaited?.id;
    } else if ('id' in props) {
      resolvedId = typeof props.id === 'object' && props.id && 'then' in props.id
        ? (await props.id)?.id || (await props.id)
        : props.id;
    }
  }
  const numericId = Number(resolvedId) || 0;

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // CHUNK 0: Core Platform Silos (Home, Static Pages, Countries, Cities, Category Silos)
  if (numericId === 0) {
    // 1. Root and Core Static Landing Pages
    const staticPaths = ['', '/about', '/list-service', '/faq', '/blog', '/privacy', '/terms'];

    for (const path of staticPaths) {
      for (const lang of SUPPORTED_LOCALES) {
        sitemapEntries.push({
          url: `${DOMAIN}/${lang}${path}`,
          lastModified: currentDate,
          changeFrequency: path === '' ? 'daily' : 'monthly',
          priority: path === '' ? 1.0 : 0.6,
          alternates: buildHreflangAlternates(path),
        });
      }
    }

    // 2. Query Active Countries and Cities
    let activeCountries: any[] = COUNTRIES.map((c) => ({ code: c.code.toLowerCase(), name: c.name }));
    let activeCities: any[] = CITIES.map((c) => ({ slug: c.slug, countryCode: c.countryCode.toLowerCase() }));

    try {
      const [{ data: dbCountries }, { data: dbCities }] = await Promise.all([
        supabase.from('countries').select('code, name, is_active').eq('is_active', true),
        supabase.from('cities').select('slug, country_id, is_active, countries(code)').eq('is_active', true),
      ]);

      if (dbCountries && dbCountries.length > 0) {
        activeCountries = dbCountries.map((c) => ({ code: c.code.toLowerCase(), name: c.name }));
      }
      if (dbCities && dbCities.length > 0) {
        activeCities = dbCities.map((c: any) => ({
          slug: c.slug,
          countryCode: (c.countries?.code || 'pk').toLowerCase(),
        }));
      }
    } catch {
      // Use fallback db arrays
    }

    // 3. Country Landing Pages
    for (const c of activeCountries) {
      const countryPath = `/${c.code}`;
      for (const lang of SUPPORTED_LOCALES) {
        sitemapEntries.push({
          url: `${DOMAIN}/${lang}${countryPath}`,
          lastModified: currentDate,
          changeFrequency: 'weekly',
          priority: 0.9,
          alternates: buildHreflangAlternates(countryPath),
        });
      }
    }

    // 4. City Hub Pages & Category Silos
    for (const city of activeCities) {
      const cityPath = `/${city.countryCode}/${city.slug}`;
      for (const lang of SUPPORTED_LOCALES) {
        sitemapEntries.push({
          url: `${DOMAIN}/${lang}${cityPath}`,
          lastModified: currentDate,
          changeFrequency: 'daily',
          priority: 0.9,
          alternates: buildHreflangAlternates(cityPath),
        });
      }

      // City + Category Programmatic Silos
      for (const cat of CATEGORIES) {
        const siloPath = `/${city.countryCode}/${city.slug}/${cat.slug}`;
        for (const lang of SUPPORTED_LOCALES) {
          sitemapEntries.push({
            url: `${DOMAIN}/${lang}${siloPath}`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
            alternates: buildHreflangAlternates(siloPath),
          });
        }
      }
    }

    return sitemapEntries;
  }

  // CHUNK 1..N: Approved Provider Dossiers (Paginated - STRICTLY status = 'approved')
  let approvedProviders: Provider[] = [];
  try {
    const { data: dbApproved } = await supabase
      .from('providers')
      .select('*, cities(slug), countries(code)')
      .eq('status', 'approved')
      .order('rating', { ascending: false });

    if (Array.isArray(dbApproved) && dbApproved.length > 0) {
      approvedProviders = dbApproved.map((r: any) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        category_id: r.category_id,
        city_slug: r.cities?.slug || 'karachi',
        country_code: r.countries?.code || 'pk',
        status: 'approved' as const,
        is_verified: true,
        trade_title: r.trade_title || r.name,
        profile_type: r.profile_type || 'individual',
        district: r.district || 'Karachi',
        service_area: Array.isArray(r.service_area) ? r.service_area : [],
        whatsapp_number: r.whatsapp_number,
        avatar_url: r.avatar_url,
        short_bio: r.short_bio || '',
        starting_price: r.starting_price || 500,
        rating: Number(r.rating) || 5.0,
        review_count: Number(r.review_count) || 1,
        total_leads: Number(r.total_leads) || 0,
        is_available: true,
      }));
    }
  } catch (err) {
    console.warn('Sitemap live provider query note:', err);
  }

  // Fallback to local data store strictly filtered by status === 'approved'
  if (approvedProviders.length === 0) {
    try {
      const all = await getAllProviders();
      approvedProviders = all.filter((p) => p.status === 'approved');
    } catch {
      approvedProviders = [];
    }
  }

  const startIndex = (numericId - 1) * PROVIDER_CHUNK_SIZE;
  const endIndex = startIndex + PROVIDER_CHUNK_SIZE;
  const chunkProviders = approvedProviders.slice(startIndex, endIndex);

  for (const pro of chunkProviders) {
    const countryCode = (pro.country_code || 'pk').toLowerCase();
    const citySlug = (pro.city_slug || 'karachi').toLowerCase();
    const categorySlug = (pro.category_id || 'electrician').toLowerCase();
    const providerPath = `/${countryCode}/${citySlug}/${categorySlug}/${pro.slug}`;

    for (const lang of SUPPORTED_LOCALES) {
      sitemapEntries.push({
        url: `${DOMAIN}/${lang}${providerPath}`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.85,
        alternates: buildHreflangAlternates(providerPath),
      });
    }
  }

  return sitemapEntries;
}
