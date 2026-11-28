import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { CATEGORIES, CITIES, COUNTRIES, getAllProviders, Provider } from '@/lib/db';
import { getSiteUrl } from '@/lib/site-url';
import { buildSitemapAlternates } from '@/lib/seo/alternates';
import { getBlogPosts } from '@/lib/blog-data';
import { getAuthors } from '@/lib/authors-data';

const DOMAIN = getSiteUrl();
const SUPPORTED_LOCALES = ['en', 'ur', 'ar'];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jkdzlunnrtfdmhgsmxyu.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ZWex7txUSkCUoSmlDdDQvg__cT_i9gI';

/**
 * Authoritative Dynamic XML Sitemap Generator
 * Route: /sitemap.xml
 * Returns MetadataRoute.Sitemap with raw application/xml and reciprocal <xhtml:link> tags.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [];
  const currentDate = new Date().toISOString();

  let supabase: any = null;
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });
  } catch (err) {
    console.warn('Supabase client init note in sitemap:', err);
  }

  // 1. Root & Core Static Pages
  const staticPaths = ['', '/about', '/list-service', '/faq', '/blog', '/authors', '/privacy', '/terms'];
  for (const path of staticPaths) {
    for (const lang of SUPPORTED_LOCALES) {
      sitemapEntries.push({
        url: `${DOMAIN}/${lang}${path}`,
        lastModified: currentDate,
        changeFrequency: path === '' ? 'daily' : 'monthly',
        priority: path === '' ? 1.0 : 0.6,
        alternates: buildSitemapAlternates(path),
      });
    }
  }

  // 1b. Editorial Blog Posts & Author Profiles
  try {
    const blogPosts = await getBlogPosts();
    for (const post of blogPosts) {
      const postPath = `/blog/${post.slug}`;
      for (const lang of SUPPORTED_LOCALES) {
        sitemapEntries.push({
          url: `${DOMAIN}/${lang}${postPath}`,
          lastModified: post.publishedAt || currentDate,
          changeFrequency: 'monthly',
          priority: 0.7,
          alternates: buildSitemapAlternates(postPath),
        });
      }
    }

    const authors = await getAuthors({ activeOnly: true });
    for (const author of authors) {
      const authorPath = `/authors/${author.slug}`;
      for (const lang of SUPPORTED_LOCALES) {
        sitemapEntries.push({
          url: `${DOMAIN}/${lang}${authorPath}`,
          lastModified: currentDate,
          changeFrequency: 'monthly',
          priority: 0.65,
          alternates: buildSitemapAlternates(authorPath),
        });
      }
    }
  } catch (err) {
    console.warn('Sitemap blog/authors generation note:', err);
  }

  // 2. Query Active Countries and Cities
  let activeCountries: Array<{ code: string; name: string }> = COUNTRIES.map((c) => ({
    code: c.code.toLowerCase(),
    name: c.name,
  }));
  let activeCities: Array<{ slug: string; countryCode: string }> = CITIES.map((c) => ({
    slug: c.slug,
    countryCode: c.countryCode.toLowerCase(),
  }));

  if (supabase) {
    try {
      const [{ data: dbCountries }, { data: dbCities }] = await Promise.all([
        supabase.from('countries').select('code, name, is_active').eq('is_active', true),
        supabase.from('cities').select('slug, country_id, is_active, countries(code)').eq('is_active', true),
      ]);

      if (dbCountries && dbCountries.length > 0) {
        activeCountries = dbCountries.map((c: any) => ({ code: c.code.toLowerCase(), name: c.name }));
      }
      if (dbCities && dbCities.length > 0) {
        activeCities = dbCities.map((c: any) => ({
          slug: c.slug,
          countryCode: (c.countries?.code || 'pk').toLowerCase(),
        }));
      }
    } catch (err) {
      console.warn('Sitemap live taxonomy query note:', err);
    }
  }

  // 2b. Published & SEO-Indexed Providers (Queried early to enforce thin-content indexing guards)
  let approvedProviders: Provider[] = [];
  try {
    const allProviders = await getAllProviders();
    approvedProviders = allProviders.filter((p) => {
      const status = p.status || (p.is_verified ? 'published' : 'pending');
      const isIndexed = p.seo_index !== false;
      return (status === 'published' || status === 'approved') && isIndexed;
    });
  } catch (err) {
    console.warn('Sitemap provider query note:', err);
    approvedProviders = [];
  }

  // Count approved providers per country, city, and city x category to guard against indexing thin-content entities
  const providerCountByCountry = new Map<string, number>();
  const publishedCitiesSet = new Set<string>();
  const publishedCityCategoriesSet = new Set<string>();

  for (const pro of approvedProviders) {
    const countryCode = (pro.country_code || 'pk').toLowerCase();
    const citySlug = (pro.city_slug || 'karachi').toLowerCase();
    const categoryId = (pro.category_id || '').toLowerCase();

    providerCountByCountry.set(countryCode, (providerCountByCountry.get(countryCode) || 0) + 1);
    publishedCitiesSet.add(citySlug);
    if (categoryId) {
      publishedCityCategoriesSet.add(`${citySlug}|${categoryId}`);
    }
  }

  // 3. Country Landing Hubs (Guarded: Only indexable countries with >= 1 published providers)
  for (const c of activeCountries) {
    const countryCode = c.code.toLowerCase();
    const count = providerCountByCountry.get(countryCode) || 0;
    // Skip countries with 0 published providers (thin content guard)
    if (count === 0) continue;

    const countryPath = `/${countryCode}`;
    for (const lang of SUPPORTED_LOCALES) {
      sitemapEntries.push({
        url: `${DOMAIN}/${lang}${countryPath}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.9,
        alternates: buildSitemapAlternates(countryPath),
      });
    }
  }

  // 4. City Hub Pages & Category Silos (Guarded: Only indexable entities with >= 1 published providers)
  for (const city of activeCities) {
    const citySlug = city.slug.toLowerCase();
    // Skip cities with 0 published providers (thin content guard)
    if (!publishedCitiesSet.has(citySlug)) continue;

    const cityPath = `/${city.countryCode}/${city.slug}`;
    for (const lang of SUPPORTED_LOCALES) {
      sitemapEntries.push({
        url: `${DOMAIN}/${lang}${cityPath}`,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: 0.9,
        alternates: buildSitemapAlternates(cityPath),
      });
    }

    // City + Category Silos (Canonical Category Slugs - strictly filtered to >= 1 published providers)
    for (const cat of CATEGORIES) {
      const isPublished =
        publishedCityCategoriesSet.has(`${citySlug}|${cat.id.toLowerCase()}`) ||
        publishedCityCategoriesSet.has(`${citySlug}|${cat.slug.toLowerCase()}`);

      // Skip categories in this city with 0 published providers (thin content guard)
      if (!isPublished) continue;

      const siloPath = `/${city.countryCode}/${city.slug}/${cat.slug}`;
      for (const lang of SUPPORTED_LOCALES) {
        sitemapEntries.push({
          url: `${DOMAIN}/${lang}${siloPath}`,
          lastModified: currentDate,
          changeFrequency: 'weekly',
          priority: 0.8,
          alternates: buildSitemapAlternates(siloPath),
        });
      }
    }
  }

  // 5. Published & SEO-Indexed Providers
  for (const pro of approvedProviders) {
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
        alternates: buildSitemapAlternates(providerPath),
      });
    }
  }

  return sitemapEntries;
}
