import { MetadataRoute } from 'next';

const DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://baseera-services-directory.vercel.app';

export default function robots(): MetadataRoute.Robots {
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
      `${DOMAIN}/sitemap.xml`,
      `${DOMAIN}/sitemap/0.xml`,
      `${DOMAIN}/sitemap/1.xml`,
    ],
  };
}
