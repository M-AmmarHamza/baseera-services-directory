import React from 'react';
import Link from 'next/link';
import CategoryIcon from '@/components/CategoryIcon';
import { CATEGORIES, getCategoryName, CategoryDef } from '@/lib/db';

export interface CategoryGridProps {
  lang: string;
  country: string;
  city: string;
  title?: string;
  subtitle?: string;
  categories?: CategoryDef[];
  activeCountText?: string;
  categoriesCountText?: string;
  className?: string;
  showHeader?: boolean;
}

/**
 * Reusable, responsive CSS Grid component displaying all 24+ verified specialties.
 * Used on Homepage, City Pages, and Country Pages.
 * Layout: 2 columns on mobile, 3 on sm, 4 on md, and 6 on lg.
 * Fully eliminates horizontal scrolling, sliders, and navigation arrow clicks.
 */
export default function CategoryGrid({
  lang,
  country,
  city,
  title,
  subtitle,
  categories = CATEGORIES,
  activeCountText,
  categoriesCountText,
  className = '',
  showHeader = true,
}: CategoryGridProps) {
  const isUrdu = lang === 'ur';
  const isArabic = lang === 'ar';

  const defaultTitle = isUrdu
    ? '24+ تصدیق شدہ کیٹیگریز دیکھیں'
    : isArabic
    ? 'تصفح أكثر من 24 تخصصاً موثقاً'
    : 'Browse 24+ Verified Specialties';

  const defaultSubtitle = isUrdu
    ? 'دنیا بھر کے تصدیق شدہ کمیونٹی ٹیکنیشنز اور ماہر کاریگر'
    : isArabic
    ? 'فنيون محترفون ومعتمدون في منطقتك بدون وسيط'
    : 'Verified community specialists & technicians with direct WhatsApp booking';

  const defaultActiveText = activeCountText || (isUrdu ? 'فعال' : isArabic ? 'متاح' : 'Active');
  const defaultCategoriesCountText = categoriesCountText || (isUrdu ? 'کیٹیگریز' : isArabic ? 'تخصصات' : 'Categories');

  const cleanCountry = (country || 'pk').toLowerCase();
  const cleanCity = (city || 'karachi').toLowerCase();

  return (
    <section className={`w-full max-w-7xl mx-auto overflow-hidden ${className}`}>
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 mb-5 sm:mb-6">
          <div>
            <h2
              className={`text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 ${
                isUrdu ? 'font-urdu leading-[2.5] mb-2 pt-1' : 'leading-snug'
              }`}
            >
              {title || defaultTitle}
            </h2>
            <p className={`text-sm text-gray-500 mt-1 ${isUrdu ? 'font-urdu leading-[2.2]' : ''}`}>
              {subtitle || defaultSubtitle}
            </p>
          </div>
          <div
            className={`text-sm font-semibold text-emerald-700 whitespace-nowrap shrink-0 ${
              isUrdu ? 'font-urdu leading-[2.0]' : ''
            }`}
          >
            {categories.length} {defaultCategoriesCountText}
          </div>
        </div>
      )}

      {/* Responsive Categories CSS Grid: 2 cols on mobile, 3 on sm, 4 on md, 6 on lg */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 w-full max-w-full overflow-hidden">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/${lang}/${cleanCountry}/${cleanCity}/${cat.slug}`}
            className={`w-full min-w-0 max-w-full flex flex-col items-center justify-between p-3 sm:p-4 rounded-2xl bg-white hover:border-[#006948] border border-gray-200/80 shadow-2xs hover:shadow-sm transition-all text-center group cursor-pointer overflow-hidden box-border ${
              isUrdu ? 'min-h-[160px] sm:min-h-[170px]' : 'min-h-[130px] sm:min-h-[140px]'
            }`}
          >
            {/* Circular icon container */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-emerald-50 text-[#006948] flex items-center justify-center mb-1.5 shrink-0 group-hover:scale-105 group-hover:bg-[#006948] group-hover:text-white transition-all">
              <CategoryIcon
                slug={cat.slug}
                id={cat.id}
                name={cat.name}
                icon={cat.icon}
                className="w-5 h-5"
              />
            </div>

            {/* Title Container */}
            <div className="flex-1 flex items-center justify-center w-full min-w-0 my-auto py-1 px-0.5 overflow-hidden">
              <span
                className={`font-bold text-gray-900 group-hover:text-[#006948] transition-colors text-center break-words ${
                  isUrdu
                    ? 'font-urdu text-xs sm:text-sm leading-[2.3] py-0.5 tracking-normal'
                    : 'text-xs line-clamp-2 leading-tight flex items-center justify-center'
                }`}
              >
                {getCategoryName(cat, lang)}
              </span>
            </div>

            {/* Active provider count subtext */}
            <span
              dir="auto"
              className={`text-[10px] sm:text-xs text-gray-500 font-medium shrink-0 mt-1 truncate ${
                isUrdu ? 'font-urdu leading-[1.8] pt-0.5' : ''
              }`}
            >
              {cat.count}+ {defaultActiveText}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
