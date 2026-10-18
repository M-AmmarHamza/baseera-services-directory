import React from 'react';
import {
  getFeaturedProviders,
  getLocalizedCityName,
  getCategoryBySlug,
  getCategoryName,
} from '@/lib/db';
import FeaturedProfilesSliderClient from './FeaturedProfilesSliderClient';

export interface FeaturedProfilesSliderProps {
  categoryId: string;
  cityId: string;
  currentProviderSlug?: string;
  lang?: string;
  country?: string;
  title?: string;
  subtitle?: string;
}

/**
 * Reusable FeaturedProfilesSlider component
 * Highlights premium / sponsored providers matching categoryId and cityId
 * Safely returns null if no featured providers are available.
 */
export default async function FeaturedProfilesSlider({
  categoryId,
  cityId,
  currentProviderSlug,
  lang = 'en',
  country,
  title,
  subtitle,
}: FeaturedProfilesSliderProps) {
  // 1. Fetch featured providers from database / resilient data store
  const providers = await getFeaturedProviders(cityId, categoryId, currentProviderSlug);

  // 2. Safely return null if no featured providers exist for this city/category
  if (!providers || providers.length === 0) {
    return null;
  }

  // 3. Resolve metadata and localization
  const resolvedCountry = (country || providers[0]?.country_code || 'pk').toLowerCase();
  const catObj = getCategoryBySlug(categoryId);
  const localizedCat = catObj ? getCategoryName(catObj, lang) : categoryId;
  const localizedCity = getLocalizedCityName(cityId, lang);

  const resolvedTitle =
    title ||
    (currentProviderSlug
      ? lang === 'ur'
        ? `${localizedCity} میں مزید نمایاں ${localizedCat} ماہرین`
        : lang === 'ar'
        ? `المزيد من ${localizedCat} المميزين في ${localizedCity}`
        : `More Featured ${localizedCat}s in ${localizedCity}`
      : lang === 'ur'
      ? `${localizedCity} میں نمایاں ${localizedCat}`
      : lang === 'ar'
      ? `${localizedCat} مميزون في ${localizedCity}`
      : `Featured ${localizedCat} in ${localizedCity}`);

  const resolvedSubtitle =
    subtitle ||
    (lang === 'ur'
      ? `${localizedCity} میں اعلیٰ ترین ریٹنگز اور تصدیق شدہ تجربے کے حامل نمایاں کاریگر`
      : lang === 'ar'
      ? `نخبة من أفضل الفنيين المعتمدين مع أولوية الرد والخدمة المتميزة في ${localizedCity}`
      : `Hand-picked verified professionals in ${localizedCity} with priority response and top ratings`);

  return (
    <FeaturedProfilesSliderClient
      items={providers}
      title={resolvedTitle}
      subtitle={resolvedSubtitle}
      lang={lang}
      country={resolvedCountry}
      city={cityId}
      category={categoryId}
    />
  );
}
