import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { CATEGORIES, CITIES, COUNTRIES, getAllProviders, Provider } from '@/lib/db';
import { getCategories, CategoryItem } from '@/lib/taxonomy-db';
import { getSiteUrl } from '@/lib/site-url';
import { getBlogPosts } from '@/lib/blog-data';
import { getAuthors } from '@/lib/authors-data';

const DOMAIN = getSiteUrl();
const SUPPORTED_LOCALES = ['en', 'ur', 'ar'] as const;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jkdzlunnrtfdmhgsmxyu.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ZWex7txUSkCUoSmlDdDQvg__cT_i9gI';

/**
 * Normalizes legacy, alias, and typo category slugs directly to canonical category IDs.
 * Ensures deleted/typo slugs like 'cctv-technician' or 'cctv-security' never appear in sitemap.
 */
function normalizeCategorySlug(catIdOrSlug: string): string {
  const norm = (catIdOrSlug || '').toLowerCase().trim();
  const aliasMap: Record<string, string> = {
    'cctv-technician': 'cctv-installer',
    'cctv-security': 'cctv-installer',
    cctv: 'cctv-installer',
    'cctv-camera': 'cctv-installer',
    'security-cameras': 'cctv-installer',
    'cctv-camera-mistri': 'cctv-installer',
    'auto-mechanic': 'car-mechanic',
    'car-repair': 'car-mechanic',
    'auto-repair': 'car-mechanic',
    'gari-car-mistri': 'car-mechanic',
    ac: 'ac-technician',
    'ac-repair': 'ac-technician',
    'ac-services': 'ac-technician',
    'ac-repair-mistri': 'ac-technician',
    plumbing: 'plumber',
    'plumbing-services': 'plumber',
    plumbers: 'plumber',
    'plumber-mistri': 'plumber',
    generator: 'generator-repair',
    'generator-services': 'generator-repair',
    'generator-mistri': 'generator-repair',
    solar: 'solar-installer',
    'solar-energy': 'solar-installer',
    'solar-panel-mistri': 'solar-installer',
    cleaning: 'sofa-carpet-cleaning',
    'sofa-cleaning': 'sofa-carpet-cleaning',
    'carpet-cleaning': 'sofa-carpet-cleaning',
    'home-cleaning': 'sofa-carpet-cleaning',
    'sofa-carpet-safai': 'sofa-carpet-cleaning',
    food: 'home-chef',
    'home-chefs': 'home-chef',
    'bawarchi-catering': 'home-chef',
    'home-chef-catering': 'home-chef',
    'bijli-mistri': 'electrician',
    'raj-mistri': 'mason',
    'rang-paint-mistri': 'painter',
    'carpenter-barhai': 'carpenter',
  };
  return aliasMap[norm] || norm;
}

/**
 * Authoritative Dynamic XML Sitemap Generator
 * Route: /sitemap.xml
 * Returns MetadataRoute.Sitemap with raw application/xml and reciprocal <xhtml:link> hreflang tags.
 * Strictly adheres to Supply Quality Gate: only entities with >= 1 published provider are included.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [];
  const seenUrls = new Set<string>();
  const currentDate = new Date().toISOString();

  let supabase: any = null;
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });
  } catch (err) {
    console.warn('Supabase client init note in sitemap:', err);
  }

  // 1. Load active taxonomy categories & build lookup maps
  const categoriesList = await getCategories({ activeOnly: true });
  const categoryById = new Map<string, CategoryItem>();
  const categoryBySlug = new Map<string, CategoryItem>();

  for (const c of categoriesList) {
    categoryById.set(c.id.toLowerCase(), c);
    categoryBySlug.set(c.slug_en.toLowerCase(), c);
    if (c.slug_ur) {
      categoryBySlug.set(c.slug_ur.toLowerCase(), c);
    }
  }

  // 2. Fetch all providers and strictly filter for published & SEO-indexed supply
  let allProviders: Provider[] = [];
  try {
    allProviders = await getAllProviders();
  } catch (err) {
    console.warn('Sitemap getAllProviders error:', err);
    allProviders = [];
  }

  const publishedProviders = allProviders.filter((p) => {
    const rawStatus = p.status || (p.is_verified ? 'published' : 'pending');
    const status = rawStatus === 'approved' ? 'published' : rawStatus;
    const isIndexed = p.seo_index !== false;
    return status === 'published' && isIndexed;
  });

  // 3. Aggregate provider counts & latest timestamps per country, city, and city x category
  const providerCountByCountry = new Map<string, number>();
  const providerCountByCity = new Map<string, number>();
  const providerCountByCityCategory = new Map<string, number>();
  const latestModifiedByCountry = new Map<string, string>();
  const latestModifiedByCity = new Map<string, string>();
  const latestModifiedByCityCategory = new Map<string, string>();

  for (const p of publishedProviders) {
    const countryCode = (p.country_code || 'pk').toLowerCase().trim();
    const citySlug = (p.city_slug || 'karachi').toLowerCase().trim();
    const canonicalCatId = normalizeCategorySlug(p.category_id);
    const catObj = categoryById.get(canonicalCatId) || categoryBySlug.get(canonicalCatId);
    if (!catObj) continue;

    const catSlug = catObj.slug_en.toLowerCase();
    const cityCatKey = `${citySlug}|${catSlug}`;

    providerCountByCountry.set(countryCode, (providerCountByCountry.get(countryCode) || 0) + 1);
    providerCountByCity.set(citySlug, (providerCountByCity.get(citySlug) || 0) + 1);
    providerCountByCityCategory.set(cityCatKey, (providerCountByCityCategory.get(cityCatKey) || 0) + 1);

    const modTime = (p as any).updated_at || (p as any).created_at;
    if (modTime) {
      if (!latestModifiedByCountry.has(countryCode) || modTime > latestModifiedByCountry.get(countryCode)!) {
        latestModifiedByCountry.set(countryCode, modTime);
      }
      if (!latestModifiedByCity.has(citySlug) || modTime > latestModifiedByCity.get(citySlug)!) {
        latestModifiedByCity.set(citySlug, modTime);
      }
      if (!latestModifiedByCityCategory.has(cityCatKey) || modTime > latestModifiedByCityCategory.get(cityCatKey)!) {
        latestModifiedByCityCategory.set(cityCatKey, modTime);
      }
    }
  }

  // 4. Query active Countries and Cities (Combining SEED with active DB records)
  const countriesMap = new Map<string, { code: string; name: string }>();
  for (const c of COUNTRIES) {
    countriesMap.set(c.code.toLowerCase(), {
      code: c.code.toLowerCase(),
      name: c.name,
    });
  }

  const citiesMap = new Map<string, { slug: string; countryCode: string }>();
  for (const c of CITIES) {
    citiesMap.set(c.slug.toLowerCase(), {
      slug: c.slug.toLowerCase(),
      countryCode: c.countryCode.toLowerCase(),
    });
  }

  if (supabase) {
    try {
      const [{ data: dbCountries }, { data: dbCities }] = await Promise.all([
        supabase.from('countries').select('code, name, is_active').eq('is_active', true),
        supabase.from('cities').select('slug, country_id, is_active, countries(code)').eq('is_active', true),
      ]);

      if (dbCountries && dbCountries.length > 0) {
        for (const c of dbCountries) {
          countriesMap.set(c.code.toLowerCase(), { code: c.code.toLowerCase(), name: c.name });
        }
      }
      if (dbCities && dbCities.length > 0) {
        for (const c of dbCities) {
          citiesMap.set(c.slug.toLowerCase(), {
            slug: c.slug.toLowerCase(),
            countryCode: (c.countries?.code || 'pk').toLowerCase(),
          });
        }
      }
    } catch (err) {
      console.warn('Sitemap live taxonomy query note:', err);
    }
  }

  const activeCountries = Array.from(countriesMap.values());
  const activeCities = Array.from(citiesMap.values());

  // Helper to safely push sitemap entries avoiding duplicate URLs
  function pushEntry(entry: MetadataRoute.Sitemap[number]) {
    if (!seenUrls.has(entry.url)) {
      seenUrls.add(entry.url);
      sitemapEntries.push(entry);
    }
  }

  // =========================================================================
  // 5. EMIT SITEMAP SECTIONS
  // =========================================================================

  // A. Root & Core Static Pages
  const staticPaths = ['', '/about', '/list-service', '/faq', '/blog', '/authors', '/privacy', '/terms'];
  for (const path of staticPaths) {
    const enUrl = `${DOMAIN}/en${path}`;
    const urUrl = `${DOMAIN}/ur${path}`;
    const arUrl = `${DOMAIN}/ar${path}`;
    const alternates = {
      languages: {
        en: enUrl,
        ur: urUrl,
        ar: arUrl,
        'x-default': enUrl,
      },
    };

    for (const lang of SUPPORTED_LOCALES) {
      pushEntry({
        url: `${DOMAIN}/${lang}${path}`,
        lastModified: currentDate,
        changeFrequency: path === '' ? 'daily' : 'monthly',
        priority: path === '' ? 1.0 : 0.6,
        alternates,
      });
    }
  }

  // B. Editorial Blog Posts & Author Profiles
  try {
    const blogPosts = await getBlogPosts();
    for (const post of blogPosts) {
      const postPath = `/blog/${post.slug}`;
      const enUrl = `${DOMAIN}/en${postPath}`;
      const urUrl = `${DOMAIN}/ur${postPath}`;
      const arUrl = `${DOMAIN}/ar${postPath}`;
      const alternates = {
        languages: {
          en: enUrl,
          ur: urUrl,
          ar: arUrl,
          'x-default': enUrl,
        },
      };
      const lastMod = post.publishedAt || currentDate;

      for (const lang of SUPPORTED_LOCALES) {
        pushEntry({
          url: `${DOMAIN}/${lang}${postPath}`,
          lastModified: lastMod,
          changeFrequency: 'monthly',
          priority: 0.7,
          alternates,
        });
      }
    }

    const authors = await getAuthors({ activeOnly: true });
    for (const author of authors) {
      const authorPath = `/authors/${author.slug}`;
      const enUrl = `${DOMAIN}/en${authorPath}`;
      const urUrl = `${DOMAIN}/ur${authorPath}`;
      const arUrl = `${DOMAIN}/ar${authorPath}`;
      const alternates = {
        languages: {
          en: enUrl,
          ur: urUrl,
          ar: arUrl,
          'x-default': enUrl,
        },
      };

      for (const lang of SUPPORTED_LOCALES) {
        pushEntry({
          url: `${DOMAIN}/${lang}${authorPath}`,
          lastModified: currentDate,
          changeFrequency: 'monthly',
          priority: 0.65,
          alternates,
        });
      }
    }
  } catch (err) {
    console.warn('Sitemap blog/authors generation note:', err);
  }

  // C. Country Landing Hubs (Strict Supply Gate: ONLY countries with >= 1 published provider)
  for (const c of activeCountries) {
    const countryCode = c.code.toLowerCase();
    const count = providerCountByCountry.get(countryCode) || 0;
    if (count < 1) continue; // Zero 0-provider countries

    const countryPath = `/${countryCode}`;
    const enUrl = `${DOMAIN}/en${countryPath}`;
    const urUrl = `${DOMAIN}/ur${countryPath}`;
    const arUrl = `${DOMAIN}/ar${countryPath}`;
    const alternates = {
      languages: {
        en: enUrl,
        ur: urUrl,
        ar: arUrl,
        'x-default': enUrl,
      },
    };
    const lastMod = latestModifiedByCountry.get(countryCode) || currentDate;

    for (const lang of SUPPORTED_LOCALES) {
      pushEntry({
        url: `${DOMAIN}/${lang}${countryPath}`,
        lastModified: lastMod,
        changeFrequency: 'weekly',
        priority: 0.9,
        alternates,
      });
    }
  }

  // D. City Hubs (Strict Supply Gate: ONLY cities with >= 1 published provider)
  for (const city of activeCities) {
    const citySlug = city.slug.toLowerCase();
    const countryCode = city.countryCode.toLowerCase();
    const cityCount = providerCountByCity.get(citySlug) || 0;
    if (cityCount < 1) continue; // Zero 0-provider cities

    const cityPath = `/${countryCode}/${citySlug}`;
    const enUrl = `${DOMAIN}/en${cityPath}`;
    const urUrl = `${DOMAIN}/ur${cityPath}`;
    const arUrl = `${DOMAIN}/ar${cityPath}`;
    const alternates = {
      languages: {
        en: enUrl,
        ur: urUrl,
        ar: arUrl,
        'x-default': enUrl,
      },
    };
    const lastMod = latestModifiedByCity.get(citySlug) || currentDate;

    for (const lang of SUPPORTED_LOCALES) {
      pushEntry({
        url: `${DOMAIN}/${lang}${cityPath}`,
        lastModified: lastMod,
        changeFrequency: 'daily',
        priority: 0.9,
        alternates,
      });
    }

    // E. Category Silos (Strict Supply Gate: ONLY (city, category) pairs with >= 1 published provider)
    for (const cat of categoriesList) {
      const catSlugEn = cat.slug_en.toLowerCase();
      const cityCatKey = `${citySlug}|${catSlugEn}`;
      const catCount = providerCountByCityCategory.get(cityCatKey) || 0;
      if (catCount < 1) continue; // Zero 0-provider categories in this city

      const slug_en = catSlugEn;
      const slug_ur = (cat.slug_ur || `${slug_en}-mistri`).toLowerCase();
      const slug_ar = (cat.slug_ar || slug_en).toLowerCase();

      const enUrl = `${DOMAIN}/en/${countryCode}/${citySlug}/${slug_en}`;
      const urUrl = `${DOMAIN}/ur/${countryCode}/${citySlug}/${slug_ur}`;
      const arUrl = `${DOMAIN}/ar/${countryCode}/${citySlug}/${slug_ar}`;
      const alternates = {
        languages: {
          en: enUrl,
          ur: urUrl,
          ar: arUrl,
          'x-default': enUrl,
        },
      };
      const lastMod = latestModifiedByCityCategory.get(cityCatKey) || currentDate;

      pushEntry({
        url: enUrl,
        lastModified: lastMod,
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates,
      });
      pushEntry({
        url: urUrl,
        lastModified: lastMod,
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates,
      });
      pushEntry({
        url: arUrl,
        lastModified: lastMod,
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates,
      });
    }
  }

  // F. Published & SEO-Indexed Providers (Strict Canonical Format: [slug]-[publicId] & Canonical Category)
  for (const pro of publishedProviders) {
    const countryCode = (pro.country_code || 'pk').toLowerCase().trim();
    const citySlug = (pro.city_slug || 'karachi').toLowerCase().trim();
    const canonicalCatId = normalizeCategorySlug(pro.category_id);
    const catObj = categoryById.get(canonicalCatId) || categoryBySlug.get(canonicalCatId);
    if (!catObj) continue;

    const slug_en = catObj.slug_en.toLowerCase();
    const slug_ur = (catObj.slug_ur || `${slug_en}-mistri`).toLowerCase();
    const slug_ar = (catObj.slug_ar || slug_en).toLowerCase();

    const publicId = pro.publicId !== undefined && pro.publicId !== null ? Number(pro.publicId) : undefined;
    let proSlug = pro.slug.toLowerCase().trim();
    if (publicId && !proSlug.endsWith(`-${publicId}`)) {
      proSlug = `${proSlug}-${publicId}`;
    }

    const enUrl = `${DOMAIN}/en/${countryCode}/${citySlug}/${slug_en}/${proSlug}`;
    const urUrl = `${DOMAIN}/ur/${countryCode}/${citySlug}/${slug_ur}/${proSlug}`;
    const arUrl = `${DOMAIN}/ar/${countryCode}/${citySlug}/${slug_ar}/${proSlug}`;
    const alternates = {
      languages: {
        en: enUrl,
        ur: urUrl,
        ar: arUrl,
        'x-default': enUrl,
      },
    };
    const lastMod = (pro as any).updated_at || (pro as any).created_at || currentDate;

    pushEntry({
      url: enUrl,
      lastModified: lastMod,
      changeFrequency: 'monthly',
      priority: 0.85,
      alternates,
    });
    pushEntry({
      url: urUrl,
      lastModified: lastMod,
      changeFrequency: 'monthly',
      priority: 0.85,
      alternates,
    });
    pushEntry({
      url: arUrl,
      lastModified: lastMod,
      changeFrequency: 'monthly',
      priority: 0.85,
      alternates,
    });
  }

  return sitemapEntries;
}
