import { MetadataRoute } from 'next';
import { getSiteUrl, isIndexingAllowed } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  const domain = getSiteUrl();
  const allowIndexing = isIndexingAllowed();

  // STAGING / TEMPORARY DOMAIN PROTECTION:
  // If indexing is not explicitly enabled, disallow all crawlers from the root
  // to avoid duplicate content penalties before the production custom domain is live.
  if (!allowIndexing) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
      sitemap: `${domain}/sitemap.xml`,
    };
  }

  // PRODUCTION CONFIGURATION:
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/*/admin',
          '/*/admin/',
          '/api/',
          '/saved',
          '/saved/',
          '/*/saved',
          '/*/dashboard',
          '/dashboard',
        ],
      },
    ],
    sitemap: [
      `${domain}/sitemap.xml`,
      `${domain}/sitemap/0.xml`,
      `${domain}/sitemap/1.xml`,
    ],
  };
}
