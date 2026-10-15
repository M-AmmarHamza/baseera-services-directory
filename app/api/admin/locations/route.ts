import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/admin-auth';
import { COUNTRIES, CITIES } from '@/lib/db';
import { generateEnglishSlug } from '@/lib/transliterate';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export interface AdminCountry {
  id?: number | string;
  code: string;
  name: string;
  defaultCity?: string;
  flag: string;
  currency?: string;
  region?: string;
  is_active?: boolean;
}

export interface AdminCity {
  id?: number | string;
  name: string;
  slug: string;
  countryCode: string;
  country_code?: string;
  is_active?: boolean;
}

// Local runtime stores for newly created/modified locations
let localCountries: AdminCountry[] = COUNTRIES.map((c) => ({
  ...c,
  currency: 'USD',
  is_active: true,
}));

let localCities: AdminCity[] = CITIES.map((c, idx) => ({
  id: idx + 1,
  name: c.name,
  slug: c.slug,
  countryCode: c.countryCode,
  country_code: c.countryCode,
  is_active: true,
}));

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid } = await verifyAdminToken(token);
  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let dbCountries: any[] = [];
  let dbCities: any[] = [];

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      const [countriesRes, citiesRes] = await Promise.all([
        supabase.from('countries').select('*').order('name'),
        supabase.from('cities').select('*, countries(code, name)').order('name'),
      ]);

      if (Array.isArray(countriesRes.data) && countriesRes.data.length > 0) {
        dbCountries = countriesRes.data;
      }
      if (Array.isArray(citiesRes.data) && citiesRes.data.length > 0) {
        dbCities = citiesRes.data;
      }
    } catch (err) {
      console.warn('Locations fetch note:', err);
    }
  }

  // Combine DB and local seed data
  const finalCountries = dbCountries.length > 0 ? dbCountries : localCountries;
  const finalCities = dbCities.length > 0 ? dbCities : localCities;

  return NextResponse.json({
    countries: finalCountries,
    cities: finalCities,
    totalCountries: finalCountries.length,
    totalCities: finalCities.length,
  });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid } = await verifyAdminToken(token);
  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type } = body; // 'country' | 'city'

    if (type === 'country') {
      const { name, code, currency = 'USD', flag = '🌐', defaultCity } = body;
      if (!name || !code) {
        return NextResponse.json({ error: 'Name and Code are required' }, { status: 400 });
      }

      const cleanCode = code.trim().toLowerCase();

      const newCountry: AdminCountry = {
        name: name.trim(),
        code: cleanCode,
        defaultCity: defaultCity || 'city',
        flag: flag.trim() || '🌐',
        currency: currency.trim() || 'USD',
        is_active: true,
      };

      localCountries.unshift(newCountry);

      if (SUPABASE_URL && SUPABASE_KEY) {
        try {
          const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
          await supabase.from('countries').insert({
            name: newCountry.name,
            code: newCountry.code,
            slug: newCountry.code,
            currency: newCountry.currency,
            is_active: true,
          });
        } catch (err) {
          console.warn('DB country insert notice:', err);
        }
      }

      return NextResponse.json({ success: true, country: newCountry });
    }

    if (type === 'city') {
      const { name, country_code, slug, is_active = true } = body;
      if (!name || !country_code) {
        return NextResponse.json(
          { error: 'City name and Country selection are required' },
          { status: 400 }
        );
      }

      const cleanSlug = slug?.trim() || generateEnglishSlug(name) || 'city';
      const cleanCountryCode = country_code.trim().toLowerCase();

      const newCity: AdminCity = {
        id: Date.now(),
        name: name.trim(),
        slug: cleanSlug,
        countryCode: cleanCountryCode,
        country_code: cleanCountryCode,
        is_active: Boolean(is_active),
      };

      localCities.unshift(newCity);

      if (SUPABASE_URL && SUPABASE_KEY) {
        try {
          const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
          // Look up country ID from country_code
          const { data: countries } = await supabase
            .from('countries')
            .select('id')
            .eq('code', cleanCountryCode)
            .limit(1);

          const countryId = countries?.[0]?.id || 1;

          await supabase.from('cities').insert({
            country_id: countryId,
            name: newCity.name,
            slug: newCity.slug,
            is_active: newCity.is_active,
          });
        } catch (err) {
          console.warn('DB city insert notice:', err);
        }
      }

      return NextResponse.json({ success: true, city: newCity });
    }

    return NextResponse.json({ error: 'Invalid location type' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid } = await verifyAdminToken(token);
  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type'); // 'country' | 'city'
  const idOrSlug = searchParams.get('id');

  if (!idOrSlug) {
    return NextResponse.json({ error: 'Identifier is required' }, { status: 400 });
  }

  if (type === 'city') {
    localCities = localCities.filter(
      (c) => c.slug.toLowerCase() !== idOrSlug.toLowerCase() && String(c.id) !== idOrSlug
    );
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        await supabase.from('cities').delete().or(`slug.eq.${idOrSlug},id.eq.${idOrSlug}`);
      } catch (err) {
        console.warn('DB city delete notice:', err);
      }
    }
    return NextResponse.json({ success: true, message: 'City deleted' });
  }

  if (type === 'country') {
    localCountries = localCountries.filter(
      (c) => c.code.toLowerCase() !== idOrSlug.toLowerCase()
    );
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        await supabase.from('countries').delete().or(`code.eq.${idOrSlug},id.eq.${idOrSlug}`);
      } catch (err) {
        console.warn('DB country delete notice:', err);
      }
    }
    return NextResponse.json({ success: true, message: 'Country deleted' });
  }

  return NextResponse.json({ error: 'Invalid location type' }, { status: 400 });
}
