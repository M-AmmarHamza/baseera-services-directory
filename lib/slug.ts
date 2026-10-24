import { generateEnglishSlug } from '@/lib/transliterate';
import { SEED_PROVIDERS, localProvidersOverrides } from '@/lib/db';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export interface UniqueSlugOptions {
  cityId?: string | number;
  categoryId?: string | number;
  existingSlugs?: Set<string> | string[];
}

/**
 * Generates a short random alphanumeric string (equivalent to nanoid(5)).
 * Produces strings like "a7x9c", "k3m8p".
 */
export function generateNanoId(length = 5): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Extracts the last 4 numeric digits from a phone number string.
 * e.g., "+92 300 1234582" -> "4582", "03004582" -> "4582"
 */
export function extractLastPhoneDigits(phoneNumber?: string): string {
  if (!phoneNumber) return '';
  const digits = phoneNumber.replace(/\D/g, '');
  if (digits.length >= 4) {
    return digits.slice(-4);
  }
  return digits;
}

/**
 * Checks whether a candidate slug is already taken across:
 * 1. In-memory batch set/array (for bulk uploads)
 * 2. In-memory local overrides
 * 3. Seed providers
 * 4. Supabase database (scoped to city/category or global unique constraint)
 */
export async function isSlugTaken(
  candidateSlug: string,
  options?: UniqueSlugOptions
): Promise<boolean> {
  const slugLower = candidateSlug.toLowerCase().trim();
  if (!slugLower) return true;

  // 1. Check in-memory batch set/array (e.g. bulk CSV import rows)
  if (options?.existingSlugs) {
    if (options.existingSlugs instanceof Set) {
      if (options.existingSlugs.has(slugLower)) return true;
    } else if (Array.isArray(options.existingSlugs)) {
      if (options.existingSlugs.includes(slugLower)) return true;
    }
  }

  // 2. Check local in-memory overrides
  if (localProvidersOverrides.has(slugLower)) {
    return true;
  }

  // 3. Check SEED_PROVIDERS
  const seedCollision = SEED_PROVIDERS.some((sp) => {
    if (sp.slug.toLowerCase() !== slugLower) return false;
    // If cityId and categoryId are provided, also verify context or match globally
    if (options?.cityId && options?.categoryId) {
      const cityMatches = String(sp.city_slug).toLowerCase() === String(options.cityId).toLowerCase();
      const catMatches = String(sp.category_id).toLowerCase() === String(options.categoryId).toLowerCase();
      return cityMatches && catMatches ? true : true; // Global unique across site
    }
    return true;
  });
  if (seedCollision) return true;

  // 4. Query Supabase database if credentials exist
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const headers = {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      };

      // Base query checks global slug existence because providers.slug has UNIQUE constraint
      let queryUrl = `${SUPABASE_URL}/rest/v1/providers?slug=eq.${encodeURIComponent(slugLower)}&select=id,slug,city_id,category_id`;

      const res = await fetch(queryUrl, { headers });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          // If cityId or categoryId specified, check if collision applies
          if (options?.cityId !== undefined && options?.categoryId !== undefined) {
            const hasMatchInContext = rows.some((row) => {
              const rowCity = String(row.city_id || '').toLowerCase();
              const rowCat = String(row.category_id || '').toLowerCase();
              const optCity = String(options.cityId).toLowerCase();
              const optCat = String(options.categoryId).toLowerCase();
              return (rowCity === optCity && rowCat === optCat) || row.slug.toLowerCase() === slugLower;
            });
            if (hasMatchInContext) return true;
          } else {
            return true;
          }
        }
      }
    } catch (err) {
      console.warn('[SlugCheck] Supabase query note:', err);
    }
  }

  return false;
}

/**
 * Generates a collision-free unique slug for a provider profile:
 * 1. Base Slug: Slugify fullName (e.g. "muhammad-ahmad")
 * 2. If available, return baseSlug
 * 3. Collision Handling - Preferred: Append last 4 digits of phone number (e.g. "muhammad-ahmad-4582")
 * 4. Collision Handling - Fallback: If phone digits also collide or unavailable, append nanoid(5) (e.g. "muhammad-ahmad-a7x9c")
 */
export async function generateUniqueSlug(
  fullName: string,
  phoneNumber?: string,
  options?: UniqueSlugOptions
): Promise<string> {
  const baseSlug = generateEnglishSlug(fullName) || 'specialist';

  // Step 1: Check if base slug is free
  const baseTaken = await isSlugTaken(baseSlug, options);
  if (!baseTaken) {
    return baseSlug;
  }

  // Step 2: Preferred Method - Append last 4 digits of phone number
  const last4 = extractLastPhoneDigits(phoneNumber);
  if (last4 && last4.length >= 2) {
    const phoneCandidate = `${baseSlug}-${last4}`;
    const phoneTaken = await isSlugTaken(phoneCandidate, options);
    if (!phoneTaken) {
      return phoneCandidate;
    }
  }

  // Step 3: Fallback Method - Append short random alphanumeric string (nanoid(5))
  for (let attempt = 0; attempt < 5; attempt++) {
    const randomSuffix = generateNanoId(5);
    const fallbackCandidate = `${baseSlug}-${randomSuffix}`;
    const fallbackTaken = await isSlugTaken(fallbackCandidate, options);
    if (!fallbackTaken) {
      return fallbackCandidate;
    }
  }

  // Ultimate fallback (timestamp + random)
  return `${baseSlug}-${Date.now().toString(36).slice(-4)}${generateNanoId(3)}`;
}
