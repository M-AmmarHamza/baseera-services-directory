import { redirect } from 'next/navigation';
import { getCountryByCode } from '@/lib/db';

export default async function CountryRootPage({
  params,
}: {
  params: Promise<{ lang: string; country: string }>;
}) {
  const { lang, country } = await params;
  const countryObj = getCountryByCode(country);
  const targetCity = countryObj.defaultCity || 'capital';

  redirect(`/${lang}/${country.toLowerCase()}/${targetCity}`);
}
