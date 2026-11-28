import React from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight, ArrowLeft, CheckCircle2, Building2 } from 'lucide-react';
import { getCategories, getCities } from '@/lib/taxonomy-db';

interface HomepageCityCategoryMatrixProps {
  lang: string;
  className?: string;
}

interface MatrixCity {
  slug: string;
  countryCode: string;
  name_en: string;
  name_ur: string;
  name_ar: string;
}

interface MatrixCategory {
  id: string;
  name_en: string;
  name_ur: string;
  name_ar: string;
  slug_en: string;
  slug_ur: string;
}

const DEFAULT_MATRIX_CITIES: MatrixCity[] = [
  { slug: 'karachi', countryCode: 'pk', name_en: 'Karachi', name_ur: 'کراچی', name_ar: 'كراتشي' },
  { slug: 'lahore', countryCode: 'pk', name_en: 'Lahore', name_ur: 'لاہور', name_ar: 'لاهور' },
  { slug: 'islamabad', countryCode: 'pk', name_en: 'Islamabad', name_ur: 'اسلام آباد', name_ar: 'إسلام آباد' },
  { slug: 'rawalpindi', countryCode: 'pk', name_en: 'Rawalpindi', name_ur: 'راولپنڈی', name_ar: 'راولبندي' },
  { slug: 'faisalabad', countryCode: 'pk', name_en: 'Faisalabad', name_ur: 'فیصل آباد', name_ar: 'فيصل آباد' },
];

const DEFAULT_MATRIX_CATEGORIES: MatrixCategory[] = [
  { id: 'electrician', name_en: 'Electrician', name_ur: 'الیکٹریشن', name_ar: 'كهربائي', slug_en: 'electrician', slug_ur: 'bijli-mistri' },
  { id: 'plumber', name_en: 'Plumber', name_ur: 'پلمبر', name_ar: 'سباك', slug_en: 'plumber', slug_ur: 'plumber-mistri' },
  { id: 'ac-technician', name_en: 'AC Technician', name_ur: 'اے سی ٹیکنیشن', name_ar: 'فني تكييف', slug_en: 'ac-technician', slug_ur: 'ac-repair-mistri' },
  { id: 'carpenter', name_en: 'Carpenter', name_ur: 'کارپینٹر', name_ar: 'نجار', slug_en: 'carpenter', slug_ur: 'carpenter-barhai' },
  { id: 'painter', name_en: 'Painter', name_ur: 'پینٹر', name_ar: 'دهان وصباغ', slug_en: 'painter', slug_ur: 'rang-paint-mistri' },
  { id: 'car-mechanic', name_en: 'Car Mechanic', name_ur: 'گاڑی مکینک', name_ar: 'ميكانيكي سيارات', slug_en: 'car-mechanic', slug_ur: 'gari-car-mistri' },
];

export default async function HomepageCityCategoryMatrix({
  lang,
  className = '',
}: HomepageCityCategoryMatrixProps) {
  const isUrdu = lang === 'ur';
  const isArabic = lang === 'ar';
  const ArrowIcon = isUrdu || isArabic ? ArrowLeft : ArrowRight;

  // Resolve active taxonomy dynamically with fallbacks
  let matrixCities = DEFAULT_MATRIX_CITIES;
  let matrixCategories = DEFAULT_MATRIX_CATEGORIES;

  try {
    const [dbCities, dbCategories] = await Promise.all([
      getCities({ countryCode: 'pk', activeOnly: true }),
      getCategories({ activeOnly: true }),
    ]);

    if (dbCities && dbCities.length >= 5) {
      // Pick top 5 target cities
      const targetSlugs = ['karachi', 'lahore', 'islamabad', 'rawalpindi', 'faisalabad'];
      const matched = targetSlugs
        .map((s) => dbCities.find((c) => c.slug.toLowerCase() === s))
        .filter((c): c is NonNullable<typeof c> => Boolean(c));

      if (matched.length >= 5) {
        matrixCities = matched.map((c) => ({
          slug: c.slug,
          countryCode: c.countryCode.toLowerCase(),
          name_en: c.name_en,
          name_ur: c.name_ur || c.name_en,
          name_ar: c.name_ar || c.name_en,
        }));
      }
    }

    if (dbCategories && dbCategories.length >= 6) {
      const targetCatIds = ['electrician', 'plumber', 'ac-technician', 'carpenter', 'painter', 'car-mechanic'];
      const matchedCats = targetCatIds
        .map((id) => dbCategories.find((c) => c.id === id || c.slug_en === id))
        .filter((c): c is NonNullable<typeof c> => Boolean(c));

      if (matchedCats.length >= 6) {
        matrixCategories = matchedCats.map((c) => ({
          id: c.id,
          name_en: c.name_en,
          name_ur: c.name_ur || c.name_en,
          name_ar: c.name_ar || c.name_en,
          slug_en: c.slug_en,
          slug_ur: c.slug_ur || c.slug_en,
        }));
      }
    }
  } catch (err) {
    console.warn('Matrix taxonomy resolution note:', err);
  }

  // Section Headers
  const sectionTitle = isUrdu
    ? 'بڑے شہروں میں مقبول ترین سروسز'
    : isArabic
    ? 'الخدمات الأكثر طلباً في المدن الرئيسية'
    : 'Popular Services Across Major Cities';

  const sectionSubtitle = isUrdu
    ? 'پاکستان کے اہم صنعتی و رہائشی شہروں میں تصدیق شدہ کاریگروں سے براہِ راست رابطہ کریں'
    : isArabic
    ? 'تواصل مباشرة عبر واتساب مع أمهر الفنيين والمهنيين في أكبر المدن'
    : 'Direct WhatsApp booking with verified local technicians across primary regional hubs';

  return (
    <section className={`border-t border-gray-200 bg-gray-50/70 py-10 sm:py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2">
              <Building2 className="w-3.5 h-3.5 text-[#006948]" />
              <span>{isUrdu ? 'علاقائی نیٹ ورک' : isArabic ? 'الشبكة الإقليمية' : 'Regional Service Network'}</span>
            </div>
            <h2
              className={`text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 ${
                isUrdu ? 'font-urdu leading-[2.5] pt-1' : 'leading-snug'
              }`}
            >
              {sectionTitle}
            </h2>
            <p className={`text-sm text-gray-500 mt-1 max-w-2xl ${isUrdu ? 'font-urdu leading-[2.2]' : ''}`}>
              {sectionSubtitle}
            </p>
          </div>

          <Link
            href={`/${lang}/pk`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#006948] hover:text-emerald-800 transition-colors shrink-0 group self-start sm:self-end"
          >
            <span className={isUrdu ? 'font-urdu' : ''}>
              {isUrdu ? 'تمام شہر اور سروسز دیکھیں' : isArabic ? 'استكشف كافة المدن والخدمات' : 'Explore All Pakistan Services'}
            </span>
            <ArrowIcon className="w-4 h-4 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* 5-Column Responsive City Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {matrixCities.map((city) => {
            const cityName = isUrdu ? city.name_ur : isArabic ? city.name_ar : city.name_en;
            const cityHubUrl = `/${lang}/${city.countryCode}/${city.slug}`;

            return (
              <div
                key={city.slug}
                className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all"
              >
                <div>
                  {/* City Header Link */}
                  <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-gray-100">
                    <Link
                      href={cityHubUrl}
                      className="group/city flex items-center gap-1.5 min-w-0"
                    >
                      <MapPin className="w-4 h-4 text-[#006948] shrink-0 group-hover/city:scale-110 transition-transform" />
                      <h3
                        className={`font-bold text-gray-900 group-hover/city:text-[#006948] transition-colors truncate ${
                          isUrdu ? 'font-urdu text-lg leading-[1.8]' : 'text-base'
                        }`}
                      >
                        {cityName}
                      </h3>
                    </Link>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 shrink-0 uppercase">
                      {city.countryCode}
                    </span>
                  </div>

                  {/* 6 Category Links */}
                  <ul className="space-y-1.5">
                    {matrixCategories.map((cat) => {
                      const catSlug = isUrdu ? cat.slug_ur : cat.slug_en;
                      const catUrl = `/${lang}/${city.countryCode}/${city.slug}/${catSlug}`;

                      const anchorText = isUrdu
                        ? `${cityName} میں ${cat.name_ur}`
                        : isArabic
                        ? `${cat.name_ar} في ${cityName}`
                        : `${cat.name_en} in ${cityName}`;

                      return (
                        <li key={cat.id}>
                          <Link
                            href={catUrl}
                            className={`flex items-center justify-between text-xs py-1.5 px-2 rounded-lg text-gray-700 hover:text-[#006948] hover:bg-emerald-50/70 transition-all group/item ${
                              isUrdu ? 'font-urdu text-[13px] leading-[1.9]' : ''
                            }`}
                          >
                            <span className="truncate">{anchorText}</span>
                            <ArrowIcon className="w-3 h-3 text-gray-300 group-hover/item:text-[#006948] shrink-0 ms-1 transition-colors" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* City Card Footer */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <Link
                    href={cityHubUrl}
                    className={`inline-flex items-center gap-1 text-xs font-semibold text-[#006948] hover:underline ${
                      isUrdu ? 'font-urdu' : ''
                    }`}
                  >
                    <span>
                      {isUrdu
                        ? `${cityName} کی تمام سروسز`
                        : isArabic
                        ? `جميع خدمات ${cityName}`
                        : `All ${cityName} Services`}
                    </span>
                    <ArrowIcon className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
