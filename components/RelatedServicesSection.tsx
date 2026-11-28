import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, Sparkles } from 'lucide-react';
import { getRelatedCategories } from '@/lib/seo/related-categories';
import CategoryIcon from '@/components/CategoryIcon';

interface RelatedServicesSectionProps {
  country: string;
  city: string;
  category: string;
  cityName: string;
  lang?: string;
  className?: string;
}

export default async function RelatedServicesSection({
  country,
  city,
  category,
  cityName,
  lang = 'en',
  className = '',
}: RelatedServicesSectionProps) {
  const relatedCategories = await getRelatedCategories(category, lang);

  if (!relatedCategories || relatedCategories.length === 0) {
    return null;
  }

  const title =
    lang === 'ur'
      ? `${cityName} میں متعلقہ دیگر سروسز`
      : lang === 'ar'
      ? `خدمات ذات صلة في ${cityName}`
      : `Related Services in ${cityName}`;

  const subtitle =
    lang === 'ur'
      ? `گھر اور کاروباری ضروریات کے لیے دیگر تصدیق شدہ ماہرین اور کاریگر`
      : lang === 'ar'
      ? `فنيون موثوقون يقدمون خدمات تكميلية لمنزلك وعملك`
      : `Explore verified local specialists offering complementary home and trade solutions.`;

  return (
    <section className={`border-t border-gray-200/90 pt-10 sm:pt-12 mt-12 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {lang === 'ur' ? 'متعلقہ سروسز' : lang === 'ar' ? 'خدمات مقترحة' : 'Complementary Services'}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {relatedCategories.map((item) => {
          const href = `/${lang}/${country.toLowerCase()}/${city.toLowerCase()}/${item.localizedSlug}`;
          return (
            <Link
              key={item.id}
              href={href}
              className="group flex items-center justify-between p-4 rounded-xl border border-gray-200/90 bg-white hover:border-emerald-500/50 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#059669] shrink-0 group-hover:scale-105 group-hover:bg-[#059669] group-hover:text-white transition-all">
                  <CategoryIcon slug={item.slug} icon={item.icon} className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#059669] transition-colors truncate">
                    {item.name}
                  </h3>
                  <span className="text-xs text-gray-500 font-medium">
                    {cityName}
                  </span>
                </div>
              </div>
              <div className="text-gray-400 group-hover:text-[#059669] transition-colors rtl:rotate-180 shrink-0 ps-2">
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
