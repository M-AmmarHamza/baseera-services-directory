import { getSiteUrl } from '@/lib/site-url';
import { getCategoryBySlug } from '@/lib/db';

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

/**
 * Specialized builder for Category Silo pages.
 * Resolves canonical category slug (aliases or Roman Urdu to canonical)
 * and formats pagination query param when page > 1.
 */
export function buildCategoryAlternates({
  country,
  city,
  category,
  currentLang,
  page,
}: {
  country: string;
  city: string;
  category: string;
  currentLang: string;
  page?: number;
}): AlternatesMetadata {
  const normCountry = (country || 'pk').toLowerCase().trim();
  const normCity = (city || 'karachi').toLowerCase().trim();

  // Resolve category to its canonical ASCII slug
  const catObj = getCategoryBySlug(category);
  const normCategory = (catObj?.slug || category || 'electrician').toLowerCase().trim();

  const basePath = `/${normCountry}/${normCity}/${normCategory}`;
  const searchParams = page && page > 1 ? { page } : undefined;

  return buildLanguageAlternates(basePath, currentLang, searchParams);
}

/**
 * Specialized builder for Provider Profile pages.
 * Preserves the canonical slug format: [slugified-name]-[publicId]
 */
export function buildProviderAlternates({
  country,
  city,
  category,
  slug,
  currentLang,
}: {
  country: string;
  city: string;
  category: string;
  slug: string;
  currentLang: string;
}): AlternatesMetadata {
  const normCountry = (country || 'pk').toLowerCase().trim();
  const normCity = (city || 'karachi').toLowerCase().trim();

  const catObj = getCategoryBySlug(category);
  const normCategory = (catObj?.slug || category || 'electrician').toLowerCase().trim();
  const normSlug = slug.toLowerCase().trim();

  const basePath = `/${normCountry}/${normCity}/${normCategory}/${normSlug}`;
  return buildLanguageAlternates(basePath, currentLang);
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
