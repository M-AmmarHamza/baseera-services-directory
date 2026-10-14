import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://baseera-services-directory.vercel.app';
const SUPPORTED_LOCALES = ['en', 'ur', 'ar'];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jkdzlunnrtfdmhgsmxyu.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ZWex7txUSkCUoSmlDdDQvg__cT_i9gI';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [];
  const currentDate = new Date().toISOString();

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // 1. Fetch Dynamic Directory Data from Supabase Tables
  const [
    { data: countries },
    { data: cities },
    { data: categories },
    { data: providers },
  ] = await Promise.all([
    supabase.from('countries').select('id, code, is_active').eq('is_active', true),
    supabase.from('cities').select('id, country_id, name, slug, is_active').eq('is_active', true),
    supabase.from('categories').select('id, slug'),
    supabase.from('providers').select('id, slug, city_id, category_id, is_verified, updated_at').eq('is_verified', true),
  ]);

  const countryCodeMap = new Map((countries || []).map((c) => [c.id, (c.code || 'pk').toLowerCase()]));
  const cityMap = new Map((cities || []).map((city) => [city.id, { slug: city.slug, countryId: city.country_id }]));
  const categoryMap = new Map((categories || []).map((cat) => [cat.id, cat.slug]));

  // 2. Dynamic City Hub Landing Pages
  for (const city of cities || []) {
    const countryCode = countryCodeMap.get(city.country_id) || 'pk';
    for (const lang of SUPPORTED_LOCALES) {
      sitemapEntries.push({
        url: `${DOMAIN}/${lang}/${countryCode}/${city.slug}`,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: 1.0,
        alternates: {
          languages: Object.fromEntries(
            SUPPORTED_LOCALES.map((l) => [l, `${DOMAIN}/${l}/${countryCode}/${city.slug}`])
          ),
        },
      });
    }

    // 3. City + Category Programmatic Silos
    for (const cat of categories || []) {
      for (const lang of SUPPORTED_LOCALES) {
        sitemapEntries.push({
          url: `${DOMAIN}/${lang}/${countryCode}/${city.slug}/${cat.slug}`,
          lastModified: currentDate,
          changeFrequency: 'weekly',
          priority: 0.8,
          alternates: {
            languages: Object.fromEntries(
              SUPPORTED_LOCALES.map((l) => [l, `${DOMAIN}/${l}/${countryCode}/${city.slug}/${cat.slug}`])
            ),
          },
        });
      }
    }
  }

  // 4. Dynamic Provider Individual Profile Pages
  for (const pro of providers || []) {
    const cityInfo = cityMap.get(pro.city_id);
    const countryCode = cityInfo ? countryCodeMap.get(cityInfo.countryId) || 'pk' : 'pk';
    const citySlug = cityInfo ? cityInfo.slug : 'karachi';
    const categorySlug = categoryMap.get(pro.category_id) || pro.category_id || 'services';

    for (const lang of SUPPORTED_LOCALES) {
      sitemapEntries.push({
        url: `${DOMAIN}/${lang}/${countryCode}/${citySlug}/${categorySlug}/${pro.slug}`,
        lastModified: pro.updated_at || currentDate,
        changeFrequency: 'monthly',
        priority: 0.9,
        alternates: {
          languages: Object.fromEntries(
            SUPPORTED_LOCALES.map((l) => [l, `${DOMAIN}/${l}/${countryCode}/${citySlug}/${categorySlug}/${pro.slug}`])
          ),
        },
      });
    }
  }

  return sitemapEntries;
}
