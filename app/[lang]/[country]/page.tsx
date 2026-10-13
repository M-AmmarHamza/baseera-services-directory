import { redirect } from 'next/navigation';

const COUNTRY_DEFAULTS: Record<string, string> = {
  pk: 'karachi',
  ae: 'dubai',
  sa: 'riyadh',
  qa: 'doha',
  om: 'muscat',
  bh: 'manama',
  kw: 'kuwait',
  gb: 'london',
  us: 'houston',
  ca: 'toronto',
};

export default async function CountryRootPage({
  params,
}: {
  params: Promise<{ lang: string; country: string }>;
}) {
  const { lang, country } = await params;
  const targetCity = COUNTRY_DEFAULTS[country.toLowerCase()] || 'karachi';

  redirect(`/${lang}/${country}/${targetCity}`);
}
