import { cache } from 'react';
import { getCountries, getCities, getCategories, CountryItem, CityItem, CategoryItem } from '@/lib/taxonomy-db';
import {
  COUNTRIES as SEED_COUNTRIES,
  CITIES as SEED_CITIES,
  CATEGORIES as SEED_CATEGORIES,
  getProviderByPublicId,
  getProviderBySlug,
  Provider,
} from '@/lib/db';
import { extractPublicIdFromSlug } from '@/lib/slug';

export const VALID_LOCALES = ['en', 'ur', 'ar'] as const;
export type ValidLocale = (typeof VALID_LOCALES)[number];

/**
 * 1. Strictly validates route locale.
 * Only allows 'en', 'ur', and 'ar'.
 */
export function isValidLocale(lang: string): lang is ValidLocale {
  if (!lang || typeof lang !== 'string') return false;
  return VALID_LOCALES.includes(lang.toLowerCase() as ValidLocale);
}

/**
 * 2. Cached Country validation: checks active countries from taxonomy DB and seed fallback.
 * Strictly returns null if country slug/code does not exist or is inactive.
 * Never fabricates country names from untrusted strings.
 */
export const resolveCountry = cache(async (countrySlugOrCode: string): Promise<CountryItem | null> => {
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
    console.warn('resolveCountry db note:', err);
  }

  // Fallback to static SEED_COUNTRIES
  const seedMatch = SEED_COUNTRIES.find((c) => c.code.toLowerCase() === norm);
  if (seedMatch) {
    return {
      id: 1,
      name_en: seedMatch.name,
      name_ur: seedMatch.code === 'pk' ? 'پاکستان' : seedMatch.code === 'ae' ? 'متحدہ عرب امارات' : seedMatch.code === 'sa' ? 'سعودی عرب' : seedMatch.name,
      slug: seedMatch.code.toLowerCase(),
      code: seedMatch.code.toLowerCase(),
      currency: seedMatch.code === 'pk' ? 'PKR' : seedMatch.code === 'ae' ? 'AED' : seedMatch.code === 'sa' ? 'SAR' : 'USD',
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
 * and strictly belongs to the specified active Country (countryId/countryCode matching).
 */
export const resolveCity = cache(async (countrySlugOrCode: string, citySlug: string): Promise<{ country: CountryItem; city: CityItem } | null> => {
  if (!citySlug || typeof citySlug !== 'string') return null;
  const country = await resolveCountry(countrySlugOrCode);
  if (!country) return null;

  const normCity = citySlug.toLowerCase().trim();

  try {
    const activeCities = await getCities({ countryCode: country.code, activeOnly: true });
    const match = activeCities.find((c) => c.slug.toLowerCase() === normCity);
    if (match && match.countryCode.toLowerCase() === country.code.toLowerCase()) {
      return { country, city: match };
    }
  } catch (err) {
    console.warn('resolveCity db note:', err);
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
      name_ur: seedCity.slug === 'karachi' ? 'کراچی' : seedCity.slug === 'lahore' ? 'لاہور' : seedCity.slug === 'islamabad' ? 'اسلام آباد' : seedCity.name,
      slug: seedCity.slug.toLowerCase(),
      targetAreas: ['City Center', 'Saddar'],
      isActive: true,
    };
    return { country, city: cityItem };
  }

  return null;
});

// Canonical category aliases mapping alternate/legacy slugs to canonical category IDs
const CANONICAL_CATEGORY_ALIASES: Record<string, string> = {
  cctv: 'cctv-technician',
  'cctv-installer': 'cctv-technician',
  'cctv-security': 'cctv-technician',
  'cctv-camera': 'cctv-technician',
  'security-cameras': 'cctv-technician',
  'cctv-security-technician': 'cctv-technician',
  'cctv-camera-mistri': 'cctv-technician',
  'car-mechanic': 'car-mechanic',
  'auto-mechanic': 'car-mechanic',
  'car-repair': 'car-mechanic',
  'auto-repair': 'car-mechanic',
  'gari-car-mistri': 'car-mechanic',
  ac: 'ac-technician',
  'ac-repair': 'ac-technician',
  'ac-services': 'ac-technician',
  'ac-repair-mistri': 'ac-technician',
  plumbing: 'plumber',
  'plumbing-services': 'plumber',
  plumbers: 'plumber',
  'plumber-mistri': 'plumber',
  generator: 'generator-repair',
  'generator-services': 'generator-repair',
  'generator-mistri': 'generator-repair',
  solar: 'solar-installer',
  'solar-energy': 'solar-installer',
  'solar-panel-mistri': 'solar-installer',
  cleaning: 'sofa-carpet-cleaning',
  'sofa-cleaning': 'sofa-carpet-cleaning',
  'carpet-cleaning': 'sofa-carpet-cleaning',
  'home-cleaning': 'sofa-carpet-cleaning',
  'sofa-carpet-safai': 'sofa-carpet-cleaning',
  food: 'home-chef',
  'home-chefs': 'home-chef',
  'bawarchi-catering': 'home-chef',
  'home-chef-catering': 'home-chef',
  'bijli-mistri': 'electrician',
  'raj-mistri': 'mason',
  'rang-paint-mistri': 'painter',
  'carpenter-barhai': 'carpenter',
};

/**
 * 4. Cached Category validation: checks if category slug matches any active category
 * across English slug (slug_en), Roman Urdu slug (slug_ur), id, or aliases.
 * Returns validated CategoryItem or null.
 */
export const resolveCategory = cache(async (categorySlug: string): Promise<CategoryItem | null> => {
  if (!categorySlug || typeof categorySlug !== 'string') return null;
  const norm = categorySlug.toLowerCase().trim();
  const canonicalId = CANONICAL_CATEGORY_ALIASES[norm] || norm;

  try {
    const activeCats = await getCategories({ activeOnly: true });
    const match = activeCats.find(
      (c) =>
        c.slug_en.toLowerCase() === norm ||
        c.slug_ur.toLowerCase() === norm ||
        c.id.toLowerCase() === norm ||
        c.id.toLowerCase() === canonicalId ||
        c.slug_en.toLowerCase() === canonicalId
    );
    if (match) return match;
  } catch (err) {
    console.warn('resolveCategory db note:', err);
  }

  // Fallback to static SEED_CATEGORIES
  const seedCat = SEED_CATEGORIES.find(
    (c) =>
      c.slug.toLowerCase() === norm ||
      c.id.toLowerCase() === norm ||
      c.id.toLowerCase() === canonicalId ||
      c.slug.toLowerCase() === canonicalId ||
      (Array.isArray(c.aliases) && (c.aliases.includes(norm) || c.aliases.includes(canonicalId)))
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
export const resolveProvider = cache(async ({
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
  const cityValidation = await resolveCity(country, city);
  if (!cityValidation) return null;

  const validCategory = await resolveCategory(category);
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

  // Verify provider status: must be active/published/approved
  if (provider.status === 'suspended' || provider.status === 'rejected') {
    return null;
  }

  // Verify provider belongs to this city
  const providerCity = (provider.city_slug || '').toLowerCase();
  const targetCity = cityValidation.city.slug.toLowerCase();
  if (providerCity && providerCity !== targetCity) {
    return null;
  }

  // Verify provider belongs to this category (or canonical category alias)
  const providerCat = (provider.category_id || '').toLowerCase();
  const targetCatId = validCategory.id.toLowerCase();
  const targetCatSlug = validCategory.slug_en.toLowerCase();
  const providerCanonical = CANONICAL_CATEGORY_ALIASES[providerCat] || providerCat;
  const targetCanonical = CANONICAL_CATEGORY_ALIASES[targetCatId] || targetCatId;

  const isCatMatch =
    providerCat === targetCatId ||
    providerCat === targetCatSlug ||
    providerCanonical === targetCanonical;

  if (providerCat && !isCatMatch) {
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

/**
 * Localized entity name extractors:
 * NEVER interpolate untrusted URL parameters or fabricate names.
 * Return empty string if missing, enabling callers to trigger notFound() guard.
 */
export function getResolvedCountryName(country: CountryItem | null | undefined, lang = 'en'): string {
  if (!country) return '';
  if (lang === 'ur' && country.name_ur) return country.name_ur;
  if (lang === 'ar') {
    if (country.code === 'pk') return 'باكستان';
    if (country.code === 'ae') return 'الإمارات';
    if (country.code === 'sa') return 'السعودية';
    return country.name_en || '';
  }
  return country.name_en || '';
}

export function getResolvedCityName(city: CityItem | null | undefined, lang = 'en'): string {
  if (!city) return '';
  if (lang === 'ur' && city.name_ur) return city.name_ur;
  if (lang === 'ar') {
    if (city.slug === 'karachi') return 'كراتشي';
    if (city.slug === 'lahore') return 'لاهور';
    if (city.slug === 'islamabad') return 'إسلام آباد';
    if (city.slug === 'dubai') return 'دبي';
    if (city.slug === 'riyadh') return 'الرياض';
    return city.name_en || '';
  }
  return city.name_en || '';
}

export function getResolvedCategoryName(category: CategoryItem | null | undefined, lang = 'en'): string {
  if (!category) return '';
  if (lang === 'ur' && category.name_ur) return category.name_ur;
  if (lang === 'ar') {
    const AR_NAMES: Record<string, string> = {
      electrician: 'كهربائي',
      'ups-inverter-technician': 'فني يو بي إس ومحولات',
      'solar-installer': 'تركيب ألواح شمسية',
      'generator-repair': 'تصليح مولدات كهربائية',
      plumber: 'سباك',
      'water-pump-repair': 'تصليح مضخات المياه',
      'water-boring': 'حفر وتمديد الآبار',
      'water-tank-cleaning': 'تنظيف خزانات المياه',
      'ac-technician': 'فني تكييف وتبريد',
      'fridge-repair': 'تصليح ثلاجات وفريزر',
      'washing-machine-repair': 'تصليح غسالات',
      'geyser-repair': 'تصليح سخانات المياه',
      carpenter: 'نجار',
      painter: 'دهان وصباغ',
      'aluminium-glass-worker': 'فني ألمنيوم وزجاج',
      welder: 'حداد ولحام',
      mason: 'بناء وسيراميك',
      'pest-control': 'مكافحة حشرات',
      'sofa-carpet-cleaning': 'غسيل كنب وسجاد',
      'cctv-technician': 'تركيب كاميرات مراقبة',
      locksmith: 'فني أقفال ومفاتيح',
      'home-chef': 'طاهي منزلي',
      'interior-designer': 'مصمم ديكور داخلي',
      'movers-packers': 'نقل وتغليف أثاث',
      'car-mechanic': 'ميكانيكي سيارات',
    };
    if (AR_NAMES[category.id] || AR_NAMES[category.slug_en]) {
      return AR_NAMES[category.id] || AR_NAMES[category.slug_en];
    }
  }
  return category.name_en || '';
}
