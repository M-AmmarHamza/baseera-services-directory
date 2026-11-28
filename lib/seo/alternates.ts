import { getSiteUrl } from '@/lib/site-url';
import { getCategoryBySlug } from '@/lib/db';
import { localCategories, ROMAN_URDU_SLUGS } from '@/lib/taxonomy-db';

export const SUPPORTED_LOCALES = ['en', 'ur', 'ar'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = 'en';

export interface AlternatesMetadata {
  canonical: string;
  languages: {
    en: string;
    ur: string;
    ar: string;
    'x-default': string;
    [key: string]: string;
  };
}

/**
 * Strips any leading locale prefix (/en, /ur, /ar) and normalizes slashes.
 */
export function normalizePath(path: string): string {
  if (!path) return '';
  let clean = path.trim();
  // Strip domain if full URL was accidentally passed
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    try {
      clean = new URL(clean).pathname;
    } catch {
      // ignore
    }
  }

  // Remove leading / trailing slashes for clean splitting
  clean = clean.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!clean) return '';

  const segments = clean.split('/');
  // If first segment is a supported locale, strip it
  if (SUPPORTED_LOCALES.includes(segments[0].toLowerCase() as SupportedLocale)) {
    segments.shift();
  }

  return segments.length > 0 ? `/${segments.join('/')}` : '';
}

/**
 * Formats optional query parameters into a query string (e.g. ?page=2).
 */
function buildQueryString(params?: Record<string, string | number | undefined | null>): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      searchParams.set(key, String(val));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Centralized, authoritative server-side Hreflang Alternates builder.
 * Guarantees:
 * 1. Absolute URLs with HTTPS via getSiteUrl().
 * 2. 100% reciprocal alternates across en, ur, ar, and x-default (pointing to en).
 * 3. Self-referencing canonical tag matching the current locale and route.
 * 4. Zero trailing slashes discrepancies.
 */
export function buildLanguageAlternates(
  pathWithoutLocale: string,
  currentLocale: string,
  searchParams?: Record<string, string | number | undefined | null>
): AlternatesMetadata {
  const domain = getSiteUrl();
  const cleanPath = normalizePath(pathWithoutLocale);
  const qs = buildQueryString(searchParams);

  // Validate or fallback currentLocale
  const lang = SUPPORTED_LOCALES.includes(currentLocale.toLowerCase() as SupportedLocale)
    ? currentLocale.toLowerCase()
    : DEFAULT_LOCALE;

  const enUrl = `${domain}/en${cleanPath}${qs}`;
  const urUrl = `${domain}/ur${cleanPath}${qs}`;
  const arUrl = `${domain}/ar${cleanPath}${qs}`;
  const xDefaultUrl = `${domain}/en${cleanPath}${qs}`;

  const canonicalUrl = `${domain}/${lang}${cleanPath}${qs}`;

  return {
    canonical: canonicalUrl,
    languages: {
      en: enUrl,
      ur: urUrl,
      ar: arUrl,
      'x-default': xDefaultUrl,
    },
  };
}

export interface CategorySlugInfo {
  slug_en: string;
  slug_ur: string;
  slug_ar: string;
}

/**
 * Resolves localized category slugs:
 *   - slug_en: canonical English slug (e.g. 'electrician')
 *   - slug_ur: Roman Urdu slug (e.g. 'bijli-mistri')
 *   - slug_ar: Arabic slug (e.g. 'electrician')
 */
export function resolveCategorySlugs(
  categoryInput?: string | { slug_en?: string; slug_ur?: string; slug_ar?: string; id?: string; slug?: string } | null
): CategorySlugInfo {
  if (!categoryInput) {
    return { slug_en: 'electrician', slug_ur: 'bijli-mistri', slug_ar: 'electrician' };
  }

  if (typeof categoryInput === 'object') {
    const rawEn = categoryInput.slug_en || categoryInput.slug || categoryInput.id || 'electrician';
    const slug_en = rawEn.toLowerCase().trim();
    const rawUr =
      categoryInput.slug_ur ||
      ROMAN_URDU_SLUGS[categoryInput.id || ''] ||
      ROMAN_URDU_SLUGS[slug_en] ||
      `${slug_en}-mistri`;
    const slug_ur = rawUr.toLowerCase().trim();
    const rawAr = categoryInput.slug_ar || slug_en;
    const slug_ar = rawAr.toLowerCase().trim();
    return { slug_en, slug_ur, slug_ar };
  }

  const norm = categoryInput.toLowerCase().trim();

  // 1. Check localCategories (matches slug_en, slug_ur, id, or slug_ar)
  const match = localCategories.find(
    (c) =>
      c.slug_en.toLowerCase() === norm ||
      c.slug_ur.toLowerCase() === norm ||
      c.id.toLowerCase() === norm ||
      (c.slug_ar && c.slug_ar.toLowerCase() === norm)
  );

  if (match) {
    const slug_en = match.slug_en.toLowerCase().trim();
    const slug_ur = (match.slug_ur || ROMAN_URDU_SLUGS[match.id] || `${slug_en}-mistri`).toLowerCase().trim();
    const slug_ar = (match.slug_ar || slug_en).toLowerCase().trim();
    return { slug_en, slug_ur, slug_ar };
  }

  // 2. Fallback to getCategoryBySlug & ROMAN_URDU_SLUGS
  const catObj = getCategoryBySlug(norm);
  const canonicalId = (catObj?.id || catObj?.slug || norm).toLowerCase().trim();
  const slug_en = (catObj?.slug || canonicalId).toLowerCase().trim();
  const slug_ur = (ROMAN_URDU_SLUGS[canonicalId] || ROMAN_URDU_SLUGS[slug_en] || `${slug_en}-mistri`).toLowerCase().trim();
  const slug_ar = (catObj?.slug || slug_en).toLowerCase().trim();

  return { slug_en, slug_ur, slug_ar };
}

/**
 * Specialized builder for Category Silo pages.
 * Resolves localized category slugs:
 *   - en: /en/[country]/[city]/[slug_en]
 *   - ur: /ur/[country]/[city]/[slug_ur] (Roman Urdu, e.g. bijli-mistri)
 *   - ar: /ar/[country]/[city]/[slug_ar]
 *   - x-default: /en/[country]/[city]/[slug_en]
 * Formats pagination query param when page > 1 (e.g. ?page=2).
 */
export function buildCategoryAlternates({
  country,
  city,
  category,
  currentLang,
  page,
  categoryItem,
}: {
  country: string;
  city: string;
  category: string;
  currentLang: string;
  page?: number;
  categoryItem?: { slug_en?: string; slug_ur?: string; slug_ar?: string; id?: string };
}): AlternatesMetadata {
  const domain = getSiteUrl();
  const normCountry = (country || 'pk').toLowerCase().trim();
  const normCity = (city || 'karachi').toLowerCase().trim();
  const qs = page && page > 1 ? `?page=${page}` : '';

  const { slug_en, slug_ur, slug_ar } = resolveCategorySlugs(categoryItem || category);

  const lang = SUPPORTED_LOCALES.includes(currentLang.toLowerCase() as SupportedLocale)
    ? currentLang.toLowerCase()
    : DEFAULT_LOCALE;

  const enUrl = `${domain}/en/${normCountry}/${normCity}/${slug_en}${qs}`;
  const urUrl = `${domain}/ur/${normCountry}/${normCity}/${slug_ur}${qs}`;
  const arUrl = `${domain}/ar/${normCountry}/${normCity}/${slug_ar}${qs}`;
  const xDefaultUrl = `${domain}/en/${normCountry}/${normCity}/${slug_en}${qs}`;

  const canonicalUrl =
    lang === 'ur' ? urUrl : lang === 'ar' ? arUrl : enUrl;

  return {
    canonical: canonicalUrl,
    languages: {
      en: enUrl,
      ur: urUrl,
      ar: arUrl,
      'x-default': xDefaultUrl,
    },
  };
}

/**
 * Specialized builder for Provider Profile pages.
 * Preserves the canonical slug format: [slugified-name]-[publicId]
 * and localized category slugs per locale (e.g. bijli-mistri for ur).
 */
export function buildProviderAlternates({
  country,
  city,
  category,
  slug,
  currentLang,
  categoryItem,
}: {
  country: string;
  city: string;
  category: string;
  slug: string;
  currentLang: string;
  categoryItem?: { slug_en?: string; slug_ur?: string; slug_ar?: string; id?: string };
}): AlternatesMetadata {
  const domain = getSiteUrl();
  const normCountry = (country || 'pk').toLowerCase().trim();
  const normCity = (city || 'karachi').toLowerCase().trim();
  const normSlug = slug.toLowerCase().trim();

  const { slug_en, slug_ur, slug_ar } = resolveCategorySlugs(categoryItem || category);

  const lang = SUPPORTED_LOCALES.includes(currentLang.toLowerCase() as SupportedLocale)
    ? currentLang.toLowerCase()
    : DEFAULT_LOCALE;

  const enUrl = `${domain}/en/${normCountry}/${normCity}/${slug_en}/${normSlug}`;
  const urUrl = `${domain}/ur/${normCountry}/${normCity}/${slug_ur}/${normSlug}`;
  const arUrl = `${domain}/ar/${normCountry}/${normCity}/${slug_ar}/${normSlug}`;
  const xDefaultUrl = `${domain}/en/${normCountry}/${normCity}/${slug_en}/${normSlug}`;

  const canonicalUrl =
    lang === 'ur' ? urUrl : lang === 'ar' ? arUrl : enUrl;

  return {
    canonical: canonicalUrl,
    languages: {
      en: enUrl,
      ur: urUrl,
      ar: arUrl,
      'x-default': xDefaultUrl,
    },
  };
}

/**
 * Helper to build multi-lingual hreflang alternates for Next.js App Router XML Sitemap
 * Generates alternates: { languages: { en, ur, ar, 'x-default' } }
 */
export function buildSitemapAlternates(pathWithoutLocale: string): { languages: Record<string, string> } {
  const domain = getSiteUrl();
  const cleanPath = normalizePath(pathWithoutLocale);

  return {
    languages: {
      en: `${domain}/en${cleanPath}`,
      ur: `${domain}/ur${cleanPath}`,
      ar: `${domain}/ar${cleanPath}`,
      'x-default': `${domain}/en${cleanPath}`,
    },
  };
}
