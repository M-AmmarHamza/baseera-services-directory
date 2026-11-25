import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import Papa from 'papaparse';
import { z } from 'zod';
import {
  verifyAdminToken,
  ADMIN_COOKIE_NAME,
  isModeratorOrAbove,
} from '@/lib/admin-auth';
import {
  SEED_PROVIDERS,
  Provider,
  localImportedProviders,
  localProvidersOverrides,
  getNextPublicId,
  syncPublicIdCounter,
  CATEGORIES as SEED_CATEGORIES,
  CITIES as SEED_CITIES,
  COUNTRIES as SEED_COUNTRIES,
} from '@/lib/db';
import { getCategories, getCities } from '@/lib/taxonomy-db';
import { validateAndFormatE164 } from '@/lib/phone';
import { formatPublicIdSlug } from '@/lib/slug';
import { stripCsvFormulaChars, isSafeImageUrl } from '@/lib/security';
import { recordAuditLog } from '@/lib/audit';
import {
  CsvBulkUploadPayloadSchema,
  CsvProviderRowSchema,
} from '@/lib/super-admin-schemas';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const MAX_CSV_SIZE_BYTES = 5 * 1024 * 1024; // 5 Megabytes
const MAX_ROWS_PER_BATCH = 500; // 500 Rows Max

// Exact CSV Template headers and sample rows
const SAMPLE_CSV_TEMPLATE = `fullName,whatsappNumber,categorySlug,citySlug,trade_title,target_areas,bio,starting_price,is_premium,status,profile_type,gallery_images,certificates,google_map_url
Muhammad Tariq,+923001234567,electrician,karachi,Certified Master Electrician,Korangi|DHA|Clifton,15+ years experience in domestic and commercial electrical repairs.,800,false,pending,individual,,,
Ahmed Al-Mansoor,+971501234567,ac-technician,dubai,Chiller & VRF Specialist,Business Bay|Downtown|Marina,24/7 emergency central and split AC repair across Dubai. Licensed master HVAC engineering contractor.,250,true,published,shop,https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800|https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800,HVAC Master License|DAIKIN Certified,https://maps.google.com/?q=25.2048,55.2708`;

/**
 * GET Handler: Generates and downloads the exact sample CSV template
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid, session } = await verifyAdminToken(token);

  if (!valid || !isModeratorOrAbove(session)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Super Admin or Moderator privileges required.' },
      { status: 401 }
    );
  }

  return new NextResponse(SAMPLE_CSV_TEMPLATE, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="baseera_providers_bulk_template.csv"',
      'Cache-Control': 'no-store',
    },
  });
}

/**
 * POST Handler: Secure, OWASP-Hardened Bulk Provider Upload
 */
export async function POST(req: NextRequest) {
  // 1. ACCESS CONTROL & RBAC (Strictly SUPER_ADMIN & MODERATOR)
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid, session } = await verifyAdminToken(token);

  if (!valid || !isModeratorOrAbove(session)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Super Admin or Moderator privileges required.' },
      { status: 401 }
    );
  }

  try {
    let csvContent = '';
    let defaultStatus: 'pending' | 'published' | 'suspended' = 'pending';
    let autoVerify = false;

    const contentType = req.headers.get('content-type') || '';

    // Handle multipart/form-data OR application/json
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No CSV file was uploaded.' },
          { status: 400 }
        );
      }

      if (!file.name.toLowerCase().endsWith('.csv')) {
        return NextResponse.json(
          { success: false, error: 'Invalid file format. Only .csv files are permitted.' },
          { status: 400 }
        );
      }

      if (file.size > MAX_CSV_SIZE_BYTES) {
        return NextResponse.json(
          { success: false, error: `File size exceeds the 5MB limit (current: ${(file.size / 1024 / 1024).toFixed(2)}MB).` },
          { status: 400 }
        );
      }

      csvContent = await file.text();
      defaultStatus = (formData.get('defaultStatus') as any) || 'pending';
      autoVerify = formData.get('autoVerify') === 'true';
    } else {
      const jsonBody = await req.json();
      const parsedPayload = CsvBulkUploadPayloadSchema.safeParse(jsonBody);

      if (!parsedPayload.success) {
        return NextResponse.json(
          { success: false, error: parsedPayload.error.issues[0]?.message || 'Invalid upload payload.' },
          { status: 400 }
        );
      }

      csvContent = parsedPayload.data.csvContent;
      defaultStatus = parsedPayload.data.defaultStatus;
      autoVerify = parsedPayload.data.autoVerify;

      if (Buffer.byteLength(csvContent, 'utf8') > MAX_CSV_SIZE_BYTES) {
        return NextResponse.json(
          { success: false, error: 'CSV content exceeds the 5MB maximum size limit.' },
          { status: 400 }
        );
      }
    }

    if (!csvContent || !csvContent.trim()) {
      return NextResponse.json(
        { success: false, error: 'Uploaded CSV is empty.' },
        { status: 400 }
      );
    }

    // 2. CSV PARSING (PapaParse)
    const parseResult = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (h) => h.trim(),
    });

    if (parseResult.errors.length > 0 && (!parseResult.data || parseResult.data.length === 0)) {
      return NextResponse.json(
        { success: false, error: `CSV Parsing Error: ${parseResult.errors[0]?.message || 'Malformed syntax'}` },
        { status: 400 }
      );
    }

    const rawRows = parseResult.data as Record<string, any>[];

    if (!rawRows || rawRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No data rows found in the uploaded CSV.' },
        { status: 400 }
      );
    }

    if (rawRows.length > MAX_ROWS_PER_BATCH) {
      return NextResponse.json(
        {
          success: false,
          error: `Maximum batch limit exceeded. Maximum allowed: ${MAX_ROWS_PER_BATCH} rows. Found: ${rawRows.length} rows. Please split your file into smaller batches.`,
        },
        { status: 400 }
      );
    }

    // 3. PRE-FETCH TAXONOMY (Categories & Cities) & EXISTING PHONE NUMBERS
    const [dbCategories, dbCities] = await Promise.all([
      getCategories(),
      getCities(),
    ]);

    // Fast category lookup map: key can be slug_en, slug_ur, slug, id, name
    const categoryMap = new Map<string, any>();
    const allCategories: any[] = [...dbCategories, ...SEED_CATEGORIES];
    for (const cat of allCategories) {
      if (cat.id) categoryMap.set(String(cat.id).toLowerCase(), cat);
      if (cat.slug) categoryMap.set(String(cat.slug).toLowerCase(), cat);
      if (cat.slug_en) categoryMap.set(String(cat.slug_en).toLowerCase(), cat);
      if (cat.slug_ur) categoryMap.set(String(cat.slug_ur).toLowerCase(), cat);
      if (cat.name) categoryMap.set(String(cat.name).toLowerCase(), cat);
      if (cat.name_en) categoryMap.set(String(cat.name_en).toLowerCase(), cat);
      if (cat.name_ur) categoryMap.set(String(cat.name_ur).toLowerCase(), cat);
    }

    // Fast city lookup map: key can be slug or name
    const cityMap = new Map<string, any>();
    const allCities: any[] = [...dbCities, ...SEED_CITIES];
    for (const city of allCities) {
      if (city.slug) cityMap.set(String(city.slug).toLowerCase(), city);
      if (city.name) cityMap.set(String(city.name).toLowerCase(), city);
      if (city.name_en) cityMap.set(String(city.name_en).toLowerCase(), city);
      if (city.name_ur) cityMap.set(String(city.name_ur).toLowerCase(), city);
    }

    // Existing phone numbers set to prevent duplicates
    const existingPhones = new Set<string>();

    // Add local memory phones
    for (const p of SEED_PROVIDERS) {
      if (p.whatsapp_number) existingPhones.add(p.whatsapp_number.trim());
    }
    for (const p of localImportedProviders) {
      if (p.whatsapp_number) existingPhones.add(p.whatsapp_number.trim());
    }

    // Fetch existing phone numbers from Supabase if connected
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        const { data: phoneRows, error: phoneErr } = await supabase
          .from('providers')
          .select('whatsapp_number');

        if (!phoneErr && Array.isArray(phoneRows)) {
          for (const row of phoneRows) {
            if (row.whatsapp_number) existingPhones.add(row.whatsapp_number.trim());
          }
        }
      } catch (err) {
        console.warn('Failed to query existing phones from Supabase:', err);
      }
    }

    // 4. ROW-BY-ROW VALIDATION, SANITIZATION, FREEMIUM RULES & SEQUENTIAL ID ASSIGNMENT
    const validProvidersToInsert: Provider[] = [];
    const skippedRows: Array<{
      rowNumber: number;
      name: string;
      phone: string;
      reason: string;
      rawRow: Record<string, any>;
    }> = [];
    const failedRows: Array<{
      rowNumber: number;
      name: string;
      phone: string;
      reason: string;
      rawRow: Record<string, any>;
    }> = [];

    const phoneRegex = /^\+?[0-9\s\-().]{7,25}$/;

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const rowNum = i + 1;

      // Normalize common header name variations
      const rawFullName =
        row.fullName ?? row.full_name ?? row.name ?? row.FullName ?? row['Full Name'] ?? '';
      const rawPhone =
        row.whatsappNumber ??
        row.whatsapp_number ??
        row.phone ??
        row.phoneNumber ??
        row.phone_number ??
        row.whatsapp ??
        row['WhatsApp Number'] ??
        row['Phone'] ??
        '';
      const rawCategorySlug =
        row.categorySlug ??
        row.category_slug ??
        row.category ??
        row.categoryId ??
        row.category_id ??
        row['Category Slug'] ??
        row['Category'] ??
        '';
      const rawCitySlug =
        row.citySlug ??
        row.city_slug ??
        row.city ??
        row.cityId ??
        row.city_id ??
        row['City Slug'] ??
        row['City'] ??
        '';
      const rawTradeTitle =
        row.trade_title ?? row.tradeTitle ?? row['Trade Title'] ?? row.headline ?? '';
      const rawTargetAreas =
        row.target_areas ?? row.targetAreas ?? row.service_area ?? row.serviceArea ?? '';
      const rawBio = row.bio ?? row.short_bio ?? row.shortBio ?? row['Bio'] ?? '';
      const rawStartingPrice =
        row.starting_price ?? row.startingPrice ?? row.price ?? row['Starting Price'] ?? 500;
      const rawIsPremium =
        row.is_premium ?? row.isPremium ?? row.premium ?? row['Is Premium'] ?? false;
      const rawStatus = row.status ?? row.Status ?? defaultStatus;
      const rawProfileType =
        row.profile_type ?? row.profileType ?? row['Profile Type'] ?? 'individual';
      const rawSeoIndex = row.seo_index ?? row.seoIndex ?? false;
      const rawIsFeatured = row.is_featured ?? row.isFeatured ?? false;
      const rawIsVerified = row.is_verified ?? row.isVerified ?? autoVerify;
      const rawGalleryImages =
        row.gallery_images ?? row.galleryImages ?? row['Gallery Images'] ?? '';
      const rawCertificates = row.certificates ?? row.Certificates ?? '';
      const rawGoogleMapUrl =
        row.google_map_url ?? row.googleMapUrl ?? row['Google Map URL'] ?? '';

      // Strip Formula / Macro Injection and sanitize XSS on all free-text fields
      const cleanFullName = stripCsvFormulaChars(rawFullName);
      const cleanTradeTitle = stripCsvFormulaChars(rawTradeTitle);
      const cleanCategorySlug = stripCsvFormulaChars(rawCategorySlug).toLowerCase();
      const cleanCitySlug = stripCsvFormulaChars(rawCitySlug).toLowerCase();
      const cleanBio = stripCsvFormulaChars(rawBio);
      const cleanProfileType =
        stripCsvFormulaChars(rawProfileType).toLowerCase() === 'shop' ? 'shop' : 'individual';

      // 4a. Basic Name Validation
      if (!cleanFullName || cleanFullName.length < 2) {
        failedRows.push({
          rowNumber: rowNum,
          name: cleanFullName || `Row #${rowNum}`,
          phone: String(rawPhone || ''),
          reason: 'Full name is required and must be at least 2 characters.',
          rawRow: row,
        });
        continue;
      }

      // 4b. Strict Phone Regex & E.164 Normalization
      const trimmedPhone = String(rawPhone || '').trim();
      if (!trimmedPhone || !phoneRegex.test(trimmedPhone)) {
        failedRows.push({
          rowNumber: rowNum,
          name: cleanFullName,
          phone: trimmedPhone,
          reason: `Invalid phone number format: '${trimmedPhone}'. Must contain 7-25 digits (e.g. +923001234567).`,
          rawRow: row,
        });
        continue;
      }

      // 4c. Relational Check: Category (matches slug_en or slug_ur)
      if (!cleanCategorySlug) {
        failedRows.push({
          rowNumber: rowNum,
          name: cleanFullName,
          phone: trimmedPhone,
          reason: 'Category slug is required.',
          rawRow: row,
        });
        continue;
      }

      const matchedCategory = categoryMap.get(cleanCategorySlug);
      if (!matchedCategory) {
        failedRows.push({
          rowNumber: rowNum,
          name: cleanFullName,
          phone: trimmedPhone,
          reason: `Category '${rawCategorySlug}' does not exist in directory (must match slug_en like 'electrician' or slug_ur like 'bijli-mistri').`,
          rawRow: row,
        });
        continue;
      }

      // 4d. Relational Check: City
      if (!cleanCitySlug) {
        failedRows.push({
          rowNumber: rowNum,
          name: cleanFullName,
          phone: trimmedPhone,
          reason: 'City slug is required.',
          rawRow: row,
        });
        continue;
      }

      const matchedCity = cityMap.get(cleanCitySlug);
      if (!matchedCity) {
        failedRows.push({
          rowNumber: rowNum,
          name: cleanFullName,
          phone: trimmedPhone,
          reason: `City '${rawCitySlug}' does not exist in directory.`,
          rawRow: row,
        });
        continue;
      }

      const countryCode = (matchedCity.countryCode || 'PK').toUpperCase();

      // Normalize phone to E.164 format
      const phoneValidation = validateAndFormatE164(trimmedPhone, countryCode);
      if (!phoneValidation.isValid || !phoneValidation.e164) {
        failedRows.push({
          rowNumber: rowNum,
          name: cleanFullName,
          phone: trimmedPhone,
          reason: `Phone number '${trimmedPhone}' failed E.164 validation for country '${countryCode}'. ${phoneValidation.error || ''}`,
          rawRow: row,
        });
        continue;
      }

      const normalizedPhone = phoneValidation.e164;

      // 4e. Duplicate Phone Check (Skip duplicate and report, do not fail batch)
      if (existingPhones.has(normalizedPhone)) {
        skippedRows.push({
          rowNumber: rowNum,
          name: cleanFullName,
          phone: normalizedPhone,
          reason: `Duplicate WhatsApp number '${normalizedPhone}' is already registered in directory.`,
          rawRow: row,
        });
        continue;
      }

      // Register into batch existing set so internal duplicates within this CSV are skipped too
      existingPhones.add(normalizedPhone);

      // 4f. Target Areas Processing (Split pipe-separated string e.g. "Korangi|DHA")
      let cleanTargetAreas: string[] = [];
      if (typeof rawTargetAreas === 'string' && rawTargetAreas.trim()) {
        cleanTargetAreas = rawTargetAreas
          .split(/[|,]/)
          .map((a) => stripCsvFormulaChars(a))
          .filter(Boolean);
      } else if (Array.isArray(rawTargetAreas)) {
        cleanTargetAreas = rawTargetAreas.map((a) => stripCsvFormulaChars(a)).filter(Boolean);
      }

      if (cleanTargetAreas.length === 0) {
        cleanTargetAreas = [matchedCity.name || matchedCity.slug];
      }

      // 4g. Freemium Enforcement
      const isPremium =
        rawIsPremium === true ||
        String(rawIsPremium).toLowerCase() === 'true' ||
        String(rawIsPremium) === '1';

      let finalBio = cleanBio;
      let finalGallery: string[] = [];
      let finalCertificates: string[] = [];
      let finalGoogleMap = '';

      if (!isPremium) {
        // Free tier: strictly truncate bio to max 150 characters and omit premium assets
        finalBio = finalBio ? finalBio.slice(0, 150) : '';
        finalGallery = [];
        finalCertificates = [];
        finalGoogleMap = '';
      } else {
        // Premium tier: allow bio up to 2500 chars, gallery images, certificates, Google Map link
        finalBio = finalBio.slice(0, 2500);

        if (typeof rawGalleryImages === 'string' && rawGalleryImages.trim()) {
          finalGallery = rawGalleryImages
            .split(/[|,]/)
            .map((url) => url.trim())
            .filter((url) => isSafeImageUrl(url));
        }

        if (typeof rawCertificates === 'string' && rawCertificates.trim()) {
          finalCertificates = rawCertificates
            .split(/[|,]/)
            .map((c) => stripCsvFormulaChars(c))
            .filter(Boolean);
        }

        if (typeof rawGoogleMapUrl === 'string' && isSafeImageUrl(rawGoogleMapUrl.trim())) {
          finalGoogleMap = rawGoogleMapUrl.trim();
        }
      }

      // 4h. Status & Flags Defaults
      const finalStatus = ['published', 'pending', 'suspended'].includes(rawStatus)
        ? rawStatus
        : defaultStatus;

      const finalIsVerified =
        rawIsVerified === true ||
        String(rawIsVerified).toLowerCase() === 'true' ||
        autoVerify;

      const finalIsFeatured =
        rawIsFeatured === true || String(rawIsFeatured).toLowerCase() === 'true';

      const finalSeoIndex =
        rawSeoIndex === true ||
        String(rawSeoIndex).toLowerCase() === 'true' ||
        finalStatus === 'published';

      const startingPriceNum = Math.max(0, parseInt(String(rawStartingPrice), 10) || 500);

      // 4i. Sequential Public ID & Canonical Slug Generation
      // Next sequence value (1001+) and slug format: [slugified-fullName]-[publicId]
      const publicId = getNextPublicId();
      const canonicalSlug = formatPublicIdSlug(cleanFullName, publicId);

      const effectiveTradeTitle =
        cleanTradeTitle || `${cleanFullName} - Verified ${matchedCategory.name || matchedCategory.name_en}`;

      const newProvider: Provider = {
        id: crypto.randomUUID(),
        publicId,
        name: cleanFullName,
        slug: canonicalSlug,
        profile_type: cleanProfileType as 'individual' | 'shop',
        category_id: matchedCategory.id,
        trade_title: effectiveTradeTitle,
        city_slug: matchedCity.slug,
        country_code: countryCode.toLowerCase(),
        district: cleanTargetAreas[0] || matchedCity.name,
        service_area: cleanTargetAreas,
        target_areas: cleanTargetAreas,
        whatsapp_number: normalizedPhone,
        phone_number: normalizedPhone,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanFullName)}`,
        profile_picture: '',
        short_bio: finalBio.slice(0, 150) || `${cleanFullName} is a verified ${matchedCategory.name} in ${matchedCity.name}. Direct WhatsApp booking.`,
        bio: finalBio,
        starting_price: startingPriceNum,
        rating: 5.0,
        review_count: 0,
        total_leads: 0,
        profile_views: 0,
        whatsapp_clicks: 0,
        status: finalStatus,
        seo_index: finalSeoIndex,
        is_verified: finalIsVerified,
        is_available: finalStatus === 'published',
        is_featured: finalIsFeatured,
        is_premium: isPremium,
        gallery_images: finalGallery,
        certificates: finalCertificates,
        google_map_url: finalGoogleMap,
      };

      validProvidersToInsert.push(newProvider);
    }

    // 5. DATABASE BATCH INSERTION
    if (validProvidersToInsert.length > 0) {
      // Supabase / PostgreSQL batch insert
      if (SUPABASE_URL && SUPABASE_KEY) {
        try {
          const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

          const supabasePayload = validProvidersToInsert.map((p) => ({
            id: p.id,
            publicId: p.publicId,
            public_id: p.publicId,
            name: p.name,
            slug: p.slug,
            profile_type: p.profile_type,
            category_id: p.category_id,
            trade_title: p.trade_title,
            city_id: p.city_slug,
            country_id: p.country_code,
            district: p.district,
            service_area: p.service_area,
            target_areas: p.target_areas,
            whatsapp_number: p.whatsapp_number,
            phone_number: p.phone_number,
            avatar_url: p.avatar_url,
            profile_picture: p.profile_picture,
            short_bio: p.short_bio,
            bio: p.bio,
            starting_price: p.starting_price,
            status: p.status,
            seo_index: p.seo_index,
            is_verified: p.is_verified,
            is_available: p.is_available,
            is_featured: p.is_featured,
            is_premium: p.is_premium,
            rating: p.rating,
            review_count: p.review_count,
            total_leads: p.total_leads,
            gallery_images: p.gallery_images,
            certificates: p.certificates,
            google_map_url: p.google_map_url,
            created_at: new Date().toISOString(),
          }));

          const { error: insertError } = await supabase
            .from('providers')
            .insert(supabasePayload);

          if (insertError) {
            console.warn('Supabase batch insert warning:', insertError.message);
          }
        } catch (supabaseErr) {
          console.warn('Supabase bulk execution error:', supabaseErr);
        }
      }

      // In-memory registration for instant reactivity
      for (const p of validProvidersToInsert) {
        localImportedProviders.unshift(p);
        localProvidersOverrides.set(p.id, p);
        localProvidersOverrides.set(p.slug, p);
      }
    }

    // Determine assigned publicId range string
    const publicIdRange =
      validProvidersToInsert.length > 0
        ? `#${validProvidersToInsert[0].publicId} - #${validProvidersToInsert[validProvidersToInsert.length - 1].publicId}`
        : 'None';

    // 6. AUDIT LOGGING (Summary entry with admin details)
    await recordAuditLog({
      adminId: session.userId || session.email,
      adminEmail: session.email,
      action: 'BULK_CSV_UPLOAD',
      entityType: 'PROVIDER',
      entityId: `batch-${Date.now()}`,
      details: {
        totalRows: rawRows.length,
        importedCount: validProvidersToInsert.length,
        skippedCount: skippedRows.length,
        failedCount: failedRows.length,
        publicIdRange,
        defaultStatusApplied: defaultStatus,
        autoVerifyApplied: autoVerify,
        adminRole: session.role,
      },
    });

    // 7. CACHE REVALIDATION
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/[lang]/super-admin/providers', 'page');
    } catch (e) {
      // Safe fallback in route handlers
    }

    // 8. DETAILED REPORT RESPONSE
    return NextResponse.json({
      success: true,
      totalRows: rawRows.length,
      importedCount: validProvidersToInsert.length,
      skippedCount: skippedRows.length,
      failedCount: failedRows.length,
      publicIdRange,
      failedRows,
      skippedRows,
      message: `Bulk import completed: ${validProvidersToInsert.length} imported (${publicIdRange}), ${skippedRows.length} skipped (duplicate WhatsApp), ${failedRows.length} failed.`,
    });
  } catch (err: any) {
    console.error('Bulk CSV upload unexpected error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'An unexpected error occurred during bulk CSV upload.' },
      { status: 500 }
    );
  }
}
