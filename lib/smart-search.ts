/**
 * Smart Search Engine for Baseera Global Directory
 * 
 * Provides:
 * 1. Multi-field searching (country_name, country_code, city_name, category_name, slugs, etc.)
 * 2. Alias / Synonym mapping (smart abbreviations for countries, cities, categories)
 * 3. Typo-tolerant Fuzzy Search (Levenshtein distance, acronyms, prefix matching)
 * 4. Multi-token query parsing (e.g. "London UK", "Dubai UAE", "Karachi PK")
 * 5. Strict case-insensitivity and Unicode accent normalization
 */

import { CategoryDef } from '@/lib/db';

/**
 * Common abbreviations / aliases for countries and global regions
 */
export const COUNTRY_ALIASES: Record<string, string> = {
  // United Kingdom
  uk: 'united kingdom',
  gb: 'united kingdom',
  gbr: 'united kingdom',
  'great britain': 'united kingdom',
  england: 'united kingdom',
  scotland: 'united kingdom',
  wales: 'united kingdom',
  britain: 'united kingdom',

  // United States
  usa: 'united states',
  us: 'united states',
  america: 'united states',

  // United Arab Emirates
  uae: 'united arab emirates',
  ae: 'united arab emirates',
  emirates: 'united arab emirates',

  // Saudi Arabia
  ksa: 'saudi arabia',
  sa: 'saudi arabia',
  sau: 'saudi arabia',
  saudi: 'saudi arabia',

  // Pakistan
  pk: 'pakistan',
  pak: 'pakistan',

  // India
  in: 'india',
  ind: 'india',

  // Bangladesh
  bd: 'bangladesh',
  bgd: 'bangladesh',
  bdesh: 'bangladesh',

  // Malaysia
  my: 'malaysia',
  mys: 'malaysia',

  // Singapore
  sg: 'singapore',
  sgp: 'singapore',
  sing: 'singapore',

  // Australia
  au: 'australia',
  aus: 'australia',
  oz: 'australia',

  // Germany
  de: 'germany',
  deu: 'germany',
  deutschland: 'germany',

  // France
  fr: 'france',
  fra: 'france',

  // Italy
  it: 'italy',
  ita: 'italy',
  italia: 'italy',

  // Spain
  es: 'spain',
  esp: 'spain',
  espana: 'spain',

  // Brazil
  br: 'brazil',
  bra: 'brazil',
  brasil: 'brazil',

  // Mexico
  mx: 'mexico',
  mex: 'mexico',

  // Egypt
  eg: 'egypt',
  egy: 'egypt',
  misr: 'egypt',

  // South Africa
  za: 'south africa',
  zaf: 'south africa',
  rsa: 'south africa',

  // Nigeria
  ng: 'nigeria',
  nga: 'nigeria',

  // Kenya
  ke: 'kenya',
  ken: 'kenya',

  // Turkey
  tr: 'turkey',
  tur: 'turkey',
  turkiye: 'turkey',

  // Canada
  ca: 'canada',
  can: 'canada',

  // Qatar
  qa: 'qatar',
  qat: 'qatar',

  // Oman
  om: 'oman',
  omn: 'oman',

  // Kuwait
  kw: 'kuwait',
  kwt: 'kuwait',

  // Bahrain
  bh: 'bahrain',
  bhr: 'bahrain',

  // Philippines
  ph: 'philippines',
  phl: 'philippines',

  // Indonesia
  id: 'indonesia',
  idn: 'indonesia',
  indo: 'indonesia',

  // Netherlands
  nl: 'netherlands',
  holland: 'netherlands',

  // Switzerland
  ch: 'switzerland',
  swiss: 'switzerland',

  // Sweden
  se: 'sweden',

  // Norway
  no: 'norway',

  // Denmark
  dk: 'denmark',

  // Poland
  pl: 'poland',

  // Ireland
  ie: 'ireland',

  // Belgium
  be: 'belgium',

  // Austria
  at: 'austria',

  // Portugal
  pt: 'portugal',

  // Greece
  gr: 'greece',

  // Vietnam
  vn: 'vietnam',

  // Thailand
  th: 'thailand',

  // Japan
  jp: 'japan',

  // South Korea
  kr: 'south korea',
  korea: 'south korea',

  // New Zealand
  nz: 'new zealand',
};

/**
 * Common abbreviations / aliases for major cities
 */
export const CITY_ALIASES: Record<string, string> = {
  nyc: 'new york',
  la: 'los angeles',
  sf: 'san francisco',
  kl: 'kuala lumpur',
  dxb: 'dubai',
  shj: 'sharjah',
  auh: 'abu dhabi',
  khi: 'karachi',
  lhr: 'lahore',
  isb: 'islamabad',
  rwp: 'rawalpindi',
  fsd: 'faisalabad',
  psh: 'peshawar',
  mux: 'multan',
  hyd: 'hyderabad',
  qta: 'quetta',
  skt: 'sialkot',
  jnb: 'johannesburg',
  cpt: 'cape town',
  rio: 'rio de janeiro',
  sp: 'sao paulo',
  cdmx: 'mexico city',
};

/**
 * Common user search keywords and abbreviations mapped to canonical Category Slugs
 */
export const CATEGORY_ALIASES: Record<string, string> = {
  // AC & Cooling
  ac: 'ac-technician',
  'a/c': 'ac-technician',
  'a c': 'ac-technician',
  aircon: 'ac-technician',
  'air condition': 'ac-technician',
  'air conditioner': 'ac-technician',
  'air conditioning': 'ac-technician',
  hvac: 'ac-technician',
  cooling: 'ac-technician',
  'ac repair': 'ac-technician',
  'ac service': 'ac-technician',
  'ac technician': 'ac-technician',
  'split ac': 'ac-technician',
  chiller: 'ac-technician',
  'اے سی': 'ac-technician',
  'تكييف': 'ac-technician',

  // Electrician
  electrician: 'electrician',
  electric: 'electrician',
  electrical: 'electrician',
  electricity: 'electrician',
  electrishan: 'electrician',
  electrition: 'electrician',
  wiring: 'electrician',
  breaker: 'electrician',
  bijli: 'electrician',
  light: 'electrician',
  'short circuit': 'electrician',
  fan: 'electrician',
  'الیکٹریشن': 'electrician',
  'كهربائي': 'electrician',

  // UPS & Inverter
  ups: 'ups-inverter-technician',
  inverter: 'ups-inverter-technician',
  battery: 'ups-inverter-technician',
  'ups repair': 'ups-inverter-technician',
  'inverter technician': 'ups-inverter-technician',
  'یو پی ایس': 'ups-inverter-technician',

  // Solar
  solar: 'solar-installer',
  'solar panel': 'solar-installer',
  'solar panels': 'solar-installer',
  'solar installer': 'solar-installer',
  'solar energy': 'solar-installer',
  'net metering': 'solar-installer',
  'سولر': 'solar-installer',
  'طاقة شمسية': 'solar-installer',

  // Generator
  generator: 'generator-repair',
  generators: 'generator-repair',
  genset: 'generator-repair',
  jenny: 'generator-repair',
  'generator mechanic': 'generator-repair',
  'generator repair': 'generator-repair',
  'جنریٹر': 'generator-repair',
  'مولدات': 'generator-repair',

  // Plumber
  plumber: 'plumber',
  plumbing: 'plumber',
  plamber: 'plumber',
  pipe: 'plumber',
  piping: 'plumber',
  leak: 'plumber',
  leakage: 'plumber',
  drain: 'plumber',
  drainage: 'plumber',
  sanitary: 'plumber',
  tap: 'plumber',
  nal: 'plumber',
  sewerage: 'plumber',
  'پلمبر': 'plumber',
  'سباك': 'plumber',

  // Water Pump
  'water pump': 'water-pump-repair',
  pump: 'water-pump-repair',
  motor: 'water-pump-repair',
  'water motor': 'water-pump-repair',
  'pump mechanic': 'water-pump-repair',
  'واٹر پمپ': 'water-pump-repair',
  'مضخات': 'water-pump-repair',

  // Water Boring
  boring: 'water-boring',
  'water boring': 'water-boring',
  bore: 'water-boring',
  drill: 'water-boring',
  well: 'water-boring',
  'بورنگ': 'water-boring',

  // Water Tank Cleaning
  'water tank': 'water-tank-cleaning',
  'tank cleaning': 'water-tank-cleaning',
  'tank cleaner': 'water-tank-cleaning',
  tank: 'water-tank-cleaning',
  'ٹینکی': 'water-tank-cleaning',
  'خزانات': 'water-tank-cleaning',

  // Fridge & Freezer
  fridge: 'fridge-repair',
  freezer: 'fridge-repair',
  refrigerator: 'fridge-repair',
  'deep freezer': 'fridge-repair',
  'fridge repair': 'fridge-repair',
  'fridge mechanic': 'fridge-repair',
  'فریج': 'fridge-repair',
  'ثلاجات': 'fridge-repair',

  // Washing Machine
  'washing machine': 'washing-machine-repair',
  washer: 'washing-machine-repair',
  dryer: 'washing-machine-repair',
  laundry: 'washing-machine-repair',
  'washing machine repair': 'washing-machine-repair',
  'واشنگ مشین': 'washing-machine-repair',
  'غسالات': 'washing-machine-repair',

  // Geyser & Water Heater
  geyser: 'geyser-repair',
  heater: 'geyser-repair',
  'water heater': 'geyser-repair',
  boiler: 'geyser-repair',
  'geyser technician': 'geyser-repair',
  'geyser repair': 'geyser-repair',
  'گیزر': 'geyser-repair',
  'سخانات': 'geyser-repair',

  // Carpenter
  carpenter: 'carpenter',
  wood: 'carpenter',
  woodwork: 'carpenter',
  furniture: 'carpenter',
  door: 'carpenter',
  doors: 'carpenter',
  cupboard: 'carpenter',
  bed: 'carpenter',
  tarkhan: 'carpenter',
  'کارپینٹر': 'carpenter',
  'بڑھئی': 'carpenter',
  'نجار': 'carpenter',

  // Painter
  painter: 'painter',
  paint: 'painter',
  painting: 'painter',
  whitewash: 'painter',
  distemper: 'painter',
  polish: 'painter',
  'deco polish': 'painter',
  'پینٹر': 'painter',
  'دهان': 'painter',

  // Aluminium & Glass
  aluminium: 'aluminium-glass-worker',
  aluminum: 'aluminium-glass-worker',
  glass: 'aluminium-glass-worker',
  window: 'aluminium-glass-worker',
  windows: 'aluminium-glass-worker',
  partition: 'aluminium-glass-worker',
  'ایلومینیم': 'aluminium-glass-worker',
  'ألمنيوم': 'aluminium-glass-worker',

  // Welder
  welder: 'welder',
  welding: 'welder',
  iron: 'welder',
  steel: 'welder',
  gate: 'welder',
  grill: 'welder',
  fabrication: 'welder',
  fabricator: 'welder',
  'ویلڈر': 'welder',
  'حداد': 'welder',

  // Mason
  mason: 'mason',
  masonry: 'mason',
  tile: 'mason',
  tiles: 'mason',
  mistri: 'mason',
  marble: 'mason',
  plaster: 'mason',
  flooring: 'mason',
  'مستری': 'mason',
  'ٹائل': 'mason',
  'بناء': 'mason',

  // Pest Control
  pest: 'pest-control',
  'pest control': 'pest-control',
  fumigation: 'pest-control',
  termite: 'pest-control',
  termites: 'pest-control',
  deemak: 'pest-control',
  cockroach: 'pest-control',
  bedbugs: 'pest-control',
  spray: 'pest-control',
  'پیسٹ کنٹرول': 'pest-control',
  'مكافحة حشرات': 'pest-control',

  // Sofa & Carpet
  sofa: 'sofa-carpet-cleaning',
  carpet: 'sofa-carpet-cleaning',
  rug: 'sofa-carpet-cleaning',
  couch: 'sofa-carpet-cleaning',
  'sofa cleaning': 'sofa-carpet-cleaning',
  'carpet cleaning': 'sofa-carpet-cleaning',
  'صوفہ': 'sofa-carpet-cleaning',
  'قالین': 'sofa-carpet-cleaning',
  'كنب': 'sofa-carpet-cleaning',

  // CCTV
  cctv: 'cctv-installer',
  camera: 'cctv-installer',
  cameras: 'cctv-installer',
  'security camera': 'cctv-installer',
  'cctv installer': 'cctv-installer',
  surveillance: 'cctv-installer',
  'کیمرہ': 'cctv-installer',
  'كاميرات': 'cctv-installer',

  // Locksmith
  locksmith: 'locksmith',
  lock: 'locksmith',
  locks: 'locksmith',
  key: 'locksmith',
  keys: 'locksmith',
  chabi: 'locksmith',
  'key maker': 'locksmith',
  'چابی': 'locksmith',
  'أقفال': 'locksmith',

  // Home Chef
  chef: 'home-chef',
  cook: 'home-chef',
  food: 'home-chef',
  catering: 'home-chef',
  khana: 'home-chef',
  biryani: 'home-chef',
  tiffin: 'home-chef',
  'home chef': 'home-chef',
  'ہوم شیف': 'home-chef',
  'طاهي': 'home-chef',

  // Interior Designer
  'interior designer': 'interior-designer',
  'interior design': 'interior-designer',
  decor: 'interior-designer',
  decoration: 'interior-designer',

  // Movers & Packers
  movers: 'movers-packers',
  packers: 'movers-packers',
  shifting: 'movers-packers',
  'movers and packers': 'movers-packers',
  'movers & packers': 'movers-packers',
};

/**
 * Normalizes text: converts to lower case, removes diacritics/accents, and trims whitespace.
 */
export function normalizeString(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Calculates standard Levenshtein edit distance with O(min(N,M)) space complexity.
 */
export function levenshteinDistance(s1: string, s2: string): number {
  if (s1 === s2) return 0;
  if (!s1.length) return s2.length;
  if (!s2.length) return s1.length;

  const a = s1.length < s2.length ? s1 : s2;
  const b = s1.length < s2.length ? s2 : s1;

  const prevRow: number[] = new Array(a.length + 1);
  for (let j = 0; j <= a.length; j++) prevRow[j] = j;

  for (let i = 1; i <= b.length; i++) {
    let prevDiag = prevRow[0];
    prevRow[0] = i;
    for (let j = 1; j <= a.length; j++) {
      const temp = prevRow[j];
      if (b[i - 1] === a[j - 1]) {
        prevRow[j] = prevDiag;
      } else {
        prevRow[j] = 1 + Math.min(prevDiag, prevRow[j], prevRow[j - 1]);
      }
      prevDiag = temp;
    }
  }

  return prevRow[a.length];
}

/**
 * Checks if query fuzzy matches target string.
 * Supports:
 * - Substring matching
 * - Acronym expansion (e.g. UAE from United Arab Emirates, UK from United Kingdom)
 * - Word prefix matching
 * - Levenshtein typo tolerance (1 typo for 4-6 chars, 2 typos for 7+ chars)
 */
export function isFuzzyMatch(rawQuery: string, rawTarget: string): boolean {
  if (!rawQuery || !rawTarget) return false;

  const q = normalizeString(rawQuery);
  const target = normalizeString(rawTarget);

  if (!q || !target) return false;

  // 1. Direct equality or substring
  if (target === q || target.includes(q)) return true;

  // 2. Acronym check (e.g., United Arab Emirates -> uae, United Kingdom -> uk)
  const targetWords = target.split(/[\s-]+/).filter(Boolean);
  const acronym = targetWords.map((w) => w[0]).join('');
  if (acronym && (acronym === q || acronym.includes(q))) return true;

  // 3. Word-prefix check (e.g. "tech" matches "technician")
  for (const word of targetWords) {
    if (word.startsWith(q)) return true;
  }

  // 4. Typo tolerance:
  // Short queries (<= 3 chars, e.g. "uk", "ac", "us", "de") must NOT fuzzy-match unrelated short strings
  if (q.length <= 3) {
    return false;
  }

  const maxAllowedDist = q.length >= 7 ? 2 : 1;

  // Check full string distance
  if (levenshteinDistance(q, target) <= maxAllowedDist) return true;

  // Check individual target words distance
  for (const word of targetWords) {
    if (word.length >= 4) {
      const wordMaxDist = Math.min(maxAllowedDist, word.length >= 7 ? 2 : 1);
      if (levenshteinDistance(q, word) <= wordMaxDist) return true;
    }
  }

  return false;
}

/**
 * Resolves a query through the country/city alias dictionaries.
 * Returns an array of search candidates to check.
 */
export function expandLocationQuery(query: string): string[] {
  const q = normalizeString(query);
  if (!q) return [];

  const candidates = new Set<string>([q]);

  // Check country abbreviations
  if (COUNTRY_ALIASES[q]) {
    candidates.add(COUNTRY_ALIASES[q]);
  }

  // Check city abbreviations
  if (CITY_ALIASES[q]) {
    candidates.add(CITY_ALIASES[q]);
  }

  // Also check if any word inside multi-word query is an alias
  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    const expandedTokens = tokens.map((token) => COUNTRY_ALIASES[token] || CITY_ALIASES[token] || token);
    candidates.add(expandedTokens.join(' '));
  }

  return Array.from(candidates);
}

export interface SmartLocationCity {
  id?: string | number;
  slug: string;
  name: string;
  countryCode: string;
}

export interface SmartLocationCountry {
  id?: string | number;
  code: string;
  name: string;
  flag: string;
  region?: string;
  cities: SmartLocationCity[];
}

/**
 * Smart search filter for location hierarchies (Countries and Cities).
 * Performs multi-field search against:
 * - country_name
 * - country_code (and mapped aliases e.g. 'uk' -> 'gb')
 * - localized country name
 * - city_name
 * - city_slug
 * - localized city name
 * - city aliases (e.g. 'dxb', 'nyc', 'khi')
 * - typo-tolerant fuzzy matching
 * - multi-token matching (e.g. 'london uk', 'dubai uae')
 */
export function filterLocationsSmart<T extends SmartLocationCountry>(
  locations: T[],
  rawQuery: string,
  getLocCountryName?: (code: string) => string,
  getLocCityName?: (slug: string) => string
): T[] {
  const trimmed = rawQuery.trim();
  if (!trimmed) return locations;

  const normalizedQuery = normalizeString(trimmed);
  const queryCandidates = expandLocationQuery(trimmed);
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

  return locations
    .map((country) => {
      const countryCode = country.code.toLowerCase();
      const countryName = country.name;
      const locCountryName = getLocCountryName ? getLocCountryName(country.code) : '';

      // Check if country matches any query candidate
      const countryMatches = queryCandidates.some((candidate) => {
        // Direct country code match (e.g. "gb", "pk", "ae")
        if (countryCode === candidate) return true;
        // Known mapping where UK is 'gb'
        if (candidate === 'uk' && (countryCode === 'gb' || countryCode === 'uk')) return true;
        if (candidate === 'uae' && countryCode === 'ae') return true;
        if (candidate === 'usa' && countryCode === 'us') return true;
        if (candidate === 'ksa' && countryCode === 'sa') return true;

        // Name match
        if (isFuzzyMatch(candidate, countryName)) return true;
        if (locCountryName && isFuzzyMatch(candidate, locCountryName)) return true;

        return false;
      });

      // Filter cities
      const matchingCities = country.cities.filter((city) => {
        const cityName = city.name;
        const citySlug = city.slug;
        const locCityName = getLocCityName ? getLocCityName(city.slug) : '';

        // 1. Direct candidate matching
        const directCityMatch = queryCandidates.some((candidate) => {
          if (isFuzzyMatch(candidate, cityName)) return true;
          if (isFuzzyMatch(candidate, citySlug)) return true;
          if (locCityName && isFuzzyMatch(candidate, locCityName)) return true;
          return false;
        });

        if (directCityMatch) return true;

        // 2. Multi-token matching (e.g. "london uk", "dubai uae")
        // If user typed multi-tokens, check if all tokens match across the (city + country) combined
        if (tokens.length > 1) {
          const combinedTarget = `${cityName} ${citySlug} ${locCityName} ${countryName} ${countryCode} ${locCountryName}`.toLowerCase();
          const allTokensMatch = tokens.every((token) => {
            const expandedToken = COUNTRY_ALIASES[token] || CITY_ALIASES[token] || token;
            return combinedTarget.includes(token) || combinedTarget.includes(expandedToken);
          });
          if (allTokensMatch) return true;
        }

        return false;
      });

      // If specific cities matched, return them.
      // If the country itself matched (e.g., user typed "UK" or "UAE"), display all cities of this country!
      const citiesToDisplay =
        matchingCities.length > 0
          ? matchingCities
          : countryMatches
          ? country.cities
          : [];

      if (citiesToDisplay.length === 0) return null;

      return {
        ...country,
        cities: citiesToDisplay,
      };
    })
    .filter((country): country is T => country !== null && country.cities.length > 0);
}

/**
 * Smart search for Categories.
 * Matches against:
 * - Category slug
 * - Category aliases
 * - Category Name (English, Urdu, Arabic)
 * - Category Group
 * - Global synonym map (e.g., "AC" -> "ac-technician", "fridge" -> "fridge-repair", etc.)
 * - Typo-tolerant fuzzy search
 */
export function smartMatchCategory(
  rawQuery: string,
  category: CategoryDef,
  lang = 'en'
): { matches: boolean; score: number } {
  const q = normalizeString(rawQuery);
  if (!q) return { matches: false, score: 0 };

  const slug = category.slug.toLowerCase();
  const name = category.name.toLowerCase();
  const nameUr = (category.nameUr || '').toLowerCase();
  const nameAr = (category.nameAr || '').toLowerCase();
  const group = category.group.toLowerCase();
  const aliases = (category.aliases || []).map((a) => a.toLowerCase());

  // Check alias map expansion
  const mappedSlug = CATEGORY_ALIASES[q];
  if (mappedSlug && (mappedSlug === slug || aliases.includes(mappedSlug))) {
    return { matches: true, score: 100 }; // Top score for exact alias match
  }

  // 1. Exact match on slug or aliases
  if (slug === q || aliases.includes(q)) {
    return { matches: true, score: 95 };
  }

  // 2. Exact match on localized or English name
  if (name === q || nameUr === q || nameAr === q) {
    return { matches: true, score: 90 };
  }

  // 3. Name or alias starts with query
  if (name.startsWith(q) || aliases.some((a) => a.startsWith(q))) {
    return { matches: true, score: 85 };
  }

  // 4. Substring match
  if (name.includes(q) || slug.includes(q) || aliases.some((a) => a.includes(q))) {
    return { matches: true, score: 75 };
  }

  if (nameUr.includes(q) || nameAr.includes(q)) {
    return { matches: true, score: 75 };
  }

  // 5. Group match
  if (group.includes(q)) {
    return { matches: true, score: 60 };
  }

  // 6. Typo-tolerant fuzzy match on name or aliases
  if (isFuzzyMatch(q, name)) {
    return { matches: true, score: 55 };
  }

  for (const alias of aliases) {
    if (isFuzzyMatch(q, alias)) {
      return { matches: true, score: 50 };
    }
  }

  return { matches: false, score: 0 };
}

/**
 * Searches categories and returns ranked results by relevance score.
 */
export function searchCategoriesSmart(
  rawQuery: string,
  categories: CategoryDef[],
  lang = 'en',
  limit = 8
): CategoryDef[] {
  const trimmed = rawQuery.trim();
  if (!trimmed) return categories.slice(0, limit);

  const scored = categories
    .map((cat) => ({
      cat,
      ...smartMatchCategory(trimmed, cat, lang),
    }))
    .filter((item) => item.matches)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.cat);
}

/**
 * Returns the single best matching category for a query, or null if no strong match.
 */
export function findBestCategoryMatch(
  rawQuery: string,
  categories: CategoryDef[],
  lang = 'en'
): CategoryDef | null {
  const results = searchCategoriesSmart(rawQuery, categories, lang, 1);
  return results.length > 0 ? results[0] : null;
}
