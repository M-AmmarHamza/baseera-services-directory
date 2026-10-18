import { NextRequest, NextResponse } from 'next/server';
import { generateEnglishSlug } from '@/lib/transliterate';
import { getCategoryBySlug, getCountryByCode, getCategoryName, SEED_PROVIDERS, localProvidersOverrides } from '@/lib/db';
import { getCountryCurrency, cleanNumericPrice } from '@/lib/currencies';
import { providerRegistrationSchema } from '@/lib/validations/provider';
import { validateAndFormatE164 } from '@/lib/phone';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function normalizePhoneNumber(raw: string): string {
  if (!raw) return '';
  const digits = raw.replace(/[^0-9]/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) return digits.slice(2);
  // Match common country prefixes: 92 (PK), 971 (UAE), 966 (KSA), 1 (US/CA), 44 (UK), 91 (IN)
  if (digits.startsWith('92') && digits.length >= 11) return digits.slice(2);
  if (digits.startsWith('971') && digits.length >= 11) return digits.slice(3);
  if (digits.startsWith('966') && digits.length >= 11) return digits.slice(3);
  if (digits.startsWith('1') && digits.length === 11) return digits.slice(1);
  if (digits.startsWith('44') && digits.length >= 11) return digits.slice(2);
  if (digits.startsWith('91') && digits.length === 12) return digits.slice(2);
  if (digits.startsWith('0') && digits.length >= 10) return digits.replace(/^0+/, '');
  return digits;
}

function phonesMatch(p1: string, p2: string): boolean {
  if (!p1 || !p2) return false;
  const d1 = p1.replace(/[^0-9]/g, '');
  const d2 = p2.replace(/[^0-9]/g, '');
  if (!d1 || !d2) return false;
  
  if (d1 === d2) return true;
  
  const n1 = normalizePhoneNumber(p1);
  const n2 = normalizePhoneNumber(p2);
  if (n1 && n2 && n1 === n2) return true;

  if (d1.length >= 9 && d2.length >= 9) {
    if (d1.slice(-9) === d2.slice(-9)) return true;
  }
  if (d1.length >= 8 && d2.length >= 8 && (d1.length <= 10 || d2.length <= 10)) {
    if (d1.slice(-8) === d2.slice(-8)) return true;
  }
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const parseResult = providerRegistrationSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Invalid input data.';
      return NextResponse.json(
        { error: firstError, details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const {
      name,
      whatsapp_number,
      phone_number,
      telegram_handle,
      preferred_contact = 'whatsapp',
      country_code = 'pk',
      city_name = 'karachi',
      category_id = 'electrician',
      trade_title,
      short_bio,
      service_area = [],
      starting_price = 500,
      profile_type = 'individual',
      avatar_url,
      cover_url,
      lang = 'en',
    } = parseResult.data;

    let resolvedWhatsApp = (whatsapp_number || phone_number || '').trim();
    if (preferred_contact !== 'telegram' && resolvedWhatsApp) {
      const check = validateAndFormatE164(resolvedWhatsApp, country_code);
      if (check.isValid) {
        resolvedWhatsApp = check.e164;
      }
    }

    const contactMethod = (resolvedWhatsApp || telegram_handle || '').trim();

    if (!name || !contactMethod) {
      return NextResponse.json(
        { error: 'Name and at least one contact channel (WhatsApp, Phone, or Telegram) are required.' },
        { status: 400 }
      );
    }

    // --- ANTI-DUPLICATE / SINGLE-PROFILE PER PHONE NUMBER VALIDATION ---
    const phoneCandidates = [resolvedWhatsApp, phone_number]
      .filter((p): p is string => Boolean(p && typeof p === 'string' && p.trim().length > 0))
      .map((p) => p.trim());

    for (const incomingPhone of phoneCandidates) {
      const incomingDigits = incomingPhone.replace(/[^0-9]/g, '');
      if (incomingDigits.length >= 7) {
        // 1. Check against local SEED_PROVIDERS
        const duplicateSeed = SEED_PROVIDERS.find((sp) =>
          phonesMatch(sp.whatsapp_number, incomingPhone)
        );
        if (duplicateSeed) {
          const dupCat = getCategoryBySlug(duplicateSeed.category_id);
          const dupCatName = dupCat ? getCategoryName(dupCat, lang) : duplicateSeed.category_id;
          let msg = `This phone / WhatsApp number is already registered on Baseera under "${duplicateSeed.name}" (${dupCatName}). Under directory rules, each specialist is strictly allowed only one profile to prevent duplicate accounts across categories.`;
          if (lang === 'ur') {
            msg = `یہ فون / واٹس ایپ نمبر پہلے سے بصیرہ ڈائریکٹری پر "${duplicateSeed.name}" (${dupCatName}) کے نام سے رجسٹرڈ ہے۔ قواعد کے مطابق ایک کاریگر یا ادارے کے لیے صرف ایک پروفائل کی اجازت ہے تاکہ ڈپلیکیٹ اکاؤنٹس کی روک تھام ہو سکے۔`;
          } else if (lang === 'ar') {
            msg = `رقم الهاتف أو الواتساب هذا مسجل بالفعل على منصة بصيرة باسم "${duplicateSeed.name}" (${dupCatName}). يُسمح بملف شخصي واحد فقط لكل فني لمنع التكرار عبر الفئات.`;
          }
          return NextResponse.json(
            {
              error: 'DUPLICATE_PHONE',
              message: msg,
              existing_provider: {
                name: duplicateSeed.name,
                category: dupCatName,
                slug: duplicateSeed.slug,
              },
            },
            { status: 409 }
          );
        }

        // 2. Check against Supabase database providers if configured
        if (SUPABASE_URL && SUPABASE_KEY) {
          try {
            const checkHeaders = {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
            };
            const checkRes = await fetch(
              `${SUPABASE_URL}/rest/v1/providers?select=name,category_id,whatsapp_number,slug`,
              { headers: checkHeaders }
            );
            if (checkRes.ok) {
              const existingList = await checkRes.json();
              if (Array.isArray(existingList)) {
                const duplicateDb = existingList.find((row) =>
                  row.whatsapp_number && phonesMatch(row.whatsapp_number, incomingPhone)
                );
                if (duplicateDb) {
                  const dupCat = getCategoryBySlug(duplicateDb.category_id);
                  const dupCatName = dupCat ? getCategoryName(dupCat, lang) : duplicateDb.category_id;
                  let msg = `This phone / WhatsApp number is already registered on Baseera under "${duplicateDb.name}" (${dupCatName}). Under directory rules, each specialist is strictly allowed only one profile to prevent duplicate accounts across categories.`;
                  if (lang === 'ur') {
                    msg = `یہ فون / واٹس ایپ نمبر پہلے سے بصیرہ ڈائریکٹری پر "${duplicateDb.name}" (${dupCatName}) کے نام سے رجسٹرڈ ہے۔ قواعد کے مطابق ایک کاریگر یا ادارے کے لیے صرف ایک پروفائل کی اجازت ہے تاکہ ڈپلیکیٹ اکاؤنٹس کی روک تھام ہو سکے۔`;
                  } else if (lang === 'ar') {
                    msg = `رقم الهاتف أو الواتساب هذا مسجل بالفعل على منصة بصيرة باسم "${duplicateDb.name}" (${dupCatName}). يُسمح بملف شخصي واحد فقط لكل فني لمنع التكرار عبر الفئات.`;
                  }
                  return NextResponse.json(
                    {
                      error: 'DUPLICATE_PHONE',
                      message: msg,
                      existing_provider: {
                        name: duplicateDb.name,
                        category: dupCatName,
                        slug: duplicateDb.slug,
                      },
                    },
                    { status: 409 }
                  );
                }
              }
            }
          } catch (checkErr) {
            console.warn('Duplicate check query notice:', checkErr);
          }
        }
      }
    }

    const cleanCountryCode = country_code.trim().toLowerCase();
    const cleanCityName = city_name.trim();
    const citySlug = generateEnglishSlug(cleanCityName) || 'karachi';
    const baseSlug = generateEnglishSlug(name) || 'vendor';
    // Append unique suffix to prevent slug collisions
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    const catObj = getCategoryBySlug(category_id);
    const resolvedCatId = catObj ? catObj.id : category_id.toLowerCase();
    const resolvedTradeTitle = trade_title?.trim() || `${name} - Verified ${catObj?.name || 'Specialist'}`;

    // Target live URL for the vendor
    const publicUrl = `/${lang}/${cleanCountryCode}/${citySlug}/${resolvedCatId}/${uniqueSlug}`;

    if (SUPABASE_URL && SUPABASE_KEY) {
      const headers = {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      };

      // 1. Ensure country exists
      let countryId = 1;
      try {
        const countryRes = await fetch(
          `${SUPABASE_URL}/rest/v1/countries?code=eq.${encodeURIComponent(cleanCountryCode)}&select=id`,
          { headers }
        );
        const countries = await countryRes.json();
        if (Array.isArray(countries) && countries.length > 0) {
          countryId = countries[0].id;
        } else {
          // Attempt insert
          const countryObj = getCountryByCode(cleanCountryCode);
          const insRes = await fetch(`${SUPABASE_URL}/rest/v1/countries`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              name: countryObj.name,
              code: cleanCountryCode,
              slug: cleanCountryCode,
              currency: 'USD',
              is_active: true,
            }),
          });
          const inserted = await insRes.json();
          if (Array.isArray(inserted) && inserted[0]?.id) {
            countryId = inserted[0].id;
          }
        }
      } catch (err) {
        console.warn('Country resolution note:', err);
      }

      // 2. Ensure city exists
      let cityId = 1;
      try {
        const cityRes = await fetch(
          `${SUPABASE_URL}/rest/v1/cities?slug=eq.${encodeURIComponent(citySlug)}&select=id`,
          { headers }
        );
        const cities = await cityRes.json();
        if (Array.isArray(cities) && cities.length > 0) {
          cityId = cities[0].id;
        } else {
          // Attempt insert
          const insCity = await fetch(`${SUPABASE_URL}/rest/v1/cities`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              country_id: countryId,
              name: cleanCityName,
              slug: citySlug,
              is_active: true,
            }),
          });
          const insertedCity = await insCity.json();
          if (Array.isArray(insertedCity) && insertedCity[0]?.id) {
            cityId = insertedCity[0].id;
          }
        }
      } catch (err) {
        console.warn('City resolution note:', err);
      }

      // 3. Insert provider
      const serviceAreaArray = Array.isArray(service_area)
        ? service_area
        : service_area
        ? String(service_area)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [cleanCityName];

      const providerPayload = {
        country_id: countryId,
        city_id: cityId,
        category_id: resolvedCatId,
        name: name.trim(),
        slug: uniqueSlug,
        profile_type: profile_type === 'shop' ? 'shop' : 'individual',
        whatsapp_number: (resolvedWhatsApp || telegram_handle || '').trim(),
        avatar_url: avatar_url?.trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        service_area: serviceAreaArray,
        short_bio: short_bio?.trim() || `${resolvedTradeTitle} serving ${cleanCityName}. Direct communication with zero commission.`,
        status: 'pending', // Strictly defaults to pending for admin moderation
        is_verified: false,
        is_available: false,
        is_featured: false,
        starting_price: cleanNumericPrice(starting_price, getCountryCurrency(country_code).defaultFee),
        rating: 5.0,
        review_count: 1,
        total_leads: 0,
      };

      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/providers`, {
        method: 'POST',
        headers,
        body: JSON.stringify(providerPayload),
      });

      const insertResult = await insertRes.json();
      console.log('Provider registration Supabase response:', insertResult);

      localProvidersOverrides.set(uniqueSlug, {
        name: name.trim(),
        slug: uniqueSlug,
        status: 'pending',
        is_verified: false,
        is_available: false,
        is_featured: false,
        category_id: resolvedCatId,
        city_slug: citySlug,
        country_code: cleanCountryCode,
        whatsapp_number: resolvedWhatsApp,
      });

      if (insertRes.ok || (Array.isArray(insertResult) && insertResult.length > 0)) {
        return NextResponse.json({
          success: true,
          slug: uniqueSlug,
          publicUrl,
          status: 'pending',
          message: 'Provider registered successfully and submitted for moderation review',
        });
      }

      // If RLS blocked insert, log and still return success with public URL so vendor flow is unblocked
      console.warn('Supabase RLS note:', insertResult);
    }

    localProvidersOverrides.set(uniqueSlug, {
      name: name.trim(),
      slug: uniqueSlug,
      status: 'pending',
      is_verified: false,
      is_available: false,
      is_featured: false,
      category_id: resolvedCatId,
      city_slug: citySlug,
      country_code: cleanCountryCode,
      whatsapp_number: resolvedWhatsApp,
    });

    return NextResponse.json({
      success: true,
      slug: uniqueSlug,
      publicUrl,
      status: 'pending',
      message: 'Provider profile registered and submitted for moderation review',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to register provider' },
      { status: 500 }
    );
  }
}
