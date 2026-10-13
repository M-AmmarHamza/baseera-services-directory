import { MetadataRoute } from 'next';
import { CITIES, CATEGORIES, getAllProviders } from '@/lib/db';

const DOMAIN = 'https://baseera-services-directory.vercel.app';
const LANGUAGES = ['en', 'ur', 'ar'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [];
  const providers = await getAllProviders();
  const currentDate = new Date().toISOString();

  // 1. Root and City level landing pages
  for (const city of CITIES) {
    for (const lang of LANGUAGES) {
      sitemapEntries.push({
        url: `${DOMAIN}/${lang}/${city.countryCode}/${city.slug}`,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: 1.0,
        alternates: {
          languages: {
            en: `${DOMAIN}/en/${city.countryCode}/${city.slug}`,
            ur: `${DOMAIN}/ur/${city.countryCode}/${city.slug}`,
            ar: `${DOMAIN}/ar/${city.countryCode}/${city.slug}`,
          },
        },
      });
    }

    // 2. City + Category pages (Programmatic SEO Silos)
    for (const cat of CATEGORIES) {
      for (const lang of LANGUAGES) {
        sitemapEntries.push({
          url: `${DOMAIN}/${lang}/${city.countryCode}/${city.slug}/${cat.slug}`,
          lastModified: currentDate,
          changeFrequency: 'weekly',
          priority: 0.8,
          alternates: {
            languages: {
              en: `${DOMAIN}/en/${city.countryCode}/${city.slug}/${cat.slug}`,
              ur: `${DOMAIN}/ur/${city.countryCode}/${city.slug}/${cat.slug}`,
              ar: `${DOMAIN}/ar/${city.countryCode}/${city.slug}/${cat.slug}`,
            },
          },
        });
      }
    }
  }

  // 3. Provider Individual Profile Pages
  for (const pro of providers) {
    for (const lang of LANGUAGES) {
      sitemapEntries.push({
        url: `${DOMAIN}/${lang}/${pro.country_code}/${pro.city_slug}/${pro.category_id}/${pro.slug}`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.9,
        alternates: {
          languages: {
            en: `${DOMAIN}/en/${pro.country_code}/${pro.city_slug}/${pro.category_id}/${pro.slug}`,
            ur: `${DOMAIN}/ur/${pro.country_code}/${pro.city_slug}/${pro.category_id}/${pro.slug}`,
            ar: `${DOMAIN}/ar/${pro.country_code}/${pro.city_slug}/${pro.category_id}/${pro.slug}`,
          },
        },
      });
    }
  }

  return sitemapEntries;
}
