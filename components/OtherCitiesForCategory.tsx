import React from 'react';
import Link from 'next/link';
import { MapPin, Globe2 } from 'lucide-react';
import { getCities, CityItem } from '@/lib/taxonomy-db';
import { CITIES as SEED_CITIES } from '@/lib/db';
import { getResolvedCityName } from '@/lib/routing/resolve-entities';

interface OtherCitiesForCategoryProps {
  country: string;
  currentCitySlug: string;
  categorySlug: string;
  categoryName: string;
  lang?: string;
  className?: string;
}

// Major city priority mapping for clean, high-intent link equity flow
const MAJOR_CITY_PRIORITY: Record<string, string[]> = {
  pk: [
    'karachi',
    'lahore',
    'islamabad',
    'rawalpindi',
    'faisalabad',
    'multan',
    'peshawar',
    'gujranwala',
    'sialkot',
    'hyderabad',
    'quetta',
    'bahawalpur',
  ],
  ae: [
    'dubai',
    'abu-dhabi',
    'sharjah',
    'ajman',
    'ras-al-khaimah',
    'al-ain',
    'fujairah',
  ],
  sa: [
    'riyadh',
    'jeddah',
    'dammam',
    'mecca',
    'medina',
    'khobar',
  ],
};

export default async function OtherCitiesForCategory({
  country,
  currentCitySlug,
  categorySlug,
  categoryName,
  lang = 'en',
  className = '',
}: OtherCitiesForCategoryProps) {
  const normCountry = (country || 'pk').toLowerCase().trim();
  const normCurrentCity = (currentCitySlug || '').toLowerCase().trim();

  // 1. Fetch active cities for this country
  let activeCities: CityItem[] = [];
  try {
    activeCities = await getCities({ countryCode: normCountry, activeOnly: true });
  } catch (err) {
    console.warn('OtherCitiesForCategory getCities error:', err);
  }

  if (!activeCities || activeCities.length === 0) {
    activeCities = SEED_CITIES
      .filter((c) => c.countryCode.toLowerCase() === normCountry)
      .map((c) => ({
        id: c.slug,
        countryCode: c.countryCode.toLowerCase(),
        name_en: c.name,
        name_ur: c.slug === 'karachi' ? 'کراچی' : c.slug === 'lahore' ? 'لاہور' : c.slug === 'islamabad' ? 'اسلام آباد' : c.name,
        slug: c.slug.toLowerCase(),
        targetAreas: [],
        isActive: true,
      }));
  }

  // 2. Exclude current city
  const otherCities = activeCities.filter((c) => c.slug.toLowerCase() !== normCurrentCity);
  if (otherCities.length === 0) return null;

  // 3. Sort by major city priority
  const priorityList = MAJOR_CITY_PRIORITY[normCountry] || [];
  otherCities.sort((a, b) => {
    const indexA = priorityList.indexOf(a.slug.toLowerCase());
    const indexB = priorityList.indexOf(b.slug.toLowerCase());
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.name_en.localeCompare(b.name_en);
  });

  // 4. Cap at 8–12 cities max to avoid footer link spam
  const selectedCities = otherCities.slice(0, 10);

  const title =
    lang === 'ur'
      ? `دیگر شہروں میں ${categoryName} سروسز`
      : lang === 'ar'
      ? `${categoryName} في مدن أخرى`
      : `${categoryName} in Other Cities`;

  const subtitle =
    lang === 'ur'
      ? `کیا آپ کو کسی دوسرے شہر میں ${categoryName} کی ضرورت ہے؟ دیگر اہم شہروں میں تصدیق شدہ کاریگر تلاش کریں۔`
      : lang === 'ar'
      ? `هل تحتاج إلى ${categoryName} في مدينة أخرى؟ تصفح الفنيين المعتمدين في المدن الكبرى.`
      : `Looking for trusted ${categoryName.toLowerCase()} specialists across other major cities? Browse verified local listings.`;

  return (
    <section className={`border-t border-gray-200/90 pt-10 sm:pt-12 mt-12 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200 mb-2">
            <Globe2 className="w-3.5 h-3.5" />
            <span>
              {lang === 'ur' ? 'ملک بھر میں دستیابی' : lang === 'ar' ? 'تغطية المدن' : 'Regional Availability'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-950">
            {title}
          </h2>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {selectedCities.map((city) => {
          const localizedCityName = getResolvedCityName(city, lang);
          const href = `/${lang}/${normCountry}/${city.slug.toLowerCase()}/${categorySlug.toLowerCase()}`;

          // Descriptive natural anchor text
          const anchorText =
            lang === 'ur'
              ? `${localizedCityName} میں ${categoryName}`
              : lang === 'ar'
              ? `${categoryName} في ${localizedCityName}`
              : `${categoryName} in ${localizedCityName}`;

          return (
            <Link
              key={city.slug}
              href={href}
              className="group flex items-center gap-2.5 p-3 rounded-xl border border-gray-200/90 bg-white hover:border-emerald-500/50 hover:bg-emerald-50/30 transition-all text-start shadow-2xs"
            >
              <div className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-[#059669] group-hover:text-white text-gray-500 flex items-center justify-center shrink-0 transition-colors">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-[#059669] transition-colors truncate">
                {anchorText}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
