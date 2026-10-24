// Vercel Serverless Function: /api/seo
// Programmatic SEO & Schema.org JSON-LD Generator
// Silo Pattern: /[lang]/[country]/[city]/[category]/[slug]

import { generateSiloUrl } from '../lib/transliterate.js';

const DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://baseera-services-directory.vercel.app';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const {
    lang = 'en',
    country = 'pk',
    city = 'karachi',
    category = 'electrician',
    slug = '',
    name = '',
    trade = '',
    district = ''
  } = req.query;

  const cityName = city.charAt(0).toUpperCase() + city.slice(1);
  const countryName = country.toUpperCase() === 'PK' ? 'Pakistan' : country.toUpperCase();
  const categoryName = category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  let pageTitle = `Top ${categoryName}s in ${cityName}, ${countryName} | Baseera Local Directory`;
  let pageDesc = `Find verified ${categoryName.toLowerCase()}s in ${cityName} (${district || 'All Districts'}). Connect directly on WhatsApp with zero commission fee.`;

  if (slug && name) {
    pageTitle = `${name} - Verified ${trade || categoryName} in ${district || cityName} | Baseera`;
    pageDesc = `Contact ${name} on WhatsApp for verified ${trade || categoryName} services across ${district || cityName}, ${countryName}. Direct transparent pricing.`;
  }

  const canonicalUrl = `${DOMAIN}${generateSiloUrl({ lang, country, city, category, slug })}`;

  // Schema.org LocalBusiness JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: name || `${categoryName} in ${cityName}`,
    description: pageDesc,
    url: canonicalUrl,
    address: {
      '@type': 'PostalAddress',
      addressLocality: cityName,
      addressCountry: country.toUpperCase()
    },
    areaServed: district ? [district, cityName] : [cityName],
    priceRange: 'PKR 500 - 5000'
  };

  return res.status(200).json({
    success: true,
    meta: {
      title: pageTitle,
      description: pageDesc,
      canonical: canonicalUrl,
      openGraph: {
        title: pageTitle,
        description: pageDesc,
        url: canonicalUrl,
        type: 'business.business',
        site_name: 'Baseera Karachi'
      },
      jsonLd
    }
  });
}
