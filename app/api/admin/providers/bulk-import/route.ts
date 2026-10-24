import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';
import { z } from 'zod';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/admin-auth';
import {
  CATEGORIES,
  COUNTRIES,
  CITIES,
  getCategoryBySlug,
  getCountryByCode,
  Provider,
  localImportedProviders,
  localProvidersOverrides,
} from '@/lib/db';
import { validateAndFormatE164 } from '@/lib/phone';
import { generateEnglishSlug } from '@/lib/transliterate';
import { generateUniqueSlug } from '@/lib/slug';
import { getCountryCurrency } from '@/lib/currencies';
import { sanitizeText, sanitizeCsvCell } from '@/lib/security';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Safe string builder neutralizing CSV Formula/Macro Injection (CWE-1236) & XSS
const safeString = (minLen = 0, fieldName = 'Field') =>
  z
    .string()
    .transform((val) => sanitizeText(sanitizeCsvCell(val)))
    .refine((val) => val.length >= minLen, {
      message: `${fieldName} must be at least ${minLen} characters.`,
    });

// Zod Schema for row validation with strict anti-macro injection guards
const rawRowSchema = z.object({
  fullName: safeString(2, 'Full name'),
  whatsappNumber: safeString(5, 'WhatsApp number'),
  categorySlug: safeString(1, 'Category slug'),
  citySlug: safeString(1, 'City slug'),
  countrySlug: safeString(2, 'Country slug'),
  tradeTitle: z
    .string()
    .optional()
    .transform((val) => sanitizeText(sanitizeCsvCell(val || ''))),
  shortBio: z
    .string()
    .optional()
    .transform((val) => sanitizeText(sanitizeCsvCell(val || ''))),
  profileType: z.enum(['individual', 'shop']).optional().default('individual'),
  startingPrice: z.coerce.number().min(0).optional().default(0),
  serviceArea: z
    .string()
    .optional()
    .transform((val) => sanitizeText(sanitizeCsvCell(val || ''))),
});

interface FailedRowReport {
  rowNumber: number;
  name: string;
  reason: string;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate Admin
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const { valid } = await verifyAdminToken(token);
    if (!valid) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await req.json();
    const {
      csvContent,
      rows: directRows,
      defaultStatus = 'approved',
    } = body || {};

    let rawRows: any[] = [];

    // Parse CSV content if passed as string
    if (typeof csvContent === 'string' && csvContent.trim()) {
      const parseResult = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: 'greedy',
        transformHeader: (h) => h.trim(),
      });
      rawRows = parseResult.data as any[];
    } else if (Array.isArray(directRows)) {
      rawRows = directRows;
    } else {
      return NextResponse.json(
        { error: 'Invalid payload: either csvContent or rows array is required.' },
        { status: 400 }
      );
    }

    if (rawRows.length === 0) {
      return NextResponse.json(
        { error: 'No data rows found in the uploaded CSV.' },
        { status: 400 }
      );
    }

    const allowedStatuses = ['published', 'approved', 'pending', 'suspended', 'rejected'];
    const chosenStatus = allowedStatuses.includes(defaultStatus)
      ? (defaultStatus === 'approved' ? 'published' : defaultStatus)
      : 'published';

    const validProvidersToInsert: Provider[] = [];
    const failedRows: FailedRowReport[] = [];
    const batchSlugs = new Set<string>();

    // 2. Iterate, Validate and Relational Integrity Check
    for (let i = 0; i < rawRows.length; i++) {
      const raw = rawRows[i];
      const rowNum = i + 1;

      // Normalize common header name variations
      const normalizedRow = {
        fullName:
          raw.fullName ??
          raw.full_name ??
          raw.name ??
          raw.FullName ??
          raw['Full Name'] ??
          raw['Provider Name'] ??
          '',
        whatsappNumber:
          raw.whatsappNumber ??
          raw.whatsapp_number ??
          raw.phone ??
          raw.phoneNumber ??
          raw.phone_number ??
          raw.whatsapp ??
          raw['WhatsApp Number'] ??
          raw['Phone'] ??
          '',
        categorySlug:
          raw.categorySlug ??
          raw.category_slug ??
          raw.category ??
          raw.category_id ??
          raw['Category Slug'] ??
          raw['Category'] ??
          '',
        citySlug:
          raw.citySlug ??
          raw.city_slug ??
          raw.city ??
          raw['City Slug'] ??
          raw['City'] ??
          '',
        countrySlug:
          raw.countrySlug ??
          raw.country_slug ??
          raw.country ??
          raw.country_code ??
          raw['Country Slug'] ??
          raw['Country'] ??
          '',
        tradeTitle:
          raw.tradeTitle ??
          raw.trade_title ??
          raw['Trade Title'] ??
          raw['Headline'] ??
          '',
        shortBio:
          raw.shortBio ??
          raw.short_bio ??
          raw.bio ??
          raw['Short Bio'] ??
          raw['Bio'] ??
          '',
        profileType: (
          raw.profileType ??
          raw.profile_type ??
          raw['Profile Type'] ??
          'individual'
        )
          .toString()
          .toLowerCase()
          .trim() === 'shop'
            ? 'shop'
            : 'individual',
        startingPrice:
          raw.startingPrice ??
          raw.starting_price ??
          raw.price ??
          raw['Starting Price'] ??
          0,
        serviceArea:
          raw.serviceArea ??
          raw.service_area ??
          raw['Service Area'] ??
          raw.areas ??
          '',
      };

      // Zod shape validation
      const parseResult = rawRowSchema.safeParse(normalizedRow);
      if (!parseResult.success) {
        const errorMsg = parseResult.error.issues.map((iss) => iss.message).join('; ');
        failedRows.push({
          rowNumber: rowNum,
          name: normalizedRow.fullName || `Row ${rowNum}`,
          reason: errorMsg,
        });
        continue;
      }

      const data = parseResult.data;

      // Relational Check: Country
      const normCountry = data.countrySlug.toLowerCase().trim();
      const countryObj =
        COUNTRIES.find(
          (c) =>
            c.code.toLowerCase() === normCountry ||
            c.name.toLowerCase() === normCountry
        ) || getCountryByCode(normCountry);

      if (!countryObj || !countryObj.code) {
        failedRows.push({
          rowNumber: rowNum,
          name: data.fullName,
          reason: `Country '${data.countrySlug}' is not recognized in directory.`,
        });
        continue;
      }

      // Relational Check: Category
      const normCategory = data.categorySlug.toLowerCase().trim();
      const categoryObj =
        getCategoryBySlug(normCategory) ||
        CATEGORIES.find(
          (c) =>
            c.id.toLowerCase() === normCategory ||
            c.slug.toLowerCase() === normCategory ||
            c.name.toLowerCase() === normCategory
        );

      if (!categoryObj) {
        failedRows.push({
          rowNumber: rowNum,
          name: data.fullName,
          reason: `Category '${data.categorySlug}' does not exist in database.`,
        });
        continue;
      }

      // Relational Check: City
      const normCity = data.citySlug.toLowerCase().trim();
      const cityObj = CITIES.find(
        (c) =>
          c.slug.toLowerCase() === normCity &&
          c.countryCode.toLowerCase() === countryObj.code.toLowerCase()
      ) || CITIES.find((c) => c.slug.toLowerCase() === normCity);

      if (!cityObj) {
        failedRows.push({
          rowNumber: rowNum,
          name: data.fullName,
          reason: `City '${data.citySlug}' does not exist for country '${countryObj.code}'.`,
        });
        continue;
      }

      // Strict Phone Number E.164 Validation
      const phoneValidation = validateAndFormatE164(data.whatsappNumber, countryObj.code);
      if (!phoneValidation.isValid || !phoneValidation.e164) {
        failedRows.push({
          rowNumber: rowNum,
          name: data.fullName,
          reason: `Invalid WhatsApp number '${data.whatsappNumber}' for country '${countryObj.code}'. Expected format (e.g. +${phoneValidation.countryCallingCode || '92'}...).`,
        });
        continue;
      }

      // Parse service areas
      const parsedAreas = data.serviceArea
        ? data.serviceArea
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [cityObj.name];

      // Robust 3-tier Unique Slug Generation with in-batch and database collision detection
      const uniqueSlug = await generateUniqueSlug(
        data.fullName,
        phoneValidation.e164 || data.whatsappNumber,
        {
          cityId: cityObj.slug,
          categoryId: categoryObj.id,
          existingSlugs: batchSlugs,
        }
      );
      batchSlugs.add(uniqueSlug);

      const defaultFee = getCountryCurrency(countryObj.code).defaultFee;

      const newProvider: Provider = {
        id: crypto.randomUUID(),
        name: data.fullName,
        slug: uniqueSlug,
        profile_type: data.profileType,
        category_id: categoryObj.id,
        trade_title:
          data.tradeTitle || `${data.fullName} - Verified ${categoryObj.name}`,
        city_slug: cityObj.slug,
        country_code: countryObj.code.toLowerCase(),
        district: cityObj.name,
        service_area: parsedAreas.length > 0 ? parsedAreas : [cityObj.name],
        whatsapp_number: phoneValidation.e164,
        phone_number: phoneValidation.e164,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.fullName)}`,
        short_bio:
          data.shortBio ||
          `${data.fullName} is a verified ${categoryObj.name} serving ${cityObj.name}. Direct WhatsApp booking with zero intermediary fee.`,
        starting_price: data.startingPrice > 0 ? data.startingPrice : defaultFee,
        rating: 5.0,
        review_count: 1,
        total_leads: 0,
        status: chosenStatus as any,
        seo_index: chosenStatus === 'published' || chosenStatus === 'approved',
        is_verified: chosenStatus === 'published' || chosenStatus === 'approved',
        is_available: chosenStatus === 'published' || chosenStatus === 'approved',
        is_featured: false,
      };

      validProvidersToInsert.push(newProvider);
    }

    // 3. Bulk Database Insertion (createMany / Batch Insert)
    if (validProvidersToInsert.length > 0) {
      // A. Supabase batch insert if connected
      if (SUPABASE_URL && SUPABASE_KEY) {
        try {
          const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

          const supabaseBatch = validProvidersToInsert.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            profile_type: p.profile_type,
            category_id: p.category_id,
            trade_title: p.trade_title,
            whatsapp_number: p.whatsapp_number,
            phone_number: p.phone_number,
            avatar_url: p.avatar_url,
            short_bio: p.short_bio,
            starting_price: p.starting_price,
            status: p.status,
            is_verified: p.is_verified,
            is_available: p.is_available,
            is_featured: p.is_featured,
            rating: p.rating,
            review_count: p.review_count,
            total_leads: p.total_leads,
            service_area: p.service_area,
            created_at: new Date().toISOString(),
          }));

          const { error: insertError } = await supabase
            .from('providers')
            .insert(supabaseBatch);

          if (insertError) {
            console.warn('Supabase bulk insert warning:', insertError.message);
          }
        } catch (supabaseErr) {
          console.warn('Supabase batch execution notice:', supabaseErr);
        }
      }

      // B. Always register in in-memory store so changes reflect immediately
      for (const p of validProvidersToInsert) {
        localImportedProviders.unshift(p);
        localProvidersOverrides.set(p.id, {
          status: p.status,
          is_verified: p.is_verified,
          is_available: p.is_available,
        });
      }
    }

    // 4. Return detailed report
    return NextResponse.json({
      success: true,
      totalRows: rawRows.length,
      importedCount: validProvidersToInsert.length,
      failedCount: failedRows.length,
      failedRows,
      statusApplied: chosenStatus,
      message: `Successfully imported ${validProvidersToInsert.length} providers. ${failedRows.length} failed.`,
    });
  } catch (err: any) {
    console.error('Bulk CSV import error:', err);
    return NextResponse.json(
      { error: err?.message || 'An unexpected error occurred during CSV import.' },
      { status: 500 }
    );
  }
}
