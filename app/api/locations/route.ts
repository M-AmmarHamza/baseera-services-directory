import { NextResponse } from 'next/server';
import { COUNTRIES, CITIES, Country, City } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://jkdzlunnrtfdmhgsmxyu.supabase.co';

const SUPABASE_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_ZWex7txUSkCUoSmlDdDQvg__cT_i9gI';

export interface GroupedCityItem {
  id?: string | number;
  slug: string;
  name: string;
  countryCode: string;
}

export interface GroupedCountryItem {
  id?: string | number;
  code: string;
  name: string;
  flag: string;
  region: string;
  cities: GroupedCityItem[];
}

export async function GET() {
  try {
    // 1. Initialize country map with all predefined/seeded countries
    const countryMap = new Map<string, GroupedCountryItem>();
    const cityMap = new Map<string, GroupedCityItem>();

    COUNTRIES.forEach((c) => {
      const code = c.code.toLowerCase();
      // Skip duplicate 'uk' code as 'gb' represents United Kingdom
      if (code === 'uk') return;

      countryMap.set(code, {
        code,
        name: c.name,
        flag: c.flag,
        region: c.region,
        cities: [],
      });
    });

    // Populate with local seeded cities
    CITIES.forEach((city) => {
      const code = city.countryCode.toLowerCase();
      const countryCode = code === 'uk' ? 'gb' : code;
      const key = `${countryCode}:${city.slug.toLowerCase()}`;

      if (!cityMap.has(key)) {
        cityMap.set(key, {
          slug: city.slug,
          name: city.name,
          countryCode,
        });
      }
    });

    // 2. Query Supabase database without any arbitrary limit (fetch all active locations)
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const res = await fetch(
          `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/cities?select=*,countries(*)&order=name.asc`,
          {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
            },
            cache: 'no-store',
          }
        );

        if (res.ok) {
          const dbCities = await res.json();
          if (Array.isArray(dbCities)) {
            for (const item of dbCities) {
              // Ensure city is active if the column exists
              if (item.is_active === false) continue;

              const cDetails = item.countries;
              const rawCountryCode = (cDetails?.code || item.country_code || '').toLowerCase();
              if (!rawCountryCode) continue;

              const countryCode = rawCountryCode === 'uk' ? 'gb' : rawCountryCode;

              // Ensure country exists in countryMap
              if (!countryMap.has(countryCode)) {
                countryMap.set(countryCode, {
                  id: cDetails?.id,
                  code: countryCode,
                  name: cDetails?.name || countryCode.toUpperCase(),
                  flag: cDetails?.flag || '🌍',
                  region: cDetails?.region || 'Global',
                  cities: [],
                });
              }

              const key = `${countryCode}:${item.slug.toLowerCase()}`;
              cityMap.set(key, {
                id: item.id,
                slug: item.slug,
                name: item.name,
                countryCode,
              });
            }
          }
        }
      } catch (dbErr) {
        console.warn('API /api/locations note: Supabase fetch skipped or offline, using robust seed data.', dbErr);
      }
    }

    // 3. Group cities into their respective countries
    for (const city of cityMap.values()) {
      const country = countryMap.get(city.countryCode);
      if (country) {
        country.cities.push(city);
      }
    }

    // 4. Sort countries alphabetically, and within each country, sort cities alphabetically
    const sortedCountries: GroupedCountryItem[] = Array.from(countryMap.values())
      .filter((c) => c.cities.length > 0)
      .map((c) => ({
        ...c,
        cities: c.cities.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));

    const totalCities = sortedCountries.reduce((sum, c) => sum + c.cities.length, 0);

    return NextResponse.json({
      success: true,
      totalCountries: sortedCountries.length,
      totalCities,
      data: sortedCountries,
    });
  } catch (err: any) {
    console.error('Error in /api/locations:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}
