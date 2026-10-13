import { NextRequest, NextResponse } from 'next/server';
import { generateEnglishSlug } from './lib/transliterate';

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (/api/...)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, documents
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
};

const SUPPORTED_LOCALES = ['en', 'ur', 'ar'];
const DEFAULT_LOCALE = 'en';

const COUNTRY_DEFAULTS: Record<string, string> = {
  pk: 'karachi',
  ae: 'dubai',
  sa: 'riyadh',
  qa: 'doha',
  kw: 'kuwait',
  bh: 'manama',
  om: 'muscat',
  in: 'mumbai',
  bd: 'dhaka',
  tr: 'istanbul',
  us: 'new-york',
  ca: 'toronto',
  mx: 'mexico-city',
  br: 'sao-paulo',
  gb: 'london',
  de: 'berlin',
  fr: 'paris',
  it: 'rome',
  es: 'madrid',
  nl: 'amsterdam',
  ie: 'dublin',
  ch: 'zurich',
  au: 'sydney',
  nz: 'auckland',
  my: 'kuala-lumpur',
  sg: 'singapore',
  id: 'jakarta',
  jp: 'tokyo',
  za: 'johannesburg',
  eg: 'cairo',
  ng: 'lagos',
  ke: 'nairobi',
};

// Regional routing defaults
const REGIONAL_ROUTING: Record<string, { country: string; city: string; defaultLang: string }> = {
  AE: { country: 'ae', city: 'dubai', defaultLang: 'en' },
  PK: { country: 'pk', city: 'karachi', defaultLang: 'en' },
  SA: { country: 'sa', city: 'riyadh', defaultLang: 'en' },
  QA: { country: 'qa', city: 'doha', defaultLang: 'en' },
  OM: { country: 'om', city: 'muscat', defaultLang: 'en' },
  BH: { country: 'bh', city: 'manama', defaultLang: 'en' },
  KW: { country: 'kw', city: 'kuwait', defaultLang: 'en' },
  GB: { country: 'gb', city: 'london', defaultLang: 'en' },
  US: { country: 'us', city: 'new-york', defaultLang: 'en' },
  CA: { country: 'ca', city: 'toronto', defaultLang: 'en' },
  AU: { country: 'au', city: 'sydney', defaultLang: 'en' },
  DE: { country: 'de', city: 'berlin', defaultLang: 'en' },
  FR: { country: 'fr', city: 'paris', defaultLang: 'en' },
  TR: { country: 'tr', city: 'istanbul', defaultLang: 'en' },
};

const LEGACY_PROVIDER_MAP: Record<string, { category: string; slug: string }> = {
  'tariq-electric': { category: 'electrician', slug: 'tariq-mahmood' },
  'tariq-mahmood': { category: 'electrician', slug: 'tariq-mahmood' },
  'irfan-electrician': { category: 'electrician', slug: 'tariq-mahmood' },
  'saleem-master-plumber': { category: 'plumbing', slug: 'saleem-master-plumber' },
  'master-plumber-saleem': { category: 'plumbing', slug: 'saleem-master-plumber' },
  'raheem-plumber': { category: 'plumbing', slug: 'raheem-plumber' },
  'asif-electric-works': { category: 'electrician', slug: 'asif-electric-works' },
  'kashif-ali': { category: 'ac', slug: 'kashif-ali' },
  'karachi-cooling-expert': { category: 'ac', slug: 'kashif-ali' },
  'farzana-kitchen': { category: 'food', slug: 'farzana-kitchen' },
  'rashid-al-nuaimi': { category: 'ac', slug: 'rashid-al-nuaimi' },
};

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Let sitemap and robots pass through directly without locale redirection
  if (pathname === '/sitemap.xml' || pathname === '/robots.txt') {
    return NextResponse.next();
  }

  // Read Vercel Geo IP headers / object
  const geoCountry = (((request as any).geo?.country || request.headers.get('x-vercel-ip-country') || 'PK') as string).toUpperCase();
  const geoCity = ((request as any).geo?.city || request.headers.get('x-vercel-ip-city') || 'Karachi') as string;

  const regionInfo = REGIONAL_ROUTING[geoCountry] || {
    country: 'pk',
    city: 'karachi',
    defaultLang: DEFAULT_LOCALE,
  };

  const detectedCitySlug = generateEnglishSlug(geoCity) || regionInfo.city;

  // 1. Intercept unlocalized legacy routes (e.g. /provider-profile.html, /categories.html, /index.html)
  if (pathname.includes('provider-profile')) {
    const rawId = searchParams.get('id') || searchParams.get('slug') || '';
    const resolved = LEGACY_PROVIDER_MAP[rawId.toLowerCase()] || { category: 'electrician', slug: 'tariq-mahmood' };
    return NextResponse.redirect(
      new URL(`/${DEFAULT_LOCALE}/${regionInfo.country}/${detectedCitySlug}/${resolved.category}/${resolved.slug}`, request.url),
      308
    );
  }

  if (pathname.includes('categories.html')) {
    const targetCat = searchParams.get('cat') || searchParams.get('category');
    return NextResponse.redirect(
      new URL(`/${DEFAULT_LOCALE}/${regionInfo.country}/${detectedCitySlug}${targetCat ? `/${targetCat}` : ''}`, request.url),
      308
    );
  }

  if (pathname === '/index.html' || pathname === '/') {
    // User requested global site by default!
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}`, request.url), 308);
  }

  // Check if pathname starts with a supported locale (/en, /ur, /ar)
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();
  const isSupportedLocale = SUPPORTED_LOCALES.includes(firstSegment);

  // If path has no valid locale prefix: prefix with /en
  if (!isSupportedLocale) {
    return NextResponse.redirect(
      new URL(`/${DEFAULT_LOCALE}${pathname}`, request.url),
      308
    );
  }

  const lang = firstSegment;

  // Case A: Just "/en", "/ur", or "/ar" -> Render the Global Directory Portal!
  if (segments.length === 1) {
    const response = NextResponse.next();
    response.headers.set('x-baseera-lang', lang);
    return response;
  }

  // Case B: Just "/en/pk", "/ur/pk", or "/en/ae" (country hub without city) -> Go to primary city
  if (segments.length === 2) {
    const country = segments[1].toLowerCase();
    const targetCity = COUNTRY_DEFAULTS[country] || (country === 'pk' ? 'karachi' : 'main-city');
    return NextResponse.redirect(
      new URL(`/${lang}/${country}/${targetCity}`, request.url),
      308
    );
  }

  const [_, country, city, category, slug] = segments;

  // Case C: Intercept legacy URLs with locale (e.g. /en/pk/karachi/provider-profilehtml)
  if (category && category.includes('provider-profile')) {
    const rawId = searchParams.get('id') || slug || '';
    const resolved = LEGACY_PROVIDER_MAP[rawId.toLowerCase()] || { category: 'electrician', slug: 'tariq-mahmood' };
    return NextResponse.redirect(
      new URL(`/${lang}/${country}/${city}/${resolved.category}/${resolved.slug}`, request.url),
      308
    );
  }

  if (category && (category.includes('categories') || category.includes('index'))) {
    return NextResponse.redirect(new URL(`/${lang}/${country}/${city}`, request.url), 308);
  }

  // Ensure any downstream segments are strictly English ASCII slugs
  let needsSanitization = false;
  const sanitizedSegments = segments.map((seg, idx) => {
    if (idx === 0) return seg; // Keep locale as is
    const clean = generateEnglishSlug(seg);
    if (clean !== seg) needsSanitization = true;
    return clean;
  });

  if (needsSanitization) {
    const sanitizedUrl = new URL(`/${sanitizedSegments.join('/')}`, request.url);
    sanitizedUrl.search = request.nextUrl.search;
    return NextResponse.redirect(sanitizedUrl, 308); // Permanent SEO redirect
  }

  const response = NextResponse.next();
  response.headers.set('x-baseera-lang', lang);
  response.headers.set('x-baseera-country', country || 'pk');
  response.headers.set('x-baseera-city', city || 'karachi');
  return response;
}
