import { getCategories, CategoryItem } from '@/lib/taxonomy-db';
import { CATEGORIES as SEED_CATEGORIES } from '@/lib/db';
import { getResolvedCategoryName } from '@/lib/routing/resolve-entities';

export interface RelatedCategoryLink {
  id: string;
  slug: string;
  localizedSlug: string;
  name: string;
  icon: string;
  group: string;
}

// Canonical category aliases
const CANONICAL_ALIASES: Record<string, string> = {
  cctv: 'cctv-installer',
  'cctv-camera': 'cctv-installer',
  'cctv-camera-mistri': 'cctv-installer',
  'bijli-mistri': 'electrician',
  'ups-inverter-mistri': 'ups-inverter-technician',
  'solar-panel-mistri': 'solar-installer',
  'generator-mistri': 'generator-repair',
  'plumber-mistri': 'plumber',
  'water-pump-mistri': 'water-pump-repair',
  'water-boring-mistri': 'water-boring',
  'water-tank-safai': 'water-tank-cleaning',
  'ac-repair-mistri': 'ac-technician',
  'fridge-repair-mistri': 'fridge-repair',
  'washing-machine-mistri': 'washing-machine-repair',
  'geyser-repair-mistri': 'geyser-repair',
  'carpenter-barhai': 'carpenter',
  'raj-mistri': 'mason',
  'rang-paint-mistri': 'painter',
  'aluminum-glass-mistri': 'aluminium-glass-worker',
  'welding-mistri': 'welder',
  'fumigation-spray': 'pest-control',
  'sofa-carpet-safai': 'sofa-carpet-cleaning',
  'tala-chaabi-maker': 'locksmith',
  'bawarchi-catering': 'home-chef',
  'interior-decorator': 'interior-designer',
  'movers-packers-shifting': 'movers-packers',
  'gari-car-mistri': 'car-mechanic',
};

// Semantically clustered service mappings (customer intent groups)
const TOPICAL_CLUSTERS: Record<string, string[]> = {
  // Electrical & Power
  electrician: ['ups-inverter-technician', 'solar-installer', 'generator-repair', 'cctv-installer'],
  'ups-inverter-technician': ['electrician', 'solar-installer', 'generator-repair', 'battery-repair'],
  'solar-installer': ['electrician', 'ups-inverter-technician', 'generator-repair', 'cctv-installer'],
  'generator-repair': ['electrician', 'ups-inverter-technician', 'solar-installer', 'car-mechanic'],

  // Plumbing & Water
  plumber: ['water-pump-repair', 'water-boring', 'water-tank-cleaning', 'geyser-repair'],
  'water-pump-repair': ['plumber', 'water-boring', 'water-tank-cleaning', 'electrician'],
  'water-boring': ['plumber', 'water-pump-repair', 'water-tank-cleaning', 'mason'],
  'water-tank-cleaning': ['plumber', 'water-pump-repair', 'pest-control', 'sofa-carpet-cleaning'],

  // Cooling & Appliances
  'ac-technician': ['fridge-repair', 'washing-machine-repair', 'geyser-repair', 'electrician'],
  'fridge-repair': ['ac-technician', 'washing-machine-repair', 'geyser-repair', 'electrician'],
  'washing-machine-repair': ['ac-technician', 'fridge-repair', 'plumber', 'electrician'],
  'geyser-repair': ['plumber', 'ac-technician', 'electrician', 'washing-machine-repair'],

  // Home & Construction
  mason: ['carpenter', 'painter', 'welder', 'aluminium-glass-worker', 'pest-control'],
  carpenter: ['mason', 'painter', 'aluminium-glass-worker', 'locksmith', 'interior-designer'],
  painter: ['mason', 'carpenter', 'sofa-carpet-cleaning', 'interior-designer', 'aluminium-glass-worker'],
  welder: ['aluminium-glass-worker', 'mason', 'carpenter', 'generator-repair'],
  'aluminium-glass-worker': ['carpenter', 'welder', 'mason', 'interior-designer'],
  'pest-control': ['water-tank-cleaning', 'sofa-carpet-cleaning', 'painter', 'mason'],

  // Cleaning & Security
  'cctv-installer': ['electrician', 'ups-inverter-technician', 'solar-installer', 'locksmith'],
  'sofa-carpet-cleaning': ['pest-control', 'water-tank-cleaning', 'painter', 'deep-cleaning-services'],
  locksmith: ['carpenter', 'cctv-installer', 'aluminium-glass-worker', 'welder'],

  // Lifestyle & Specialist Services
  'home-chef': ['sofa-carpet-cleaning', 'movers-packers', 'deep-cleaning-services', 'pest-control'],
  'interior-designer': ['painter', 'carpenter', 'aluminium-glass-worker', 'mason'],
  'movers-packers': ['carpenter', 'ac-technician', 'electrician', 'painter'],
  'car-mechanic': ['generator-repair', 'electrician', 'welder', 'ac-technician'],
};

// Fallback high-intent core categories
const DEFAULT_FALLBACK_CLUSTER = [
  'electrician',
  'plumber',
  'ac-technician',
  'solar-installer',
  'carpenter',
  'painter',
];

/**
 * Returns 4–6 semantically related active categories for a given category.
 * Guarantees:
 * 1. Only active categories existing in database/runtime taxonomy are returned.
 * 2. Current category is strictly excluded.
 * 3. Localized slug is provided (slug_ur for Urdu, slug_en for English/Arabic).
 * 4. Zero fabricated or broken links.
 */
export async function getRelatedCategories(
  currentCategorySlugOrId: string,
  lang: string = 'en'
): Promise<RelatedCategoryLink[]> {
  if (!currentCategorySlugOrId) return [];

  const norm = currentCategorySlugOrId.toLowerCase().trim();
  const canonicalId = CANONICAL_ALIASES[norm] || norm;

  // 1. Fetch all active categories from taxonomy DB or fallback to seed
  let activeCategories: CategoryItem[] = [];
  try {
    activeCategories = await getCategories({ activeOnly: true });
  } catch (err) {
    console.warn('getRelatedCategories taxonomy fetch note:', err);
  }

  if (!activeCategories || activeCategories.length === 0) {
    activeCategories = SEED_CATEGORIES.map((c) => ({
      id: c.id,
      name_en: c.name,
      name_ur: c.nameUr || c.name,
      slug_en: c.slug,
      slug_ur: `${c.slug}-mistri`,
      icon: c.icon,
      sortOrder: 1,
      isActive: true,
      group: c.group,
    }));
  }

  const activeMap = new Map<string, CategoryItem>();
  for (const cat of activeCategories) {
    activeMap.set(cat.id.toLowerCase(), cat);
    if (cat.slug_en) activeMap.set(cat.slug_en.toLowerCase(), cat);
  }

  // 2. Identify candidate related category IDs
  const clusterIds = TOPICAL_CLUSTERS[canonicalId] || DEFAULT_FALLBACK_CLUSTER;

  // 3. Filter candidate categories: must be active, must NOT be current category
  const results: RelatedCategoryLink[] = [];
  const seenIds = new Set<string>();

  for (const targetId of clusterIds) {
    const normTarget = CANONICAL_ALIASES[targetId.toLowerCase()] || targetId.toLowerCase();
    if (normTarget === canonicalId || seenIds.has(normTarget)) continue;

    const matchedCat = activeMap.get(normTarget);
    if (!matchedCat || !matchedCat.isActive) continue;

    seenIds.add(normTarget);

    const localizedSlug =
      lang === 'ur' && matchedCat.slug_ur
        ? matchedCat.slug_ur
        : matchedCat.slug_en || matchedCat.id;

    results.push({
      id: matchedCat.id,
      slug: matchedCat.slug_en || matchedCat.id,
      localizedSlug,
      name: getResolvedCategoryName(matchedCat, lang),
      icon: matchedCat.icon || 'Wrench',
      group: matchedCat.group || 'Trade Services',
    });

    if (results.length >= 6) break;
  }

  // If cluster yielded fewer than 4, backfill from general active categories
  if (results.length < 4) {
    for (const cat of activeCategories) {
      if (cat.id.toLowerCase() === canonicalId || seenIds.has(cat.id.toLowerCase())) continue;
      if (!cat.isActive) continue;

      seenIds.add(cat.id.toLowerCase());

      const localizedSlug =
        lang === 'ur' && cat.slug_ur
          ? cat.slug_ur
          : cat.slug_en || cat.id;

      results.push({
        id: cat.id,
        slug: cat.slug_en || cat.id,
        localizedSlug,
        name: getResolvedCategoryName(cat, lang),
        icon: cat.icon || 'Wrench',
        group: cat.group || 'Trade Services',
      });

      if (results.length >= 5) break;
    }
  }

  return results;
}
