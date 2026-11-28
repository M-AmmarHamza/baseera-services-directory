import React from 'react';
import { HelpCircle, ChevronDown, ShieldCheck } from 'lucide-react';
import JsonLd from '@/components/JsonLd';
import { createFaqSchema, FaqItem } from '@/lib/schema';
import { getFaqs, getCategoryTradeContent } from '@/lib/taxonomy-db';

interface CategoryFaqProps {
  categoryName: string;
  cityName: string;
  countryName: string;
  startingPrice?: string;
  lang?: string;
  categorySlug?: string;
  hasPublishedProviders?: boolean;
}

export default async function CategoryFaqSection({
  categoryName,
  cityName,
  countryName,
  startingPrice = 'competitive market rates',
  lang = 'en',
  categorySlug,
  hasPublishedProviders = true,
}: CategoryFaqProps) {
  // ANTI-DOORWAY QUALITY GATE:
  // Never render FAQs or inject FAQPage schema on 0-provider empty categories
  if (!hasPublishedProviders) {
    return null;
  }

  const isUrdu = lang === 'ur';
  const isArabic = lang === 'ar';

  // 1. Fetch trade-specific practical FAQs (distinct per trade, non-templated)
  const tradeContent = getCategoryTradeContent(categorySlug || categoryName, lang);
  const tradeFaqs: FaqItem[] = tradeContent.faqs || [];

  // 2. Dynamic FAQs fetched from Super Admin database (if custom overrides configured)
  let dynamicFaqs: FaqItem[] = [];
  try {
    const rawFaqs = await getFaqs({
      scope: 'CATEGORY',
      categoryId: categorySlug || categoryName.toLowerCase().replace(/\s+/g, '-'),
      activeOnly: true,
    });
    if (rawFaqs && rawFaqs.length > 0) {
      dynamicFaqs = rawFaqs.map((f) => ({
        question: isUrdu && f.question_ur ? f.question_ur : f.question_en,
        answer: isUrdu && f.answer_ur ? f.answer_ur : f.answer_en,
      }));
    }
  } catch (err) {
    console.warn('CategoryFaqSection dynamic fetch notice:', err);
  }

  // Combine dynamic CMS FAQs with curated trade-specific FAQs
  const faqs: FaqItem[] = [...dynamicFaqs, ...tradeFaqs];

  // If no trade-specific or CMS FAQs exist, suppress section entirely
  if (faqs.length === 0) {
    return null;
  }

  // Dynamic FAQPage schema targeted for Google People Also Ask (PAA) rich snippets
  const faqSchema = createFaqSchema(faqs);

  const sectionTitle = isUrdu
    ? `اکثر پوچھے جانے والے سوالات (${categoryName} - ${cityName})`
    : isArabic
    ? `الأسئلة الشائعة (${categoryName} في ${cityName})`
    : `Frequently Asked Questions (${categoryName} in ${cityName})`;

  const sectionSubtitle = isUrdu
    ? `${cityName} میں ${categoryName} کے تکنیکی کام، خرابی کی تشخیص اور معیاری خدمات سے متعلق ضروری رہنمائی`
    : isArabic
    ? `إجابات عملية وشاملة حول خدمات ${categoryName} ومعايير الصيانة والتشخيص في ${cityName}`
    : `Practical answers on trade techniques, troubleshooting, and quality standards for ${categoryName} in ${cityName}.`;

  return (
    <section className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-gray-200">
      {/* Safe FAQPage Schema.org Injection (populated pages only) */}
      <JsonLd data={faqSchema} />

      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200 mb-3">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>{isUrdu ? 'تکنیکی رہنمائی و سوالات' : isArabic ? 'دليل الصيانة والأسئلة' : 'Trade Guidance & FAQs'}</span>
          </div>
          <h2
            className={`text-xl sm:text-2xl font-bold text-gray-900 tracking-tight ${
              isUrdu ? 'font-urdu leading-[2.4]' : ''
            }`}
          >
            {sectionTitle}
          </h2>
          <p className={`text-sm text-gray-600 mt-1.5 ${isUrdu ? 'font-urdu leading-[2.2]' : ''}`}>
            {sectionSubtitle}
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, index) => (
            <details
              key={index}
              open={index === 0}
              className="group bg-white border border-gray-200 rounded-xl p-4 sm:p-5 transition-all open:border-emerald-500/50 open:ring-1 open:ring-emerald-500/10 shadow-2xs"
            >
              <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-gray-900 text-sm sm:text-base group-hover:text-emerald-700 transition-colors">
                <span className={isUrdu ? 'font-urdu leading-[2.2]' : ''}>
                  {faq.question}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform shrink-0 ms-3" />
              </summary>
              <div className="mt-3 pt-3 border-t border-gray-100 text-xs sm:text-sm text-gray-600 leading-relaxed">
                <p className={isUrdu ? 'font-urdu leading-[2.4]' : ''}>{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>

        {/* Zero-Commission Trust Badge Box */}
        <div className="mt-6 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3 text-xs sm:text-sm text-emerald-900">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className={isUrdu ? 'font-urdu leading-[2.2]' : ''}>
            <p className="font-semibold text-emerald-950">
              {isUrdu
                ? 'بصیرہ زیرو کمیشن ضامن ہے'
                : isArabic
                ? 'ضمان شفافية دليل بصيرة 0% عمولة'
                : '100% Free & Zero Commission Guarantee'}
            </p>
            <p className="text-emerald-800 mt-0.5">
              {isUrdu
                ? 'ہم کاریگروں یا کسٹمرز سے کوئی فیس نہیں لیتے۔ آپ کا تمام لین دین براہِ راست کاریگر کے ساتھ طے پاتا ہے۔'
                : isArabic
                ? 'لا نتقاضى أي عمولات من المستهلكين أو الفنيين. جميع المعاملات تتم بينك وبين مقدم الخدمة مباشرة.'
                : 'Baseera connects you directly via WhatsApp without agency cuts. You pay 100% of the agreed amount directly to the specialist.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
