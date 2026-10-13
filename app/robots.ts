import { MetadataRoute } from 'next';

const DOMAIN = 'https://baseera-services-directory.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: `${DOMAIN}/sitemap.xml`,
  };
}
