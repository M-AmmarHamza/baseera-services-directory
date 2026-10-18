import React from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
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
          question: `${cityName} میں تصدیق شدہ ${categoryName} کی خدمات کیسے حاصل کریں؟`,
          answer: `آپ بصیرہ ڈائریکٹری پر ${cityName} کے تصدیق شدہ ${categoryName} کے پروفائلز دیکھ سکتے ہیں، ان کے کام کے جائزے، ریٹنگز اور وزٹ چارجز چیک کر سکتے ہیں۔ رابطہ کرنے کے لیے براہِ راست واٹس ایپ بٹن پر کلک کریں اور بغیر کسی مڈل مین کے کاریگر سے بات کریں۔`,
        },
        {
          question: `${cityName} میں ${categoryName} کے وزٹ چارجز کتنے ہیں؟`,
          answer: `${cityName} میں ${categoryName} کے ابتدائی وزٹ چارجز عام طور پر ${startingPrice} سے شروع ہوتے ہیں۔ کام کی اصل نوعیت اور پرزہ جات کی لاگت کا حتمی تخمینہ کاریگر معائنے کے بعد براہِ راست فراہم کرتا ہے۔`,
        },
        {
          question: `کیا بصیرہ پر کام بک کرنے پر کوئی کمیشن یا اضافی فیس لاگو ہوتی ہے؟`,
          answer: `جی نہیں، بصیرہ 100% زیرو کمیشن پلیٹ فارم ہے۔ ہمارا مقصد صارفین اور کاریگروں کا براہِ راست رابطہ کروانا ہے۔ آپ کی طرف سے ادا کی جانے والی تمام رقم بغیر کسی کٹوتی کے سیدھی کاریگر کو ملتی ہے۔`,
        },
        {
          question: `${cityName} میں کاریگر کتنی دیر میں واٹس ایپ پر جواب دیتے ہیں؟`,
          answer: `بصیرہ پر درج زیادہ تر تصدیق شدہ ${categoryName} عام طور پر 10 سے 20 منٹ کے اندر واٹس ایپ پر جواب دیتے ہیں۔ آپ خرابی کی تصاویر یا ویڈیوز بھیج کر فوری مشاورت حاصل کر سکتے ہیں۔`,
        },
      ]
    : isArabic
    ? [
        {
          question: `كيف يمكنني توظيف ${categoryName} معتمد في ${cityName}؟`,
          answer: `يمكنك تصفح ملفات أفضل الفنيين المتخصصين في ${categoryName} في ${cityName} عبر دليل بصيرة، والاطلاع على التقييمات وسوابق الأعمال. اضغط على زر الواتساب للتواصل مباشرة مع الفني دون وسطاء.`,
        },
        {
          question: `كم تبلغ رسوم الزيارة المبدئية لفني ${categoryName} في ${cityName}؟`,
          answer: `تبدأ رسوم الزيارة والفحص المبدئي في ${cityName} عادةً من ${startingPrice}. ويتم الاتفاق على التكلفة الإجمالية للإصلاح أو الصيانة مباشرة مع الفني بعد معاينة العطل.`,
        },
        {
          question: `هل تتقاضى منصة بصيرة أي عمولة أو رسوم حجز خفية؟`,
          answer: `لا، منصة بصيرة مجانية وبدون أي عمولة (0%). يتم دفع كامل قيمة الخدمة للفني مباشرة بعد إنجاز العمل دون أي وسيط.`,
        },
        {
          question: `ما هي سرعة الاستجابة للفنيين في ${cityName} عبر واتساب؟`,
          answer: `يستجيب معظم الفنيين المعتمدين في ${cityName} خلال 10 إلى 20 دقيقة عبر واتساب. يمكنك إرسال صور أو مقاطع فيديو للعطل لتشخيص مبدئي فوري.`,
        },
      ]
    : [
        {
          question: `How do I hire a verified ${categoryName} in ${cityName}?`,
          answer: `You can browse verified ${categoryName} profiles on Baseera, review their ratings, portfolio, and starting charges. Click the "Chat on WhatsApp" button to connect directly with the specialist without middleman delays.`,
        },
        {
          question: `What are the typical visiting charges for a ${categoryName} in ${cityName}?`,
          answer: `Visiting and inspection charges in ${cityName} typically start around ${startingPrice}. The final service quotation is provided directly by the specialist after on-site evaluation of the job requirements.`,
        },
        {
          question: `Is there any platform booking fee or commission on Baseera?`,
          answer: `No. Baseera operates on a strict zero-commission model. Homeowners and businesses pay 100% of the agreed service charges directly to the specialist upon completion.`,
        },
        {
          question: `How quickly do specialists in ${cityName} respond on WhatsApp?`,
          answer: `Most verified specialists on Baseera respond within 10 to 20 minutes on WhatsApp. You can share fault photos or short voice notes for prompt diagnosis.`,
        },
      ];

  const faqSchema = createFaqSchema(faqs);

  const sectionTitle = isUrdu
    ? `اکثر پوچھے جانے والے سوالات (${categoryName} - ${cityName})`
    : isArabic
    ? `الأسئلة الشائعة (${categoryName} في ${cityName})`
    : `Frequently Asked Questions (${categoryName} in ${cityName})`;

  return (
    <section className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-gray-200">
      {/* Safe Schema Injection */}
      <JsonLd data={faqSchema} />

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <h2
            className={`text-xl sm:text-2xl font-bold text-gray-900 ${
              isUrdu ? 'font-urdu leading-[2.4]' : ''
            }`}
          >
            {sectionTitle}
          </h2>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, index) => (
            <details
              key={index}
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
      </div>
    </section>
  );
}
