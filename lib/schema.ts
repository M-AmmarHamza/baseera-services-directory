/**
 * Comprehensive Structured Data (JSON-LD) Generator Library for Baseera
 * Generates Schema.org compliant data for SEO & Generative Engine Optimization (GEO)
 */

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface LocalBusinessSchemaParams {
  name: string;
  description: string;
  url: string;
  telephone: string;
  image?: string[];
  priceRange?: string;
  categoryName: string;
  serviceType?: string;
  cityName: string;
  countryCode: string;
  serviceArea?: string[];
  rating?: number;
  reviewCount?: number;
  openingHours?: string;
}

export interface ItemListEntry {
  name: string;
  url: string;
  image?: string;
  telephone?: string;
  priceRange?: string;
  rating?: number;
  reviewCount?: number;
  cityName?: string;
  countryCode?: string;
}

/**
 * 1. BreadcrumbList Schema (URL Hierarchy for search engines)
 */
export function createBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * 2. LocalBusiness & ProfessionalService Schema (Provider Profiles)
 */
export function createLocalBusinessSchema(params: LocalBusinessSchemaParams) {
  const {
    name,
    description,
    url,
    telephone,
    image = [],
    priceRange = '$$',
    categoryName,
    serviceType,
    cityName,
    countryCode,
    serviceArea = [],
    rating,
    reviewCount,
    openingHours = 'Mo-Su 08:00-22:00',
  } = params;

  // Format clean E.164 phone string if available
  const cleanPhone = telephone ? telephone.replace(/[\s\(\)\-]/g, '') : undefined;

  const areaServedList =
    Array.isArray(serviceArea) && serviceArea.length > 0
      ? serviceArea.map((area) => ({
          '@type': 'AdministrativeArea',
          name: `${area}, ${cityName}`,
        }))
      : [
          {
            '@type': 'City',
            name: cityName,
          },
        ];

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ProfessionalService'],
    '@id': url,
    name,
    description,
    url,
    image: image.filter(Boolean),
    telephone: cleanPhone,
    serviceType: serviceType || categoryName,
    category: categoryName,
    priceRange,
    openingHours,
    currenciesAccepted: countryCode === 'PK' ? 'PKR' : countryCode === 'AE' ? 'AED' : 'USD',
    paymentAccepted: 'Cash, Bank Transfer',
    address: {
      '@type': 'PostalAddress',
      addressLocality: cityName,
      addressRegion: cityName,
      addressCountry: countryCode.toUpperCase(),
    },
    areaServed: areaServedList,
  };

  if (rating && rating > 0 && reviewCount && reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(rating).toFixed(1),
      reviewCount: String(reviewCount),
      bestRating: '5',
      worstRating: '1',
    };
  }

  return schema;
}

/**
 * 3. ItemList / CollectionPage Schema (City & Category listings)
 */
export function createItemListSchema(params: {
  name: string;
  description: string;
  url: string;
  items: ItemListEntry[];
}) {
  const { name, description, url, items } = params;

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    url,
    numberOfItems: items.length,
    itemListElement: items.map((item, idx) => {
      const listItem: Record<string, any> = {
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': 'LocalBusiness',
          name: item.name,
          url: item.url,
          image: item.image,
          telephone: item.telephone ? item.telephone.replace(/[\s\(\)\-]/g, '') : undefined,
          priceRange: item.priceRange,
          address: item.cityName
            ? {
                '@type': 'PostalAddress',
                addressLocality: item.cityName,
                addressCountry: (item.countryCode || 'PK').toUpperCase(),
              }
            : undefined,
        },
      };

      if (item.rating && item.rating > 0) {
        listItem.item.aggregateRating = {
          '@type': 'AggregateRating',
          ratingValue: Number(item.rating).toFixed(1),
          reviewCount: String(item.reviewCount || 1),
        };
      }

      return listItem;
    }),
  };
}

/**
 * 4. FAQPage Schema (Category & Guides pages)
 */
export function createFaqSchema(faqs: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * 5. WebSite Schema with SearchAction
 */
export function createWebSiteSchema(domain: string, lang: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Baseera',
    url: `${domain}/${lang}`,
    description:
      'Zero-commission global directory connecting homeowners and businesses directly with verified local service specialists via WhatsApp.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${domain}/${lang}/pk/karachi/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}
