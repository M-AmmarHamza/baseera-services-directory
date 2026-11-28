import { createClient } from '@supabase/supabase-js';
import { CATEGORIES as SEED_CATEGORIES, CITIES as SEED_CITIES, COUNTRIES as SEED_COUNTRIES, CITY_DISTRICTS, CITY_NAMES_AR } from './db';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// =========================================================================
// TYPES & INTERFACES
// =========================================================================

export interface CategoryFaqPair {
  question: string;
  answer: string;
}

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
  intro_en?: string;
  intro_ur?: string;
  intro_ar?: string;
  faqs_en?: CategoryFaqPair[];
  faqs_ur?: CategoryFaqPair[];
  faqs_ar?: CategoryFaqPair[];
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
export const ROMAN_URDU_SLUGS: Record<string, string> = {
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

// =========================================================================
// TRADE-SPECIFIC INTRO PARAGRAPHS & REAL PRACTICAL FAQS (EN, UR, AR)
// =========================================================================

export interface TradeContent {
  intro_en: string;
  intro_ur: string;
  intro_ar: string;
  faqs_en: CategoryFaqPair[];
  faqs_ur: CategoryFaqPair[];
  faqs_ar: CategoryFaqPair[];
}

export const TRADE_SPECIFIC_CONTENT: Record<string, TradeContent> = {
  plumber: {
    intro_en:
      'Find verified plumbers near you for emergency water pipe leakages, drain blockage clearing, bathroom sanitary fittings, and water pump installations. Connect directly on WhatsApp with certified local plumbing specialists.',
    intro_ur:
      'پائپ لائن لیکج، سیوریج بلاکیج، واٹر موٹر اور سینیٹری فٹنگز کے لیے تصدیق شدہ پلمبرز سے براہِ راست رابطہ کریں۔ بغیر کسی کمیشن کے اپنے علاقے کے مستند پلمبر سے واٹس ایپ پر بات کریں۔',
    intro_ar:
      'اعثر على سباكين معتمدين لإصلاح تسربات المياه الخفية، تسليك المجاري، تركيب الأدوات الصحية، وصيانة مضخات المياه عبر واتساب مباشرة بدون وسيط.',
    faqs_en: [
      {
        question: 'How do plumbers detect and fix concealed wall or floor water leakages?',
        answer:
          'Professional plumbers use acoustic leak detectors and thermal inspection to locate concealed pipe bursts behind tiles without unnecessary chipping, followed by targeted pipe joint repair or PPRC line replacement.',
      },
      {
        question: 'What is the typical cost difference between visit charges and repair work?',
        answer:
          'Visiting and diagnosis fees cover on-site inspection (usually starting from PKR 500-1,000 depending on location). Final repair costs depend on pipe materials (PPRC/CPVC), sanitary parts replacement, and labor hours required.',
      },
      {
        question: 'Do plumbers handle water pressure pump and motor installations?',
        answer:
          'Yes, plumbers install automatic pressure pumps, donkey pumps, overhead water tank float valves, and repair underground suction pipelines to ensure consistent household water pressure.',
      },
      {
        question: 'Can a plumber assist with geyser and water heater pipeline connections?',
        answer:
          'Yes, plumbers install instant gas geysers, electric water heaters, and dual-line hot/cold mixer taps with heat-resistant CPVC piping and safety pressure release valves.',
      },
    ],
    faqs_ur: [
      {
        question: 'پلمبر دیوار کے اندر چھپی پائپ لیکج کی تشخیص کیسے کرتے ہیں؟',
        answer:
          'ماہر پلمبر بغیر توڑ پھوڑ کے لیکج معلوم کرنے کے لیے پریشر ٹیسٹنگ اور جدید آلات کا استعمال کرتے ہیں، جس کے بعد صرف متاثرہ جگہ پر ٹائل ہٹا کر پائپ جوائنٹ کی مرمت کی جاتی ہے۔',
      },
      {
        question: 'وزٹ چارجز اور اصل مرمتی کام کی فیس میں کیا فرق ہوتا ہے؟',
        answer:
          'وزٹ فیس صرف کاریگر کے آنے اور خرابی چیک کرنے کی ہوتی ہے (عام طور پر 500 تا 1000 روپے)۔ سامان جیسے PPRC پائپ، والوز اور لیبر کا حتمی تخمینہ معائنے کے بعد دیا جاتا ہے۔',
      },
      {
        question: 'کیا پلمبر واٹر پریشر پمپ اور موٹر کی فٹنگ کرتے ہیں؟',
        answer:
          'جی ہاں، پلمبرز آٹومیٹک واٹر پریشر پمپ، ڈونکی پمپ، اور واٹر ٹینک کے آٹومیٹک فلوٹ والو کی نئی تنصیب اور خرابی دور کرنے کی مکمل سروس فراہم کرتے ہیں۔',
      },
      {
        question: 'کیا گیزر اور گرم پانی کی پائپ لائن کی فٹنگ پلمبر کرتے ہیں؟',
        answer:
          'جی ہاں، انسٹنٹ گیس گیزر، الیکٹرک گیزر اور گرم و سرد مکسر نلکوں کی فٹنگ ہیٹ پروف CPVC پائپنگ کے ساتھ پلمبرز باآسانی انجام دیتے ہیں۔',
      },
    ],
    faqs_ar: [
      {
        question: 'كيف يقوم السباك بكشف تسربات المياه المخفية خلف الجدران؟',
        answer:
          'يستخدم السباكون أجهزة كشف تسرب إلكترونية واختبارات ضغط لتحديد مكان الكسر بدقة دون تكسير عشوائي، يتبعها تلحيم أنابيب PPRC أو استبدال الأجزاء التالفة.',
      },
      {
        question: 'ما الفرق بين رسوم الكشف وتكلفة الإصلاح الإجمالية؟',
        answer:
          'رسوم الكشف تغطي فحص الموقع وتشخيص العطل، بينما تعتمد تكلفة الإصلاح على أسعار قطع الغيار (مثل المحابس والمواسير) وساعات العمل المطلوبة.',
      },
      {
        question: 'هل يقوم السباكون بتركيب وصيانة مضخات تقوية ضغط المياه؟',
        answer:
          'نعم، يشمل عمل السباكين تركيب مضخات الضغط الأوتوماتيكية، عوامات الخزانات العلوية، وصيانة خطوط السحب السفلية لضمان تدفق مستمر للمياه.',
      },
      {
        question: 'هل يوفر السباك تمديدات سخانات المياه والمحابس الحرارية؟',
        answer:
          'نعم، يقدم السباكون تمديدات كاملة لسخانات المياه الغازية والكهربائية باستخدام أنابيب CPVC المقاومة للحرارة العالية مع صمامات الأمان.',
      },
    ],
  },
  electrician: {
    intro_en:
      'Hire certified electricians for home DB breaker box wiring, short-circuit diagnostics, UPS/solar inverter connections, and LED ceiling light fixtures. Direct WhatsApp contact with prompt local response.',
    intro_ur:
      'شارٹ سرکٹ کی درستگی، مین ڈی بی باکس و بریکرز، یو پی ایس و سولر وائرنگ اور سیلنگ لائٹس کی تنصیب کے لیے تصدیق شدہ الیکٹریشنز سے براہِ راست واٹس ایپ پر رابطہ کریں۔',
    intro_ar:
      'احجز كهربائيين معتمدين لحل مشاكل التماس الكهربائي، فحص لوحات التوزيع والقواطع، توصيلات العاكس والشمس، وتركيب الإضاءة مباشرة عبر واتساب.',
    faqs_en: [
      {
        question: 'What should I do during an emergency electrical short circuit or tripping breaker?',
        answer:
          'Immediately switch off the main double-pole breaker on your distribution board (DB) and unplug sensitive appliances. Avoid touching spark points and contact a licensed electrician to diagnose earth leakages or overloaded circuits.',
      },
      {
        question: 'How do electricians price wiring work (per-point vs lump-sum)?',
        answer:
          'New installations or renovations are commonly charged per electrical point (switch, socket, or light point), while repairs like short circuit diagnosis, DB box dressing, or breaker replacements are quoted as flat job rates.',
      },
      {
        question: 'Can an electrician properly balance phases and configure UPS/inverter wiring?',
        answer:
          'Yes, certified electricians divide heavy loads (ACs, geysers, pumps) across phases to prevent neutral burning, and wire dedicated sub-circuits for uninterrupted UPS or solar inverter power.',
      },
      {
        question: 'Why is proper copper earthing / grounding necessary for homes?',
        answer:
          'Proper earthing discharges stray voltages from appliances (like refrigerators, washing machines, and geysers) safely into the ground, preventing dangerous electric shocks and protecting electronics from lightning surges.',
      },
    ],
    faqs_ur: [
      {
        question: 'شارٹ سرکٹ یا بار بار بریکر ٹرپ ہونے کی صورت میں کیا کرنا چاہیے؟',
        answer:
          'فوری طور پر مین ڈی بی باکس سے مین بریکر بند کر دیں اور حساس برقی آلات کو ان پلگ کر دیں۔ شارٹ سرکٹ کی جگہ کو ہاتھ لگانے سے گریز کریں اور مستند الیکٹریشن سے ارتھنگ چیک کروائیں۔',
      },
      {
        question: 'الیکٹریشن وائرنگ کا کام پر پوائنٹ کے حساب سے کرتے ہیں یا یکمشت؟',
        answer:
          'نئے گھر یا کمرے کی وائرنگ عام طور پر فی پوائنٹ (سوئچ، ساکٹ، پنکھا) کے ریٹ پر طے ہوتی ہے، جبکہ پرانی وائرنگ میں فالٹ ٹریسنگ اور ڈی بی ڈریسنگ کا الگ فکس ریٹ ہوتا ہے۔',
      },
      {
        question: 'کیا الیکٹریشن یو پی ایس اور انورٹر کے لیے فیز بیلنسنگ کرتے ہیں؟',
        answer:
          'جی ہاں، الیکٹریشن زیادہ لوڈ والے آلات (اے سی، موٹر، گیزر) کو نارمل لائن پر رکھتے ہیں اور مخصوص کم لوڈ والے پنکھوں اور لائٹس کو الگ نیوٹرل کے ساتھ یو پی ایس لائن پر شفٹ کرتے ہیں۔',
      },
      {
        question: 'گھر میں کاپر ارتھنگ وائر لگوانا کیوں ضروری ہے؟',
        answer:
          'ارتھنگ برقی آلات (جیسے فریج، واشنگ مشین، گیزر کی باڈی) پر آنے والے کرنٹ کو بحفاظت زمین میں منتقل کرتی ہے، جس سے انسانی جان کو کرنٹ لگنے سے محفوظ رکھا جا سکتا ہے۔',
      },
    ],
    faqs_ar: [
      {
        question: 'ما هو الإجراء الصحيح عند حدوث التماس كهربائي أو انقطاع القاطع المتكرر؟',
        answer:
          'افصل القاطع الرئيسي في لوحة التوزيع فوراً وانزع قوابس الأجهزة الحساسة. لا تلمس الأسلاك المكشوفة واستدعِ فنياً متخصصاً لفحص العزل والحمل الزائد.',
      },
      {
        question: 'كيف يتم تسعير أعمال التمديدات الكهربائية (بالنقطة أم بالمشروع)؟',
        answer:
          'تُسعر التمديدات الجديدة عادة بنظام النقطة (لكل مفتاح أو مأخذ أو وحدة إنارة)، بينما تُسعر أعمال الصيانة وحل الأعطال بمبلغ مقطوع متفق عليه.',
      },
      {
        question: 'هل يقدم الكهربائي موازنة للأحمال وتمديدات لأنظمة العاكس والطاقة البديلة؟',
        answer:
          'نعم، يقوم الفنيون بتوزيع الأحمال الثقيلة على الفازات لتجنب احتراق خط التعادل، مع تخصيص دوائر فرعية لأجهزة الإضاءة والمراوح على خط الطاقة الاحتياطية.',
      },
      {
        question: 'ما أهمية تركيب خط التأريض الأرضي (Earthing) في المنازل؟',
        answer:
          'يقوم التأريض بتفريغ التيارات المتسربة من هياكل الأجهزة المعدنية كالغسالات والسخانات إلى الأرض، مما يحمي السكان من الصدمات الكهربائية ويحمي الأجهزة من الصواعق.',
      },
    ],
  },
  'ac-technician': {
    intro_en:
      'Connect with certified AC technicians for inverter and split AC general servicing, R32/R410a refrigerant gas refilling, PCB board repairs, and professional split AC dismounting/installation.',
    intro_ur:
      'انورٹر اور اسپلٹ اے سی کی جنرل سروس، R32/R410a گیس ری فلنگ، کمپریسر فالٹس، پی سی بی کٹ کی مرمت اور فٹنگ کے لیے ماہر اے سی ٹیکنیشنز سے واٹس ایپ پر براہِ راست رابطہ کریں۔',
    intro_ar:
      'تواصل مع فنيي تكييف معتمدين لصيانة وتنظيف مكيفات الاسبليت والإنفرتر، تعبئة غاز الفريون، صيانة لوحات PCB، والفك والتركيب الاحترافي بدون عمولة.',
    faqs_en: [
      {
        question: 'What is the difference between AC Normal Service and Chemical Master Service?',
        answer:
          'Normal service cleans dust filters and basic indoor grills. Chemical Master Service uses high-pressure jet pumps and specialized coil cleaners to remove deep indoor evaporator gunk and outdoor condenser sludge, restoring full cooling efficiency.',
      },
      {
        question: 'How do I know if my Inverter AC requires gas refilling or has a leak?',
        answer:
          'If your AC runs without cooling, the thin copper pipe gets frosted with ice, or the outdoor unit blows lukewarm air, there is likely a refrigerant leak that must be brazed and nitrogen pressure-tested before adding R410a or R32 gas.',
      },
      {
        question: 'Can technicians repair Inverter AC outdoor PCB motherboard circuits?',
        answer:
          'Yes, specialized technicians diagnose error codes (e.g., communication or IPM faults), replace burnt capacitors/IGBT chips on the inverter PCB, saving substantial money compared to buying a complete new kit.',
      },
      {
        question: 'What are the standard charges for split AC installation and copper piping?',
        answer:
          'Installation packages typically cover mounting both units and vacuuming. Extra pure copper piping, insulation sleeve, wiring, and angle iron wall brackets are billed per additional running foot.',
      },
    ],
    faqs_ur: [
      {
        question: 'اے سی کی عام سروس اور کیمیکل ماسٹر سروس میں کیا فرق ہوتا ہے؟',
        answer:
          'عام سروس میں صرف فلٹرز دھوئے جاتے ہیں۔ ماسٹر سروس میں ہائی پریشر واشر اور کیمیکل کے ذریعے انڈور کوائل اور آؤٹ ڈور کنڈینسر کی گہری صفائی کی جاتی ہے جس سے کولنگ اور بجلی کی بچت میں اضافہ ہوتا ہے۔',
      },
      {
        question: 'کیسے معلوم ہوگا کہ انورٹر اے سی میں گیس کم ہے یا پائپ میں لیکج ہے؟',
        answer:
          'اگر اے سی چلنے کے باوجود ٹھنڈک نہ کرے، باریک پائپ پر برف جم جائے، یا آؤٹ ڈور سے گرم ہوا نہ نکل رہی ہو، تو یہ گیس لیکیج کی علامت ہے۔ گیس بھرنے سے پہلے لیکیج تلاش کر کے ویلڈنگ کروانا لازمی ہے۔',
      },
      {
        question: 'کیا انورٹر اے سی کی پی سی بی کٹ اور کارڈ کی مرمت ممکن ہے؟',
        answer:
          'جی ہاں، ماہر ٹیکنیشن ایرر کوڈز کے ذریعے پی سی بی کے جلے ہوئے آئی جی بی ٹی یا کیپیسیٹرز تبدیل کر کے کٹ مرمت کر دیتے ہیں جس سے نئی کٹ کے بھاری خرچ سے بچا جا سکتا ہے۔',
      },
      {
        question: 'اسپلٹ اے سی کی فٹنگ میں اضافی کاپر پائپ کے چارجز کیسے طے ہوتے ہیں؟',
        answer:
          'بنیادی فٹنگ میں انڈور اور آؤٹ ڈور یونٹ کی دیوار پر تنصیب شامل ہوتی ہے۔ اگر کاپر پائپ 10 فٹ کی معیاری لمبائی سے زیادہ درکار ہو تو اضافی پائپ اور بریکٹس کے چارجز فی فٹ کے حساب سے لیے جاتے ہیں۔',
      },
    ],
    faqs_ar: [
      {
        question: 'ما الفرق بين غسيل المكيف العادي والتنظيف الكيميائي الشامل؟',
        answer:
          'التنظيف العادي يقتصر على غسيل الفلاتر، بينما التنظيف الكيميائي الشامل يستخدم مضخات ضغط عالٍ ومواد مخصصة لإزالة الأوساخ المترسبة في ملفات المبخر والضاغط الخارجي لاستعادة برودة الهواء.',
      },
      {
        question: 'كيف أعرف أن مكيف الإنفرتر يحتاج تعبئة فريون أو به تسريب؟',
        answer:
          'عند ضعف التبريد، أو تشكل ثلج على أنبوب النحاس الرفيع، أو عدم خروج هواء ساخن من الوحدة الخارجية؛ يدل ذلك على تسريب يتطلب اللحام واختبار الضغط قبل شحن غاز R410a أو R32.',
      },
      {
        question: 'هل يمكن صيانة كروت ولوحات التحكم الإلكترونية (PCB) للمكيفات؟',
        answer:
          'نعم، يقوم مهندسو التبريد بفحص رموز الأعطال واستبدال الترانزستورات والمكثفات التالفة في اللوحة الإلكترونية بدلاً من استبدالها بالكامل بتكلفة مرتفعة.',
      },
      {
        question: 'كيف تُحسب تكلفة تركيب مكيف الاسبليت وتمديدات النحاس الإضافية؟',
        answer:
          'تشمل أجور التركيب تثبيت الوحدتين الداخلية والخارجية وعمل الفاكيوم، بينما تُحسب مواسير النحاس الإضافية والعوازل وقواعد التثبيت بالمتر الطولي.',
      },
    ],
  },
  carpenter: {
    intro_en:
      'Find master carpenters for custom wooden wardrobes, modular kitchen cabinets, door lock/hinge repairs, and antique furniture wood polishing. Direct WhatsApp communication.',
    intro_ur:
      'دروازوں اور تالوں کی مرمت، الماری و کچن کیبنٹس، صوفہ فریمز اور لکڑی کی پالش و لیمینیشن کے لیے ماہر بڑھئی (کارپینٹر) سے واٹس ایپ پر رابطہ کریں۔',
    intro_ar:
      'استعن بأمهر النجارين لتفصيل خزائن الملابس، مطابخ الألمنيوم والخشب، صيانة الأبواب والأقفال، ودهان وتلميع الأثاث الخشبي مباشرة عبر واتساب.',
    faqs_en: [
      {
        question: 'Do carpenters make custom modular kitchen cabinets and wardrobes from scratch?',
        answer:
          'Yes, carpenters take exact room measurements, provide 3D layout advice, and build bespoke wardrobes and kitchens using MDF, UV sheets, tactile lamination, or solid wood with soft-close hydraulic hardware.',
      },
      {
        question: 'Can a carpenter fix swollen, stuck wooden doors and misaligned hinges?',
        answer:
          'Yes, moisture during humid weather often swells doors. Carpenters plane the binding edges, re-align heavy-duty hinges, and adjust latch strike plates so doors close smoothly.',
      },
      {
        question: 'What is the difference between PU lacquer polish, deco paint, and lamination sheet finish?',
        answer:
          'PU polish enhances natural wood grain, deco paint gives a smooth automotive-grade solid colored finish, while tactile lamination sheets provide scratch-resistant, low-maintenance surfaces for daily-use furniture.',
      },
      {
        question: 'Do carpenters supply materials or should the client purchase wood and hardware?',
        answer:
          'You can either choose a turnkey contract where the carpenter sources all sheets and hardware, or pay labor-only charges and purchase sheets and fittings yourself based on the carpenter cutting list.',
      },
    ],
    faqs_ur: [
      {
        question: 'کیا کارپینٹر کچن کیبنٹس اور بیڈ روم الماریاں خود تیار کرتے ہیں؟',
        answer:
          'جی ہاں، کارپینٹر کمرے کی پیمائش لے کر UV شیٹ، ٹیکٹائل لیمینیشن یا سالڈ لکڑی سے جدید ہائیڈرولک فٹنگز کے ساتھ الماریاں اور کچن کیبنٹس تیار کرتے ہیں۔',
      },
      {
        question: 'کیا بارش یا نمی سے پھولے ہوئے دروازوں اور جام تالوں کی مرمت بڑھئی کرتے ہیں؟',
        answer:
          'جی ہاں، نمی کی وجہ سے اٹکنے والے دروازوں کو رندے کے ذریعے درست کیا جاتا ہے، قبضوں کی سیدھ نکالی جاتی ہے اور لاک کو آئلنگ کر کے رواں کیا جاتا ہے۔',
      },
      {
        question: 'ڈیکو پینٹ، اسپرٹ پالش اور لیمینیشن شیٹ میں کیا بنیادی فرق ہے؟',
        answer:
          'پالش لکڑی کے قدرتی ریشوں کو چمکاتی ہے، ڈیکو پینٹ بالکل ہموار یک رنگی فنش دیتا ہے، جبکہ لیمینیشن شیٹس روزمرہ استعمال کے لیے پائیدار اور واٹر ریزسٹنٹ ہوتی ہیں۔',
      },
      {
        question: 'سامان کارپینٹر خود خرید کر لاتے ہیں یا کسٹمر کو لانا ہوتا ہے؟',
        answer:
          'آپ دونوں طریقے اختیار کر سکتے ہیں: یا تو میٹریل سمیت مکمل ٹھیکہ طے کر لیں، یا صرف کاریگر کی مزدوری طے کر کے شیٹس اور ہارڈویئر خود خرید لیں۔',
      },
    ],
    faqs_ar: [
      {
        question: 'هل يقوم النجار بتفصيل المطابخ وخزائن الملابس حسب المقاس؟',
        answer:
          'نعم، يقوم النجار برفع المقاسات وتفصيل الخزائن والمطابخ باستخدام ألواح MDF المقاومة للرطوبة، الفورميكا، أو الخشب الطبيعي مع مفصلات هيدروليكية ناعمة الإغلاق.',
      },
      {
        question: 'هل يمكن معالجة الأبواب الخشبية المنتفخة بسبب الرطوبة وصيانة الأقفال؟',
        answer:
          'نعم، يعالج النجار تمدد الخشب عبر كشط الحواف وإعادة ضبط المفصلات والمزلاج ليعود الباب للإغلاق بسلاسة وأمان.',
      },
      {
        question: 'ما الفرق بين دهان الدوكو ودهان اللاكيه وتغطية ألواح الفورميكا؟',
        answer:
          'دهان الدوكو يوفر سطحاً ناعماً شبيهاً بدهان السيارات، واللاكيه يبرز عروق الخشب الطبيعي، بينما توفر ألواح الفورميكا حماية عالية من الخدوش وسهولة في التنظيف اليومي.',
      },
      {
        question: 'هل يشمل الاتفاق توفير الأخشاب والإكسسوارات أم أجور يد فقط؟',
        answer:
          'يمكن الاتفاق على العمل متضمناً المواد كاملة، أو الاتفاق على مصنعية اليد فقط مع شراء العميل للخشب والمفصلات وفق قائمة يقدمها النجار.',
      },
    ],
  },
  painter: {
    intro_en:
      'Connect with experienced painters for interior wall emulsion, dampness wall putty treatments, exterior weather-shield coating, and door/grill enamel paints.',
    intro_ur:
      'گھر کے اندرونی و بیرونی پینٹ، سیم زدہ دیواروں کی واٹر پروفنگ پٹین، ویدر شیلڈ اور دروازوں کی اینامل پینٹنگ کے لیے ماہر پینٹرز سے براہِ راست رابطہ کریں۔',
    intro_ar:
      'احجز دهانين محترفين للدهانات الداخلية (بلاستيك وجبس)، معالجة الرطوبة والتشققات، دهانات الواجهات الخارجية المقاومة للطقس، واللاكيه للأبواب.',
    faqs_en: [
      {
        question: 'How do professional painters treat bubbling paint and wall dampness (seepage)?',
        answer:
          'Painters scrape off all flaking paint down to the plaster, apply deep-penetrating anti-fungal chemical primer, fill uneven areas with waterproof wall putty, and let it cure fully before applying final coats.',
      },
      {
        question: 'What paint is best for exterior walls exposed to harsh sun and rain?',
        answer:
          'Exterior surfaces require high-grade elastomeric weather-shield paints with UV blockers and acrylic waterproofing polymers that resist cracking, fungal stains, and chalking.',
      },
      {
        question: 'How are residential painting jobs estimated (per square foot vs lump sum)?',
        answer:
          'Painters calculate total wall and ceiling surface area (square footage) deducting openings, factoring in the number of coats and wall prep required, or quote an all-inclusive lump-sum labor price.',
      },
      {
        question: 'How many coats of paint are recommended for a fresh or repainted room?',
        answer:
          'For fresh plaster: 1 coat primer sealer, 2 coats acrylic wall putty, followed by 2 to 3 topcoats of matte or silk emulsion. For repainting existing sound walls, 2 topcoats usually provide complete coverage.',
      },
    ],
    faqs_ur: [
      {
        question: 'دیواروں پر سیم (نمی) اور پینٹ اکھڑنے کا مستقل علاج کیا ہے؟',
        answer:
          'ماہر پینٹر خراب پینٹ کھرچ کر واٹر پروفنگ کیمیکل اور اینٹی فنگل پرائمر لگاتے ہیں، پھر واٹر ریزسٹنٹ پٹین سے ہموار کر کے کوالٹی پینٹ کرتے ہیں تاکہ سیم دوبارہ ظاہر نہ ہو۔',
      },
      {
        question: 'گھر کی بیرونی دیواروں کے لیے کون سا پینٹ موزوں ترین ہے؟',
        answer:
          'بیرونی دیواروں کے لیے ایکریلک ویدر شیلڈ پینٹ سب سے بہترین ہے جو تیز دھوپ، بارش اور مٹی سے دیوار کو محفوظ رکھتا ہے اور رنگ مدہم نہیں ہونے دیتا۔',
      },
      {
        question: 'پینٹ کے کام کا ریٹ اسکوائر فٹ پر طے ہوتا ہے یا یکمشت؟',
        answer:
          'پینٹرز دیواروں اور چھت کا رقبہ ناپ کر اسکوائر فٹ کے حساب سے ریٹ بتاتے ہیں جس میں پٹین اور کوٹنگز کی تعداد شامل ہوتی ہے، یا پورے گھر کا یکمشت لیبر ریٹ طے کیا جاتا ہے۔',
      },
      {
        question: 'ایک عام کمرے کو پینٹ کرنے کے لیے کتنے کوٹ لگانا ضروری ہیں؟',
        answer:
          'نئی دیوار پر ایک کوٹ پرائمر، دو کوٹ پٹین اور کم از کم دو کوٹ پینٹ لگتے ہیں۔ پرانی درست دیوار پر دو کوٹ اچھے ایمولشن پینٹ سے بہترین فنش آ جاتی ہے۔',
      },
    ],
    faqs_ar: [
      {
        question: 'كيف يعالج فني الدهان رطوبة الجدران وتقشر البوية؟',
        answer:
          'يقوم الدهان بإزالة الدهان المتقشر تماماً وصولاً لطبقة اللياسة، ثم يدهن مادة عازلة للرطوبة ومعجوناً مقاوماً للماء قبل تطبيق الدهان النهائي لضمان عدم عودة التقشير.',
      },
      {
        question: 'ما هو أفضل نوع دهان للواجهات الخارجية المعرضة للشمس والأمطار؟',
        answer:
          'يُفضل استخدام دهانات الأكريليك المطاطية المقاومة للعوامل الجوية (Weather-shield) التي تحمي الجدران من الأشعة فوق البنفسجية وتمنع تراكم الأتربة والتشققات.',
      },
      {
        question: 'كيف يتم تقدير تكلفة دهان الشقق والمنازل؟',
        answer:
          'يتم حساب التكلفة إما بالمتر المربع لمسطح الجدران والأسقف مع الأخذ في الاعتبار عدد الطبقات، أو بمبلغ مقطوع يشمل المصنعية والمواد بعد المعاينة.',
      },
      {
        question: 'كم طبقة دهان يحتاجها الحائط للحصول على تغطية ممتازة؟',
        answer:
          'للجدران الجديدة: طبقة أساس (برايمر)، وطبقتان من المعجون، ثم طبقتان إلى ثلاث طبقات من البوية. أما لإعادة الدهان فتكفي طبقتان من الدهان عالي الجودة.',
      },
    ],
  },
  'cctv-installer': {
    intro_en:
      'Connect with verified security camera installers for IP and HD-Analog CCTV setups, DVR/NVR hard drive configurations, and smartphone live streaming setup.',
    intro_ur:
      'گھر، دکان اور فیکٹری کے لیے ایچ ڈی اور آئی پی کیمروں کی تنصیب، موبائل پر لائیو ویو، اور ڈی وی آر/این وی آر ریکارڈنگ سیٹ اپ کے لیے سی سی ٹی وی انسٹالرز سے رابطہ کریں۔',
    intro_ar:
      'احجز فنيي تركيب كاميرات مراقبة معتمدين لتركيب كاميرات IP وHD، ضبط أجهزة التسجيل DVR/NVR، وربط المراقبة بالهاتف المحمول مباشرة عبر واتساب.',
    faqs_en: [
      {
        question: 'What is the difference between IP digital cameras and HD analog CCTV cameras?',
        answer:
          'IP cameras transmit digital video over Ethernet cables with superior 4K clarity, smart motion tracking, and remote PoE power, whereas HD-Analog uses coaxial cables and is a more budget-friendly option for standard surveillance.',
      },
      {
        question: 'Can I watch live CCTV footage on my Android or iPhone while away from home?',
        answer:
          'Yes, installers configure cloud P2P remote monitoring apps on your mobile devices, enabling live viewing, two-way audio, and instant motion notifications anywhere via mobile internet.',
      },
      {
        question: 'How many days of recording can a 1TB or 2TB surveillance hard drive store?',
        answer:
          'Using modern H.265+ video compression, a 4-camera 1080p system can record continuously for approximately 12–18 days on a 1TB drive, or over 30 days when set to smart motion-activated recording.',
      },
      {
        question: 'Do outdoor CCTV cameras work in complete darkness and heavy rain?',
        answer:
          'Yes, IP67 weatherproof outdoor cameras feature infrared (IR) or full-color night vision LED arrays that illuminate pitch-black yards up to 30 meters with weatherproof cable junction boxes.',
      },
    ],
    faqs_ur: [
      {
        question: 'آئی پی کیمروں اور اینالاگ سی سی ٹی وی کیمروں میں کیا فرق ہے؟',
        answer:
          'آئی پی کیمرے انٹرنیٹ کیبل (CAT6) کے ذریعے الٹرا ایچ ڈی کوالٹی اور جدید موشن ڈیٹیکشن فراہم کرتے ہیں، جبکہ اینالاگ کیمرے روایتی کوایکسیل وائر پر سستے لیکن معیاری نتائج دیتے ہیں۔',
      },
      {
        question: 'کیا میں گھر سے دور رہتے ہوئے اپنے موبائل فون پر لائیو کیمرے دیکھ سکتا ہوں؟',
        answer:
          'جی ہاں، ٹیکنیشن آپ کے ڈی وی آر یا این وی آر کو موبائل ایپ کے ساتھ کنیکٹ کر دیتے ہیں جس سے آپ 4G/5G انٹرنیٹ کے ذریعے دنیا بھر سے لائیو ریکارڈنگ دیکھ سکتے ہیں۔',
      },
      {
        question: 'ایک یا دو ٹی بی کی ہارڈ ڈرائیو پر کتنے دن کی ریکارڈنگ محفوظ رہتی ہے؟',
        answer:
          'چار کیمروں کے لیے 1TB ہارڈ ڈرائیو پر عام طور پر 12 سے 18 دن کی مسلسل ریکارڈنگ محفوظ رہتی ہے، اور موشن ڈیٹیکشن پر یہ دورانیہ ایک ماہ تک بڑھ جاتا ہے۔',
      },
      {
        question: 'کیا بیرونی کیمرے رات کی تاریکی اور بارش میں درست کام کرتے ہیں؟',
        answer:
          'جی ہاں، آؤٹ ڈور واٹر پروف (IP67) کیمروں میں نائٹ ویژن انفراریڈ اور کلر ایل ای ڈی لگی ہوتی ہے جو گھپ اندھیرے میں بھی 30 میٹر تک واضح رزلٹ دیتی ہے۔',
      },
    ],
    faqs_ar: [
      {
        question: 'ما الفرق بين كاميرات المراقبة الشبكية (IP) والكاميرات التناظرية (Analog HD)؟',
        answer:
          'كاميرات IP تنقل الفيديو بدقة فائقة 4K عبر كابلات الشبكة وتوفر ميزات الذكاء الاصطناعي وتتبع الحركة، بينما الكاميرات التناظرية تعتبر خياراً اقتصادياً يعتمد على الكابل المحوري.',
      },
      {
        question: 'هل يمكنني مشاهدة بث الكاميرات المباشر عبر الهاتف من أي مكان؟',
        answer:
          'نعم، يقوم الفني بتهيئة خاصية P2P السحابية وتثبيت تطبيق الهاتف لربط الكاميرات بنظامي iOS وAndroid لتتمكن من المراقبة وتلقي إشعارات التنبيه عن بُعد.',
      },
      {
        question: 'كم يوماً من التسجيل يمكن لقرص صلب سعة 1 أو 2 تيرابايت تخزينه؟',
        answer:
          'مع تقنية الضغط H.265+ الحديثة، يسجل القرص سعة 1 تيرابايت لنظام مكون من 4 كاميرات لمدة 12 إلى 18 يوماً من التسجيل المتواصل، وتتضاعف المدة عند تفعيل التسجيل عند الحركة.',
      },
      {
        question: 'هل تعمل الكاميرات الخارجية في الظلام الدامس وتحت المطر الشديد؟',
        answer:
          'نعم، الكاميرات الخارجية تأتي بمعيار مقاومة الماء والغبار IP67 ومزودة بتقنية الرؤية الليلية بالأشعة تحت الحمراء أو الإضاءة الملونة الذكية لمسافات تصل لـ 30 متراً.',
      },
    ],
  },
  'car-mechanic': {
    intro_en:
      'Connect with verified auto mechanics for computerized engine diagnostics, doorstep emergency battery/starting breakdown assistance, suspension overhauls, and brake maintenance.',
    intro_ur:
      'کمپیوٹرائزڈ انجن اسکیننگ، آن سائٹ بریک ڈاؤن مدد، سسپنشن، بریک سروس اور آئل فلٹر ٹیوننگ کے لیے تصدیق شدہ کار مکینکس سے براہِ راست رابطہ کریں۔',
    intro_ar:
      'اعثر على ميكانيكي سيارات معتمد لفحص المحرك بالكمبيوتر OBD، خدمة الإنقاذ عند تعطل البطارية، صيانة الفرامل والعكوس، والتصفية الشاملة عبر واتساب.',
    faqs_en: [
      {
        question: 'Do mobile car mechanics provide roadside or doorstep breakdown assistance?',
        answer:
          'Yes, many listed auto mechanics offer emergency doorstep dispatch for dead battery jumpstarts, alternator issues, punctured spares, and starter motor troubleshooting.',
      },
      {
        question: 'What is checked during a computerized OBD-II engine scan?',
        answer:
          'Mechanics plug diagnostic scanners into your vehicle OBD port to read check engine light codes, monitor sensor inputs (O2, MAF, throttle position), and verify catalytic converter performance.',
      },
      {
        question: 'When should suspension ball joints, tie rods, and shock absorbers be replaced?',
        answer:
          'If you hear clunking noises over speed breakers, experience loose steering vibration, or notice hydraulic oil weeping from shock absorber struts, the suspension components need urgent overhaul.',
      },
      {
        question: 'Should I purchase genuine OEM spare parts or rely on the mechanic?',
        answer:
          'You can let the mechanic purchase guaranteed OEM or certified aftermarket parts and review store receipts, or purchase the parts yourself from authorized distributors to pay labor-only.',
      },
    ],
    faqs_ur: [
      {
        question: 'کیا کار مکینک راستے میں گاڑی خراب ہونے کی صورت میں ایمرجنسی سروس دیتے ہیں؟',
        answer:
          'جی ہاں، بیشتر مکینکس گاڑی بند ہونے، بیٹری ڈیڈ ہونے، یا فیول پمپ کے مسائل کی صورت میں آپ کے بتائے گئے مقام پر آن سائٹ سروس فراہم کرتے ہیں۔',
      },
      {
        question: 'کمپیوٹرائزڈ اسکیننگ سے گاڑی کے کون سے نقائص سامنے آتے ہیں؟',
        answer:
          'او بی ڈی اسکینر کے ذریعے چیک انجن لائٹ کی وجوہات، سینسرز (جیسے آکسیجن سینسر، تھروٹل)، ای ایف آئی وائرنگ، اور فیول ایوریج کے فالٹس فوری معلوم ہو جاتے ہیں۔',
      },
      {
        question: 'گاڑی کا سسپنشن اور جھولے کب چیک یا تبدیل کروانے چاہئیں؟',
        answer:
          'اگر اسپیڈ بریکر پر سے گزرتے وقت نیچے سے کھٹ کھٹ کی آواز آئے، گاڑی ایک طرف کھینچتی ہو، یا جھٹکے زیادہ محسوس ہوں تو سسپنشن بش اور شاکس کی مرمت ضروری ہے۔',
      },
      {
        question: 'گاڑی کے پرزہ جات خود لانے چاہئیں یا مکینک کے ذریعے؟',
        answer:
          'آپ مستند آٹو اسٹور سے خود اوریجنل پرزے خرید سکتے ہیں اور مکینک کو صرف اجرت دے سکتے ہیں، یا مکینک کے ذریعے بل کی تصدیق کے ساتھ سامان منگوا سکتے ہیں۔',
      },
    ],
    faqs_ar: [
      {
        question: 'هل يقدم ميكانيكي السيارات خدمة فزعة على الطريق للأعطال الطارئة؟',
        answer:
          'نعم، يقدم الفنيون خدمات المساعدة على الطريق مثل شحن أو تبديل البطاريات، إصلاح أعطال السلف، وتفقد مضخات الوقود في موقع تعطل المركبة.',
      },
      {
        question: 'ما الذي يتم كشفه عبر فحص كمبيوتر السيارة (OBD-II)؟',
        answer:
          'يكشف الفحص الإلكتروني أسباب إضاءة لمبة المحرك، أداء حساسات الأكسجين وحرارة المحرك، كفاءة بخاخات الوقود، ونظام الاحتراق لضبط عزم المركبة.',
      },
      {
        question: 'متى يجب تبديل المساعدات، المقصات، ومساند العكوس في السيارة؟',
        answer:
          'يجب الصيانة فور سماع أصوات طقطقة عند المطبات، أو انحراف مقود القيادة، أو ملاحظة تسريب زيت من مساعدات الصدمات لضمان ثبات السيارة.',
      },
      {
        question: 'هل الأفضل شراء قطع الغيار بنفسي أم عبر ورشة الميكانيكي؟',
        answer:
          'يمكنك شراء قطع الغيار الأصلية بنفسك من الوكلاء المعتمدين ودفع أجور اليد فقط، أو ترك تأمين القطع للميكانيكي مع التأكد من فواتير الشراء والضمان.',
      },
    ],
  },
  'home-chef': {
    intro_en:
      'Connect directly with local home chefs and catering specialists for hygienic daily tiffin meal plans, custom birthday party catering, and corporate lunch deliveries.',
    intro_ur:
      'گھریلو ماحول میں تیار کردہ حفظانِ صحت کے اصولوں کے مطابق روزمرہ ٹفن سروس، دعوت اور تقریبات کے لذیذ کھانوں کے لیے ہوم شیف سے واٹس ایپ پر رابطہ کریں۔',
    intro_ar:
      'تواصل مع طهاة منزليين ومتخصصي بوفيهات معتمدين للوجبات اليومية الصحية، وتجهيز ولائم المناسبات الخاصة بجودة منزلية فاخرة عبر واتساب مباشرة.',
    faqs_en: [
      {
        question: 'How do home chefs operate monthly lunch/dinner tiffin subscriptions?',
        answer:
          'Chefs send weekly rotating menus over WhatsApp. Meals are freshly cooked each morning using home kitchen hygiene standards and delivered in insulated tiffin packaging during your chosen time slot.',
      },
      {
        question: 'How much advance notice is required for party orders and small catering events?',
        answer:
          'For orders catering to 10 to 50 guests, chefs generally request 24 to 48 hours advance booking to source fresh organic ingredients, prepare marinations, and arrange warm delivery containers.',
      },
      {
        question: 'Can home chefs accommodate customized dietary needs (diabetic, low-oil, keto)?',
        answer:
          'Yes, because food is cooked in small custom batches, you can instruct your chef directly on WhatsApp regarding low salt, specific cooking oils (olive/mustard), or spice level preferences.',
      },
      {
        question: 'Are food packaging and delivery charges included in the quote?',
        answer:
          'Most chefs quote food portions and indicate whether delivery is complimentary within their immediate neighborhood or fulfilled via local rider delivery apps at exact distance costs.',
      },
    ],
    faqs_ur: [
      {
        question: 'ماہانہ ٹفن سروس کا طریقہ کار کیا ہوتا ہے؟',
        answer:
          'ہوم شیف ہفتہ وار مینو واٹس ایپ پر شیئر کرتے ہیں۔ روزانہ صبح تازہ کھانا گھر کے صاف ستھرے مصالحوں میں پکایا جاتا ہے اور دوپہر یا رات کے وقت ڈلیور کیا جاتا ہے۔',
      },
      {
        question: 'چھوٹی دعوت یا پارٹی کے لیے کھانا کتنے دن پہلے بک کروانا چاہیے؟',
        answer:
          '10 سے 50 افراد کے کھانے کے لیے کم از کم 24 سے 48 گھنٹے پہلے آرڈر دینا بہتر ہوتا ہے تاکہ تازہ گوشت اور معیاری اجزاء کا انتظام وقت پر کیا جا سکے۔',
      },
      {
        question: 'کیا مریضوں یا ڈائٹ کرنے والوں کے لیے کم تیل اور ہلکے مصالحے کا کھانا مل سکتا ہے؟',
        answer:
          'جی ہاں، چونکہ کھانا مخصوص آرڈر پر تیار ہوتا ہے اس لیے آپ شیف کو براہِ راست شوگر، بلڈ پریشر یا وزن کم کرنے کے حساب سے خصوصی ہدایات دے سکتے ہیں۔',
      },
      {
        question: 'کیا کھانے کی پیکنگ اور ڈلیوری کے چارجز بل میں شامل ہوتے ہیں؟',
        answer:
          'قریبی علاقوں میں عام طور پر ڈلیوری شامل ہوتی ہے، جبکہ دور دراز علاقوں کے لیے رائیڈر سروس کے اصل چارجز مینو کے ساتھ واضح کر دیے جاتے ہیں۔',
      },
    ],
    faqs_ar: [
      {
        question: 'كيف تعمل اشتراكات الوجبات المنزلية الشهرية (تيفن)؟',
        answer:
          'يقدم الطهاة قائمة أسبوعية متغيرة، ويتم طهي الطعام طازجاً كل صباح بمعايير النظافة المنزلية وتوصيله في أوعية حافظة للحرارة خلال الموعد المحدد.',
      },
      {
        question: 'كم المدة المطلوبة مسبقاً لحجز بوفيهات العزائم والولائم الصغيرة؟',
        answer:
          'للولائم المكونة من 10 إلى 50 شخصاً، يُفضل الحجز قبل 24 إلى 48 ساعة لتوفير المكونات الطازجة والتتبيل والترتيب للتسليم في الوقت المناسب.',
      },
      {
        question: 'هل يمكن تلبية الأنظمة الغذائية الخاصة (مثل الكيتو، قليلة الملح، أو الدهون الصحية)؟',
        answer:
          'نعم، لأن الوجبات تُعد خصيصاً لكل عميل، يمكنك التنسيق مع الطاهي مباشرة عبر واتساب لتقليل الملح أو استخدام زيوت معينة كزيت الزيتون.',
      },
      {
        question: 'هل رسوم التوصيل والتغليف مشمولة في الأسعار المعروضة؟',
        answer:
          'تكون رسوم التوصيل مجانية في الأحياء المجاورة لمطبخ الطاهي عادةً، بينما تُحسب رسوم مندوب التوصيل الفعلية حسب المسافة للأحياء الأخرى.',
      },
    ],
  },
  'interior-designer': {
    intro_en:
      'Connect with verified interior designers and turnkey renovation contractors for 2D/3D floor layouts, bespoke false ceiling designs, custom cabinetry, and complete home remodeling.',
    intro_ur:
      'گھر اور دفتر کی خوبصورت ڈیزائننگ، 2D/3D نقشہ جات، فال سیلنگ، وال پینلنگ اور جدید رینوویشن کے لیے تصدیق شدہ انٹیریئر ڈیزائنرز سے واٹس ایپ پر رابطہ کریں۔',
    intro_ar:
      'استعن بمهندسي تصميم داخلي معتمدين لمخططات 2D/3D، ديكورات الأسقف الجبسية، التكسيات الجدارية، والإشراف على أعمال الترميم الفاخرة عبر واتساب.',
    faqs_en: [
      {
        question: 'What is the difference between Design-Only consultation and Full Turnkey execution?',
        answer:
          'Design-only provides 2D floor plans, 3D photorealistic visual renders, and material specifications for your own contractors. Turnkey covers complete end-to-end execution, labor supervision, and material procurement under one fixed budget.',
      },
      {
        question: 'How do interior designers charge for residential projects?',
        answer:
          'Designers typically charge either a flat design fee per square foot for conceptual planning, or a transparent management percentage (usually 10%–15%) over actual execution costs for turnkey builds.',
      },
      {
        question: 'Can an interior designer assist with small room or kitchen renovations?',
        answer:
          'Yes, designers take up targeted single-space projects like master bedroom makeovers, media wall panelling, or modular kitchen overhauls with customized mood boards.',
      },
      {
        question: 'How are project timelines and material quality milestones maintained?',
        answer:
          'Professional designers create phase-wise Gantt charts (civil/electrical, woodworks, paint/finishing) with client inspection sign-offs before approving payments at each construction stage.',
      },
    ],
    faqs_ur: [
      {
        question: 'صرف ڈیزائننگ پلان اور مکمل ٹرن کی (Turnkey) پروجیکٹ میں کیا فرق ہے؟',
        answer:
          'صرف ڈیزائننگ میں ڈیزائنر آپ کو نقشے اور 3D تصاویر بنا کر دیتا ہے۔ ٹرن کی پروجیکٹ میں سامان کی خریداری سے لے کر کاریگروں کی نگرانی اور فائنل کام کروانے کی تمام ذمہ داری ڈیزائنر کی ہوتی ہے۔',
      },
      {
        question: 'انٹیریئر ڈیزائنرز اپنی فیس کس طرح چارج کرتے ہیں؟',
        answer:
          'ڈیزائنرز یا تو فی اسکوائر فٹ کے حساب سے نقشہ فیس لیتے ہیں، یا پھر مجموعی تعمیراتی لاگت کا 10 سے 15 فیصد سپروائزری کمیشن لیتے ہیں۔',
      },
      {
        question: 'کیا کسی ایک کمرے یا کچن کی رینوویشن کے لیے انٹیریئر ڈیزائنر کی خدمات لی جا سکتی ہیں؟',
        answer:
          'جی ہاں، ڈیزائنرز صرف ایک ڈرائنگ روم، ٹی وی لاؤنج، میڈیا وال، یا کچن کی ری ماڈلنگ کے لیے بھی مکمل گائیڈنس اور کام کی نگرانی فراہم کرتے ہیں۔',
      },
      {
        question: 'کام کے معیار اور وقت کی پابندی کو کیسے یقینی بنایا جاتا ہے؟',
        answer:
          'کام کو مراحل (جیسے وائرنگ، فال سیلنگ، ووڈ ورک، پینٹ) میں تقسیم کیا جاتا ہے اور ہر مرحلے پر کلائنٹ کی تسلی کے بعد اگلا کام شروع کیا جاتا ہے۔',
      },
    ],
    faqs_ar: [
      {
        question: 'ما الفرق بين خدمة التصميم فقط (Design-only) وتسليم المفتاح (Turnkey)؟',
        answer:
          'خدمة التصميم تشمل المخططات المعمارية والتصاميم ثلاثية الأبعاد 3D وقوائم المواد، بينما تسليم المفتاح يشمل إدارة المشروع، توفير العمالة والمواد، والإشراف حتى التسليم النهائي.',
      },
      {
        question: 'كيف تُحسب أتعاب مهندس التصميم الداخلي للمشاريع السكنية؟',
        answer:
          'تُحسب الأتعاب إما بسعر محدد للمتر المربع لمخططات التصميم، أو بنسبة إشراف وإدارة تتراوح بين 10% إلى 15% من التكلفة الفعلية لأعمال التنفيذ.',
      },
      {
        question: 'هل يمكن الاستعانة بمهندس ديكور لتجديد غرفة واحدة أو مطبخ فقط؟',
        answer:
          'نعم، يقدم المصممون حلولاً للمساحات المفردة مثل تجديد الصالة، تصميم جدار التلفزيون بديكورات الخشب والبديل، أو تفصيل المطابخ الحديثة.',
      },
      {
        question: 'كيف يتم ضمان جودة المواد والتزام المقاولين بالجدول الزمني؟',
        answer:
          'يتم إعداد جدول زمني مفصل لكل مرحلة (كهرباء، جبس، أعمال خشبية، دهان) مع زيارات إشراف دورية واعتماد العينات قبل التركيب الفعلي.',
      },
    ],
  },
  'solar-installer': {
    intro_en:
      'Connect with certified solar system installers for on-grid net metering, hybrid inverter setups, monocrystalline Tier-1 solar panels, and battery bank configurations.',
    intro_ur:
      'آن گرڈ نیٹ میٹرنگ، ہائبرڈ سولر انورٹرز، ٹائر ون مونو پرک پینلز اور لیتھیم و ٹیوبلر بیٹریوں کی معیاری تنصیب کے لیے سولر انسٹالرز سے رابطہ کریں۔',
    intro_ar:
      'احجز فنيي تركيب طاقة شمسية معتمدين لأنظمة الربط بالشبكة (العداد الذكي)، محولات الإنفرتر الهجينة، وتركيب ألواح المونوكريستال عالية الكفاءة عبر واتساب.',
    faqs_en: [
      {
        question: 'What is the complete process and timeline for On-Grid Net Metering approval?',
        answer:
          'Installers prepare the three-phase load extension, submit documentation to DISCO, perform AEDB certified inspection, and coordinate green bidirectional meter installation within 30 to 45 business days.',
      },
      {
        question: 'Should I choose an On-Grid or Hybrid solar inverter for my home?',
        answer:
          'On-grid inverters export excess electricity to the grid and cut electricity bills drastically but turn off during power outages. Hybrid inverters combine grid-tie export with lithium/tubular battery backup during load shedding.',
      },
      {
        question: 'How many kilowatt (kW) solar panels are needed to run 1.5-ton Inverter ACs?',
        answer:
          'A 5kW to 6kW Tier-1 monocrystalline solar setup typically produces enough peak daytime wattage to power one 1.5-ton inverter AC alongside your refrigerator, water motor, and general home load.',
      },
      {
        question: 'How are rooftop solar mounting structures anchored against high storm winds?',
        answer:
          'Certified installers use hot-dip galvanized custom angle iron (GI L2/L3) structures anchored into RCC rooftop roof beams using chemical anchor bolts and concrete civil foundation blocks.',
      },
    ],
    faqs_ur: [
      {
        question: 'آن گرڈ نیٹ میٹرنگ اور گرین میٹر لگوانے کا کیا طریقہ کار ہے؟',
        answer:
          'سولر کمپنی آپ کے تھری فیز کنکشن کی فائل تیار کر کے بجلی کی کمپنی کو جمع کرواتی ہے، معائنے کے بعد 30 سے 45 دن میں دو طرفہ گرین میٹر لگا دیا جاتا ہے۔',
      },
      {
        question: 'گھر کے لیے آن گرڈ انورٹر بہتر ہے یا ہائبرڈ انورٹر؟',
        answer:
          'آن گرڈ سسٹم بجلی کا بل صفر کرنے کے لیے سستا اور بہترین ہے مگر لوڈ شیڈنگ میں بند ہو جاتا ہے۔ ہائبرڈ انورٹر بل میں کمی کے ساتھ ساتھ بیٹری کے ذریعے لائٹ جانے پر بھی بیک اپ دیتا ہے۔',
      },
      {
        question: 'ڈیڑھ ٹن انورٹر اے سی چلانے کے لیے کتنے کلو واٹ کا سولر سسٹم چاہیے؟',
        answer:
          'دن کے وقت ایک ڈیڑھ ٹن انورٹر اے سی اور گھر کے عام پنکھے، فریج چلانے کے لیے کم از کم 5 سے 6 کلو واٹ کا ٹائر ون سولر سسٹم بہترین کام کرتا ہے۔',
      },
      {
        question: 'تیز آندھی اور طوفان سے سولر فریمز کو کیسے محفوظ رکھا جاتا ہے؟',
        answer:
          'معیاری انسٹالیشن میں ہاٹ ڈِپ گیلوانائزڈ (GI) اسٹرکچر لگایا جاتا ہے اور چھت پر کیمیکل راول بولٹس کے ساتھ کنکریٹ کے وزنی بلاکس بنا کر فریم مضبوط کیا جاتا ہے۔',
      },
    ],
    faqs_ar: [
      {
        question: 'ما هي متطلبات ومدة ربط نظام الطاقة الشمسية بالشبكة (صافي القياس)؟',
        answer:
          'يقوم المقاول بإعداد المخططات الهندسية وتقديم الملف لشركة الكهرباء، وبعد الفحص الفني يتم تركيب العداد الرقمي ثنائي الاتجاه خلال 30 إلى 45 يوماً.',
      },
      {
        question: 'أيهما أفضل للمنزل: الإنفرتر المتصل بالشبكة (On-Grid) أم الهجين (Hybrid)؟',
        answer:
          'الإنفرتر المتصل بالشبكة يخفض الفاتورة لأقصى حد ويصدّر الفائض نهاراً لكنه يفصل عند انقطاع التيار. بينما الهجين يوفر شحن بطاريات واستمرار تشغيل الأجهزة الحساسة.',
      },
      {
        question: 'كم كيلوواط أحتاج من الألواح الشمسية لتشغيل مكيف بقدرة 1.5 طن؟',
        answer:
          'يحتاج تشغيل مكيف إنفرتر 1.5 طن نهاراً مع أحمال المنزل الأساسية (الثلاجة والإنارة) إلى منظومة ألواح شمسية بقدرة 5 إلى 6 كيلوواط من الفئة الأولى.',
      },
      {
        question: 'كيف يتم تثبيت هياكل الألواح الشمسية على الأسطح لمقاومة الرياح القوية؟',
        answer:
          'تُستخدم هياكل حديدية مجلفنة بالغمس الساخن (GI) ومثبتات كيميائية ميكانيكية في الصبة الخرسانية مع كتل تثبيت ثقيلة لمقاومة العواصف الهوائية.',
      },
    ],
  },
  'ups-inverter-technician': {
    intro_en:
      'Find specialized technicians for home UPS and inverter repairs, battery charging issues, automatic transfer switch (ATS) installations, and tubular battery maintenance.',
    intro_ur:
      'یو پی ایس انورٹر کی مرمت، بیٹری چارجنگ کے مسائل، آٹومیٹک چینج اوور (ATS) اور ٹیوبلر بیٹری کی دیکھ بھال کے لیے مستند یو پی ایس ٹیکنیشنز سے رابطہ کریں۔',
    intro_ar:
      'تواصل مع فنيي صيانة محولات الطاقة الاحتياطية (UPS)، صيانة كروت الشحن، تركيب مفاتيح التحويل الآلي ATS، وتفقد بطاريات الجل والأنبوبية.',
    faqs_en: [
      {
        question: 'Why is my UPS inverter continuously beeping and not charging the battery?',
        answer:
          'Constant beeping usually indicates battery low-voltage cutoff, a shorted battery cell, blown MOSFET output transistors, or low utility AC input voltage preventing the internal charger from engaging.',
      },
      {
        question: 'What is the life expectancy of Tubular batteries vs standard lead-acid batteries?',
        answer:
          'Tall tubular deep-cycle batteries typically last 3 to 5 years under heavy daily cycling, whereas standard automotive starter batteries fail within 12 to 18 months when used on home inverters.',
      },
      {
        question: 'What does an Automatic Transfer Switch (ATS) do for inverter setups?',
        answer:
          'An ATS changeover seamlessly shifts your home electrical sub-circuits between utility grid, UPS inverter, and generator lines without manual switch flipping or spark surges.',
      },
      {
        question: 'Can technicians repair inverter motherboards on pure sine wave units?',
        answer:
          'Yes, technicians replace burnt high-frequency MOSFETs, driver ICs, PWM control boards, and cooling fan bearings on modern pure sine wave inverters.',
      },
    ],
    faqs_ur: [
      {
        question: 'یو پی ایس بار بار بیپ کیوں کرتا ہے اور بیٹری چارج کیوں نہیں ہوتی؟',
        answer:
          'مسلسل بیپ عام طور پر بیٹری کی کم وولٹیج، بیٹری کا ایک سیل خراب ہونے، یا یو پی ایس کے اندرونی چارجنگ سرکٹ اور ماسفیٹ ٹرانزسٹر جلنے کی وجہ سے ہوتی ہے۔',
      },
      {
        question: 'یو پی ایس کے لیے ٹیوبلر بیٹری اور عام بیٹری میں کیا فرق ہے؟',
        answer:
          'ٹیوبلر ڈیپ سائیکل بیٹری خاص طور پر لوڈ شیڈنگ کے لیے بنائی گئی ہے جو 3 سے 5 سال باآسانی نکالتی ہے، جبکہ عام گاڑی والی بیٹری سال ڈیڑھ سال میں خراب ہو جاتی ہے۔',
      },
      {
        question: 'آٹومیٹک چینج اوور (ATS) سوئچ لگوانے کا کیا فائدہ ہے؟',
        answer:
          'اے ٹی ایس سوئچ بجلی جانے اور آنے پر خودکار طریقے سے بغیر کسی اسپارک کے بجلی کو واپڈا سے یو پی ایس یا جنریٹر پر شفٹ کر دیتا ہے اور ہاتھ سے بٹن تبدیل نہیں کرنا پڑتا۔',
      },
      {
        question: 'کیا پیور سائن ویو یو پی ایس انورٹر کے مدر بورڈ کی مرمت ممکن ہے؟',
        answer:
          'جی ہاں، ماہر الیکٹرانکس ٹیکنیشنز یو پی ایس کا مین سرکٹ بورڈ، ڈرائیور آئی سی، اور کولنگ فین تبدیل کر کے انورٹر کو دوبارہ فیکٹری کنڈیشن میں بحال کر دیتے ہیں۔',
      },
    ],
    faqs_ar: [
      {
        question: 'لماذا يصدر جهاز الـ UPS صفارة تحذير مستمرة ولا يشحن البطارية؟',
        answer:
          'الصفير المستمر يشير غالباً لهبوط جهد البطارية لأقل من الحد الآمن، أو تلف أحد خلايا البطارية، أو احتراق ترانزستورات الشحن MOSFET الداخلية في لوحة الإنفرتر.',
      },
      {
        question: 'كم يبلغ العمر الافتراضي للبطاريات الأنبوبية مقارنة ببطاريات السيارات؟',
        answer:
          'تدوم بطاريات التيوبلار الأنبوبية العميقة من 3 إلى 5 سنوات مع التفريغ اليومي المتكرر، بينما تتلف بطاريات السيارات العادية خلال 12 إلى 18 شهراً عند استخدامها للـ UPS.',
      },
      {
        question: 'ما هي وظيفة قاطع التحويل التلقائي (ATS) في أنظمة الطاقة الاحتياطية؟',
        answer:
          'يقوم قاطع ATS بنقل الأحمال الكهربائية المنزلية تلقائياً بين خط الشبكة الرئيسي والمولد أو العاكس خلال أجزاء من الثانية دون انقطاع الكهرباء ودون تدخل يدوي.',
      },
      {
        question: 'هل يمكن صيانة كروت التحكم لمولدات الموجة الجيبية النقية (Pure Sine Wave)؟',
        answer:
          'نعم، يقوم فنيو الإلكترونيات بفحص واستبدال دوائر التردد العالي، منظمات الجهد PWM، ومراوح التبريد لإعادة تشغيل محول الطاقة بكفاءة تامة.',
      },
    ],
  },
  'generator-repair': {
    intro_en:
      'Connect with expert generator mechanics for petrol and gas generator tuning, AVR voltage stabilizer replacements, self-starter troubleshooting, and routine oil changes.',
    intro_ur:
      'پٹرول اور گیس جنریٹر کی مرمت، اے وی آر وولٹیج ریگولیٹر تبدیلی، سیلف اسٹارٹر کے مسائل اور انجن آئل ٹیوننگ کے لیے جنریٹر مکینک سے رابطہ کریں۔',
    intro_ar:
      'استعن بفنيي صيانة المولدات الكهربائية للبنزين والغاز، استبدال منظم الجهد AVR، صيانة بادئ التشغيل (السلف)، والتصفية الميكانيكية الشاملة.',
    faqs_en: [
      {
        question: 'How do mechanics convert and tune a petrol generator to dual-fuel Sui Gas/LPG?',
        answer:
          'Mechanics install a certified dual-fuel vacuum carburettor kit and low-pressure gas regulator, tuning air-fuel mixture ratios to eliminate engine hunting and ensure instant starting on natural gas.',
      },
      {
        question: 'Why does my generator voltage fluctuate and cause lights to flicker?',
        answer:
          'Flickering voltage is usually caused by a failing Automatic Voltage Regulator (AVR), worn carbon brushes on the rotor slip rings, or clogged carburettor idle jets causing engine RPM hunting.',
      },
      {
        question: 'What causes the generator self-starter to click without cranking the engine?',
        answer:
          'A clicking starter typically indicates a discharged 12V battery, corroded starter solenoid terminal connections, or worn carbon brushes inside the 12V starter motor itself.',
      },
      {
        question: 'How often should generator engine oil and spark plugs be changed?',
        answer:
          'Engine oil (20W-50 / 10W-40) should be changed every 50 to 80 operational hours. Spark plugs and foam air filters should be cleaned and inspected every 100 hours.',
      },
    ],
    faqs_ur: [
      {
        question: 'پٹرول جنریٹر کو سوئی گیس یا ایل پی جی پر کیسے کنورٹ اور سیٹ کیا جاتا ہے؟',
        answer:
          'جنریٹر مکینک ڈوئل فیول کاربوریٹر کٹ اور گیس کٹ لگا کر ہوا اور گیس کے مکسچر کی سیٹنگ کرتے ہیں جس سے جنریٹر گیس پر مسنگ کیے بغیر پہلی سلف میں اسٹارٹ ہو جاتا ہے۔',
      },
      {
        question: 'جنریٹر کے وولٹیج کم زیادہ ہونے اور لائٹیں پھڑکنے کی کیا وجہ ہوتی ہے؟',
        answer:
          'وولٹیج کی فلکچوایشن عام طور پر خراب اے وی آر (AVR)، روٹر کے کاربن کاربن برش گھس جانے، یا کاربوریٹر میں کچرا آنے سے انجن کے چکر کم زیادہ ہونے پر ہوتی ہے۔',
      },
      {
        question: 'جنریٹر کا سلف کٹ کٹ کی آواز کرے مگر انجن اسٹارٹ نہ ہو تو کیا خرابی ہے؟',
        answer:
          'یہ خرابی جنریٹر کی 12 وولٹ بیٹری ڈسچارج ہونے، سلف ریلے کے تار ڈھیلے ہونے، یا سلف موٹر کے اندرونی کاربن برش ختم ہونے کی علامت ہے۔',
      },
      {
        question: 'جنریٹر کا انجن آئل اور پلگ کتنے گھنٹے چلنے کے بعد تبدیل کرنا چاہیے؟',
        answer:
          'جنریٹر کا انجن آئل ہر 50 سے 80 گھنٹے بعد لازمی تبدیل کرنا چاہیے۔ اسپارک پلگ اور ایئر فلٹر کو ہر 100 گھنٹے پر صاف یا تبدیل کروانا انجن کی لمبی عمر کے لیے ضروری ہے۔',
      },
    ],
    faqs_ar: [
      {
        question: 'كيف تتم موالفة وتحويل مولد البنزين للعمل بالغاز الطبيعي أو LPG؟',
        answer:
          'يقوم الفني بتركيب كربراتير مزدوج الوقود مع منظم ضغط غاز منخفض، وضبط نسبة خلط الهواء والوقود لمنع تذبذب المحرك وضمان استجابة التشغيل السريعة.',
      },
      {
        question: 'ما سبب تذبذب خرج الكهرباء ورعشة الإضاءة الصادرة من المولد؟',
        answer:
          'يرجع التذبذب عادة لتلف منظم الجهد الأوتوماتيكي (AVR)، أو تآكل فحمات الكربون في عضو الإنتاج، أو انسداد ممر السرعة البطيئة في الكربراتير مما يسبب تذبذب دورات المحرك.',
      },
      {
        question: 'ما سبب صدور صوت طقة من بادئ التشغيل (السلف) دون دوران المحرك؟',
        answer:
          'يدل صوت الطقطقة على ضعف شحن بطارية الـ 12 فولت، أو تأكسد كابلات التوصيل بسلف المولد، أو تآكل قلب محرك بدء التشغيل الكهربائي الداخلي.',
      },
      {
        question: 'كم عدد ساعات التشغيل الموصى بها لتغيير زيت المولد وشمعة الاحتراق؟',
        answer:
          'يجب تغيير زيت المحرك كل 50 إلى 80 ساعة تشغيل فعلية، مع تنظيف فلتر الهواء وفحص شمعة الاحتراق (البوجيه) كل 100 ساعة لضمان كفاءة الاحتراق.',
      },
    ],
  },
  'water-pump-repair': {
    intro_en:
      'Hire experienced technicians for water suction pumps, automatic pressure motors, donkey pump seal leakages, and motor winding repairs.',
    intro_ur:
      'واٹر پمپ موٹر کی وائنڈنگ، ڈونکی پمپ کی سیل لیکیج، آٹومیٹک پریشر سوئچ اور پانی نہ کھینچنے کے مسائل کے لیے واٹر موٹر مکینک سے رابطہ کریں۔',
    intro_ar:
      'احجز فنيي صيانة وإصلاح مضخات المياه المنزلية، محركات السحب، تبديل موانع التسريب الميكانيكية (الاويل سيل)، وضبط أوتوماتيك الضغط.',
    faqs_en: [
      {
        question: 'Why is my water pump motor humming loudly without spinning or pumping water?',
        answer:
          'Loud humming usually points to a blown motor run-capacitor, seized ball bearings from water ingress, or a foreign pebble jamming the internal brass impeller blades.',
      },
      {
        question: 'How do technicians stop water dripping from a donkey or centrifugal pump head?',
        answer:
          'Technicians dismantle the pump head casing, inspect the central rotor shaft for pitting, and press in a brand new ceramic-graphite mechanical face seal with fresh silicone gaskets.',
      },
      {
        question: 'Why does my automatic pressure pump turn on and off continuously when no tap is open?',
        answer:
          'Frequent rapid cycling indicates a lost air cushion inside the expansion diaphragm pressure tank, or a slow hidden leak in toilet flush cistern valves or concealed fittings.',
      },
      {
        question: 'Is it better to rewind a burned motor coil or buy a new water motor?',
        answer:
          'Rewinding using 99.9% pure copper magnet wire restores original torque and pumping efficiency at less than half the cost of purchasing a brand-new branded pump.',
      },
    ],
    faqs_ur: [
      {
        question: 'پانی کی موٹر گنگناتی ہے مگر گھومتی نہیں اور پانی نہیں کھینچتی، کیا وجہ ہے؟',
        answer:
          'موٹر کے گنگنانے کی عام وجہ چارجنگ کیپیسیٹر کا کمزور ہونا، پانی جانے سے بیرنگ جام ہونا، یا ایمپیلر (پنکھے) میں ریت اور کنکر پھنسنا ہوتا ہے۔',
      },
      {
        question: 'ڈونکی پمپ یا واٹر پمپ کے آگے سے پانی کے قطرے ٹپکنے کا حل کیا ہے؟',
        answer:
          'مکینک پمپ کا اگلا حصہ کھول کر چیک کرتے ہیں اور اس کی گریفائٹ واٹر سیل اور ربڑ گسکیٹ تبدیل کرتے ہیں تاکہ پانی بیرنگ اور موٹر کی طرف نہ جائے۔',
      },
      {
        question: 'آٹومیٹک پریشر موٹر بغیر نلکا کھولے بار بار خود بخود کیوں چل پڑتی ہے؟',
        answer:
          'یہ مسئلہ پریشر ٹینک کے اندرونی بلبلے (ڈایافرام) میں ہوا کم ہونے، یا واش روم کے کموڈ ٹینک میں باریک پانی لیکیج ہونے کی وجہ سے پیش آتا ہے۔',
      },
      {
        question: 'جلی ہوئی موٹر کی کاپر وائنڈنگ کروانا بہتر ہے یا نئی موٹر خریدنا؟',
        answer:
          'اگر 99.9% خالص کاپر وائر اور کوالٹی وارنش سے وائنڈنگ کروائی جائے تو موٹر نئی جیسی طاقت فراہم کرتی ہے اور نئے پمپ کے مقابلے میں آدھے سے بھی کم خرچ آتا ہے۔',
      },
    ],
    faqs_ar: [
      {
        question: 'لماذا يصدر محرك مضخة المياه صوتاً مرتفعاً دون دوران أو ضخ للماء؟',
        answer:
          'يرجع صوت الأزيز عادة لتلف مكثف البدء (الكبستر)، أو تجيم رولمان البلي بسبب تسرب الرطوبة، أو انحشار حصى صغيرة في مروحة السحب (الإمبلر).',
      },
      {
        question: 'كيف يعالج الفني تسريب المياه من رأس مضخة الماء السطحية؟',
        answer:
          'يقوم الفني بفك غطاء المضخة وتفقد عمود الدوران، ثم استبدال مانع التسريب الميكانيكي (Mechanical Seal) السيراميكي مع تركيب جوانات مانعة للماء جديدة.',
      },
      {
        question: 'ما سبب عمل وفصل مضخة الضغط الأوتوماتيكية باستمرار دون فتح أي صنبور؟',
        answer:
          'يعود التكرار السريع إلى فقدان ضغط الهواء داخل بالونة الضغط (الخزان الغشائي)، أو وجود تسريب طفيف غير ملحوظ في سيفون الحمام أو محابس التغذية.',
      },
      {
        question: 'هل الأفضل إعادة لف ملفات المحرك الكهربائي المحترق أم شراء مضخة جديدة؟',
        answer:
          'إعادة لف المحرك بسلك نحاس نقي 99.9% يعيد عزم المضخة الأصلي وكفاءة الضخ بنصف تكلفة شراء مضخة جديدة بالكامل.',
      },
    ],
  },
  'water-boring': {
    intro_en:
      'Find licensed water well boring contractors for residential tube-well drilling, underground PVC casing installations, and deep submersible pump lowerings.',
    intro_ur:
      'گھریلو اور کمرشل واٹر بورنگ، میٹھے پانی کی گہرائی معلوم کرنے، پی وی سی فلٹر پائپ اور سبمرسیبل پمپ کی فٹنگ کے لیے ماہر بورنگ ٹھیکیداروں سے رابطہ کریں۔',
    intro_ar:
      'تواصل مع مقاولي حفر آبار المياه السكنية والزراعية، تركيب مواسير التغليف البلاستيكية، وتنزيل المضخات الغاطسة في الآبار الارتوازية عبر واتساب.',
    faqs_en: [
      {
        question: 'How do drilling contractors determine the correct depth for sweet drinking water?',
        answer:
          'Contractors evaluate geological groundwater strata maps in your specific neighborhood, testing soil mud layers during rotary drilling until reaching the sweet water aquifer layer (typically 80ft to 300ft+).',
      },
      {
        question: 'What is the difference between rotary rig drilling and manual casing boring?',
        answer:
          'Rotary machine rigs drill through dense rock and stone layers in a single day down to deep water tables. Manual rotary boring is suited for tight residential courtyards and sandy loam soil.',
      },
      {
        question: 'Why are heavy-duty PVC casing pipes and gravel packs essential for boreholes?',
        answer:
          'Class-D PVC casing pipes prevent borehole wall collapse, while graded river gravel packed around slotted strainer pipes naturally filters out sand and silt from entering the pump.',
      },
      {
        question: 'Can contractors install and lower a deep submersible bore pump?',
        answer:
          'Yes, contractors connect multi-stage stainless steel submersible pumps with waterproof submersible electric drop cables, safety stainless suspension wire, and HDPE delivery pipes.',
      },
    ],
    faqs_ur: [
      {
        question: 'بورنگ کرتے وقت میٹھے پانی کی درست گہرائی کا تعین کیسے کیا جاتا ہے؟',
        answer:
          'بورنگ ٹھیکیدار علاقے کے زمینی پانی کے ریکارڈ اور کھدائی کے دوران نکلنے والی ریت اور مٹی کے نمونے چیک کرتے ہیں جب تک کہ میٹھے پانی کی مستند تہہ (عام طور پر 80 سے 300+ فٹ) نہ آ جائے۔',
      },
      {
        question: 'مشینی رگ بورنگ اور مینوئل بورنگ میں کیا بنیادی فرق ہے؟',
        answer:
          'مشینی رگ سخت پتھریلی زمین میں ایک دن کے اندر گہرا بور کر دیتی ہے، جبکہ مینوئل بورنگ تنگ گلیوں یا گھر کے اندرونی صحن میں ریتلی زمین کے لیے موزوں رہتی ہے۔',
      },
      {
        question: 'بور میں کلاس ڈی پی وی سی پائپ اور بجری ڈالنا کیوں ضروری ہے؟',
        answer:
          'کلاس ڈی کا موٹا پائپ بور کو بیٹھنے سے بچاتا ہے اور فلٹر پائپ کے ارد گرد مخصوص بجری (Gravel Pack) باریک ریت کو موٹر کے اندر آنے سے روکتی ہے۔',
      },
      {
        question: 'کیا بورنگ والے سبمرسیبل پمپ اور واٹر پائپ کی فٹنگ بھی کرتے ہیں؟',
        answer:
          'جی ہاں، ٹھیکیدار واٹر پروف کیبل، سیفٹی وائر اور ایچ ڈی پی ای پائپ کے ساتھ اسٹین لیس اسٹیل سبمرسیبل پمپ کو بور کے اندر اتار کر مکمل ٹیسٹنگ کر کے دیتے ہیں۔',
      },
    ],
    faqs_ar: [
      {
        question: 'كيف يحدد مقاولو الحفر العمق المناسب للوصول إلى المياه العذبة؟',
        answer:
          'يعتمد المقاولون على خرائط الطبقات الجيولوجية للحي ومراقبة عينات التربة والرمال المستخرجة أثناء الحفر حتى الوصول للطبقة الحاملة للمياه العذبة (غالباً بين 80 إلى 300+ قدم).',
      },
      {
        question: 'ما الفرق بين الحفر الآلي بالحفارات الكبيرة والحفر اليدوي الدوار؟',
        answer:
          'الحفارات الآلية تخترق الطبقات الصخرية الصلبة وتصل لأعماق كبيرة في يوم واحد، بينما يُستخدم الحفر اليدوي في الأفنية الضيقة والمناطق ذات التربة الطينية الرملية.',
      },
      {
        question: 'لماذا يُشترط استخدام مواسير PVC سميكة مع الفلتر وحصى التصفية؟',
        answer:
          'مواسير التغليف السميكة تحمي البئر من الانهيار الداخلي، بينما يعمل الحصى المتدرج حول المواسير المخرمة كمرشح طبيعي يمنع دخول الرمال إلى المضخة.',
      },
      {
        question: 'هل يقوم المقاول بتنزيل وتثبيت المضخة الغاطسة داخل البئر الارتوازي؟',
        answer:
          'نعم، يقوم الفريق بتنزيل مضخات الغطاس المصنوعة من الستانلس ستيل وربطها بكابلات عازلة للماء ومواسير HDPE مع حبل أمان فولاذي لضمان ثباتها.',
      },
    ],
  },
  'water-tank-cleaning': {
    intro_en:
      'Connect with professional water tank cleaning services for underground and overhead tank chemical sludge extraction, pressure washing, and UV/chlorine disinfection.',
    intro_ur:
      'زیرِ زمین اور چھت کی واٹر ٹینکوں کی کیمیکل صفائی، مڈ اور کائی کا خاتمہ، ہائی پریشر واشنگ اور جراثیم کش کلورینیشن کے لیے ٹینک صفائی ماہرین سے رابطہ کریں۔',
    intro_ar:
      'احجز شركات تنظيف وتعقيم خزانات المياه الأرضية والعلوية، سحب الرواسب والشوائب بمضخات الضغط، واستخدام مواد التطهير المصرحة صحياً.',
    faqs_en: [
      {
        question: 'What multi-step process do professional water tank cleaners follow?',
        answer:
          'Cleaners dewater the tank using dirty-water submersible pumps, scrub walls with food-grade disinfectants, high-pressure jet wash algae from corners, vacuum out residual sludge, and apply antibacterial chlorine sterilization.',
      },
      {
        question: 'How frequently should underground and rooftop water tanks be cleaned?',
        answer:
          'Health experts recommend professional deep cleaning every 6 months to prevent the accumulation of parasitic bacteria, airborne dust sediment, and harmful algae blooms.',
      },
      {
        question: 'How long after chemical tank cleaning is the water safe to use?',
        answer:
          'After final fresh-water flushing and chlorine neutralization, tanks can be refilled immediately. The water is completely safe for bathing, cooking, and household utility.',
      },
      {
        question: 'Can tank cleaning technicians seal wall cracks and stop water seepage?',
        answer:
          'Yes, technicians inspect the empty underground concrete tank and apply hydraulic cement waterproof bond plaster or elastomeric polymer coating to stop external contaminated groundwater seepage.',
      },
    ],
    faqs_ur: [
      {
        question: 'پیشہ ورانہ واٹر ٹینک صفائی کا مکمل طریقہ کار کیا ہوتا ہے؟',
        answer:
          'ٹیم سبمرسیبل پمپ سے گندا پانی نکالتی ہے، ہائی پریشر واشر سے کائی اتارتی ہے، سلج ویکیوم سے کیچڑ صاف کرتی ہے، اور کلورین سے ٹینک کو جراثیم سے پاک کرتی ہے۔',
      },
      {
        question: 'زیرِ زمین اور چھت کی ٹینکی کتنے عرصے بعد صاف کروانی چاہیے؟',
        answer:
          'صحت کے ماہرین کے مطابق ٹینکی میں مٹی، کائی اور جراثیم سے بچاؤ کے لیے ہر 6 ماہ بعد ٹینک کی مکمل کیمیکل صفائی کروانا انتہائی ضروری ہے۔',
      },
      {
        question: 'کیمیکل صفائی کے بعد پانی کتنی دیر میں استعمال کے قابل ہوتا ہے؟',
        answer:
          'صفائی کے بعد ٹینک کو تازہ پانی سے اچھی طرح دھویا جاتا ہے، جس کے فوری بعد نیا پانی بھر کر نہانے، برتن دھونے اور گھریلو استعمال میں لایا جا سکتا ہے۔',
      },
      {
        question: 'کیا ٹینک کلینرز زیرِ زمین ٹینکی میں دراڑیں اور لیکیج بھی بند کرتے ہیں؟',
        answer:
          'جی ہاں، صفائی کے دوران خالی ٹینک میں دراڑیں چیک کی جاتی ہیں اور واٹر پروفنگ کیمیکل و سیمنٹ بانڈ لگا کر باہر کا گندا پانی اندر آنے سے روکا جاتا ہے۔',
      },
    ],
    faqs_ar: [
      {
        question: 'ما هي المراحل المتبعة في التنظيف والتعقيم الاحترافي لخزانات المياه؟',
        answer:
          'تبدأ بسحب المياه الراكدة بمضخات طرد، ثم فرك الجدران بمواد تعقيم مصرحة، وغسيل الزوايا بمكائن الضغط العالي، وشفط الرواسب، وأخيراً التطهير بالكلور بنسب آمنة.',
      },
      {
        question: 'كم مرة يُنصح بتنظيف خزانات المياه الأرضية والعلوية سنوياً؟',
        answer:
          'توصي الجهات الصحية بتنظيف وتعقيم الخزانات كل 6 أشهر لمنع تراكم الطحالب الخضراء، وتجمع البكتيريا، وترسب الأتربة والشوائب القادمة مع مياه الشبكة.',
      },
      {
        question: 'متى يمكن استخدام المياه بأمان بعد الانتهاء من عملية تنظيف الخزان؟',
        answer:
          'بعد شطف الخزان بالماء العذب وتفريغ ماء الغسيل بالكامل، يمكن ملء الخزان فوراً واستخدام المياه بأمان لكافة الأغراض المنزلية.',
      },
      {
        question: 'هل يمكن لفريق التنظيف كشف الشروخ وعزل الخرسانة الأرضية لمنع التسرب؟',
        answer:
          'نعم، يقوم الفريق بمعاينة الخزان بعد التجفيف وتطبيق معجون مائي عازل أو طبقة إيبوكسي معتمدة لمعالجة التشققات ومنع تسرب المياه الجوفية للخزان.',
      },
    ],
  },
  'fridge-repair': {
    intro_en:
      'Connect with certified refrigerator technicians for inverter fridge compressor replacements, R600a/R134a refrigerant gas refilling, and no-frost sensor repairs.',
    intro_ur:
      'ریفریجریٹر اور ڈیپ فریزر کی گیس چارجنگ، انورٹر کمپریسر کی تبدیلی، تھرموسٹیٹ اور ڈی فروسٹ فالٹس کے لیے مستند فریج ٹیکنیشنز سے واٹس ایپ پر رابطہ کریں۔',
    intro_ar:
      'تواصل مع فنيي صيانة الثلاجات والفريزر المعتمدين لتعبئة غاز R600a/R134a، استبدال ضواغط الإنفرتر، وإصلاح حساسات التبريد ومراوح الديفروست.',
    faqs_en: [
      {
        question: 'Why is the freezer compartment freezing ice while the lower fridge is warm?',
        answer:
          'This common no-frost refrigerator defect is caused by a blocked air damper duct, a burnt evaporator circulation fan motor, or a blown defrost heating element leaving coils choked with ice.',
      },
      {
        question: 'What causes a refrigerator compressor to get boiling hot and click off repeatedly?',
        answer:
          'Repetitive clicking indicates a damaged PTC starter relay, a weak motor start capacitor, or internal compressor mechanical seizure from low operating voltage.',
      },
      {
        question: 'How do technicians recharge R600a isobutane gas safely in inverter refrigerators?',
        answer:
          'Because R600a is flammable, certified technicians use lock-ring non-flame fittings or strict nitrogen purging before brazing, measuring gas charging precisely in grams with digital scales.',
      },
      {
        question: 'Can damaged or loose refrigerator magnetic door gaskets be repaired?',
        answer:
          'Yes, technicians either reshape warped magnetic rubber seals using heat gun therapy or replace brittle torn gaskets to eliminate warm air leaks and heavy frost buildup.',
      },
    ],
    faqs_ur: [
      {
        question: 'فریزر میں برف جمتی ہے مگر نیچے والے حصے میں کولنگ کیوں نہیں ہوتی؟',
        answer:
          'یہ خرابی نو فروسٹ فریج میں ڈی فروسٹ ہیٹر، تھرمل فیوز جل جانے، یا اوپر سے نیچے ٹھنڈی ہوا لانے والے فین اور ہوا کی نالی میں برف جمنے سے پیش آتی ہے۔',
      },
      {
        question: 'فریج کا کمپریسر شدید گرم ہو کر بار بار ٹک ٹک کی آواز کے ساتھ بند کیوں ہوتا ہے؟',
        answer:
          'کمپریسر کا بار بار ٹرپ ہونا پی ٹی سی اسٹارٹنگ ریلے جلنے، اوورلوڈ پروٹیکٹر کی خرابی، یا کم وولٹیج کی وجہ سے کمپریسر کے پسٹن جام ہونے کی علامت ہے۔',
      },
      {
        question: 'انورٹر فریج میں R600a گیس بھرتے وقت کن باتوں کا خیال رکھا جاتا ہے؟',
        answer:
          'چونکہ R600a ایک حساس گیس ہے اس لیے مستند کاریگر نائٹروجن سے سسٹم فلش کر کے بغیر شعلے کے کپلنگ کا استعمال کرتے ہیں اور گرام کے حساب سے درست گیس چارج کرتے ہیں۔',
      },
      {
        question: 'کیا فریج کے دروازے کی ڈھیلی یا پھٹی ہوئی ربڑ (گاسکیٹ) تبدیل ہو جاتی ہے؟',
        answer:
          'جی ہاں، اگر ربڑ سخت ہو تو گرم پانی یا ہیٹ سے سیدھی کی جا سکتی ہے، یا نئی میگنیٹک ربڑ لگا کر دروازے کی ایئر ٹائٹ فٹنگ بحال کر دی جاتی ہے۔',
      },
    ],
    faqs_ar: [
      {
        question: 'لماذا يُجمّد الفريزر العلوي بكفاءة بينما الثلاجة السفلية لا تبرد؟',
        answer:
          'يرجع هذا العطل الشائع في ثلاجات النوفروست إلى انسداد مجرى الهواء بالثلج بسبب تلف سخان إذابة الثلج (Defrost)، أو توقف مروحة توزيع الهواء الداخلية.',
      },
      {
        question: 'ما سبب سخونة كمبروسر الثلاجة وصدور صوت تكة متكررة مع انقطاع التشغيل؟',
        answer:
          'يدل صوت التكة على تلف ريليه البدء (PTC Relay)، أو ضعف مكثف التشغيل، أو تجيم مكبس الضاغط نتيجة تذبذب الجهد الكهربائي وضعف التغذية.',
      },
      {
        question: 'كيف تتم تعبئة غاز R600a بأمان في ثلاجات الإنفرتر الحديثة؟',
        answer:
          'نظراً لخصائص غاز R600a، يستخدم الفنيون المعتمدون موازين إلكترونية لشحن الغاز بالجرام بدقة متناهية مع تفريغ الهواء بالفاكيوم واستخدام توصيلات آمنة.',
      },
      {
        question: 'هل يمكن صيانة أو استبدال كاوتش (إطار) باب الثلاجة المغناطيسي؟',
        answer:
          'نعم، يقوم الفني بإعادة تليين الإطار المغناطيسي بالحرارة، أو استبداله بإطار أصلي جديد لمنع تسرب الهواء البارد وتكون الرطوبة المفرطة.',
      },
    ],
  },
  'washing-machine-repair': {
    intro_en:
      'Hire specialized technicians for automatic front-load and top-load washing machine repairs, drain pump blockages, drum noise bearings, and digital PCB error code troubleshooting.',
    intro_ur:
      'آٹومیٹک اور سیمی آٹومیٹک واشنگ مشین کی مرمت، ڈرین پمپ، ڈرم بیرنگ، موٹر بیلٹ اور سرکٹ بورڈ ایرر کوڈز کے حل کے لیے ماہر واشنگ مشین مکینک سے رابطہ کریں۔',
    intro_ar:
      'احجز فنيي صيانة غسالات الملابس الأوتوماتيكية ذات الفتحة العلوية والأمامية، استبدال طلمبات التصريف، رولمان بلي الحلة، وبرمجة كروت التحكم.',
    faqs_en: [
      {
        question: 'Why does my automatic washing machine show OE / 5E error and refuse to drain water?',
        answer:
          'The OE/5E code signifies water drainage failure, typically caused by a jammed foreign coin or hair-pin in the drain filter pump impeller, or a burnt drain pump motor coil.',
      },
      {
        question: 'What causes violent shaking, banging, and walking during the high-speed spin cycle?',
        answer:
          'Violent shaking is caused by worn hydraulic tub shock absorber dampers, snapped balance suspension springs, or disintegrated stainless steel drum spider bearings.',
      },
      {
        question: 'Why does my washing machine take in water continuously even when switched off?',
        answer:
          'Continuous unmetered water intake happens when the electromagnetic water inlet solenoid valve gets stuck open due to calcium sediment, requiring valve replacement.',
      },
      {
        question: 'Can technicians repair electronic PCB controller board errors (dE, LE, PE)?',
        answer:
          'Yes, technicians replace door interlock switches (dE error), repair motor hall sensors (LE error), and replace faulty water level pressure transducers (PE error) directly on-site.',
      },
    ],
    faqs_ur: [
      {
        question: 'آٹومیٹک واشنگ مشین میں OE یا 5E ایرر آنے اور پانی نہ نکلنے کی کیا وجہ ہے؟',
        answer:
          'یہ ایرر پانی خارج نہ ہونے پر آتا ہے، جس کی وجہ ڈرین پمپ کے نیچے سکے یا دھاگے پھنسنا، یا پانی نکالنے والے پمپ کی موٹر جل جانا ہوتی ہے۔',
      },
      {
        question: 'اسپن سائیکل میں واشنگ مشین کے بہت زیادہ ہلنے اور کھڑ کھڑ کی آواز کی کیا وجہ ہے؟',
        answer:
          'تیز گھومنے پر مشین کے اچھلنے کی وجہ نیچے لگے شاکس (Dampers) کا ختم ہونا، ڈرم کے اسپرنگ ٹوٹنا، یا ڈرم کے اندرونی بیرنگ کا کٹ جانا ہے۔',
      },
      {
        question: 'واشنگ مشین بند ہونے کے باوجود اندر پانی کیوں بھرتا رہتا ہے؟',
        answer:
          'مشین میں ہر وقت پانی بھرنے کی وجہ واٹر انلیٹ والو کا کچرا آنے سے کھلا رہ جانا ہے، جسے نیا لگا کر مسئلہ فوری حل کیا جاتا ہے۔',
      },
      {
        question: 'کیا واشنگ مشین کے کارڈ اور ایرر کوڈز (dE, LE, PE) کی مرمت سائٹ پر ہو جاتی ہے؟',
        answer:
          'جی ہاں، دروازے کے سوئچ (dE)، موٹر سینسر (LE)، اور واٹر لیول سینسر (PE) کے فالٹس ماہر ٹیکنیشن گھر پر پارٹس تبدیل کر کے درست کر دیتے ہیں۔',
      },
    ],
    faqs_ar: [
      {
        question: 'ما سبب ظهور رمز الخطأ OE أو 5E وعدم تصريف المياه في الغسالة الأوتوماتيكية؟',
        answer:
          'يشير هذا الرمز إلى تعطل تفريغ الماء، وغالباً بسبب انحشار عملات معدنية أو ألياف في فلتر طلمبة الطرد، أو احتراق محرك مضخة التصريف.',
      },
      {
        question: 'ما سبب الاهتزاز العنيف وصوت الخبط القوي أثناء مرحلة العصر والتجفيف؟',
        answer:
          'ينتج الاهتزاز عن تلف مساعدات التثبيت الهيدروليكية (المساعدين)، أو انكسار زنبركات التعليق، أو تآكل رولمان بلي الحلة الداخلية (البيرينج).',
      },
      {
        question: 'لماذا تستمر الغسالة في سحب المياه دون توقف حتى عند إيقاف تشغيلها؟',
        answer:
          'يرجع ذلك إلى تلف صمام دخول المياه الكهرومغناطيسي (Inlet Valve) وبقائه مفتوحاً بسبب الترسبات الجيرية، ويجب استبداله بقطعة جديدة.',
      },
      {
        question: 'هل يمكن إصلاح أعطال اللوحة الإلكترونية وأكواد الأعطال (dE, LE, PE)؟',
        answer:
          'نعم، يقوم الفني بإصلاح حساس قفل الباب (dE)، أو فحص حساس دوران المحرك (LE)، واستبدال مفتاح ضغط مستوى الماء (PE) في المنزل مباشرة.',
      },
    ],
  },
  'geyser-repair': {
    intro_en:
      'Connect with verified geyser technicians for instant gas geyser thermostat repairs, electric water heater immersion element replacements, and annual pre-winter descaling.',
    intro_ur:
      'انسٹنٹ گیس گیزر کے سیل و سرکٹ، الیکٹرک گیزر کے راڈ و تھرموسٹیٹ کی تبدیلی اور ٹینک لیکیج ویلڈنگ کے لیے تجربہ کار گیزر مکینکس سے رابطہ کریں۔',
    intro_ar:
      'تواصل مع فنيي صيانة سخانات المياه الغازية والكهربائية الفورية، استبدال شمعات التسخين، ضبط منظم الحرارة الثرموستات، ومعالجة ترسبات الأملاح.',
    faqs_en: [
      {
        question: 'Why does my instant gas geyser spark and click without lighting the main burner flame?',
        answer:
          'Clicking without ignition usually indicates dead dry cell batteries, a hardened water pressure rubber diaphragm, or a jammed electromagnetic gas solenoid valve.',
      },
      {
        question: 'Why is my electric water heater geyser not heating water despite the red light turning on?',
        answer:
          'A functioning indicator with cold water means the heavy-duty copper immersion heating element has burnt out from lime-scale accumulation or the manual reset safety thermal cutout has tripped.',
      },
      {
        question: 'Can geyser storage tanks that leak rusty water from bottom seams be repaired?',
        answer:
          'If the internal galvanized or enameled steel tank has corroded through, technicians inspect if seam welding is viable, but strongly recommend tank replacement if structural integrity is compromised.',
      },
      {
        question: 'Why is regular servicing and safety pressure relief valve inspection essential?',
        answer:
          'The safety pressure relief valve prevents dangerous steam pressure explosions in storage geysers. Annual pre-winter descaling clears calcium buildup from burner nozzles and heating rods.',
      },
    ],
    faqs_ur: [
      {
        question: 'انسٹنٹ گیس گیزر میں ٹک ٹک کی آواز آتی ہے مگر آگ کیوں نہیں جلتی؟',
        answer:
          'اس کی عام وجہ گیزر کے سیل (بیٹریاں) ختم ہونا، پانی کے پریشر والی ربڑ ڈایافرام کا پھٹنا، یا گیس کو آن کرنے والا میگنیٹ والو جام ہونا ہے۔',
      },
      {
        question: 'الیکٹرک گیزر کی بتی جلتی ہے مگر پانی گرم کیوں نہیں ہوتا؟',
        answer:
          'اگر لائٹ جل رہی ہو مگر پانی ٹھنڈا رہے تو اس کا مطلب ہے کہ نمکیات جمنے سے گیزر کا ہیٹنگ راڈ (Element) جل چکا ہے یا سیفٹی تھرموسٹیٹ ٹرپ ہو گیا ہے۔',
      },
      {
        question: 'کیا گیزر کی زنگ آلود اور ٹپکتی ہوئی لوہے کی ٹینکی ویلڈ ہو سکتی ہے؟',
        answer:
          'اگر ٹینکی میں معمولی لیکیج ہو تو پیتل یا برقی ویلڈنگ سے مرمت کی جا سکتی ہے، لیکن اگر زنگ سے لوہا باریک ہو چکا ہو تو نئی ٹینکی لگوانا زیادہ محفوظ ہے۔',
      },
      {
        question: 'سردیوں سے پہلے گیزر کی سروس اور سیفٹی والو چیک کروانا کیوں ضروری ہے؟',
        answer:
          'سیفٹی والو گیزر میں زیادہ پریشر بننے پر دھماکے سے بچاتا ہے۔ سالانہ سروس سے برنر صاف ہو جاتا ہے، گیس کا دھواں ختم ہوتا ہے اور گیس کی بچت ہوتی ہے۔',
      },
    ],
    faqs_ar: [
      {
        question: 'ما سبب شرز الإشعال الذاتي في سخان الغاز الفوري دون اشتعال الشعلة الرئيسية؟',
        answer:
          'يرجع ذلك عادة إلى ضعف حجارة البطارية، أو تلف جلدة الرداخ (الدايافرام) المسؤولة عن تحسس ضغط الماء، أو انسداد صمام الغاز الكهرومغناطيسي.',
      },
      {
        question: 'لماذا تضيء لمبة السخان الكهربائي دون أن يسخن الماء؟',
        answer:
          'إضاءة المؤشر مع بقاء الماء بارداً تشير إلى احتراق شمعة التسخين (الهيتر) بسبب تراكم الأملاح الكلسية، أو فصل قاطع الحماية الحرارية (الثرموستات).',
      },
      {
        question: 'هل يمكن لحام خزان السخان عند تسريب مياه مصحوبة بصدأ من القاع؟',
        answer:
          'يمكن إجراء لحام موضعي للشروخ البسيطة، لكن إذا كان جسم الخزان متآكلاً بالصدأ المفرط فيُوصى باستبداله فوراً لتجنب حوادث التسريب والماس الكهربائي.',
      },
      {
        question: 'ما أهمية فحص صمام الأمان (رداد الضغط) وتنظيف السخان دورياً؟',
        answer:
          'يعمل صمام الأمان على تنفيس ضغط البخار الزائد لمنع انفجار السخان، بينما يحافظ التنظيف السنوي على كفاءة التسخين ويقلل استهلاك الكهرباء والغاز.',
      },
    ],
  },
  'aluminium-glass-worker': {
    intro_en:
      'Find experienced aluminium and glass fabricators for sliding window track repairs, tempered glass bathroom shower partitions, double-glazed soundproof glass, and insect screens.',
    intro_ur:
      'ایلومینیم سلائیڈنگ کھڑکیوں، ٹیمپرڈ گلاس شاور پارٹیشن، ڈبل گلیز ساؤنڈ پروف شیشوں اور مچھر جالی کے فریمز کے لیے ماہر ایلومینیم فیبریکیٹرز سے رابطہ کریں۔',
    intro_ar:
      'استعن بفنيي تركيب الألمنيوم والزجاج لتفصيل النوافذ السحابة، كبائن الشاور الزجاجية المقسّاة (سيكوريت)، الزجاج المزدوج العازل للصوت، وشبك الحشرات.',
    faqs_en: [
      {
        question: 'Why do sliding aluminium windows get stuck or jump off the lower track?',
        answer:
          'Sticking occurs when dirt chokes the bottom rail or the nylon/brass bearing rollers wear out. Fabricators unmount the sash, replace roller wheels, and align track locks.',
      },
      {
        question: 'What glass thickness is recommended for bathroom shower cabins?',
        answer:
          'Bathroom shower enclosures require 8mm to 10mm toughened safety tempered glass (Securit) with stainless steel 304 waterproof wall hinges and magnetic anti-leak seals.',
      },
      {
        question: 'How do double-glazed acoustic windows reduce outside street traffic noise?',
        answer:
          'Double glazing bonds two glass panes separated by an airtight desiccated aluminum spacer filled with vacuum or argon gas, blocking up to 70% of external noise and heat transfer.',
      },
      {
        question: 'Can stainless steel mosquito wire mesh be retrofitted into existing windows?',
        answer:
          'Yes, fabricators custom-build sliding or fixed insect screen aluminum sash inserts fitted with heavy-duty SS 304 wire mesh that resists pet scratching and rust.',
      },
    ],
    faqs_ur: [
      {
        question: 'ایلومینیم کی کھڑکیاں جام کیوں ہو جاتی ہیں اور ان کا کیا حل ہے؟',
        answer:
          'کھڑکی کے اٹکنے کی وجہ نیچے کی ٹریک پر مٹی جمنا یا پہیوں (Roller Wheels) کا ٹوٹنا ہے۔ کاریگر کھڑکی اتار کر نئے بیئرنگ والے پہیے لگا کر ٹریک درست کر دیتے ہیں۔',
      },
      {
        question: 'باتھ روم کے شاور کیبن کے لیے کون سا شیشہ لگانا محفوظ رہتا ہے؟',
        answer:
          'باتھ روم کے لیے 8 یا 10 ایم ایم کا ٹیمپرڈ گلاس (سیکورٹ شیشہ) استعمال ہوتا ہے جو چوٹ لگنے پر محفوظ رہتا ہے اور واٹر پروف اسٹیل ہینڈلز کے ساتھ لگایا جاتا ہے۔',
      },
      {
        question: 'ڈبل گلیز شیشہ ٹریفک کا شور اور گرمی کیسے روکتا ہے؟',
        answer:
          'ڈبل گلیزنگ میں دو شیشوں کے درمیان خلاء رکھ کر گیس یا ویکیوم پیدا کیا جاتا ہے، جس سے 70 فیصد تک باہر کا شور، دھوپ اور گرمی کمرے میں نہیں آ پاتی۔',
      },
      {
        question: 'کیا پرانی کھڑکیوں میں مچھر اور مکھی روکنے والی جالی لگ سکتی ہے؟',
        answer:
          'جی ہاں، ایلومینیم کاریگر موجودہ فریم کے مطابق سلائیڈنگ یا الگ فریم والی اسٹیل جالی تیار کر کے لگا دیتے ہیں جو زنگ سے محفوظ رہتی ہے۔',
      },
    ],
    faqs_ar: [
      {
        question: 'ما سبب ثقل حركة النوافذ السحابة وخروجها من المسار السفلي؟',
        answer:
          'يحدث ذلك بسبب تراكم الأتربة في المجرى السفلي أو تآكل كفرات الرولمان بلي (العجلات). يقوم الفني برفع الدلفة واستبدال العجلات بقطع نحاسية أو نايلون أصلية.',
      },
      {
        question: 'ما هو سمك الزجاج الموصى به لكبائن الشاور وفواصل الحمامات؟',
        answer:
          'يُوصى باستخدام زجاج سيكوريت مقسّى بسمك 8 إلى 10 ملم المقاوم للكسر، مع مفصلات وإكسسوارات ستانلس ستيل 304 المقاومة للصدأ وجلود مانعة للماء.',
      },
      {
        question: 'كيف يقلل الزجاج المزدوج (الدبل جلاس) من ضوضاء الشارع وحرارة الشمس؟',
        answer:
          'يتكون من طبقتي زجاج بينهما فراغ هوائي عازل مفرغ، مما يخمد الموجات الصوتية بنسبة تصل إلى 70% ويعزل الحرارة صيفاً وشتاءً بكفاءة عالية.',
      },
      {
        question: 'هل يمكن تركيب شبك سلك مانع للحشرات على النوافذ القائمة؟',
        answer:
          'نعم، يقوم فنيو الألمنيوم بتفصيل أطر شبك سحاب أو ثابت باستخدام سلك ستانلس ستيل قوي مقاوم للتمزق والصدأ يركب على النوافذ الحالية بسهولة.',
      },
    ],
  },
  welder: {
    intro_en:
      'Hire mobile on-site welders for main entry iron gates, staircase steel railings, window security grills, and structural steel roof shed fabrications.',
    intro_ur:
      'مین اینٹرنس گیٹ، سیڑھیوں کی اسٹیل ریلنگ، کھڑکیوں کی سیفٹی گرلز اور شیڈ کی ویلڈنگ کے لیے آن سائٹ ویلڈرز سے واٹس ایپ پر رابطہ کریں۔',
    intro_ar:
      'احجز حدادين متنقلين لأعمال اللحام في الموقع، تصنيع أبواب الحديد الخارجية، درابزين السلالم الاستانلس ستيل، حمايات النوافذ، ومظلات السيارات.',
    faqs_en: [
      {
        question: 'Do welders provide on-site repair services for broken hinges and gates?',
        answer:
          'Yes, welders carry portable inverter ARC/MIG welding machines and power generators to re-attach snapped gate hinges, repair cracked grills, and reinforce security door latches on-site.',
      },
      {
        question: 'What is the best way to prevent wrought iron gates and grills from rusting?',
        answer:
          'Welders grind away surface slag, wipe surfaces with thinner, and apply 2 coats of zinc chromate red oxide anti-rust primer before spraying glossy synthetic enamel topcoats.',
      },
      {
        question: 'What is the durability difference between Stainless Steel (SS 304) and Mild Steel (MS)?',
        answer:
          'SS 304 grade stainless steel contains nickel and chromium that never rusts outdoors, whereas MS (iron) requires periodic anti-rust painting but offers heavy structural strength at lower initial cost.',
      },
      {
        question: 'How do welders fix a heavy main gate that drags and scrapes on the driveway?',
        answer:
          'Welders jack up the gate, replace worn ball-bearing barrel hinges, reinforce the sagging pillar mounting brackets, and adjust bottom clearance to swing smoothly.',
      },
    ],
    faqs_ur: [
      {
        question: 'کیا ویلڈر گھر آ کر ٹوٹے ہوئے گیٹ اور کنڈے کی ویلڈنگ کرتے ہیں؟',
        answer:
          'جی ہاں، ویلڈرز کے پاس پورٹیبل انورٹر ویلڈنگ مشین ہوتی ہے جس سے وہ گھر کے دروازوں کے ٹوٹے قبضے، کھڑکیوں کی گرلز اور تالے کے کنڈے موقع پر ویلڈ کر دیتے ہیں۔',
      },
      {
        question: 'لوہے کے گیٹ اور گرلز کو زنگ لگنے سے کیسے بچایا جا سکتا ہے؟',
        answer:
          'ویلڈنگ کے بعد جوائنٹس کو گرائنڈر سے صاف کیا جاتا ہے اور دو کوٹ ریڈ آکسائیڈ اینٹی رسٹ پرائمر لگایا جاتا ہے جس کے بعد معیاری اینامل پینٹ زنگ سے مکمل بچاتا ہے۔',
      },
      {
        question: 'اسٹین لیس اسٹیل (SS 304) اور عام لوہے کی ریلنگ میں کیا فرق ہے؟',
        answer:
          'اسٹیل 304 لائف ٹائم زنگ سے محفوظ رہتا ہے اور ہمیشہ چمکتا رہتا ہے، جبکہ عام لوہا سستا تو ہوتا ہے مگر ہر سال دو سال بعد پینٹ کروانا لازمی ہوتا ہے۔',
      },
      {
        question: 'بھاری مین گیٹ اگر فرش پر رگڑ کھانے لگے تو اسے کیسے درست کیا جاتا ہے؟',
        answer:
          'ویلڈر گیٹ کو جیک کی مدد سے اٹھا کر پرانے گھسے ہوئے قبضے اور بیرنگ تبدیل کرتے ہیں اور ستون کی مضبوط سپورٹ ویلڈ کر کے گیٹ کی سیدھ نکالتے ہیں۔',
      },
    ],
    faqs_ar: [
      {
        question: 'هل يقدم الحداد خدمات اللحام المتنقل لإصلاح الأبواب والمفصلات في الموقع؟',
        answer:
          'نعم، يمتلك الحدادون ماكينات لحام كهربائية متنقلة لإصلاح مفصلات الأبواب المكسورة، وتثبيت أقفال الحماية، وتدعيم درابزين السلالم في موقع العميل مباشرة.',
      },
      {
        question: 'كيف تتم حماية بوابات وشبابيك الحديد المشغول من الصدأ والتآكل؟',
        answer:
          'يقوم الفني بصنفرة اللحام وإزالة الخبث، ثم دهان طبقتين من برايمر أكسيد الحديد المقاوم للصدأ (Red Oxide) قبل دهان طبقة اللاكيه النهائية المقاومة للرطوبة.',
      },
      {
        question: 'ما الفرق بين درابزين الاستانلس ستيل (SS 304) والحديد المطاوع (MS)؟',
        answer:
          'الستانلس ستيل 304 يتميز بمقاومة تامة للصدأ ولمعان دائم دون حاجة لدهان، بينما الحديد يتميز بصلابة هيكلية عالية وقابلية لتشكيل الزخارف مع تكلفة أقل.',
      },
      {
        question: 'كيف يعالج الحداد هبوط البوابة الرئيسية واحتكاكها بأرضية المدخل؟',
        answer:
          'يقوم الحداد برفع البوابة بالرافعة، وتغيير مفصلات الجلب والرمان بلي التالفة، وإعادة تلحيم وتثبيت قوائم التثبيت في الجدار لتتحرك البوابة بسلاسة تامة.',
      },
    ],
  },
  mason: {
    intro_en:
      'Connect with master masons for ceramic floor and porcelain tile fixing, bathroom slope waterproofing, plastering repairs, and brick/block masonry work.',
    intro_ur:
      'ٹائل اور ماربل کی فٹنگ، باتھ روم فرش کی واٹر پروفنگ و ڈھلان، پلستر اور اینٹوں کی چنائی کے لیے مستند راج مستری سے واٹس ایپ پر رابطہ کریں۔',
    intro_ar:
      'تواصل مع معلمين بناء وبلاط محترفين لتركيب السيراميك والبورسلان، عزل أرضيات الحمامات وضبط الميول، اللياسة، وبناء البلوك والخرسانة.',
    faqs_en: [
      {
        question: 'What is the advantage of polymer tile adhesive (bond) over traditional cement mortar?',
        answer:
          'Polymer tile bond provides superior flexible adhesion for non-porous large porcelain tiles, preventing hollow sound spots, de-bonding, and tile cracking under temperature variations.',
      },
      {
        question: 'How do masons fix reverse water pooling slopes on bathroom floors and rooftops?',
        answer:
          'Masons strip the affected floor tiles, re-establish correct laser level gradients towards drainage outlets using polymer sand bedding, apply waterproof membranes, and re-tile with waterproof grout.',
      },
      {
        question: 'Can loose or hollow-sounding floor tiles be repaired without breaking adjacent tiles?',
        answer:
          'Yes, masons either inject low-viscosity epoxy resin through drilled grout lines or delicately lift loose tiles with suction cups to re-lay with fresh bond without chipping surrounding tiles.',
      },
      {
        question: 'How do masons repair deep settling cracks across plastered brick walls?',
        answer:
          'Masons chisel V-grooves along cracks, anchor galvanized wire expansion mesh across the fracture, and fill with non-shrink structural polymer cement mortar before smooth plaster finishing.',
      },
    ],
    faqs_ur: [
      {
        question: 'پورسلین ٹائلیں لگانے کے لیے ٹائل بانڈ اور روایتی سیمنٹ میں کیا فرق ہے؟',
        answer:
          'بڑی پورسلین ٹائلیں سیمنٹ کو نہیں پکڑتیں۔ پولیمر ٹائل بانڈ لچکدار اور مضبوط گرفت فراہم کرتا ہے جس سے ٹائلیں اندر سے کھوکھلی نہیں ہوتیں اور اکھڑتی نہیں ہیں۔',
      },
      {
        question: 'باتھ روم اور چھت پر الٹی ڈھلان کی وجہ سے پانی کھڑا ہونے کا کیا حل ہے؟',
        answer:
          'راج مستری پرانی ٹائلیں ہٹا کر لیول کے ذریعے پرنالے یا ڈرین کی طرف نئی ڈھلان بناتے ہیں، نیچے کیمیکل واٹر پروفنگ کرتے ہیں اور نئی ٹائلیں لگا کر لیکیج ختم کرتے ہیں۔',
      },
      {
        question: 'کیا ہلی ہوئی ٹائل کو ساتھ والی ٹائلوں کو توڑے بغیر دوبارہ لگایا جا سکتا ہے؟',
        answer:
          'جی ہاں، ماہر مستری ویکیوم کٹر کے ذریعے گروٹ ہٹا کر احتیاط سے ہلی ہوئی ٹائل اٹھا لیتے ہیں اور نیا بانڈ لگا کر بغیر نقصان کے دوبارہ فکس کر دیتے ہیں۔',
      },
      {
        question: 'دیواروں کے اندر گہری دراڑوں اور پلستر کی خرابی کو کیسے ٹھیک کیا جاتا ہے؟',
        answer:
          'مستری دراڑ کو چوڑا کر کے اس پر لوہے کی باریک جالی لگاتے ہیں اور نان شرنک سیمنٹ بھر کر پلستر کرتے ہیں تاکہ پینٹ کے بعد دراڑ دوبارہ ظاہر نہ ہو۔',
      },
    ],
    faqs_ar: [
      {
        question: 'ما هي ميزة استخدام غراء البلاط (البوند) مقارنة بالمونة الإسمنتية التقليدية؟',
        answer:
          'يوفر غراء البلاط البوليمري التصاقاً قوياً لبلاط البورسلان قليل المسامية، ويمنع تطبيل البلاط وفككه نتيجة التمدد الحراري وحركة المبنى الطبيعية.',
      },
      {
        question: 'كيف يعالج معلم البلاط مشكلة الميول المعكوسة وتجمع المياه في الحمامات؟',
        answer:
          'يقوم المعلم بإزالة البلاط القديم وإعادة ضبط مناسيب الميول باتجاه صفاية التصريف باستخدام الليزر، مع تطبيق عازل مائي قبل إعادة التبليط وترويب الفواصل.',
      },
      {
        question: 'هل يمكن تثبيت البلاط المطبل أو المفكوك دون كسر البلاط المجاور؟',
        answer:
          'نعم، يقوم المعلم بتفريغ الترويبة المحيطة واستخراج البلاطة بحذر باستخدام شفاطات الزجاج ثم تنظيف القاعدة وإعادة لصقها بالغراء دون إتلاف ما حولها.',
      },
      {
        question: 'كيف تتم معالجة الشروخ العميقة في الجدران والصبات الإسمنتية؟',
        answer:
          'يتم تفتيح الشرخ على شكل حرف V وتثبيت شبك فايبر جلاس أو حديدي مع ملء الفراغ بمونة إيبوكسية غير قابلة للانكماش قبل تطبيق اللياسة النهائية الناعمة.',
      },
    ],
  },
  'pest-control': {
    intro_en:
      'Connect with licensed pest control specialists for pre-construction and post-construction termite drilling barrier treatments, cockroach gel baiting, and bed bug fumigation.',
    intro_ur:
      'دیمک کے خاتمے کے لیے ڈرلنگ اسپرے، کاکڑوچ جیل ٹریٹمنٹ اور کھٹمل فیومیگیشن کے لیے تصدیق شدہ پیسٹ کنٹرول ماہرین سے واٹس ایپ پر رابطہ کریں۔',
    intro_ar:
      'احجز شركات مكافحة الحشرات المعتمدة لرش النمل الأبيض (الأرضة) بحقن التربة، مكافحة الصراصير بالجيل الألماني، وإبادة بق الفراش بالبخار والمبيدات الآمنة.',
    faqs_en: [
      {
        question: 'What is the warranty and method for post-construction termite proofing?',
        answer:
          'Specialists drill small perimeter holes along baseboards and door frames, inject pressurized termiticide chemical barriers into the foundation soil, and provide written 3 to 5-year guarantees.',
      },
      {
        question: 'How does odorless cockroach gel baiting eliminate entire colonies?',
        answer:
          'Targeted food-grade cockroach gel is placed in concealed cabinet hinges. Foraging roaches consume the bait, return to nests, and transfer the active ingredient via the domino effect to wipe out the colony.',
      },
      {
        question: 'What safety precautions are required for kids and pets during bed bug fumigation?',
        answer:
          'For thermal and chemical bed bug sprays, residents and pets should vacate the premises for 4 to 6 hours. Cleaners air out rooms upon return, and children beds are safe to use that evening.',
      },
      {
        question: 'How should homeowners prepare their kitchen before pest control spray?',
        answer:
          'Cover all open food, spices, and cutlery inside plastic bins or the refrigerator, empty lower kitchen sink cabinets, and leave baseboards accessible for targeted application.',
      },
    ],
    faqs_ur: [
      {
        question: 'گھر میں دیمک کے خاتمے کے لیے ڈرلنگ اسپرے کا کیا طریقہ اور وارنٹی ہے؟',
        answer:
          'ماہرین دیواروں اور دروازوں کی چوکھٹوں کے ساتھ چھوٹے سوراخ کر کے ہائی پریشر سے دیمک کش کیمیکل داخل کرتے ہیں جس کی 3 سے 5 سال کی تحریری وارنٹی دی جاتی ہے۔',
      },
      {
        question: 'کاکڑوچ جیل ٹریٹمنٹ کیسے کام کرتا ہے اور کیا اس کی کوئی بو ہوتی ہے؟',
        answer:
          'یہ جیل بالکل بے بو ہوتی ہے۔ الماریوں اور درازوں کے کونوں میں لگائی جاتی ہے۔ کاکڑوچ اسے کھا کر اپنے بلوں میں جاتے ہیں جس سے پوری کالونی چند دنوں میں ختم ہو جاتی ہے۔',
      },
      {
        question: 'کھٹمل مار اسپرے کے دوران بچوں اور پالتو جانوروں کی حفاظت کیسے کی جائے؟',
        answer:
          'کھٹمل کے اسپرے کے وقت گھر کو 4 سے 6 گھنٹے بند رکھا جاتا ہے۔ واپسی پر کھڑکیاں کھول کر ہوا کا اخراج کیا جاتا ہے جس کے بعد بچے اور پالتو جانور محفوظ رہتے ہیں۔',
      },
      {
        question: 'کچن میں اسپرے کروانے سے پہلے کیا تیاریاں کرنی چاہئیں؟',
        answer:
          'کھانے پینے کی تمام کھلی اشیاء، برتن اور مصالحے پلاسٹک بیگز میں یا فریج میں رکھ لیں، اور کیبنٹس کے نچلے حصے خالی کر دیں تاکہ دوائی ہر کونے تک پہنچ سکے۔',
      },
    ],
    faqs_ar: [
      {
        question: 'ما هي طريقة وضمان مكافحة النمل الأبيض (الأرضة) بالحقن للمنازل القائمة؟',
        answer:
          'يقوم الفنيون بحفر ثقوب صغيرة ودقيقة في زوايا الأرضيات وحلوق الأبواب، وحقن مبيد النمل الأبيض بضغط هيدروليكي في التربة مع تقديم ضمان خطي من 3 إلى 5 سنوات.',
      },
      {
        question: 'كيف يقضي الجيل الألماني عديم الرائحة على مستعمرات الصراصير نهائياً؟',
        answer:
          'يتم توزيع نقاط جيل صغيرة في زوايا المطابخ والأجهزة. تتغذى الصراصير على الطُعم وتنقل المادة الفعالة لداخل الأعشاش مما يقضي على البيض واليرقات بالكامل.',
      },
      {
        question: 'ما هي الاحتياطات الواجب اتخاذها للأطفال والحيوانات الأليفة عند رش بق الفراش؟',
        answer:
          'يجب إخلاء المنزل لمدة 4 إلى 6 ساعات أثناء الرش. وعند العودة تُفتح النوافذ للتهوية، وتكون الأسطح والمراتب آمنة تماماً للاستخدام المسائي دون أي خطر.',
      },
      {
        question: 'كيف يجب تجهيز المطبخ قبل زيارة فريق مكافحة الحشرات والرش؟',
        answer:
          'يُفضل تغطية الأطعمة المفتوحة والأواني، وإفراغ الدواليب السفلية تحت حوض الغسيل، وتسهيل الوصول للزوايا ومجاري التغذية لضمان وصول المبيد لأماكن الاختباء.',
      },
    ],
  },
  'sofa-carpet-cleaning': {
    intro_en:
      'Hire on-site deep upholstery cleaning services for sofa shampooing, wall-to-wall carpet steam extraction, dining chair fabric stain removals, and mattress sanitization.',
    intro_ur:
      'گھر پر صوفہ، قالین اور گدوں کی جدید کیمیکل اور اسٹیم واشنگ، گہرے داغ دھبوں کے خاتمے اور فوری خشک کرنے والی سروسز کے لیے واٹس ایپ پر رابطہ کریں۔',
    intro_ar:
      'تواصل مع متخصصي غسيل وتطهير الكنب والسجاد في المنزل بتقنية الحقن واستخلاص البخار، إزالة البقع الصعبة، وتعقيم المراتب من البكتيريا وحشرات الفراش.',
    faqs_en: [
      {
        question: 'How does on-site injection-extraction sofa and carpet shampooing work?',
        answer:
          'Cleaners spray eco-friendly fabric cleaning solution under pressure to break down dirt and grease, scrub fibers gently with rotary brushes, and extract 95% of moisture and loosened grime simultaneously.',
      },
      {
        question: 'How long does it take for a washed sofa or carpet to dry completely?',
        answer:
          'Because industrial vacuum suction removes almost all liquid, cleaned sofas and carpets dry completely within 3 to 5 hours with regular ceiling fan ventilation and open room airflow.',
      },
      {
        question: 'Can stubborn stains like tea, oil, and pet urine odors be completely removed?',
        answer:
          'Yes, technicians pre-treat spots with specialized enzymatic spotters to dissolve deep organic stains, followed by antibacterial deodorizers that neutralize pet odor at the root.',
      },
      {
        question: 'Is fabric shampooing safe for delicate velvet, suede, and jacquard fabrics?',
        answer:
          'Yes, professional cleaners perform a fabric color-fastness patch test and adjust pH-balanced chemical formulations to prevent color bleeding or fiber shrinkage on delicate upholstery.',
      },
    ],
    faqs_ur: [
      {
        question: 'گھر پر صوفہ اور قالین کی مشین کے ذریعے کیمیکل واشنگ کا طریقہ کیا ہے؟',
        answer:
          'ٹیم مخصوص صوفہ واشنگ مشین سے شیمپو اور پانی کا اسپرے کرتی ہے، نرم برش سے میل کچیل اتارتی ہے، اور ویکیوم پمپ کے ذریعے 95 فیصد گندا پانی فوری کھینچ لیتی ہے۔',
      },
      {
        question: 'دھلائی کے بعد صوفہ یا قالین سوکھنے میں کتنا وقت لیتا ہے؟',
        answer:
          'چونکہ مشین سارا گیلا پن فوری چوس لیتی ہے، اس لیے پنکھا چلانے پر صوفہ یا قالین 3 سے 5 گھنٹے کے اندر مکمل خشک اور استعمال کے لیے تیار ہو جاتا ہے۔',
      },
      {
        question: 'کیا چائے، چکنائی اور بچوں یا پالتو جانوروں کے داغ اور بدبو ختم ہو جاتی ہے؟',
        answer:
          'جی ہاں، ضدی داغوں پر خصوصی اسٹین ریموور کیمیکل لگایا جاتا ہے اور اینٹی بیکٹیریل اسپرے کے ذریعے بدبو کو جڑ سے ختم کر دیا جاتا ہے۔',
      },
      {
        question: 'کیا ویلوٹ اور نازک کپڑے کے صوفوں پر شیمپو واشنگ محفوظ ہے؟',
        answer:
          'جی ہاں، پیشہ ور کاریگر کپڑے کا رنگ چیک کر کے مخصوص پی ایچ بیلنسڈ شیمپو استعمال کرتے ہیں جس سے کپڑے کی چمک برقرار رہتی ہے اور رنگ خراب نہیں ہوتا۔',
      },
    ],
    faqs_ar: [
      {
        question: 'كيف تتم عملية غسيل وتنظيف الكنب والسجاد في المنزل بتقنية الاستخلاص؟',
        answer:
          'يتم رش محلول تنظيف رغوي خاص لفكك الدهون والأوساخ مع فرك ناعم للألياف، يتبعه سحب وشفط فوري لـ 95% من المياه والأوساخ عبر ماكينات الشفط العميق.',
      },
      {
        question: 'كم يستغرق الكنب أو السجاد ليجف تماماً بعد الانتهاء من الغسيل؟',
        answer:
          'بفضل قوة الشفط الصناعي التي تسحب الرطوبة من الأعماق، يجف الكنب والسجاد تماماً خلال 3 إلى 5 ساعات عند تشغيل المكيف أو مراوح السقف.',
      },
      {
        question: 'هل يمكن إزالة بقع الشاي والقهوة والزيوت المستعصية والروائح الكريهة؟',
        answer:
          'نعم، يتم استخدام مزيلات بقع إنزيمية متخصصة لكل نوع من البقع، مع رش معطرات ومطهرات مضادة للبكتيريا تقضي على مسببات الروائح العميقة نهائياً.',
      },
      {
        question: 'هل التنظيف بالبخار والشامبو آمن على أقمشة المخمل والشمواه والحرير؟',
        answer:
          'نعم، يقوم الفريق بإجراء اختبار ثبات الألوان في منطقة غير ظاهرة وضبط حرارة وضغط البخار بما يتناسب مع طبيعة النسيج الحساس لمنع تلفه أو انكماشه.',
      },
    ],
  },
  locksmith: {
    intro_en:
      'Find emergency locksmiths for residential door lockout openings without frame damage, duplicate computerized key cutting, deadbolt lock repairs, and smart biometric digital lock fittings.',
    intro_ur:
      'تالا چابی میکر، ایمرجنسی میں بغیر نقصان دروازہ کھولنے، ڈیجیٹل اور کمپیوٹرائزڈ چابیاں بنانے اور مین ڈور کے محفوظ لاکس لگانے کے لیے رابطہ کریں۔',
    intro_ar:
      'استعن بفنيي فتح الأقفال وصناعة المفاتيح لفتح الأبواب المغلقة في حالات الطوارئ دون كسر، نسخ المفاتيح المشفرة، وتركيب الأقفال الذكية بالبصمة.',
    faqs_en: [
      {
        question: 'Can emergency locksmiths open locked main doors without drilling or damaging the wood polish?',
        answer:
          'Yes, professional locksmiths use professional lock picks and bypass tools to unlock deadbolts and latch handles cleanly in 95% of home lockouts without damaging the door frame or cylinder.',
      },
      {
        question: 'Do locksmiths install modern smart biometric fingerprint and card locks on main doors?',
        answer:
          'Yes, locksmiths chisel mortise slots and install digital biometric locks supporting fingerprint access, PIN codes, RFID cards, mobile app Bluetooth unlocks, and backup manual keys.',
      },
      {
        question: 'Can computer laser-cut and dimple keys be duplicated accurately on-site?',
        answer:
          'Locksmiths carry precision computerized key duplicating machines in their service vans to cut high-security laser dimple keys and cross keys with exact factory tolerances.',
      },
      {
        question: 'Should I rekey existing lock cylinders or replace the complete lock body when moving into a new home?',
        answer:
          'Rekeying is faster and saves up to 60% of costs: the locksmith modifies the internal brass tumbler pins to fit a brand-new key set, rendering any old master keys useless.',
      },
    ],
    faqs_ur: [
      {
        question: 'کیا چابی اندر رہ جانے پر تالا توڑنے کے بغیر دروازہ کھل سکتا ہے؟',
        answer:
          'جی ہاں، پیشہ ور چابی میکر جدید اوزاروں کے ذریعے دروازے، لکڑی کے پالش یا تالے کو نقصان پہنچائے بغیر تالے کی اندرونی پنیں کھول دیتے ہیں۔',
      },
      {
        question: 'کیا مین گیٹ اور دروازوں پر جدید فنگر پرنٹ اور پاسورڈ والا اسمارٹ لاک لگ سکتا ہے؟',
        answer:
          'جی ہاں، کاریگر بائیو میٹرک ڈیجیٹل لاک کی مکمل فٹنگ کرتے ہیں جس میں فنگر پرنٹ، پاسورڈ، کارڈ اور موبائل ایپ کے ذریعے دروازہ کھلتا ہے۔',
      },
      {
        question: 'کمپیوٹرائزڈ اور لیزر کٹ چابیاں کتنی دیر میں تیار ہو جاتی ہیں؟',
        answer:
          'کمپیوٹرائزڈ کٹنگ مشین کے ذریعے سیکیورٹی ڈمپل چابی اور گاڑیوں کی ریموٹ چابیاں 10 سے 15 منٹ کے اندر سو فیصد درست کاپی ہو جاتی ہیں۔',
      },
      {
        question: 'نئے گھر میں شفٹ ہونے پر تالے بدلنا بہتر ہے یا چابیاں تبدیل کروانا؟',
        answer:
          'تالا مکمل بدلنے کے بجائے اس کا اندرونی سلنڈر ری کی (Rekey) کروانا سستا پڑتا ہے، جس سے پرانی تمام چابیاں بیکار ہو جاتی ہیں اور نیا سیٹ کام کرنے لگتا ہے۔',
      },
    ],
    faqs_ar: [
      {
        question: 'هل يمكن فتح الأبواب المغلقة في الطوارئ دون كسر القفل أو إتلاف دهان الباب؟',
        answer:
          'نعم، يستخدم الفنيون أدوات فتح احترافية دقيقة لفك لسان القفل وتحريك التروس الداخلية بسلاسة في دقائق دون إحداث أي خدش للباب أو كسر للكالون.',
      },
      {
        question: 'هل يقوم فني الأقفال بتركيب الأقفال الذكية الرقمية التي تعمل بالبصمة والكود؟',
        answer:
          'نعم، يقوم الفني بتجهيز وتفريغ فتحات الباب وتركيب الأقفال الذكية المتطورة التي تدعم بصمة الإصبع، الأرقام السرية، البطاقات الممغنطة، وتطبيق الهاتف.',
      },
      {
        question: 'هل يمكن نسخ المفاتيح المشفرة والمفاتيح الكمبيوتر بدقة في موقع العميل؟',
        answer:
          'يمتلك الفنيون أجهزة نسخ مفاتيح رقمية دقيقة لقص ونسخ مفاتيح الليزر والمفاتيح المنقوشة بدقة مطابقة تماماً للمفتاح الأصلي للوكالة.',
      },
      {
        question: 'عند الانتقال لمنزل جديد: هل الأفضل استبدال الأقفال بالكامل أم تغيير قلب الكالون؟',
        answer:
          'تغيير قلب الكالون (السلندر الداخلي) فقط يوفر حتى 60% من التكلفة ويضمن إلغاء فاعلية أي مفاتيح سابقة كانت لدى السكان أو العمال السابقين.',
      },
    ],
  },
  'movers-packers': {
    intro_en:
      'Connect with trusted movers and packers for house shifting, multilayer bubble-wrapping for furniture, covered waterproof container trucks, and skilled loading/unloading labor.',
    intro_ur:
      'گھر اور دفتر کی شفٹنگ، فرنیچر اور شیشے کے سامان کی ببل ریپنگ، بند کنٹینر ٹرک اور ماہر لیبر کے لیے تصدیق شدہ موورز اینڈ پیکرز سے رابطہ کریں۔',
    intro_ar:
      'احجز شركات نقل وتغليف العفش لنقل الأثاث المنزلي والمكتبي، التغليف بالبابلز والكرتون المقوى، دينا نقل مغلقة ومجهزة، وفك وتركيب غرف النوم.',
    faqs_en: [
      {
        question: 'How do professional movers estimate home shifting charges?',
        answer:
          'Quotes depend on total household inventory volume, cargo truck size (14ft to 22ft container), packing material layers required, floor levels with/without elevators, and inter-city distance.',
      },
      {
        question: 'What protective packing materials are used for fragile glassware and LCD televisions?',
        answer:
          'Movers wrap glassware in thick bubble film, pack into reinforced corrugated cartons with foam dividers, and protect TVs and marble tables with wooden crating and corner corner-guards.',
      },
      {
        question: 'Do moving packages include carpenters for disassembling and reassembling heavy furniture?',
        answer:
          'Yes, skilled furniture carpenters dismantle king-size hydraulic beds, 6-door wardrobes, and dining tables at your old home and reassemble and level them perfectly at the new destination.',
      },
      {
        question: 'How far in advance should home shifting be scheduled?',
        answer:
          'Booking 2 to 4 days ahead ensures reservation of dedicated enclosed waterproof trucks, organized moving boxes, and an experienced 4 to 6-man packing and loading crew on your moving morning.',
      },
    ],
    faqs_ur: [
      {
        question: 'گھر کی شفٹنگ کے اخراجات کا اندازہ کن چیزوں پر لگایا جاتا ہے؟',
        answer:
          'لاگت کا دارومدار سامان کی مقدار، ٹرک کے سائز (14 یا 20 فٹ بند کنٹینر)، ببل شیٹ کی پیکنگ، دونوں گھروں کی منزل (بغیر لفٹ سیڑھیاں)، اور فاصلے پر ہوتا ہے۔',
      },
      {
        question: 'نازک کراکری، ایل ای ڈی ٹی وی اور شیشے کے سامان کی حفاظت کیسے کی جاتی ہے؟',
        answer:
          'سامان کو کثیر البلا ببل ریپنگ اور فوم شیٹس میں لپیٹ کر مضبوط کاٹن بکسوں میں پیک کیا جاتا ہے، اور ایل ای ڈی کے لیے اسپیشل تھرموپول پیکنگ دی جاتی ہے۔',
      },
      {
        question: 'کیا فرنیچر کھولنے اور نئے گھر میں جوڑنے کے لیے کارپینٹر ساتھ ہوتا ہے؟',
        answer:
          'جی ہاں، موورز کے ساتھ ماہر کارپینٹر ہوتے ہیں جو الماریاں، بیڈ اور ڈائننگ ٹیبلز کھولتے ہیں اور نئے گھر میں مطلوبہ کمروں میں دوبارہ سیٹ کر کے دیتے ہیں۔',
      },
      {
        question: 'گھر شفٹ کرنے کے لیے کتنے دن پہلے بکنگ کروانی چاہیے؟',
        answer:
          'کم از کم 2 سے 3 دن پہلے بکنگ کروانا بہتر ہوتا ہے تاکہ مخصوص بند کنٹینر ٹرک، پیکنگ سامان اور تجربہ کار لیبر آپ کے وقت پر حاضر ہو سکے۔',
      },
    ],
    faqs_ar: [
      {
        question: 'كيف تُحدد تكلفة نقل العفش والأثاث المنزلي والمكتبي؟',
        answer:
          'تُحسب التكلفة بناءً على حجم وعدد قطع الأثاث، حجم دينا النقل (مغلقة أو مفتوحة)، كمية مواد التغليف المطلوبة، عدد الطوابق وتوفر المصعد، والمسافة بين الموقعين.',
      },
      {
        question: 'ما هي مواد التغليف المعتمدة لحماية الأواني الزجاجية وشاشات التلفزيون؟',
        answer:
          'يتم استخدام رولات الفقاعات الهوائية السميكة (Bubble Wrap)، كراتين مقواة خماسية الطبقات، أركان فوم لحماية الزوايا، وتغليف الشاشات بصناديق خشبية مبطنة.',
      },
      {
        question: 'هل يشمل عرض السعر نجارين لفك وتركيب غرف النوم والمطابخ؟',
        answer:
          'نعم، تشمل الخدمة نجارين محترفين لفك غرف النوم والستائر وخزائن الملابس في المنزل القديم، وإعادة تركيبها وضبطها بالكامل في المنزل الجديد بدقة.',
      },
      {
        question: 'كم يوماً قبل موعد النقل يجب تأكيد وحجز خدمة نقل العفش؟',
        answer:
          'يُفضل الحجز قبل 2 إلى 4 أيام لضمان توفير الشاحنة المغلقة المناسبة، تجهيز مواد الكرتون والتغليف، وتخصيص طاقم تحميل متخصص في الموعد المحدد صباحاً.',
      },
    ],
  },
};

// Aliases lookup for trade content
export function getCategoryTradeContent(
  categoryIdOrSlug: string,
  lang: string = 'en'
): {
  intro: string;
  faqs: CategoryFaqPair[];
} {
  const norm = (categoryIdOrSlug || '').toLowerCase().trim();
  const canonicalId =
    Object.keys(ROMAN_URDU_SLUGS).find((k) => ROMAN_URDU_SLUGS[k] === norm) ||
    norm;

  const content =
    TRADE_SPECIFIC_CONTENT[canonicalId] ||
    TRADE_SPECIFIC_CONTENT[norm] ||
    TRADE_SPECIFIC_CONTENT['electrician'];

  const intro =
    lang === 'ur'
      ? content.intro_ur
      : lang === 'ar'
      ? content.intro_ar
      : content.intro_en;

  const faqs =
    lang === 'ur'
      ? content.faqs_ur
      : lang === 'ar'
      ? content.faqs_ar
      : content.faqs_en;

  return { intro, faqs };
}

// Initial in-memory categories state populated from SEED_CATEGORIES with trade-specific content
export const localCategories: CategoryItem[] = SEED_CATEGORIES.map((c, index) => {
  const content = TRADE_SPECIFIC_CONTENT[c.id] || TRADE_SPECIFIC_CONTENT[c.slug];
  return {
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
    intro_en: content?.intro_en,
    intro_ur: content?.intro_ur,
    intro_ar: content?.intro_ar,
    faqs_en: content?.faqs_en,
    faqs_ur: content?.faqs_ur,
    faqs_ar: content?.faqs_ar,
  };
});

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
