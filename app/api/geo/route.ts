import { NextRequest, NextResponse } from 'next/server';
import { COUNTRIES, CITIES } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Primary capital or flagship city per country code fallback
const PRIMARY_CITIES: Record<string, string> = {
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
  br: 'sao-paulo',
  mx: 'mexico-city',
  ng: 'lagos',
  ke: 'nairobi',
};

export async function GET(request: NextRequest) {
  try {
    // Read geo headers provided by Vercel Edge / Cloudflare / Reverse Proxies
    const countryHeader = (
      request.headers.get('x-vercel-ip-country') ||
      request.headers.get('cf-ipcountry') ||
      request.headers.get('x-country-code') ||
      (request as any).geo?.country ||
      ''
    ).toLowerCase().trim();

    const cityHeader = (
      request.headers.get('x-vercel-ip-city') ||
      (request as any).geo?.city ||
      ''
    ).toLowerCase().trim();

    if (!countryHeader) {
      return NextResponse.json({
        detected: false,
        message: 'No geo country header detected',
      });
    }

    const country = COUNTRIES.find((c) => c.code.toLowerCase() === countryHeader);
    if (!country) {
      return NextResponse.json({
        detected: false,
        countryCode: countryHeader,
        message: 'Country not currently in Baseera directory database',
      });
    }

    // Try finding exact city or fallback to country primary city
    const countryCities = CITIES.filter(
      (c) => c.countryCode.toLowerCase() === country.code.toLowerCase()
    );

    let resolvedCity = countryCities.find(
      (c) => c.slug.toLowerCase() === cityHeader || c.name.toLowerCase() === cityHeader
    );

    if (!resolvedCity && countryCities.length > 0) {
      const primarySlug = PRIMARY_CITIES[country.code.toLowerCase()];
      resolvedCity =
        countryCities.find((c) => c.slug.toLowerCase() === primarySlug) ||
        countryCities[0];
    }

    if (!resolvedCity) {
      return NextResponse.json({
        detected: false,
        countryCode: country.code,
        countryName: country.name,
      });
    }

    return NextResponse.json({
      detected: true,
      countryCode: country.code,
      countryName: country.name,
      flag: country.flag,
      citySlug: resolvedCity.slug,
      cityName: resolvedCity.name,
    });
  } catch (err: any) {
    return NextResponse.json(
      { detected: false, error: err?.message || 'Geo detection error' },
      { status: 500 }
    );
  }
}
