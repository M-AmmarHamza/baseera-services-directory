import { cache } from 'react';
import { getCountries, getCities, getCategories, CountryItem, CityItem, CategoryItem } from '@/lib/taxonomy-db';
import { COUNTRIES as SEED_COUNTRIES, CITIES as SEED_CITIES, CATEGORIES as SEED_CATEGORIES, getProviderByPublicId, getProviderBySlug, Provider } from '@/lib/db';
import { extractPublicIdFromSlug } from '@/lib/slug';

export const VALID_LOCALES = ['en', 'ur', 'ar'] as const;
export type ValidLocale = (typeof VALID_LOCALES)[number];

/**
 * 1. Strictly validates route locale.
 */
export function isValidLocale(lang: string): lang is ValidLocale {
  if (!lang || typeof lang !== 'string') return false;
  return VALID_LOCALES.includes(lang.toLowerCase() as ValidLocale);
}

/**
 * 2. Cached Country validation: checks active countries from taxonomy DB and seed fallback.
 * Strictly returns null if country slug/code does not exist or is inactive.
 * Never fabricates country names.
 */
export const getValidCountry = cache(async (countrySlugOrCode: string): Promise<CountryItem | null> => {
  if (!countrySlugOrCode || typeof countrySlugOrCode !== 'string') return null;
  let norm = countrySlugOrCode.toLowerCase().trim();
  if (norm === 'uk') norm = 'gb';

  try {
    const activeCountries = await getCountries({ activeOnly: true });
    const match = activeCountries.find(
      (c) => c.code.toLowerCase() === norm || c.slug.toLowerCase() === norm
    );
    if (match) return match;
  } catch (err) {
    console.warn('getValidCountry db note:', err);
  }

  // Fallback to static SEED_COUNTRIES
  const seedMatch = SEED_COUNTRIES.find(
    (c) => c.code.toLowerCase() === norm
  );
  if (seedMatch) {
    return {
      id: 1,
      name_en: seedMatch.name,
      name_ur: seedMatch.code === 'pk' ? 'پاکستان' : seedMatch.name,
      slug: seedMatch.code.toLowerCase(),
      code: seedMatch.code.toLowerCase(),
      currency: seedMatch.code === 'pk' ? 'PKR' : 'USD',
      premiumPrice: 50,
      isActive: true,
      flag: seedMatch.flag,
      region: seedMatch.region,
    };
  }

  return null;
});

/**
 * 3. Cached City validation: strictly verifies that the city exists, is active,
 * and strictly belongs to the specified active Country.
 */
export const getValidCity = cache(async (countrySlugOrCode: string, citySlug: string): Promise<{ country: CountryItem; city: CityItem } | null> => {
  if (!citySlug || typeof citySlug !== 'string') return null;
  const country = await getValidCountry(countrySlugOrCode);
  if (!country) return null;

  const normCity = citySlug.toLowerCase().trim();

  try {
    const activeCities = await getCities({ countryCode: country.code, activeOnly: true });
    const match = activeCities.find((c) => c.slug.toLowerCase() === normCity);
    if (match && match.countryCode.toLowerCase() === country.code.toLowerCase()) {
      return { country, city: match };
    }
  } catch (err) {
    console.warn('getValidCity db note:', err);
  }

  // Fallback to static SEED_CITIES
  const seedCity = SEED_CITIES.find(
    (c) => c.slug.toLowerCase() === normCity && c.countryCode.toLowerCase() === country.code.toLowerCase()
  );
  if (seedCity) {
    const cityItem: CityItem = {
      id: 1,
      countryCode: country.code.toLowerCase(),
      name_en: seedCity.name,
      name_ur: seedCity.name,
      slug: seedCity.slug.toLowerCase(),
      targetAreas: ['City Center', 'Saddar'],
      isActive: true,
    };
    return { country, city: cityItem };
  }

  return null;
});

/**
 * 4. Cached Category validation: checks if category slug matches any active category
 * across English slug (slug_en), Roman Urdu slug (slug_ur), id, or aliases.
 */
export const getValidCategory = cache(async (categorySlug: string): Promise<CategoryItem | null> => {
  if (!categorySlug || typeof categorySlug !== 'string') return null;
  const norm = categorySlug.toLowerCase().trim();

  try {
    const activeCats = await getCategories({ activeOnly: true });
    const match = activeCats.find(
      (c) =>
        c.slug_en.toLowerCase() === norm ||
        c.slug_ur.toLowerCase() === norm ||
        c.id.toLowerCase() === norm
    );
    if (match) return match;
  } catch (err) {
    console.warn('getValidCategory db note:', err);
  }

  // Fallback to static SEED_CATEGORIES
  const seedCat = SEED_CATEGORIES.find(
    (c) =>
      c.slug.toLowerCase() === norm ||
      c.id.toLowerCase() === norm ||
      (Array.isArray(c.aliases) && c.aliases.map(a => a.toLowerCase()).includes(norm))
  );
  if (seedCat) {
    return {
      id: seedCat.id,
      name_en: seedCat.name,
      name_ur: seedCat.nameUr || seedCat.name,
      slug_en: seedCat.slug,
      slug_ur: `${seedCat.slug}-mistri`,
      icon: seedCat.icon,
      sortOrder: 1,
      isActive: true,
      activeCount: seedCat.count,
      group: seedCat.group,
    };
  }

  return null;
});

/**
 * 5. Cached Provider validation: validates Country + City + Category + Provider Public ID.
 * Strictly verifies provider belongs to that city and category.
 */
export const getValidProvider = cache(async ({
  country,
  city,
  category,
  providerSlug,
}: {
  country: string;
  city: string;
  category: string;
  providerSlug: string;
}): Promise<{
  country: CountryItem;
  city: CityItem;
  category: CategoryItem;
  provider: Provider;
  canonicalSlug: string;
} | null> => {
  const cityValidation = await getValidCity(country, city);
  if (!cityValidation) return null;

  const validCategory = await getValidCategory(category);
  if (!validCategory) return null;

  if (!providerSlug || typeof providerSlug !== 'string') return null;

  const publicId = extractPublicIdFromSlug(providerSlug);
  let provider: Provider | null = null;

  if (publicId !== null && !isNaN(publicId)) {
    provider = await getProviderByPublicId(publicId);
  }

  if (!provider) {
    provider = await getProviderBySlug(cityValidation.city.slug, validCategory.id, providerSlug);
  }

  if (!provider) return null;

  // Verify provider belongs to this city and category
  const providerCity = (provider.city_slug || '').toLowerCase();
  const targetCity = cityValidation.city.slug.toLowerCase();
  if (providerCity && providerCity !== targetCity) {
    return null;
  }

  const providerCat = (provider.category_id || '').toLowerCase();
  const targetCatId = validCategory.id.toLowerCase();
  const targetCatSlug = validCategory.slug_en.toLowerCase();
  if (providerCat && providerCat !== targetCatId && providerCat !== targetCatSlug) {
    return null;
  }

  return {
    country: cityValidation.country,
    city: cityValidation.city,
    category: validCategory,
    provider,
    canonicalSlug: provider.slug || providerSlug,
  };
});
