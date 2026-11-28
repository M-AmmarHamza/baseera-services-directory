import { createClient } from '@supabase/supabase-js';
import { CATEGORIES as SEED_CATEGORIES, CITIES as SEED_CITIES, COUNTRIES as SEED_COUNTRIES, CITY_DISTRICTS, CITY_NAMES_AR } from './db';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// =========================================================================
// TYPES & INTERFACES
// =========================================================================

export interface CategoryItem {
  id: string;
  name_en: string;
  name_ur: string;
  name_ar?: string;
  slug_en: string;
  slug_ur: string;
  slug_ar?: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
  activeCount?: number;
  group?: string;
}

export interface CountryItem {
  id: string | number;
  name_en: string;
  name_ur: string;
  slug: string;
  code: string;
  currency: string;
  premiumPrice: number;
  isActive: boolean;
  flag?: string;
  region?: string;
}

export interface CityItem {
  id: string | number;
  countryCode: string;
  name_en: string;
  name_ur: string;
  name_ar?: string;
  slug: string;
  targetAreas: string[];
  isActive: boolean;
}

export interface FaqItemRecord {
  id: string;
  scope: 'GLOBAL' | 'CATEGORY';
  categoryId?: string | null;
  question_en: string;
  answer_en: string;
  question_ur?: string | null;
  answer_ur?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Roman Urdu slug mapper for 24+ categories
const ROMAN_URDU_SLUGS: Record<string, string> = {
  electrician: 'bijli-mistri',
  'ups-inverter-technician': 'ups-inverter-mistri',
  'solar-installer': 'solar-panel-mistri',
  'generator-repair': 'generator-mistri',
  plumber: 'plumber-mistri',
  'water-pump-repair': 'water-pump-mistri',
  'water-boring': 'water-boring-mistri',
  'water-tank-cleaning': 'water-tank-safai',
  'ac-technician': 'ac-repair-mistri',
  'refrigerator-technician': 'fridge-repair-mistri',
  'fridge-repair': 'fridge-repair-mistri',
  'washing-machine-technician': 'washing-machine-mistri',
  'washing-machine-repair': 'washing-machine-mistri',
  'geyser-technician': 'geyser-repair-mistri',
  'geyser-repair': 'geyser-repair-mistri',
  carpenter: 'carpenter-barhai',
  mason: 'raj-mistri',
  painter: 'rang-paint-mistri',
  'aluminum-glass-fabricator': 'aluminum-glass-mistri',
  'aluminium-glass-worker': 'aluminum-glass-mistri',
  welder: 'welding-mistri',
  'false-ceiling-specialist': 'false-ceiling-mistri',
  'deep-cleaning-services': 'deep-cleaning-safai',
  'pest-control': 'fumigation-spray',
  'pest-control-fumigation': 'fumigation-spray',
  'sofa-carpet-cleaning': 'sofa-carpet-safai',
  'cctv-installer': 'cctv-camera-mistri',
  locksmith: 'tala-chaabi-maker',
  'home-chef': 'bawarchi-catering',
  'home-chef-catering': 'bawarchi-catering',
  'interior-designer': 'interior-decorator',
  'movers-packers': 'movers-packers-shifting',
  'tile-flooring-specialist': 'tile-marble-mistri',
  'car-mechanic': 'gari-car-mistri',
};

// Initial in-memory categories state populated from SEED_CATEGORIES
export const localCategories: CategoryItem[] = SEED_CATEGORIES.map((c, index) => ({
  id: c.id,
  name_en: c.name,
  name_ur: c.nameUr || c.name,
  name_ar: c.nameAr || c.name,
  slug_en: c.slug,
  slug_ur: ROMAN_URDU_SLUGS[c.id] || `${c.slug}-mistri`,
  slug_ar: c.slug,
  icon: c.icon || 'Wrench',
  sortOrder: index + 1,
  isActive: true,
  activeCount: c.count || 25,
  group: c.group || 'Home Maintenance',
}));

// Initial in-memory countries state
export const localCountries: CountryItem[] = SEED_COUNTRIES.map((c, idx) => ({
  id: idx + 1,
  name_en: c.name,
  name_ur: c.code === 'pk' ? 'پاکستان' : c.code === 'ae' ? 'متحدہ عرب امارات' : c.code === 'sa' ? 'سعودی عرب' : c.name,
  slug: c.code,
  code: c.code.toLowerCase(),
  currency: c.code === 'pk' ? 'PKR' : c.code === 'ae' ? 'AED' : c.code === 'sa' ? 'SAR' : c.code === 'us' ? 'USD' : 'EUR',
  premiumPrice: c.code === 'pk' ? 2500 : c.code === 'ae' ? 99 : c.code === 'sa' ? 99 : 29,
  isActive: true,
  flag: c.flag,
  region: c.region,
}));

// Initial in-memory cities state with targetAreas from CITY_DISTRICTS
export const localCities: CityItem[] = SEED_CITIES.map((c, idx) => ({
  id: idx + 1,
  countryCode: c.countryCode.toLowerCase(),
  name_en: c.name,
  name_ur: c.slug === 'karachi' ? 'کراچی' : c.slug === 'lahore' ? 'لاہور' : c.slug === 'islamabad' ? 'اسلام آباد' : c.name,
  name_ar: CITY_NAMES_AR[c.slug.toLowerCase()] || c.name,
  slug: c.slug,
  targetAreas: CITY_DISTRICTS[c.slug.toLowerCase()] || ['City Center', 'Saddar', 'Model Town', 'Industrial Zone'],
  isActive: true,
}));

// Initial Bilingual Seed FAQs (Global & Category Scopes)
export const localFaqs: FaqItemRecord[] = [
  // Global FAQs
  {
    id: 'faq-global-1',
    scope: 'GLOBAL',
    categoryId: null,
    question_en: 'What is Baseera and how does the directory work?',
    answer_en: 'Baseera is a 100% zero-commission local service discovery directory. We connect homeowners and businesses directly with verified local tradespeople, technicians, and artisans across Pakistan and the Middle East without middlemen or booking fees.',
    question_ur: 'بصیرہ کیا ہے اور یہ پلیٹ فارم کس طرح کام کرتا ہے؟',
    answer_ur: 'بصیرہ 100% زیرو کمیشن اوپن لوکل سروس ڈائریکٹری ہے۔ ہم صارفین کو بغیر کسی مڈل مین یا بکنگ فیس کے تصدیق شدہ کاریگروں سے براہِ راست جوڑتے ہیں۔',
    sortOrder: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'faq-global-2',
    scope: 'GLOBAL',
    categoryId: null,
    question_en: 'Do I pay Baseera or pay the service specialist directly?',
    answer_en: 'You pay the specialist directly upon satisfactory completion of work. Baseera never handles payments, deposits, or takes commission cuts from either customer or specialist.',
    question_ur: 'کیا رقم بصیرہ کو ادا کرنی ہوگی یا براہِ راست کاریگر کو؟',
    answer_ur: 'آپ کام کی تسلی بخش تکمیل پر تمام رقم براہِ راست کاریگر کو ادا کرتے ہیں۔ بصیرہ کوئی کمیشن یا بکنگ فیس وصول نہیں کرتی۔',
    sortOrder: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'faq-global-3',
    scope: 'GLOBAL',
    categoryId: null,
    question_en: 'How can service providers list their profile on Baseera?',
    answer_en: 'Qualified specialists can tap "List Your Service" on the homepage to register. After quick WhatsApp and identity verification, profiles are indexed in search and regional sitemaps.',
    question_ur: 'کاریگر بصیرہ پر اپنا پروفائل کیسے درج کروا سکتے ہیں؟',
    answer_ur: 'کاریگر ہوم پیج پر "سروس درج کریں" پر کلک کر کے فارم بھر سکتے ہیں۔ تصدیق کے بعد ان کا پروفائل فوری طور پر لائیو کر دیا جاتا ہے۔',
    sortOrder: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  // Category FAQs
  {
    id: 'faq-cat-electrician',
    scope: 'CATEGORY',
    categoryId: 'electrician',
    question_en: 'What are the typical visiting charges for an Electrician?',
    answer_en: 'Visiting and diagnostic charges typically start from PKR 800 - 1,200 depending on your area. Final labor and replacement parts costs are agreed upon directly on-site.',
    question_ur: 'الیکٹریشن کے عام وزٹ چارجز کتنے ہوتے ہیں؟',
    answer_ur: 'ابتدائی معائنہ و وزٹ چارجز عام طور پر 800 سے 1,200 روپے سے شروع ہوتے ہیں۔ حتمی کام کی لاگت سائٹ پر براہِ راست طے کی جاتی ہے۔',
    sortOrder: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'faq-cat-ac',
    scope: 'CATEGORY',
    categoryId: 'ac-technician',
    question_en: 'What is included in AC Master General Service?',
    answer_en: 'General service includes chemical pressure washing of indoor and outdoor coils, blower cleaning, drain tray flushing, and refrigerant gas pressure testing.',
    question_ur: 'اے سی کی جنرل سروس میں کون سے کام شامل ہوتے ہیں؟',
    answer_ur: 'جنرل سروس میں انڈور اور آؤٹ ڈور کوائلز کی پریشر واشنگ، فلٹرز کی صفائی، ڈرین پائپ کی کلیئرنس اور گیس پریشر کی جانچ شامل ہے۔',
    sortOrder: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'faq-cat-plumber',
    scope: 'CATEGORY',
    categoryId: 'plumber',
    question_en: 'Do plumbers handle emergency pipeline bursts and leakage detection?',
    answer_en: 'Yes, most plumbers listed on Baseera provide 24/7 emergency response for concealed water leakages, pipeline bursts, motor repairs, and drain clearing.',
    question_ur: 'کیا پلمبرز ایمرجنسی پائپ لائن لیکج اور واٹر پمپ کے کام کرتے ہیں؟',
    answer_ur: 'جی ہاں، بصیرہ پر موجود پلمبرز ایمرجنسی واٹر لیکج، ڈرین بلاکیج اور واٹر پمپ کی فوری مرمت کے لیے دستیاب ہوتے ہیں۔',
    sortOrder: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

// =========================================================================
// CATEGORY CRUD OPERATIONS
// =========================================================================

export async function getCategories(filter?: { activeOnly?: boolean }): Promise<CategoryItem[]> {
  let list = [...localCategories];
  if (filter?.activeOnly) {
    list = list.filter((c) => c.isActive);
  }
  return list.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function saveCategory(input: Partial<CategoryItem> & { id: string }): Promise<CategoryItem> {
  const existingIndex = localCategories.findIndex((c) => c.id === input.id);
  let updatedItem: CategoryItem;

  if (existingIndex >= 0) {
    localCategories[existingIndex] = {
      ...localCategories[existingIndex],
      ...input,
      name_en: input.name_en || localCategories[existingIndex].name_en,
      name_ur: input.name_ur || localCategories[existingIndex].name_ur,
      name_ar: input.name_ar || localCategories[existingIndex].name_ar,
      slug_en: input.slug_en || localCategories[existingIndex].slug_en,
      slug_ur: input.slug_ur || localCategories[existingIndex].slug_ur,
      slug_ar: input.slug_ar || localCategories[existingIndex].slug_ar,
    };
    updatedItem = localCategories[existingIndex];
  } else {
    updatedItem = {
      id: input.id,
      name_en: input.name_en || input.id,
      name_ur: input.name_ur || input.name_en || input.id,
      name_ar: input.name_ar || input.name_en || input.id,
      slug_en: input.slug_en || input.id,
      slug_ur: input.slug_ur || `${input.id}-mistri`,
      slug_ar: input.slug_ar || input.slug_en || input.id,
      icon: input.icon || 'Wrench',
      sortOrder: input.sortOrder !== undefined ? input.sortOrder : localCategories.length + 1,
      isActive: input.isActive !== undefined ? input.isActive : true,
      activeCount: 0,
    };
    localCategories.push(updatedItem);
  }

  // Sync to Supabase if connected
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      await supabase.from('categories').upsert({
        id: updatedItem.id,
        name: updatedItem.name_en,
        name_en: updatedItem.name_en,
        name_ur: updatedItem.name_ur,
        slug: updatedItem.slug_en,
        slug_en: updatedItem.slug_en,
        slug_ur: updatedItem.slug_ur,
        icon: updatedItem.icon,
        sort_order: updatedItem.sortOrder,
        is_active: updatedItem.isActive,
      });
    } catch (err) {
      console.warn('Supabase category upsert notice:', err);
    }
  }

  return updatedItem;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const index = localCategories.findIndex((c) => c.id === id);
  if (index >= 0) {
    localCategories.splice(index, 1);
  }
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      await supabase.from('categories').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase category delete notice:', err);
    }
  }
  return true;
}

export async function reorderCategories(orderedIds: string[]): Promise<void> {
  orderedIds.forEach((id, newIndex) => {
    const item = localCategories.find((c) => c.id === id);
    if (item) {
      item.sortOrder = newIndex + 1;
    }
  });
}

// =========================================================================
// LOCATIONS: COUNTRIES & CITIES CRUD OPERATIONS
// =========================================================================

export async function getCountries(filter?: { activeOnly?: boolean }): Promise<CountryItem[]> {
  let list = [...localCountries];
  if (filter?.activeOnly) {
    list = list.filter((c) => c.isActive);
  }
  return list;
}

export async function saveCountry(input: Partial<CountryItem> & { code: string }): Promise<CountryItem> {
  const normCode = input.code.toLowerCase();
  const existingIndex = localCountries.findIndex((c) => c.code.toLowerCase() === normCode);
  let updatedItem: CountryItem;

  if (existingIndex >= 0) {
    localCountries[existingIndex] = {
      ...localCountries[existingIndex],
      ...input,
      code: normCode,
    };
    updatedItem = localCountries[existingIndex];
  } else {
    updatedItem = {
      id: input.id || localCountries.length + 1,
      name_en: input.name_en || normCode.toUpperCase(),
      name_ur: input.name_ur || input.name_en || normCode.toUpperCase(),
      slug: input.slug || normCode,
      code: normCode,
      currency: input.currency || 'USD',
      premiumPrice: input.premiumPrice || 50,
      isActive: input.isActive !== undefined ? input.isActive : true,
      flag: input.flag || '🌐',
      region: input.region || 'Global',
    };
    localCountries.push(updatedItem);
  }

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      await supabase.from('countries').upsert({
        code: updatedItem.code,
        name: updatedItem.name_en,
        name_en: updatedItem.name_en,
        name_ur: updatedItem.name_ur,
        slug: updatedItem.slug,
        currency: updatedItem.currency,
        premium_price: updatedItem.premiumPrice,
        is_active: updatedItem.isActive,
      });
    } catch (err) {
      console.warn('Supabase country upsert notice:', err);
    }
  }

  return updatedItem;
}

export async function getCities(filter?: { countryCode?: string; activeOnly?: boolean }): Promise<CityItem[]> {
  let list = [...localCities];
  if (filter?.countryCode) {
    list = list.filter((c) => c.countryCode.toLowerCase() === filter.countryCode?.toLowerCase());
  }
  if (filter?.activeOnly) {
    list = list.filter((c) => c.isActive);
  }
  return list;
}

export async function saveCity(input: Partial<CityItem> & { slug: string; countryCode: string }): Promise<CityItem> {
  const normSlug = input.slug.toLowerCase();
  const existingIndex = localCities.findIndex((c) => c.slug.toLowerCase() === normSlug);
  let updatedItem: CityItem;

  if (existingIndex >= 0) {
    localCities[existingIndex] = {
      ...localCities[existingIndex],
      ...input,
      slug: normSlug,
      countryCode: input.countryCode.toLowerCase(),
      name_en: input.name_en || localCities[existingIndex].name_en,
      name_ur: input.name_ur || localCities[existingIndex].name_ur,
      name_ar: input.name_ar || localCities[existingIndex].name_ar,
      targetAreas: input.targetAreas || localCities[existingIndex].targetAreas,
    };
    updatedItem = localCities[existingIndex];
  } else {
    updatedItem = {
      id: input.id || localCities.length + 1,
      countryCode: input.countryCode.toLowerCase(),
      name_en: input.name_en || normSlug,
      name_ur: input.name_ur || input.name_en || normSlug,
      name_ar: input.name_ar || input.name_en || normSlug,
      slug: normSlug,
      targetAreas: input.targetAreas || ['City Center'],
      isActive: input.isActive !== undefined ? input.isActive : true,
    };
    localCities.push(updatedItem);
  }

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      await supabase.from('cities').upsert({
        slug: updatedItem.slug,
        name: updatedItem.name_en,
        name_en: updatedItem.name_en,
        name_ur: updatedItem.name_ur,
        target_areas: updatedItem.targetAreas,
        is_active: updatedItem.isActive,
      });
    } catch (err) {
      console.warn('Supabase city upsert notice:', err);
    }
  }

  return updatedItem;
}

export async function deleteCity(slug: string): Promise<boolean> {
  const index = localCities.findIndex((c) => c.slug.toLowerCase() === slug.toLowerCase());
  if (index >= 0) {
    localCities.splice(index, 1);
  }
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      await supabase.from('cities').delete().eq('slug', slug);
    } catch (err) {
      console.warn('Supabase city delete notice:', err);
    }
  }
  return true;
}

// =========================================================================
// FAQS CMS CRUD OPERATIONS
// =========================================================================

export async function getFaqs(filter?: {
  scope?: 'GLOBAL' | 'CATEGORY';
  categoryId?: string | null;
  activeOnly?: boolean;
}): Promise<FaqItemRecord[]> {
  let list = [...localFaqs];

  if (filter?.scope) {
    list = list.filter((f) => f.scope === filter.scope);
  }
  if (filter?.categoryId !== undefined) {
    if (filter.categoryId === null) {
      list = list.filter((f) => !f.categoryId);
    } else {
      list = list.filter((f) => f.categoryId === filter.categoryId);
    }
  }
  if (filter?.activeOnly) {
    list = list.filter((f) => f.isActive);
  }

  return list.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function saveFaq(input: Partial<FaqItemRecord> & { question_en: string; answer_en: string }): Promise<FaqItemRecord> {
  let updatedItem: FaqItemRecord;

  if (input.id) {
    const existingIndex = localFaqs.findIndex((f) => f.id === input.id);
    if (existingIndex >= 0) {
      localFaqs[existingIndex] = {
        ...localFaqs[existingIndex],
        ...input,
        updatedAt: new Date().toISOString(),
      };
      updatedItem = localFaqs[existingIndex];
    } else {
      updatedItem = {
        id: input.id,
        scope: input.scope || 'GLOBAL',
        categoryId: input.scope === 'CATEGORY' ? input.categoryId : null,
        question_en: input.question_en,
        answer_en: input.answer_en,
        question_ur: input.question_ur || null,
        answer_ur: input.answer_ur || null,
        sortOrder: input.sortOrder !== undefined ? input.sortOrder : localFaqs.length + 1,
        isActive: input.isActive !== undefined ? input.isActive : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localFaqs.push(updatedItem);
    }
  } else {
    updatedItem = {
      id: crypto.randomUUID(),
      scope: input.scope || 'GLOBAL',
      categoryId: input.scope === 'CATEGORY' ? input.categoryId : null,
      question_en: input.question_en,
      answer_en: input.answer_en,
      question_ur: input.question_ur || null,
      answer_ur: input.answer_ur || null,
      sortOrder: input.sortOrder !== undefined ? input.sortOrder : localFaqs.length + 1,
      isActive: input.isActive !== undefined ? input.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localFaqs.unshift(updatedItem);
  }

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      await supabase.from('faqs').upsert({
        id: updatedItem.id,
        scope: updatedItem.scope,
        category_id: updatedItem.categoryId,
        question_en: updatedItem.question_en,
        answer_en: updatedItem.answer_en,
        question_ur: updatedItem.question_ur,
        answer_ur: updatedItem.answer_ur,
        sort_order: updatedItem.sortOrder,
        is_active: updatedItem.isActive,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Supabase faq upsert notice:', err);
    }
  }

  return updatedItem;
}

export async function deleteFaq(id: string): Promise<boolean> {
  const index = localFaqs.findIndex((f) => f.id === id);
  if (index >= 0) {
    localFaqs.splice(index, 1);
  }
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      await supabase.from('faqs').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase faq delete notice:', err);
    }
  }
  return true;
}

export async function reorderFaqs(orderedIds: string[]): Promise<void> {
  orderedIds.forEach((id, newIndex) => {
    const item = localFaqs.find((f) => f.id === id);
    if (item) {
      item.sortOrder = newIndex + 1;
    }
  });
}
