// Baseera Karachi - Transliteration & English Slugify Engine
// Converts Urdu, Arabic, and mixed text into clean, strict English SEO slugs

const COMMON_URDU_TERMS = {
  'الیکٹریشن': 'electrician',
  'بجلی': 'electrician',
  'اے سی': 'ac',
  'ریفریجریشن': 'ac',
  'پلمبر': 'plumbing',
  'موٹر': 'plumbing',
  'جنریٹر': 'generator',
  'سولر': 'solar',
  'کیمرہ': 'cctv',
  'سی سی ٹی وی': 'cctv',
  'کھانا': 'food',
  'باورچی': 'food',
  'طارق': 'tariq',
  'کاشف': 'kashif',
  'فرزانہ': 'farzana',
  'عرفان': 'irfan',
  'احمد': 'ahmed'
};

const URDU_ARABIC_MAP = {
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

/**
 * Transliterates Urdu / Arabic characters and common keywords to Roman English equivalents
 */
export function transliterate(text = '') {
  if (!text) return '';
  let str = text.trim();

  // Check known terms first
  for (const [urdu, eng] of Object.entries(COMMON_URDU_TERMS)) {
    if (str.includes(urdu)) {
      str = str.replace(new RegExp(urdu, 'g'), eng);
    }
  }

  return str
    .split('')
    .map(char => URDU_ARABIC_MAP[char] !== undefined ? URDU_ARABIC_MAP[char] : char)
    .join('');
}

/**
 * Generates a strictly English, lowercase, hyphen-separated SEO slug
 * Example: "احمد الیکٹریشن" -> "ahmed-electrician"
 * Example: "Tariq Mahmood & Sons" -> "tariq-mahmood-sons"
 */
export function generateEnglishSlug(text = '') {
  const romanized = transliterate(text);
  return romanized
    .toLowerCase()
    .trim()
    .normalize('NFD') // separate accents
    .replace(/[\u0300-\u036f]/g, '') // remove accent marks
    .replace(/[^a-z0-9\s-]/g, '') // strictly remove non-alphanumeric except spaces and dashes
    .replace(/\s+/g, '-') // spaces to hyphen
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}

/**
 * Generates Silo URL structure:
 * /[lang]/[country]/[city]/[category]/[provider-slug]
 */
export function generateSiloUrl({ lang = 'en', country = 'pk', city = 'karachi', category = 'electrician', slug = '' }) {
  const cleanLang = generateEnglishSlug(lang) || 'en';
  const cleanCountry = generateEnglishSlug(country) || 'pk';
  const cleanCity = generateEnglishSlug(city) || 'karachi';
  const cleanCategory = generateEnglishSlug(category);
  const cleanSlug = generateEnglishSlug(slug);

  if (!cleanSlug) {
    return `/${cleanLang}/${cleanCountry}/${cleanCity}/${cleanCategory}`;
  }
  return `/${cleanLang}/${cleanCountry}/${cleanCity}/${cleanCategory}/${cleanSlug}`;
}
