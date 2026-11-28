import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, CheckCircle2, MessageCircle, Sparkles } from 'lucide-react';
import { resolveCategory, getResolvedCategoryName, getResolvedCityName, resolveCity } from '@/lib/routing/resolve-entities';

interface BlogServiceCTAProps {
  relatedCategorySlugs: string[];
  featuredCitySlugs?: string[];
  lang?: string;
  className?: string;
}

export default async function BlogServiceCTA({
  relatedCategorySlugs,
  featuredCitySlugs = ['karachi', 'lahore', 'islamabad'],
  lang = 'en',
  className = '',
}: BlogServiceCTAProps) {
  if (!relatedCategorySlugs || relatedCategorySlugs.length === 0) return null;

  // Resolve the primary target category
  const primaryCatSlug = relatedCategorySlugs[0];
  const categoryItem = await resolveCategory(primaryCatSlug);
  if (!categoryItem) return null;

  const categoryName = getResolvedCategoryName(categoryItem, lang);
  const localizedCatSlug =
    lang === 'ur' && categoryItem.slug_ur
      ? categoryItem.slug_ur
      : categoryItem.slug_en || categoryItem.id;

  // Prepare city links
  const targetCities = featuredCitySlugs.slice(0, 4);

  const title =
    lang === 'ur'
      ? `کیا آپ کو فوری ${categoryName} کی ضرورت ہے؟`
      : lang === 'ar'
      ? `هل تبحث عن ${categoryName} معتمد؟`
      : `Need a Certified ${categoryName}?`;

  const description =
    lang === 'ur'
      ? `بصیرہ پر اپنے قریبی تصدیق شدہ ماہرین تلاش کریں، ریٹس معلوم کریں اور بغیر کسی کمیشن کے براہِ راست واٹس ایپ پر رابطہ کریں۔`
      : lang === 'ar'
      ? `تصفح أمهر الفنيين المعتمدين في منطقتك، وقارن الأسعار، وتواصل مباشرة عبر واتساب بدون أي عمولة.`
      : `Connect directly with verified local specialists in your city. Compare visiting charges, inspect certifications, and chat on WhatsApp with 0% platform commission.`;

  return (
    <aside className={`my-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-950 text-white shadow-md border border-emerald-800/80 ${className}`}>
      <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
        <Sparkles className="w-4 h-4 text-emerald-400" />
        <span>
          {lang === 'ur' ? 'تصدیق شدہ ماہر کاریگر' : lang === 'ar' ? 'فنيون محترفون' : 'Verified Trade Specialists'}
        </span>
      </div>

      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2 leading-snug">
        {title}
      </h3>

      <p className="text-sm text-emerald-100/90 leading-relaxed max-w-2xl mb-6">
        {description}
      </p>

      {/* City CTA Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {await Promise.all(
          targetCities.map(async (citySlug) => {
            const cityResolved = await resolveCity('pk', citySlug);
            const cityName = cityResolved
              ? getResolvedCityName(cityResolved.city, lang)
              : citySlug.charAt(0).toUpperCase() + citySlug.slice(1);

            const href = `/${lang}/pk/${citySlug.toLowerCase()}/${localizedCatSlug}`;

            const label =
              lang === 'ur'
                ? `${cityName} میں ${categoryName} بُک کریں`
                : lang === 'ar'
                ? `احجز ${categoryName} في ${cityName}`
                : `Hire ${categoryName} in ${cityName}`;

            return (
              <Link
                key={citySlug}
                href={href}
                className="group flex items-center justify-between px-4 py-3 rounded-xl bg-white/10 hover:bg-white text-white hover:text-emerald-900 border border-white/20 hover:border-white transition-all duration-200 shadow-2xs font-semibold text-xs sm:text-sm"
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageCircle className="w-4 h-4 text-emerald-300 group-hover:text-emerald-700 shrink-0" />
                  <span className="truncate">{label}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform shrink-0 ps-1" />
              </Link>
            );
          })
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-emerald-800/60 flex flex-wrap items-center justify-between gap-4 text-xs text-emerald-200/80">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{lang === 'ur' ? '100% مفت ڈائریکٹری' : lang === 'ar' ? 'دليل مجاني 100%' : '100% Free Open Directory'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{lang === 'ur' ? 'زیرو مڈل مین کمیشن' : lang === 'ar' ? 'بدون عمولة وساطة' : 'Zero Middleman Markups'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>{lang === 'ur' ? 'براہِ راست واٹس ایپ' : lang === 'ar' ? 'محادثة فورية' : 'Direct WhatsApp Chat'}</span>
        </div>
      </div>
    </aside>
  );
}
