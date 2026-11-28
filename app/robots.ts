import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  const domain = getSiteUrl();

  // NEVER block root with Disallow: /
  // Even on staging, crawlers must be allowed to fetch HTML to cleanly read <meta name="robots" content="noindex, nofollow">
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/super-admin/',
          '/super-admin',
          '/*/super-admin/',
          '/*/super-admin',
          '/admin/',
          '/admin',
          '/*/admin/',
          '/*/admin',
          '/dashboard/',
          '/dashboard',
          '/*/dashboard/',
          '/*/dashboard',
          '/api/',
        ],
      },
    ],
    sitemap: `${domain}/sitemap.xml`,
  };
}
