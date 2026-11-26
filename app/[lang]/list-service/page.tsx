import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/lib/get-dictionary';
import ListServiceForm from '@/components/ListServiceForm';
import { getSiteUrl } from '@/lib/site-url';
import { buildLanguageAlternates } from '@/lib/seo/alternates';
import { isValidLocale } from '@/lib/routing/validate-route';

const DOMAIN = getSiteUrl();

interface PageProps {
  params: Promise<{
    lang: string;
  }>;
}

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'ur' }, { lang: 'ar' }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();
  const isUrdu = lang === 'ur';
  const isArabic = lang === 'ar';

  const title = isUrdu
    ? 'اپنی سروس مفت درج کریں | کاریگر رجسٹریشن | بصیرہ'
    : isArabic
    ? 'أضف خدمتك مجاناً | تسجيل الفنيين والمهنيين | بصيرة'
    : 'List Your Service Free | Provider Registration | Baseera';

  const description = isUrdu
    ? 'بصیرہ پر اپنے ہنر اور سروس کا پروفائل 100% مفت شائع کریں اور اپنے شہر کے کسٹمرز سے براہِ راست واٹس ایپ اور کال پر رابطے حاصل کریں۔ زیرو کمیشن۔'
    : isArabic
    ? 'انشر ملفك المهني على منصة بصيرة مجاناً 100% وتواصل مع العملاء في مدينتك مباشرة عبر واتساب والمكالمات بدون أي عمولة أو وسيط.'
    : 'Publish your service profile on Baseera 100% free. Connect directly with customers in your city via WhatsApp and direct call with zero commission.';

  return {
    title,
    description,
    alternates: buildLanguageAlternates('/list-service', lang),
    openGraph: {
      title,
      description,
      url: `${DOMAIN}/${lang}/list-service`,
      siteName: 'Baseera Local Services Directory',
      locale: isUrdu ? 'ur_PK' : isArabic ? 'ar_AE' : 'en_US',
      type: 'website',
    },
  };
}

export default async function ListServicePage({ params }: PageProps) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f9f9ff] p-8 text-center text-xs text-gray-400">
          {lang === 'ur'
            ? 'رجسٹریشن اسٹوڈیو لوڈ ہو رہا ہے...'
            : lang === 'ar'
            ? 'جارٍ تحميل استوديو تسجيل الخدمات...'
            : 'Loading List Service Studio...'}
        </div>
      }
    >
      <ListServiceForm lang={lang} dict={dict} />
    </Suspense>
  );
}
