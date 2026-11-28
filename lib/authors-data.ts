export interface Author {
  id: string;
  slug: string;
  name: string;
  role_en: string;
  role_ur: string;
  role_ar: string;
  bio_en: string;
  bio_ur: string;
  bio_ar: string;
  avatarUrl?: string;
  sameAs?: string[];
  isActive: boolean;
}

export const AUTHORS: Author[] = [
  {
    id: 'author-baseera-editorial',
    slug: 'baseera-editorial',
    name: 'Baseera Editorial Team',
    role_en: 'Technical Editorial Desk & Field Standards Team',
    role_ur: 'ٹیکنیکل ایڈیٹوریل ڈیسک اور فیلڈ اسٹینڈرڈز ٹیم',
    role_ar: 'فريق التحرير الفني ومعايير الميدان',
    bio_en:
      'The authoritative editorial desk at Baseera Directory. Collaborating with certified field technicians, master tradespeople, and consumer advocates across Pakistan and the Middle East to publish rigorous, unbiased maintenance and hiring guides. (Owner editable profile).',
    bio_ur:
      'بصیرہ ڈائریکٹری کا مستند ایڈیٹوریل ڈیسک۔ پاکستان اور مشرق وسطیٰ کے تصدیق شدہ فیلڈ کاریگروں اور ماہرین کے تعاون سے غیر جانبدارانہ اور مستند تکنیکی رہنمائی فراہم کرتا ہے۔ (ایڈمن کے ذریعے قابل ترمیم پروفائل)۔',
    bio_ar:
      'هيئة التحرير المعتمدة في دليل بصيرة. نعمل بالتعاون مع فنيين معتمدين وخبراء مهنيين في باكستان والشرق الأوسط لتقديم أدلة صيانة دقيقة ومستقلة. (ملف قابل للتعديل بواسطة المالك).',
    avatarUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    sameAs: ['https://www.linkedin.com/company/baseera-directory'],
    isActive: true,
  },
  {
    id: 'author-engr-tariq-mahmood',
    slug: 'engr-tariq-mahmood',
    name: 'Engr. Tariq Mahmood',
    role_en: 'Senior Electrical & HVAC Technical Contributor',
    role_ur: 'سینئر الیکٹریکل اور ایچ وی اے سی ٹیکنیکل کنٹری بیوٹر',
    role_ar: 'مهندس كهرباء وتكييف أول ومساهم فني',
    bio_en:
      'Field engineer and technical contributor specializing in inverter electronics, commercial cold storage troubleshooting, solar net-metering distribution boards, and industrial phase balancing.',
    bio_ur:
      'فیلڈ انجینئر اور تکنیکی مشیر جو انورٹر الیکٹرانکس، انڈسٹریل سولر نیٹ میٹرنگ، کمرشل کولڈ اسٹوریج اور تھری فیز لوڈ بیلنسنگ میں طویل عملی تجربہ رکھتے ہیں۔',
    bio_ar:
      'مهندس ميداني ومساهم فني متخصص في إلكترونيات الإنفرتر وصيانة التبريد التجاري وتوزيع لوحات الطاقة الشمسية وحماية الأحمال الكهربائية.',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    sameAs: [],
    isActive: true,
  },
  {
    id: 'author-saleem-akhtar',
    slug: 'saleem-akhtar',
    name: 'Saleem Akhtar',
    role_en: 'Master Plumbing & Hydraulic Systems Contributor',
    role_ur: 'ماسٹر پلمبنگ اور ہائیڈرولک سسٹمز کنٹری بیوٹر',
    role_ar: 'خبير السباكة وشبكات المياه والمضخات',
    bio_en:
      'Over 18 years of on-site plumbing expertise across municipal drainage networks, acoustic acoustic underground leak detection, high-pressure booster pump stations, and residential pipeline diagnostics.',
    bio_ur:
      'زیر زمین واٹر پائپ لائن لیکج کی جدید کھوج، ہائی پریشر واٹر پمپ سسٹمز، واٹر ٹینک سینیٹیشن اور رہائشی پلمبنگ انفراسٹرکچر میں 18 سال سے زائد کا عملی تجربہ۔',
    bio_ar:
      'أكثر من 18 عاماً من الخبرة العملية في كشف تسريبات المياه المخفية بأحدث الأجهزة الصوتية وتركيب مضخات الضغط وصيانة خطوط الصرف الصحي.',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    sameAs: [],
    isActive: true,
  },
];

export async function getAuthors(filter?: { activeOnly?: boolean }): Promise<Author[]> {
  if (filter?.activeOnly) {
    return AUTHORS.filter((a) => a.isActive);
  }
  return [...AUTHORS];
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  if (!slug || typeof slug !== 'string') return null;
  const norm = slug.toLowerCase().trim();
  const found = AUTHORS.find((a) => a.slug.toLowerCase() === norm);
  if (!found || !found.isActive) return null;
  return found;
}

export function getLocalizedAuthorRole(author: Author, lang = 'en'): string {
  if (lang === 'ur' && author.role_ur) return author.role_ur;
  if (lang === 'ar' && author.role_ar) return author.role_ar;
  return author.role_en || '';
}

export function getLocalizedAuthorBio(author: Author, lang = 'en'): string {
  if (lang === 'ur' && author.bio_ur) return author.bio_ur;
  if (lang === 'ar' && author.bio_ar) return author.bio_ar;
  return author.bio_en || '';
}
