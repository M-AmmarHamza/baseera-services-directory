import React from 'react';
import { HelpCircle, ChevronDown, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import JsonLd from '@/components/JsonLd';
import { createFaqSchema, FaqItem } from '@/lib/schema';

interface CategoryFaqProps {
  categoryName: string;
  cityName: string;
  countryName: string;
  startingPrice?: string;
  lang?: string;
}

export default function CategoryFaqSection({
  categoryName,
  cityName,
  countryName,
  startingPrice = 'competitive market rates',
  lang = 'en',
}: CategoryFaqProps) {
  const isUrdu = lang === 'ur';
  const isArabic = lang === 'ar';

  const faqs: FaqItem[] = isUrdu
    ? [
        {
          question: `${cityName} میں ${categoryName} کے اوسط وزٹ چارجز کتنے ہیں؟`,
          answer: `${cityName} میں ${categoryName} کے ابتدائی معائنہ و وزٹ چارجز عام طور پر ${startingPrice} سے شروع ہوتے ہیں۔ کام کی اصل نوعیت، پرزہ جات کی تبدیلی اور لیبر کا حتمی تخمینہ کاریگر سائٹ پر معائنے کے بعد براہِ راست آپ کو فراہم کرتا ہے۔`,
        },
        {
          question: `کیا میں رقم بصیرہ کو ادا کروں گا یا براہِ راست ${categoryName} کو؟`,
          answer: `آپ تمام رقم کام تسلی بخش مکمل ہونے کے بعد براہِ راست ${categoryName} کو ادا کریں گے۔ بصیرہ 100% مفت ڈائریکٹری ہے اور صارفین یا کاریگروں سے کوئی کمیشن، مڈل مین کٹوتی یا بکنگ فیس وصول نہیں کرتی۔`,
        },
        {
          question: `${cityName} میں تصدیق شدہ ${categoryName} کی خدمات کیسے حاصل کریں؟`,
          answer: `آپ بصیرہ ڈائریکٹری پر ${cityName} کے تصدیق شدہ ${categoryName} کے پروفائلز دیکھ سکتے ہیں، ان کے کام کے جائزے، ریٹنگز اور وزٹ چارجز چیک کر سکتے ہیں۔ رابطہ کرنے کے لیے براہِ راست "واٹس ایپ پر رابطہ کریں" یا فون بٹن پر کلک کریں اور بغیر کسی تاخیر کے کاریگر سے خود بات کریں۔`,
        },
        {
          question: `کیا بصیرہ کام کے معیار یا مالی تنازعات کی ذمہ دار ہے؟`,
          answer: `جی نہیں، بصیرہ ایک اوپن کمیونٹی ڈائریکٹری کے طور پر کام کرتی ہے نہ کہ ٹھیکیدار کے طور پر۔ کام کی وارنٹی، معیار اور قیمتوں کا معاہدہ آپ اور ${categoryName} کے مابین براہِ راست طے پاتا ہے۔ ہم تجویز کرتے ہیں کہ کام شروع کروانے سے پہلے شرائط باہمی طور پر طے کر لیں۔`,
        },
        {
          question: `${cityName} میں کاریگر کتنی دیر میں واٹس ایپ پر جواب دیتے ہیں؟`,
          answer: `بصیرہ پر درج زیادہ تر فعال ${categoryName} کاروباری اوقات میں عام طور پر 10 سے 15 منٹ کے اندر واٹس ایپ پر فوری جواب دیتے ہیں۔ فوری تشخیص کے لیے آپ خرابی کی تصاویر یا وائس نوٹ بھی بھیج سکتے ہیں۔`,
        },
      ]
    : isArabic
    ? [
        {
          question: `ما هو متوسط رسوم الزيارة لفني ${categoryName} في ${cityName}؟`,
          answer: `تبدأ رسوم الزيارة والفحص المبدئي لفني ${categoryName} في ${cityName} عادةً من ${startingPrice}. ويتم الاتفاق على التكلفة الإجمالية للصيانة وقطع الغيار مباشرة مع الفني بعد معاينة العطل على أرض الواقع.`,
        },
        {
          question: `هل أدفع الرسوم لمنصة بصيرة أم لفني ${categoryName} مباشرة؟`,
          answer: `تدفع كامل الرسوم لفني ${categoryName} مباشرة بعد إنجاز العمل ورضاك التام. بصيرة هي منصة مجانية 100% بنموذج عمولة صفرية (0%)، ولا نتقاضى أي رسوم حجز أو عمولات وسيط إطلاقاً.`,
        },
        {
          question: `كيف يمكنني توظيف ${categoryName} معتمد في ${cityName}؟`,
          answer: `يمكنك تصفح قائمة الفنيين المعتمدين في ${cityName} أعلاه، والاطلاع على تقييمات العملاء ومجالات التخصص والأسعار المبدئية، ثم الضغط على "محادثة واتساب" للتواصل المباشر مع الفني بدون وسطاء.`,
        },
        {
          question: `هل بصيرة مسؤولة عن جودة العمل أو الخلافات المالية؟`,
          answer: `لا، بصيرة دليل إلكتروني للتواصل المباشر وليست مقاولاً تنفيذياً. جميع الاتفاقات المالية وشروط الضمان يتم تحديدها بينك وبين فني ${categoryName} مباشرة. ننصح دائماً بتأكيد تفاصيل الضمان خطياً قبل البدء.`,
        },
        {
          question: `ما هي سرعة استجابة فنيي ${categoryName} في ${cityName} عبر واتساب؟`,
          answer: `يستجيب معظم الفنيين المعتمدين في ${cityName} خلال 10 إلى 15 دقيقة عبر واتساب خلال ساعات العمل المعتادة. يمكنك إرسال صور أو مقاطع فيديو للمشكلة للحصول على تقدير مبدئي فوري.`,
        },
      ]
    : [
        {
          question: `What is the average visiting fee for a ${categoryName} in ${cityName}?`,
          answer: `Visiting and inspection charges for a ${categoryName} in ${cityName} typically start from ${startingPrice}. The final service quotation is determined by the specialist based on required parts, labor, and job scope after on-site evaluation.`,
        },
        {
          question: `Do I pay Baseera or the ${categoryName} directly?`,
          answer: `You pay the ${categoryName} directly upon satisfactory completion of the work. Baseera operates strictly as a zero-commission directory; we never take any middleman fee, booking charge, or commission cut from either the customer or the provider.`,
        },
        {
          question: `How do I hire a verified ${categoryName} in ${cityName}?`,
          answer: `Browse the verified listings above, review customer feedback, starting prices, and specializations, then tap "Chat on WhatsApp" or call the specialist directly to discuss your requirements and schedule a visit.`,
        },
        {
          question: `Is Baseera responsible for the quality of work or financial disputes?`,
          answer: `No. Baseera acts strictly as an open discovery directory. We are not liable for any financial transactions, damages, or disputes between you and the ${categoryName}. We recommend confirming pricing and warranty terms directly before work commences.`,
        },
        {
          question: `How quickly does a ${categoryName} in ${cityName} respond on WhatsApp?`,
          answer: `Most verified specialists in ${cityName} respond within 10 to 15 minutes during regular operating hours. You can send fault photos or brief voice notes for prompt diagnosis.`,
        },
      ];

  // Dynamic FAQPage schema targeted for Google People Also Ask (PAA) rich snippets
  const faqSchema = createFaqSchema(faqs);

  const sectionTitle = isUrdu
    ? `اکثر پوچھے جانے والے سوالات (${categoryName} - ${cityName})`
    : isArabic
    ? `الأسئلة الشائعة (${categoryName} في ${cityName})`
    : `Frequently Asked Questions (${categoryName} in ${cityName})`;

  const sectionSubtitle = isUrdu
    ? `${cityName} میں ${categoryName} کی بکنگ، وزٹ فیس اور زیرو کمیشن ڈائریکٹ رابطے کے بارے میں معلومات`
    : isArabic
    ? `دليلك الشامل لرسوم الزيارة والتواصل المباشر مع فنيي ${categoryName} في ${cityName}`
    : `Everything you need to know about pricing, hiring, and direct contact for ${categoryName} in ${cityName}.`;

  return (
    <section className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-gray-200">
      {/* Safe FAQPage Schema.org Injection */}
      <JsonLd data={faqSchema} />

      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200 mb-3">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>{isUrdu ? 'عمومی سوال و جواب' : isArabic ? 'إجابات سريعة' : 'Direct Answers & Pricing'}</span>
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
