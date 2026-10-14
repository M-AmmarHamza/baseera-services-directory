import { NextRequest, NextResponse } from 'next/server';
import { generateEnglishSlug } from './lib/transliterate';

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (/api/...)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, documents, sitemap, robots
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
};

const SUPPORTED_LOCALES = ['en', 'ur', 'ar'];
const DEFAULT_LOCALE = 'en';

// Fallback primary cities per country code (ISO 2-letter lowercase)
const COUNTRY_DEFAULT_CITIES: Record<string, string> = {
  ae: 'dubai',
  pk: 'karachi',
  sa: 'riyadh',
  qa: 'doha',
  kw: 'kuwait',
  bh: 'manama',
  om: 'muscat',
  us: 'new-york',
  gb: 'london',
  ca: 'toronto',
  in: 'mumbai',
  bd: 'dhaka',
  tr: 'istanbul',
  de: 'berlin',
  fr: 'paris',
  it: 'rome',
  es: 'madrid',
  nl: 'amsterdam',
  au: 'sydney',
  my: 'kuala-lumpur',
  sg: 'singapore',
  eg: 'cairo',
  za: 'johannesburg',
};

// Legacy profile mappings for SEO redirects
const LEGACY_PROVIDER_MAP: Record<string, { category: string; slug: string }> = {
  'tariq-electric': { category: 'electrician-services', slug: 'tariq-mahmood' },
  'tariq-mahmood': { category: 'electrician-services', slug: 'tariq-mahmood' },
  'irfan-electrician': { category: 'electrician-services', slug: 'tariq-mahmood' },
  'saleem-master-plumber': { category: 'plumbing-services', slug: 'saleem-master-plumber' },
  'master-plumber-saleem': { category: 'plumbing-services', slug: 'saleem-master-plumber' },
  'raheem-plumber': { category: 'plumbing-services', slug: 'raheem-plumber' },
  'asif-electric-works': { category: 'electrician-services', slug: 'asif-electric-works' },
  'kashif-ali': { category: 'ac-repair', slug: 'kashif-ali' },
  'karachi-cooling-expert': { category: 'ac-repair', slug: 'kashif-ali' },
  'farzana-kitchen': { category: 'home-chef', slug: 'farzana-kitchen' },
  'rashid-al-nuaimi': { category: 'ac-repair', slug: 'rashid-al-nuaimi' },
};

// SEO Slug redirects for legacy or short category names
const SHORT_CATEGORY_REDIRECTS: Record<string, string> = {
  ac: 'ac-repair',
  food: 'home-chef',
  electrician: 'electrician-services',
  plumbing: 'plumbing-services',
  generator: 'generator-services',
  solar: 'solar-energy',
  cctv: 'cctv-security',
  cleaning: 'home-cleaning',
  carpenter: 'carpenter-services',
  painter: 'painting-services',
  appliances: 'appliance-repair',
};

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Bypass sitemap and robots.txt
  if (pathname === '/sitemap.xml' || pathname === '/robots.txt') {
    return NextResponse.next();
  }

  // 1. Detect user country and city using Vercel Edge req.geo with header fallbacks
  const geoCountry = (
    (request as any).geo?.country ||
    request.headers.get('x-vercel-ip-country') ||
    'AE' // Default to UAE / Global Hub
  ).toLowerCase();

  const geoCityRaw = (
    (request as any).geo?.city ||
    request.headers.get('x-vercel-ip-city') ||
    ''
  );

  // Generate ASCII slug for detected city or fallback to country capital/primary city
  const detectedCitySlug = geoCityRaw
    ? generateEnglishSlug(geoCityRaw) || (COUNTRY_DEFAULT_CITIES[geoCountry] || 'dubai')
    : (COUNTRY_DEFAULT_CITIES[geoCountry] || 'dubai');

  // Handle unlocalized legacy routes (e.g., /provider-profile.html)
  if (pathname.includes('provider-profile')) {
    const rawId = searchParams.get('id') || searchParams.get('slug') || '';
    const resolved = LEGACY_PROVIDER_MAP[rawId.toLowerCase()] || { category: 'electrician', slug: 'tariq-mahmood' };
    return NextResponse.redirect(
      new URL(`/${DEFAULT_LOCALE}/${geoCountry}/${detectedCitySlug}/${resolved.category}/${resolved.slug}`, request.url),
      308
    );
  }

  if (pathname.includes('categories.html')) {
    const rawCat = searchParams.get('cat') || searchParams.get('category') || '';
    const targetCat = SHORT_CATEGORY_REDIRECTS[rawCat.toLowerCase()] || rawCat;
    return NextResponse.redirect(
      new URL(`/${DEFAULT_LOCALE}/${geoCountry}/${detectedCitySlug}${targetCat ? `/${targetCat}` : ''}`, request.url),
      308
    );
  }

  // 2. Parse language segment from path
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();
  const isSupportedLocale = SUPPORTED_LOCALES.includes(firstSegment);

  // 3. Auto-redirect root "/" to the IP-detected localized path (e.g. baseera.com/en/ae/dubai)
  if (pathname === '/' || pathname === '/index.html') {
    return NextResponse.redirect(
      new URL(`/${DEFAULT_LOCALE}/${geoCountry}/${detectedCitySlug}`, request.url),
      307 // Temporary redirect based on dynamic user IP
    );
  }

  // If path lacks a supported locale prefix, prepend default locale
  if (!isSupportedLocale) {
    return NextResponse.redirect(
      new URL(`/${DEFAULT_LOCALE}${pathname}`, request.url),
      308
    );
  }

  const lang = firstSegment;

  // If visiting "/en", "/ur", "/ar" directly without country/city, auto-redirect based on IP
  if (segments.length === 1) {
    // Check if query string requested the global directory view explicitly
    if (searchParams.get('view') === 'global') {
      const response = NextResponse.next();
      response.headers.set('x-baseera-lang', lang);
      return response;
    }

    return NextResponse.redirect(
      new URL(`/${lang}/${geoCountry}/${detectedCitySlug}`, request.url),
      307
    );
  }

  // Handle top-level routes (e.g. /en/join, /en/vendors, /en/search)
  if (segments.length === 2) {
    const secondSegment = segments[1].toLowerCase();
    if (['join', 'vendors', 'search', 'services', 'dashboard', 'blog', 'admin'].includes(secondSegment)) {
      const response = NextResponse.next();
      response.headers.set('x-baseera-lang', lang);
      return response;
    }

    // Country hub without city -> auto-redirect to default city of that country
    const country = secondSegment;
    const targetCity = COUNTRY_DEFAULT_CITIES[country] || (country === 'pk' ? 'karachi' : 'main-city');
    return NextResponse.redirect(
      new URL(`/${lang}/${country}/${targetCity}`, request.url),
      308
    );
  }

  // Canonical SEO Category Slug Redirects (e.g., /pk/karachi/ac -> /pk/karachi/ac-repair)
  if (segments.length >= 4 && !['blog', 'admin', 'dashboard'].includes(segments[1])) {
    const rawCategory = segments[3].toLowerCase();
    const canonicalCategory = SHORT_CATEGORY_REDIRECTS[rawCategory];
    if (canonicalCategory && canonicalCategory !== rawCategory) {
      const canonicalSegments = [...segments];
      canonicalSegments[3] = canonicalCategory;
      const targetUrl = new URL(`/${canonicalSegments.join('/')}`, request.url);
      targetUrl.search = request.nextUrl.search;
      return NextResponse.redirect(targetUrl, 308);
    }
  }

  // Downstream path sanitization for ASCII slugs
  let needsSanitization = false;
  const sanitizedSegments = segments.map((seg, idx) => {
    if (idx === 0) return seg; // Keep locale intact
    const clean = generateEnglishSlug(seg);
    if (clean !== seg) needsSanitization = true;
    return clean;
  });

  if (needsSanitization) {
    const sanitizedUrl = new URL(`/${sanitizedSegments.join('/')}`, request.url);
    sanitizedUrl.search = request.nextUrl.search;
    return NextResponse.redirect(sanitizedUrl, 308);
  }

  const [_, country, city] = segments;
  const response = NextResponse.next();
  response.headers.set('x-baseera-lang', lang);
  response.headers.set('x-baseera-country', country || geoCountry);
  response.headers.set('x-baseera-city', city || detectedCitySlug);
  return response;
}
