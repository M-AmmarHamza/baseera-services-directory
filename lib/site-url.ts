/**
 * Dynamic Base URL & SEO Environment Configuration
 * Baseera Global Local Services Directory
 *
 * Requirements:
 * 1. Never hardcode the domain name anywhere in the app.
 * 2. Define the base domain in .env via NEXT_PUBLIC_SITE_URL.
 * 3. Fallbacks to Vercel production/preview domain, or localhost for dev.
 * 4. Staging protection: control search engine indexing via NEXT_PUBLIC_ALLOW_INDEXING.
 */

export function getSiteUrl(): string {
  // 1. Explicitly configured site URL in environment variables
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL;

  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // 2. Vercel deployment URL fallbacks
  if (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL.replace(/\/+$/, '')}`;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/+$/, '')}`;
  }
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL.replace(/\/+$/, '')}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, '')}`;
  }

  // 3. Fallback default staging domain
  return 'https://baseera-services-directory.vercel.app';
}

export const SITE_URL = getSiteUrl();

/**
 * Staging Indexing Protection Guard:
 * When false, explicitly blocks search engine spiders via robots.txt ("Disallow: /")
 * and outputs <meta name="robots" content="noindex, nofollow" /> on pages.
 *
 * Defaults to false (protected staging mode) so real data entered on staging
 * is not indexed by Google, preventing duplicate content penalties.
 * Set NEXT_PUBLIC_ALLOW_INDEXING=true in .env when production domain goes live.
 */
export function isIndexingAllowed(): boolean {
  return process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';
}
