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

// Country to default city and language mapping
const REGIONAL_ROUTING: Record<string, { country: string; city: string; defaultLang: string }> = {
  AE: { country: 'ae', city: 'dubai', defaultLang: 'ar' },
  PK: { country: 'pk', city: 'karachi', defaultLang: 'en' },
  SA: { country: 'sa', city: 'riyadh', defaultLang: 'ar' },
  QA: { country: 'qa', city: 'doha', defaultLang: 'ar' },
  OM: { country: 'om', city: 'muscat', defaultLang: 'ar' },
  BH: { country: 'bh', city: 'manama', defaultLang: 'ar' },
  KW: { country: 'kw', city: 'kuwait', defaultLang: 'ar' },
  GB: { country: 'gb', city: 'london', defaultLang: 'en' },
  US: { country: 'us', city: 'houston', defaultLang: 'en' },
  CA: { country: 'ca', city: 'toronto', defaultLang: 'en' },
};

function getPreferredLocale(request: NextRequest, defaultLocale: string): string {
  const acceptLang = request.headers.get('accept-language');
  if (acceptLang) {
    if (acceptLang.includes('ur')) return 'ur';
    if (acceptLang.includes('ar')) return 'ar';
    if (acceptLang.includes('en')) return 'en';
  }
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
    defaultLang: 'en',
  };

  const detectedCitySlug = generateEnglishSlug(geoCity) || regionInfo.city;
  const userLang = getPreferredLocale(request, regionInfo.defaultLang);

  // Check if pathname starts with a supported locale (/en, /ur, /ar)
  const pathnameHasLocale = SUPPORTED_LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If visiting root "/" or missing locale: redirect to localized geo-silo
  if (pathname === '/' || !pathnameHasLocale) {
    const targetCountry = regionInfo.country;
    const targetCity = detectedCitySlug;
    const cleanPath = pathname === '/' ? '' : pathname;

    // Geo-redirect to: /[lang]/[country]/[city]
    const redirectUrl = new URL(`/${userLang}/${targetCountry}/${targetCity}${cleanPath}`, request.url);
    
    const response = NextResponse.redirect(redirectUrl);
    response.headers.set('x-baseera-geo-country', targetCountry);
    response.headers.set('x-baseera-geo-city', targetCity);
    return response;
  }

  // Ensure any downstream segments are strictly English slugs
  const segments = pathname.split('/').filter(Boolean);
  const [lang, country, city, category, slug] = segments;

  let needsSanitization = false;
  const sanitizedSegments = segments.map((seg, idx) => {
    // Keep locale segment as is
    if (idx === 0) return seg;
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
  response.headers.set('x-baseera-lang', lang || 'en');
  response.headers.set('x-baseera-country', country || 'pk');
  response.headers.set('x-baseera-city', city || 'karachi');
  return response;
}
