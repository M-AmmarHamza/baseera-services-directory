// Centralized Category Cover Banners and Avatar Fallback Helpers
// Provides SEO-optimized, category-themed cover photos and branded initials avatars

export const CATEGORY_COVER_BANNERS: Record<string, string> = {
  // Electrical & Power
  electrician: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
  'ups-inverter-technician': 'https://images.unsplash.com/photo-1558441719-8b449c6ff673?auto=format&fit=crop&w=1200&q=80',
  'solar-installer': 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
  'generator-repair': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',

  // Water & Plumbing
  plumber: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
  'water-pump-repair': 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=1200&q=80',
  'water-boring': 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?auto=format&fit=crop&w=1200&q=80',
  'water-tank-cleaning': 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1200&q=80',

  // Cooling & Home Appliances
  'ac-technician': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80',
  'refrigerator-repair': 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=1200&q=80',
  'washing-machine-repair': 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1200&q=80',
  'geyser-repair': 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=1200&q=80',

  // Maintenance & Construction
  carpenter: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
  painter: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80',
  'aluminium-glass-worker': 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
  welder: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
  mason: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1200&q=80',
  'interior-designer': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',

  // Cleaning & Security
  'pest-control': 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=1200&q=80',
  'sofa-carpet-cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
  'cctv-installer': 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80',
  'home-chef': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80',
};

const DEFAULT_GLOBAL_BANNER =
  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80';

/**
 * Returns a high-definition, category-tailored cover banner URL.
 */
export function getCategoryCoverBanner(categorySlug?: string): string {
  if (!categorySlug) return DEFAULT_GLOBAL_BANNER;
  const key = categorySlug.toLowerCase().trim();
  return CATEGORY_COVER_BANNERS[key] || DEFAULT_GLOBAL_BANNER;
}

/**
 * Returns the provider's cover banner URL, falling back to their category banner.
 */
export function getProviderCoverUrl(provider: { cover_url?: string; category_id?: string }): string {
  if (provider.cover_url && provider.cover_url.trim().length > 0) {
    return provider.cover_url.trim();
  }
  return getCategoryCoverBanner(provider.category_id);
}

/**
 * Returns a personalized, branded SVG initials avatar (0ms load, 0KB payload, emerald theme).
 */
export function getDefaultAvatarUrl(name?: string): string {
  const safeName = (name || 'Baseera Specialist').trim();
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(safeName)}&backgroundColor=006948,059669,047857,0f766e&textColor=ffffff`;
}

/**
 * Returns the provider's avatar URL, falling back to a branded initials avatar.
 */
export function getProviderAvatarUrl(provider: { avatar_url?: string; profile_picture?: string; name: string }): string {
  if (provider.profile_picture && provider.profile_picture.trim().length > 0) {
    return provider.profile_picture.trim();
  }
  if (provider.avatar_url && provider.avatar_url.trim().length > 0) {
    return provider.avatar_url.trim();
  }
  return getDefaultAvatarUrl(provider.name);
}
