import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  MessageCircle,
  Zap,
  ArrowRight,
  PlusCircle,
  Compass,
} from 'lucide-react';
import JsonLd from '@/components/JsonLd';
import { createFaqSchema, createBreadcrumbSchema } from '@/lib/schema';
import FaqAccordion, { FaqAccordionItem, FaqCategory } from '@/components/FaqAccordion';

interface PageProps {
  params: Promise<{
    lang: string;
  }>;
}

const DOMAIN = 'https://baseera-services-directory.vercel.app';

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'ur' }, { lang: 'ar' }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const isUrdu = lang === 'ur';
  const isArabic = lang === 'ar';

  const title = isUrdu
    ? 'اکثر پوچھے جانے والے سوالات (FAQ) | بصیرہ ڈائریکٹری'
    : isArabic
    ? 'الأسئلة الشائعة (FAQ) | دليل بصيرة للخدمات'
    : 'Frequently Asked Questions (FAQ) | Baseera Local Services Directory';

  const description = isUrdu
    ? 'بصیرہ پلیٹ فارم کے طریقہ کار، زیرو کمیشن پالیسی، کاریگروں سے براہِ راست لین دین اور قانونی شرائط کے بارے میں تمام سوالات کے مکمل جوابات۔'
    : isArabic
    ? 'إجابات على الأسئلة الشائعة حول منصة بصيرة، سياسة العمولة الصفرية، التعامل المباشر مع الفنيين، وإخلاء المسؤولية القانونية.'
    : 'Answers to frequently asked questions about Baseera: our 100% zero-commission model, direct payments to specialists, platform guidelines, and legal disclaimers.';

  return {
    title,
    description,
    alternates: {
      canonical: `${DOMAIN}/${lang}/faq`,
      languages: {
        en: `${DOMAIN}/en/faq`,
        ur: `${DOMAIN}/ur/faq`,
        ar: `${DOMAIN}/ar/faq`,
        'x-default': `${DOMAIN}/en/faq`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${DOMAIN}/${lang}/faq`,
      type: 'website',
    },
  };
}

export default async function FaqPage({ params }: PageProps) {
  const { lang } = await params;
  const isUrdu = lang === 'ur';
  const isArabic = lang === 'ar';
  const isRTL = isUrdu || isArabic;

  // Categories for the filter tabs
  const categories: FaqCategory[] = isUrdu
    ? [
        { id: 'all', label: 'تمام سوالات' },
        { id: 'pricing', label: 'زیرو کمیشن اور فیس' },
        { id: 'hiring', label: 'بکنگ اور رابطہ' },
        { id: 'legal', label: 'قانونی شرائط و ذمہ داری' },
        { id: 'providers', label: 'کاریگروں کے لیے' },
      ]
    : isArabic
    ? [
        { id: 'all', label: 'جميع الأسئلة' },
        { id: 'pricing', label: 'عمولة 0% والدفع' },
        { id: 'hiring', label: 'الحجز والتواصل' },
        { id: 'legal', label: 'إخلاء المسؤولية والقانونية' },
        { id: 'providers', label: 'للفنيين والورش' },
      ]
    : [
        { id: 'all', label: 'All Questions' },
        { id: 'pricing', label: '0% Commission & Fees' },
        { id: 'hiring', label: 'Hiring & Payments' },
        { id: 'legal', label: 'Legal & Disclaimers' },
        { id: 'providers', label: 'For Providers' },
      ];

  // Static FAQ items with EXACT required Q&A text for Baseera disclaimers & zero-commission model
  const faqItems: FaqAccordionItem[] = isUrdu
    ? [
        {
          id: 'booking-fees-commission',
          category: 'pricing',
          categoryLabel: 'زیرو کمیشن اور فیس',
          question: 'کیا بصیرہ کسی قسم کی بکنگ فیس یا کمیشن وصول کرتا ہے؟',
          answer:
            'جی نہیں، بصیرہ صارفین کے لیے 100% مفت پلیٹ فارم ہے۔ ہم کسی قسم کا کوئی کمیشن، پوشیدہ چارجز یا بکنگ فیس وصول نہیں کرتے۔',
        },
        {
          id: 'service-charges-payment',
          category: 'pricing',
          categoryLabel: 'زیرو کمیشن اور فیس',
          question: 'سروس کے نرخ کیسے طے ہوتے ہیں اور رقم کسے ادا کرنی ہوتی ہے؟',
          answer:
            'آپ براہِ راست سروس فراہم کنندہ سے ڈیل کرتے ہیں۔ تمام سروس چارجز، وزٹ فیس اور ادائیگی کا طریقہ کار مکمل طور پر آپ اور کاریگر کے مابین طے پاتا ہے۔ بصیرہ قیمتوں کے تعین میں قطعی ملوث نہیں ہے۔',
        },
        {
          id: 'liability-disputes',
          category: 'legal',
          categoryLabel: 'قانونی شرائط و ذمہ داری',
          question: 'کیا بصیرہ کام کے معیار یا مالی تنازعات کی ذمہ دار ہے؟',
          answer:
            'جی نہیں، بصیرہ صرف ایک ڈائریکٹری کے طور پر کام کرتی ہے۔ ہم آپ اور سروس فراہم کنندہ کے مابین کسی بھی مالی لین دین، نقصانات یا تنازعات کے قانونی طور پر ذمہ دار نہیں ہیں۔',
        },
        {
          id: 'how-to-hire',
          category: 'hiring',
          categoryLabel: 'بکنگ اور رابطہ',
          question: 'بصیرہ پر کسی ماہر کاریگر سے رابطہ یا بکنگ کیسے کی جائے؟',
          answer:
            'اپنے شہر اور مطلوبہ سروس کا انتخاب کریں، کاریگر کی ریٹنگز، کام کی تصاویر اور ابتدائی فیس دیکھیں، اور بغیر کسی درمیانی واسطے کے سیدھا "واٹس ایپ پر رابطہ کریں" یا فون کال کے ذریعے بات کریں۔',
        },
        {
          id: 'why-platform-free',
          category: 'pricing',
          categoryLabel: 'زیرو کمیشن اور فیس',
          question: 'بصیرہ یہ ڈائریکٹری سروس بالکل مفت کیوں فراہم کر رہا ہے؟',
          answer:
            'روایتی ایجنسیاں اور مڈل مین 20% سے 35% تک بھاری کمیشن کاٹتے ہیں، جس سے صارفین کے لیے کام مہنگا اور محنتی کاریگروں کے لیے اجرت کم ہو جاتی ہے۔ بصیرہ اس بوجھ کو ختم کر کے ایک شفاف، براہِ راست رابطہ فراہم کرتا ہے۔',
        },
        {
          id: 'provider-verification',
          category: 'legal',
          categoryLabel: 'قانونی شرائط و ذمہ داری',
          question: 'کیا بصیرہ پر موجود سروس فراہم کنندگان کی تصدیق کی جاتی ہے؟',
          answer:
            'ہم کاریگروں کے فون نمبر، واٹس ایپ کی فعالیت اور پبلک ریکارڈ کی تصدیق کا عمل کرتے ہیں۔ تاہم کام شروع کروانے سے قبل وزٹ چارجز اور وارنٹی کی شرائط خود براہِ راست طے کرنے کا مشورہ دیا جاتا ہے۔',
        },
        {
          id: 'register-business',
          category: 'providers',
          categoryLabel: 'کاریگروں کے لیے',
          question: 'کوئی کاریگر یا ورکشاپ بصیرہ پر اپنا اندراج کیسے کروا سکتے ہیں؟',
          answer:
            'ہمارے مینیو میں "اپنی سروس درج کریں" پر کلک کریں، اپنا فون نمبر، شہر اور مہارتیں منتخب کر کے فارم جمع کروائیں۔ اندراج بالکل مفت ہے اور اس میں 3 منٹ سے بھی کم وقت لگتا ہے۔',
        },
        {
          id: 'unprofessional-behavior',
          category: 'legal',
          categoryLabel: 'قانونی شرائط و ذمہ داری',
          question: 'اگر کوئی کاریگر غیر پیشہ ورانہ رویہ اختیار کرے تو کیا کرنا چاہیے؟',
          answer:
            'چونکہ لین دین آپ اور کاریگر کے مابین براہِ راست ہوتا ہے اس لیے معاملہ باہمی طور پر حل کریں۔ ساتھ ہی آپ اس کاریگر کے پروفائل پر "رپورٹ کریں" کے ذریعے اطلاع دے سکتے ہیں تاکہ ہماری ٹیم اس کا جائزہ لے کر کارروائی کرے۔',
        },
      ]
    : isArabic
    ? [
        {
          id: 'booking-fees-commission',
          category: 'pricing',
          categoryLabel: 'عمولة 0% والدفع',
          question: 'هل تتقاضى منصة بصيرة أي رسوم حجز أو عمولات؟',
          answer:
            'لا، منصة بصيرة مجانية تماماً (100%) لجميع المستخدمين. نحن لا نفرض أي عمولات أو رسوم خفية أو تكاليف حجز إطلاقاً.',
        },
        {
          id: 'service-charges-payment',
          category: 'pricing',
          categoryLabel: 'عمولة 0% والدفع',
          question: 'كيف يتم تحديد أسعار الخدمات ولمن أقوم بالدفع؟',
          answer:
            'أنت تتعامل مباشرة مع مقدم الخدمة. يتم الاتفاق على جميع تكاليف الخدمة ورسوم الفحص وطريقة الدفع بينك وبين الفني مباشرة ودون أي تدخل من بصيرة في تحديد الأسعار.',
        },
        {
          id: 'liability-disputes',
          category: 'legal',
          categoryLabel: 'إخلاء المسؤولية والقانونية',
          question: 'هل بصيرة مسؤولة عن جودة العمل أو الخلافات المالية؟',
          answer:
            'لا، تعمل بصيرة كدليل إعلاني مفتوح وتواصل مباشر فقط. نحن لسنا طرفاً في أي معاملات مالية أو أضرار أو نزاعات تنشأ بينك وبين مقدم الخدمة.',
        },
        {
          id: 'how-to-hire',
          category: 'hiring',
          categoryLabel: 'الحجز والتواصل',
          question: 'كيف يمكنني التواصل مع الفني أو حجزه عبر بصيرة؟',
          answer:
            'تصفح مدينتك والتخصص المطلوب، واطلع على تقييمات الفني وسوابق أعماله، ثم اضغط على زر "محادثة واتساب" أو الاتصال المباشر للتنسيق معه فوراً دون وسطاء.',
        },
        {
          id: 'why-platform-free',
          category: 'pricing',
          categoryLabel: 'عمولة 0% والدفع',
          question: 'لماذا تقدم بصيرة هذه الخدمة مجاناً بالكامل دون أي رسوم؟',
          answer:
            'تفرض المنصات التقليدية عمولات مرتفعة تصل إلى 35% مما يزيد التكلفة على أصحاب المنازل ويقلل دخل الفنيين. تسعى بصيرة إلى إلغاء الوسطاء لتمكين الفنيين وتقديم أسعار عادلة للمستهلكين.',
        },
        {
          id: 'provider-verification',
          category: 'legal',
          categoryLabel: 'إخلاء المسؤولية والقانونية',
          question: 'هل الفنيون المسجلون في منصة بصيرة معتمدون ومفحوصون؟',
          answer:
            'نحن نتحقق من صحة أرقام الهواتف وتوفر خدمة الواتساب وسجل تقييمات العملاء. ومع ذلك، ننصح دائماً بالاتفاق المسبق على رسوم الزيارة وشروط الضمان قبل بدء العمل.',
        },
        {
          id: 'register-business',
          category: 'providers',
          categoryLabel: 'للفنيين والورش',
          question: 'كيف يمكن للفنيين وأصحاب الورش التسجيل في دليل بصيرة؟',
          answer:
            'اضغط على "سجل كفني" من القائمة العلوية، واملأ بياناتك ورقم هاتفك والمدينة والتخصصات. التسجيل مجاني تماماً بنسبة 100% ويستغرق أقل من 3 دقائق.',
        },
        {
          id: 'unprofessional-behavior',
          category: 'legal',
          categoryLabel: 'إخلاء المسؤولية والقانونية',
          question: 'ماذا أفعل إذا تصرف الفني بشكل غير احترافي أو قدم عملاً رديئاً؟',
          answer:
            'بما أن الاتفاق يتم بينك وبين الفني مباشرة دون وساطة، فإننا نوصي بحل الأمر ودياً أو قانونياً. ويمكنك أيضاً الضغط على "إبلاغ عن الحساب" في ملف الفني لتقوم إدارة بصيرة بمراجعته وحظره إذا لزم الأمر.',
        },
      ]
    : [
        {
          id: 'booking-fees-commission',
          category: 'pricing',
          categoryLabel: '0% Commission & Fees',
          // EXACT PROMPT REQUIREMENT 1
          question: 'Does Baseera charge any booking fees or commissions?',
          answer:
            'No, Baseera is a 100% free platform for users. We do not charge any commissions, hidden fees, or booking charges.',
        },
        {
          id: 'service-charges-payment',
          category: 'pricing',
          categoryLabel: '0% Commission & Fees',
          // EXACT PROMPT REQUIREMENT 2
          question: 'How are service charges decided, and who do I pay?',
          answer:
            'You deal directly with the service provider. All service charges, visiting fees, and payment methods are negotiated strictly between you and the specialist. Baseera has no involvement in pricing.',
        },
        {
          id: 'liability-disputes',
          category: 'legal',
          categoryLabel: 'Legal & Disclaimers',
          // EXACT PROMPT REQUIREMENT 3
          question: 'Is Baseera responsible for the quality of work or financial disputes?',
          answer:
            'No. Baseera acts strictly as a directory. We are not liable for any financial transactions, damages, or disputes between you and the provider.',
        },
        {
          id: 'how-to-hire',
          category: 'hiring',
          categoryLabel: 'Hiring & Payments',
          question: 'How do I contact or hire a service provider on Baseera?',
          answer:
            'Browse your desired category and city, review verified specialist profiles, ratings, and portfolios, then tap "Chat on WhatsApp" or "Call" to coordinate directly without middleman queues.',
        },
        {
          id: 'why-platform-free',
          category: 'pricing',
          categoryLabel: '0% Commission & Fees',
          question: 'Why is Baseera 100% free to use?',
          answer:
            'Traditional agency platforms extract 20% to 35% commission off every service ticket, inflating homeowner costs and reducing worker wages. Baseera eliminates this friction by operating as an open community directory.',
        },
        {
          id: 'provider-verification',
          category: 'legal',
          categoryLabel: 'Legal & Disclaimers',
          question: 'How does Baseera verify registered specialists?',
          answer:
            'We verify provider contact details, WhatsApp responsiveness, phone validity, and regional service coverage. However, customers are always encouraged to confirm pricing, credentials, and written warranty terms directly before authorizing on-site work.',
        },
        {
          id: 'register-business',
          category: 'providers',
          categoryLabel: 'For Providers',
          question: 'How can a technician or contractor list their services?',
          answer:
            'Click "List Your Service" in the navigation bar, provide your mobile number, select your city and primary categories, and submit. Listing is completely free with zero lead acquisition fees.',
        },
        {
          id: 'unprofessional-behavior',
          category: 'legal',
          categoryLabel: 'Legal & Disclaimers',
          question: 'What should I do if a provider fails to deliver or behaves unprofessionally?',
          answer:
            'Since service agreements and payments are strictly between you and the independent specialist, disputes should be addressed directly. You can also use the "Report Listing" link on their profile so our moderation team can inspect and de-list non-compliant accounts.',
        },
      ];

  // Static FAQPage Schema for SEO & Rich Snippets (Main Entity Q&A)
  const faqSchema = createFaqSchema(
    faqItems.map((item) => ({
      question: item.question,
      answer: item.answer,
    }))
  );

  // Breadcrumb Schema
  const breadcrumbSchema = createBreadcrumbSchema([
    {
      name: isUrdu ? 'مرکزی صفحہ' : isArabic ? 'الرئيسية' : 'Home',
      url: `${DOMAIN}/${lang}`,
    },
    {
      name: isUrdu ? 'عمومی سوالات' : isArabic ? 'الأسئلة الشائعة' : 'FAQ',
      url: `${DOMAIN}/${lang}/faq`,
    },
  ]);

  return (
    <div
      className={`min-h-screen bg-[#f9f9ff] text-neutral-900 pb-20 ${
        isUrdu ? 'font-urdu' : isArabic ? 'font-tajawal' : 'font-sans'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* 1. Static Schema.org FAQPage & BreadcrumbList Injection */}
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* 2. Breadcrumb Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500">
            <Link
              href={`/${lang}`}
              className="hover:text-[#059669] transition-colors"
            >
              {isUrdu ? 'مرکزی صفحہ' : isArabic ? 'الرئيسية' : 'Home'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 rtl:rotate-180" />
            <span className="text-neutral-900 font-semibold">
              {isUrdu ? 'عمومی سوالات' : isArabic ? 'الأسئلة الشائعة' : 'FAQ'}
            </span>
          </nav>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* 3. Page Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200 mb-4 shadow-2xs">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>
              {isUrdu
                ? 'رہنمائی اور شفافیت'
                : isArabic
                ? 'مركز الشفافية والمساعدة'
                : 'Help Center & Platform Transparency'}
            </span>
          </div>

          <h1
            className={`text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 leading-tight mb-3 ${
              isUrdu ? 'leading-[2.4]' : ''
            }`}
          >
            {isUrdu
              ? 'اکثر پوچھے جانے والے سوالات'
              : isArabic
              ? 'الأسئلة الشائعة حول بصيرة'
              : 'Frequently Asked Questions'}
          </h1>

          <p
            className={`text-sm sm:text-base text-gray-600 leading-relaxed ${
              isUrdu ? 'leading-[2.2]' : ''
            }`}
          >
            {isUrdu
              ? 'بصیرہ کے طریقہ کار، 0% کمیشن ماڈل، براہِ راست واٹس ایپ رابطے اور پلیٹ فارم کی پالیسیوں کے بارے میں شفاف معلومات۔'
              : isArabic
              ? 'كل ما تود معرفته عن نموذج العمل المباشر، انعدام العمولات بنسبة 100%، والتواصل السلس مع أفضل الفنيين المحليين.'
              : 'Find clear answers about Baseera’s 100% free directory, zero-commission policies, direct payments, and platform guidelines.'}
          </p>
        </div>

        {/* 4. Trust Summary Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-12">
          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-1">
              {isUrdu ? '0% کمیشن پالیسی' : isArabic ? 'عمولة صفرية (0%)' : '0% Commission'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {isUrdu
                ? 'صارفین اور کاریگروں سے کوئی فیس یا کٹوتی نہیں کی جاتی۔'
                : isArabic
                ? 'لا نقتطع أي نسبة من دخل الفنيين أو أجور العملاء.'
                : 'No hidden booking fees, no lead cuts, and no payment commissions.'}
            </p>
          </div>

          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-1">
              {isUrdu ? 'براہِ راست ڈیلنگ' : isArabic ? 'تعامل مباشر دون وسيط' : 'Direct Hiring'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {isUrdu
                ? 'کاریگر سے سیدھا واٹس ایپ پر بات کریں اور نرخ طے کریں۔'
                : isArabic
                ? 'تواصل فوري عبر واتساب للاتفاق على الأسعار ومواعيد الزيارة.'
                : 'Deal directly with verified specialists. No call center middleman.'}
            </p>
          </div>

          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center mb-3">
              <Compass className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-1">
              {isUrdu ? 'ڈائریکٹری رول' : isArabic ? 'دليل إعلاني مفتوح' : 'Directory Model'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {isUrdu
                ? 'بصیرہ ایک اوپن ڈائریکٹری ہے، مالی لین دین فریقین کا باہمی معاملہ ہے۔'
                : isArabic
                ? 'بصيرة منصة للربط المباشر وليست مسؤولة عن النزاعات المالية.'
                : 'We connect customers and providers. Service terms are negotiated directly.'}
            </p>
          </div>
        </div>

        {/* 5. Interactive Accordion with Category Filters & Search */}
        <FaqAccordion
          items={faqItems}
          categories={categories}
          lang={lang}
          searchPlaceholder={
            isUrdu
              ? 'سوالات، پالیسیوں یا عنوانات کو تلاش کریں...'
              : isArabic
              ? 'ابحث في الأسئلة أو السياسات أو الشروط...'
              : 'Search questions, policies, or topics...'
          }
          noResultsTitle={
            isUrdu
              ? 'کوئی متعلقہ سوال نہیں ملا'
              : isArabic
              ? 'لم يتم العثور على نتائج'
              : 'No matching questions found'
          }
          noResultsDesc={
            isUrdu
              ? 'مختلف الفاظ سے تلاش کریں یا اوپر موجود کیٹیگری ٹیبز کا استعمال کریں۔'
              : isArabic
              ? 'جرب البحث بكلمات أخرى أو اختر تخصصاً من القائمة أعلاه.'
              : 'Try searching with different keywords or switch category filter.'
          }
          clearSearchText={
            isUrdu ? 'تلاش ختم کریں' : isArabic ? 'إعادة ضبط البحث' : 'Reset Search'
          }
          expandAllText={
            isUrdu ? 'سب کھولیں' : isArabic ? 'توسيع الكل' : 'Expand All'
          }
          collapseAllText={
            isUrdu ? 'سب بند کریں' : isArabic ? 'طي الكل' : 'Collapse All'
          }
        />

        {/* 6. Still Have Questions CTA */}
        <div className="mt-14 sm:mt-18 pt-10 border-t border-gray-200">
          <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-sm">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-800/80 text-emerald-200 mb-3 border border-emerald-700/50">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'مزید مدد درکار ہے؟' : isArabic ? 'هل تحتاج إلى مساعدة؟' : 'Need Further Assistance?'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
                {isUrdu
                  ? 'کیا آپ کاریگر ہیں یا مزید تفصیلات چاہتے ہیں؟'
                  : isArabic
                  ? 'هل أنت فني أو ترغب في الاستفسار عن المزيد؟'
                  : 'Are you a specialist or have questions about listing?'}
              </h2>
              <p className="text-sm text-emerald-100/90 leading-relaxed mb-6">
                {isUrdu
                  ? 'بصیرہ کی ٹیم آپ کی رہنمائی کے لیے تیار ہے۔ آپ اپنی سروس بالکل مفت درج کروا سکتے ہیں یا ڈائریکٹری سے ماہر کاریگر تلاش کر سکتے ہیں۔'
                  : isArabic
                  ? 'فريق بصيرة مستعد لخدمتك ومساعدتك في الانضمام إلى الدليل أو العثور على أفضل الفنيين في منطقتك.'
                  : 'Baseera connects households with the best local tradespeople. You can list your services for free in under 3 minutes.'}
              </p>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  href={`/${lang}/list-service`}
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold px-5 py-2.5 rounded-full text-sm transition-all shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>
                    {isUrdu
                      ? 'اپنی سروس درج کریں (مفت)'
                      : isArabic
                      ? 'أضف خدمتك مجاناً'
                      : 'List Your Service Free'}
                  </span>
                </Link>

                <Link
                  href={`/${lang}/about`}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-5 py-2.5 rounded-full text-sm transition-all border border-white/20"
                >
                  <span>{isUrdu ? 'ہمارے بارے میں' : isArabic ? 'عن بصيرة' : 'About Baseera'}</span>
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </Link>
              </div>
            </div>

            {/* Subtle background decoration */}
            <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>
        </div>
      </main>
    </div>
  );
}
