import { Provider, getProviders, CATEGORIES, getCategoryBySlug } from './db';
import { findBestCategoryMatch } from './smart-search';

export interface SearchAnalysis {
  originalQuery: string;
  detectedCategoryId: string | null;
  detectedCategoryName: string | null;
  detectedArea: string | null;
  exactMatches: Provider[];
  nearbyCityMatches: Provider[];
}

const CATEGORY_KEYWORDS: Record<string, string> = {
  // Plumbing
  plumber: 'plumbing',
  plumbing: 'plumbing',
  plamber: 'plumbing',
  pipe: 'plumbing',
  piping: 'plumbing',
  sanitary: 'plumbing',
  boring: 'plumbing',
  drainage: 'plumbing',
  leakage: 'plumbing',
  sewerage: 'plumbing',
  geyser: 'plumbing',
  'water motor': 'plumbing',
  nal: 'plumbing',
  'پلمبر': 'plumbing',

  // Electrician
  electrician: 'electrician',
  electric: 'electrician',
  electricity: 'electrician',
  alectrician: 'electrician',
  alactrician: 'electrician',
  electrition: 'electrician',
  wiring: 'electrician',
  breaker: 'electrician',
  short: 'electrician',
  'short circuit': 'electrician',
  ups: 'electrician',
  bijli: 'electrician',
  'الیکٹریشن': 'electrician',

  // AC & Refrigeration
  ac: 'ac',
  'air conditioner': 'ac',
  airconditioner: 'ac',
  inverter: 'ac',
  cooling: 'ac',
  refrigeration: 'ac',
  refrigerator: 'ac',
  fridge: 'ac',
  chiller: 'ac',
  hvac: 'ac',
  'اے سی': 'ac',

  // Generator
  generator: 'generator',
  generators: 'generator',
  jenny: 'generator',
  genset: 'generator',

  // Solar
  solar: 'solar',
  soler: 'solar',
  'solar panel': 'solar',
  'net metering': 'solar',

  // Food & Chefs
  food: 'food',
  chef: 'food',
  cook: 'food',
  biryani: 'food',
  tiffin: 'food',
  daawat: 'food',
  catering: 'food',
  khana: 'food',
  'کھانا': 'food',

  // CCTV
  cctv: 'cctv',
  camera: 'cctv',
  security: 'cctv',
  surveillance: 'cctv',

  // RO Water
  ro: 'ro-water',
  water: 'ro-water',
  filter: 'ro-water',
  'ro plant': 'ro-water',
};

const AREA_KEYWORDS: Record<string, string> = {
  // Karachi Areas
  orangi: 'Orangi Town',
  'orangi town': 'Orangi Town',
  banaras: 'Orangi Town',
  qasba: 'Orangi Town',
  baldia: 'Baldia Town',
  'baldia town': 'Baldia Town',
  dha: 'DHA',
  defence: 'DHA',
  clifton: 'Clifton',
  zamzama: 'Clifton',
  'bath island': 'Clifton',
  gulshan: 'Gulshan-e-Iqbal',
  'gulshan-e-iqbal': 'Gulshan-e-Iqbal',
  jauhar: 'Gulistan-e-Jauhar',
  'gulistan-e-jauhar': 'Gulistan-e-Jauhar',
  pechs: 'PECHS',
  'tariq road': 'PECHS',
  bahadurabad: 'PECHS',
  nazimabad: 'Nazimabad',
  'north nazimabad': 'North Nazimabad',
  'f.b area': 'Federal B Area',
  'fb area': 'Federal B Area',
  'federal b area': 'Federal B Area',
  malir: 'Malir',
  korangi: 'Korangi',
  landhi: 'Landhi',
  saddar: 'Saddar',
  'site': 'SITE Area',
  'site area': 'SITE Area',

  // UAE Areas
  deira: 'Deira',
  'business bay': 'Business Bay',
  downtown: 'Downtown Dubai',
  jumeirah: 'Jumeirah',
  marina: 'Dubai Marina',
};

export function parseSearchQuery(query: string) {
  const clean = query.toLowerCase().trim();
  const normalized = clean.replace(/[^\w\s-]/g, ' ');

  let detectedCategoryId: string | null = null;
  let detectedArea: string | null = null;

  // 1. Detect Category Keyword (Smart Search engine with alias mapping & fuzzy matching)
  const smartCat = findBestCategoryMatch(clean, CATEGORIES);
  if (smartCat) {
    detectedCategoryId = smartCat.slug;
  } else {
    for (const [kw, catId] of Object.entries(CATEGORY_KEYWORDS)) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(normalized)) {
        detectedCategoryId = catId;
        break;
      }
    }
  }

  // 2. Detect Area Keyword
  for (const [kw, areaName] of Object.entries(AREA_KEYWORDS)) {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    if (regex.test(normalized)) {
      detectedArea = areaName;
      break;
    }
  }

  const categoryObj = detectedCategoryId ? getCategoryBySlug(detectedCategoryId) : null;

  return {
    detectedCategoryId,
    detectedCategoryName: categoryObj ? categoryObj.name : null,
    detectedArea,
  };
}

export async function searchProviders(citySlug: string, rawQuery: string): Promise<SearchAnalysis> {
  const query = (rawQuery || '').trim();
  const allProvidersInCity = await getProviders(citySlug);

  if (!query) {
    return {
      originalQuery: '',
      detectedCategoryId: null,
      detectedCategoryName: null,
      detectedArea: null,
      exactMatches: allProvidersInCity,
      nearbyCityMatches: [],
    };
  }

  const { detectedCategoryId, detectedCategoryName, detectedArea } = parseSearchQuery(query);
  const searchTokens = query.toLowerCase().split(/\s+/).filter((t) => !['in', 'at', 'near', 'wali', 'wala', 'me', 'mein', 'ka', 'ki', 'ke', 'the'].includes(t));

  // Filter 1: If category detected, strictly restrict to this category!
  const categoryScopedProviders = detectedCategoryId
    ? allProvidersInCity.filter((p) => p.category_id.toLowerCase() === detectedCategoryId.toLowerCase() || p.slug.includes(detectedCategoryId))
    : allProvidersInCity;

  // Filter 2: Area and Keyword matching
  let exactMatches: Provider[] = [];

  if (detectedArea) {
    const targetAreaLower = detectedArea.toLowerCase();
    exactMatches = categoryScopedProviders.filter((p) => {
      const districtMatch = p.district.toLowerCase().includes(targetAreaLower);
      const serviceAreaMatch = p.service_area.some((a) => a.toLowerCase().includes(targetAreaLower));
      return districtMatch || serviceAreaMatch;
    });
  } else {
    // General token match on name, trade_title, district, service_area, and short_bio
    exactMatches = categoryScopedProviders.filter((p) => {
      const fullText = `${p.name} ${p.trade_title} ${p.district} ${p.service_area.join(' ')} ${p.short_bio}`.toLowerCase();
      return searchTokens.some((t) => fullText.includes(t));
    });
  }

  // If no exact matches in this area, but category is known, provide nearby city specialists
  let nearbyCityMatches: Provider[] = [];
  if (exactMatches.length === 0 && detectedCategoryId) {
    nearbyCityMatches = categoryScopedProviders;
  }

  return {
    originalQuery: query,
    detectedCategoryId,
    detectedCategoryName,
    detectedArea,
    exactMatches,
    nearbyCityMatches,
  };
}
