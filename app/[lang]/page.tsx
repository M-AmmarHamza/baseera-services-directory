import { redirect } from 'next/navigation';

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'ur' }, { lang: 'ar' }];
}

export default async function LocaleRootPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const targetCountry = lang === 'ar' ? 'ae' : 'pk';
  const targetCity = targetCountry === 'ae' ? 'dubai' : 'karachi';

  redirect(`/${lang}/${targetCountry}/${targetCity}`);
}
