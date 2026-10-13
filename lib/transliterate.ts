// Baseera - Transliteration & Strict English SEO Slugify Engine
// Converts Urdu, Arabic, and mixed text into clean, strict English SEO slugs without non-ASCII characters

export const COMMON_URDU_TERMS: Record<string, string> = {
  'الیکٹریشن': 'electrician',
  'بجلی': 'electrician',
  'اے سی': 'ac',
  'تكييف': 'ac',
  'تبريد': 'ac',
  'پلمبر': 'plumbing',
  'سباك': 'plumbing',
  'موٹر': 'plumbing',
  'جنریٹر': 'generator',
  'مولدات': 'generator',
  'سولر': 'solar',
  'طاقة شمسية': 'solar',
  'کیمرہ': 'cctv',
  'كاميرات': 'cctv',
  'کھانا': 'food',
  'طباخ': 'food',
  'باورچی': 'food',
  'کراچی': 'karachi',
  'لاہور': 'lahore',
  'اسلام آباد': 'islamabad',
  'دبي': 'dubai',
  'الشارقة': 'sharjah',
  'أبوظبي': 'abu-dhabi',
  'الرياض': 'riyadh',
  'جدة': 'jeddah',
  'طارق': 'tariq',
  'کاشف': 'kashif',
  'فرزانہ': 'farzana',
  'عرفان': 'irfan',
  'احمد': 'ahmed'
};

const URDU_ARABIC_MAP: Record<string, string> = {
  'ا': 'a', 'آ': 'aa', 'أ': 'a', 'إ': 'i', 'ء': '',
  'ب': 'b', 'پ': 'p', 'ت': 't', 'ٹ': 't', 'ث': 's',
  'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh',
  'د': 'd', 'ڈ': 'd', 'ذ': 'z',
  'ر': 'r', 'ڑ': 'r', 'ز': 'z', 'ژ': 'zh',
  'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'z',
  'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh',
  'ف': 'f', 'ق': 'q', 'ک': 'k', 'ك': 'k', 'گ': 'g',
  'ل': 'l', 'م': 'm', 'ن': 'n', 'ں': 'n',
  'و': 'o', 'ؤ': 'o', 'ہ': 'h', 'ھ': 'h', 'ۃ': 'h',
  'ی': 'y', 'ئ': 'y', 'ے': 'e', 'ى': 'a',
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
  '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
};

export function transliterate(text = ''): string {
  if (!text) return '';
  let str = text.trim();

  // Known city & trade mappings
  for (const [nonAscii, english] of Object.entries(COMMON_URDU_TERMS)) {
    if (str.includes(nonAscii)) {
      str = str.replace(new RegExp(nonAscii, 'g'), english);
    }
  }

  return str
    .split('')
    .map(char => URDU_ARABIC_MAP[char] !== undefined ? URDU_ARABIC_MAP[char] : char)
    .join('');
}

export function generateEnglishSlug(text = ''): string {
  const romanized = transliterate(text);
  return romanized
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateSiloUrl({
  lang = 'en',
  country = 'pk',
  city = 'karachi',
  category = 'electrician',
  slug = ''
}: {
  lang?: string;
  country?: string;
  city?: string;
  category?: string;
  slug?: string;
}): string {
  const cleanLang = generateEnglishSlug(lang) || 'en';
  const cleanCountry = generateEnglishSlug(country) || 'pk';
  const cleanCity = generateEnglishSlug(city) || 'karachi';
  const cleanCategory = generateEnglishSlug(category);
  const cleanSlug = generateEnglishSlug(slug);

  if (!cleanCategory) {
    return `/${cleanLang}/${cleanCountry}/${cleanCity}`;
  }
  if (!cleanSlug) {
    return `/${cleanLang}/${cleanCountry}/${cleanCity}/${cleanCategory}`;
  }
  return `/${cleanLang}/${cleanCountry}/${cleanCity}/${cleanCategory}/${cleanSlug}`;
}
