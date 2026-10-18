import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import {
  BadgeCheck,
  ShieldCheck,
  Star,
  MapPin,
  ChevronRight,
  Clock,
  CheckCircle2,
  Zap,
  Phone,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/Icons';
import { getDictionary } from '@/lib/get-dictionary';
import {
  getProviderBySlug,
  getProviders,
  getCategoryBySlug,
  getCategoryName,
  getCountryByCode,
  getLocalizedCountryName,
  getLocalizedCityName,
  toTitleCase,
} from '@/lib/db';
import { getProviderCoverUrl, getProviderAvatarUrl } from '@/lib/category-banners';
import { formatVisitingPrice } from '@/lib/currencies';
import { getCleanWhatsAppUrl, getCleanTelUrl } from '@/lib/phone';
import ProviderImageSlider from '@/components/ProviderImageSlider';
import ProviderContactFAB from '@/components/ProviderContactFAB';
import RelatedSlider from '@/components/RelatedSlider';
import FeaturedProfilesSlider from '@/components/FeaturedProfilesSlider';
import LeadTrackButton from '@/components/LeadTrackButton';
import QuickFacts from '@/components/QuickFacts';
import JsonLd from '@/components/JsonLd';

interface ProviderPageProps {
  params: Promise<{
    lang: string;
    country: string;
    city: string;
    category: string;
    'provider-slug': string;
  }>;
}

const DOMAIN = 'https://baseera-services-directory.vercel.app';

// DYNAMIC CATEGORY SPECIALIZATIONS (ZERO HARDCODED MISMATCHES)
const CATEGORY_SPECIALIZATIONS: Record<string, Array<{ title: string; desc: string }>> = {
  // Electrical & Power
  electrician: [
    { title: 'Concealed Wiring & Rewiring', desc: 'Full premise concealed copper cabling, load distribution, and short-circuit localization.' },
    { title: 'Inverter, Solar & ATS Changeover Panels', desc: 'Automatic transfer switch (ATS) wiring and UPS / solar inverter distribution.' },
    { title: 'Main Distribution Board (DB) Balancing', desc: 'Earthing rod testing, circuit breaker trip diagnosis, and phase load balancing.' },
    { title: 'Ceiling Fan & Heavy Fixture Fitting', desc: 'Secure ceiling suspension anchors, chandelier installation, and LED dimmer panels.' },
  ],
  'ups-inverter-technician': [
    { title: 'Pure Sine Wave Inverter PCB Repair', desc: 'MOSFET replacement, driver IC testing, transformer coil winding, and error code diagnostics.' },
    { title: 'Tubular & Lithium Battery Calibration', desc: 'Specific gravity acid balancing, equalization charge programming, and BMS communication wiring.' },
    { title: 'Dual-Mode Changeover Panel Integration', desc: 'Manual and automatic transfer switches (ATS) with isolated neutral busbars.' },
    { title: 'Load Shedding Automation & Overload Protection', desc: 'Fast millisecond relay switching for computers, medical units, and sensitive appliances.' },
  ],
  'solar-installer': [
    { title: 'Tier-1 Solar Array Mounting', desc: 'Heavy gauge galvanized structure, wind-load anchor bolt fastening, and optimal angle tilt.' },
    { title: 'Hybrid & On-Grid Inverter Commissioning', desc: 'MPPT charge controller synchronization, net-metering three-phase calibration, and battery balancing.' },
    { title: 'DC Breakers & Lightning Surge Protection', desc: 'SPD class II surge arrester integration, copper earth pit rod boring, and fire-resistant DC cabling.' },
    { title: 'Performance Remote Monitoring Setup', desc: 'Wi-Fi datalogger configuration, cloud mobile dashboard tracking, and shading loss optimization.' },
  ],
  'generator-repair': [
    { title: 'Engine Overhaul & Tappet Clearance', desc: 'Valve clearance adjustment, cylinder compression check, and spark plug calibration.' },
    { title: 'Digital AVR & Alternator Repair', desc: 'Automatic voltage regulator replacement, carbon brush alignment, and frequency tuning.' },
    { title: 'Carburetor & Dual-Fuel Gas Kits', desc: 'CNG/LPG zero-pressure regulator installation and ultrasonic carburetor clearing.' },
    { title: 'Auto Start ATS Control Wiring', desc: 'Mains failure sensing relays, battery float chargers, and emergency cut-off solenoids.' },
  ],

  // Plumbing & Water
  plumber: [
    { title: 'PPR-C Heat Fusion Pipeline Installation', desc: 'Master pressure testing, thermal fusion welding, and leakproof concealed plumbing.' },
    { title: 'Submersible Boring & Water Pump Overhaul', desc: 'Deep-well impeller replacement, foot valve sealing, and non-return check valves.' },
    { title: 'Sanitary Ware & Concealed Commode Cisterns', desc: 'Wall-hung commode frames, pneumatic flush plates, and vanity mixer connections.' },
    { title: 'Ultrasonic Hidden Leakage Detection', desc: 'Acoustic pipeline inspection without destructive wall chiseling or tile breakage.' },
  ],
  'water-tank-cleaning': [
    { title: 'Sludge Suction & Rotary Deep Jet Wash', desc: 'High-bar pressure washing of reinforced underground and overhead concrete tanks.' },
    { title: 'Anti-Bacterial Chlorine Fumigation', desc: 'Food-grade sanitization killing E. coli, waterborne microbes, and mosquito larvae.' },
    { title: 'Epoxy Waterproof Leak Sealing', desc: 'Food-grade non-toxic epoxy crack coating resisting hydrostatic water pressure.' },
    { title: 'Float Valve & Automatic Overflow Sensor', desc: 'Heavy brass float valves and digital dry-run motor shutoff float switches.' },
  ],
  'drain-unblocking': [
    { title: 'Heavy Rotary Mechanical Spiral Rodding', desc: 'High-torque steel cable clearing roots, hard grease, and construction debris.' },
    { title: 'High-Velocity Hydro-Jet Sewer Flushing', desc: '200+ bar pulsating water nozzles stripping interior grease build-up completely.' },
    { title: 'Fiber-Optic CCTV Pipe Camera Inspection', desc: 'Real-time internal pipe video diagnosis locating cracks, collapses, and obstacles.' },
    { title: 'Manhole Desilting & Non-Toxic Odor Trap', desc: 'Main inspection chamber cleaning and anti-backflow sanitary P-trap alignment.' },
  ],

  // Cooling & Heating
  'ac-technician': [
    { title: 'Inverter PCB Diagnostic & Micro-Soldering', desc: 'Component level repair of indoor and outdoor communication motherboard circuits.' },
    { title: 'R32 & R410A Refrigerant Vacuum Charging', desc: 'Deep micron vacuum dehydration and electronic weight-calibrated gas replenishment.' },
    { title: 'Indoor Evaporator Coil Anti-Leak Brazing', desc: 'Silver brazing of copper hairline pinholes and pressurized nitrogen testing.' },
    { title: 'Hydro-Jet Deep Foam Dismantling Service', desc: 'High-pressure chemical washing of blower wheel, condenser fins, and drain pan.' },
  ],
  'refrigerator-technician': [
    { title: 'Inverter Compressor Relaying & Sealed System', desc: 'Rotary/linear compressor brazing, suction line filter-drier replacement, and gas charge.' },
    { title: 'No-Frost Heating Element & Bi-Metal Sensor', desc: 'Defrost timer troubleshooting, thermal fuse replacement, and evaporative coil testing.' },
    { title: 'Magnetic Door Gasket Air-Tight Sealing', desc: 'Custom silicone/vinyl thermal gasket replacement preventing cool air leakage.' },
    { title: 'Digital Thermostat & Micro-Controller Repair', desc: 'Electronic temperature sensor calibration and compressor cycle regulation.' },
  ],
  'washing-machine-technician': [
    { title: 'Front-Load Spider Arm & Drum Bearing Swapping', desc: 'Stainless steel drum disassembly, hydraulic bearing pressing, and oil seal installation.' },
    { title: 'Drain Pump & Pulsator Gearbox Overhaul', desc: 'Impeller clearance, magnetic drain motor replacement, and spin cycle clutch repair.' },
    { title: 'Digital Inverter Inrush Control Board Diagnostics', desc: 'Error code clearance (IE, OE, UE, dE) and hall sensor tachometer testing.' },
    { title: 'Heavy Duty Suspension Damper Struts', desc: 'Vibration dampening spring replacement and unbalance detection tuning.' },
  ],
  'geyser-technician': [
    { title: 'Instant Gas Geyser Solenoid & Microswitch', desc: 'Water diaphragm replacement, pilot jet needle clearing, and ignition box repair.' },
    { title: 'Electric Geyser Heavy Magnesium Anode & Element', desc: 'Titanium heating rod scaling removal and sacrificial corrosion anode swapping.' },
    { title: 'Thermostat Safety Cut-Off Valve Calibration', desc: 'Overheat pressure relief valve installation preventing cylinder bulging.' },
    { title: 'Descaling of Heavy Copper Heat Exchanger', desc: 'Eco-friendly acid flushing removing lime scale for maximum heat transfer.' },
  ],

  // Home & Construction
  carpenter: [
    { title: 'Custom Solid Wood & Modular Kitchen Cabinetry', desc: 'Soft-close hydraulic hinges, UV sheet lamination, and moisture-resistant MDF carcass.' },
    { title: 'Solid Sheesham Wood Door Framing & Fitting', desc: 'Mortise lock installation, threshold weather-stripping, and acoustic gap seal.' },
    { title: 'Bespoke Wardrobe & Walk-in Closet Design', desc: 'Concealed sliding tracks, pull-out trouser racks, and LED sensor profiles.' },
    { title: 'Antique Furniture Restoration & Lacquer Polish', desc: 'Hand-rubbed French spirit polish, PU high gloss finish, and joint reinforcement.' },
  ],
  painter: [
    { title: 'Exterior Weather-Proof Elastomeric Coating', desc: 'High-build acrylic barrier resisting harsh sunlight, rain, and fungal flaking.' },
    { title: 'Interior Matt Velvet & Silk Enamel Finishes', desc: 'Three-coat wall putty sanding, primer stabilization, and roller velvet coats.' },
    { title: 'Anti-Dampness & Saltpetre Chemical Treatment', desc: 'Crystalline deep masonry penetrant blocking rising damp and efflorescence salt.' },
    { title: 'Italian Marble Stucco & Velvet Texture Art', desc: 'Trowel-applied Venetian stucco, metallic glaze, and industrial concrete effects.' },
  ],
  mason: [
    { title: 'Granite & Vitrified Floor Tile Laser Laying', desc: 'Zero-tolerance laser leveling, epoxy grout filling, and polymer tile adhesive bonding.' },
    { title: 'RCC Concrete Boundary Wall & Brick Masonry', desc: 'Structural brick laying, column shuttering, and sand-cement render plastering.' },
    { title: 'Rooftop Thermal Insulation & Bitumen Waterproofing', desc: 'APP membrane torching, lightweight thermal screed, and drainage slope setting.' },
    { title: 'Staircase Marble Bullnosing & Riser Cladding', desc: 'Diamond machine edge rounding, anti-slip grooving, and mirror buffing.' },
  ],
  welder: [
    { title: 'Heavy Wrought Iron Gate & Safety Grills', desc: 'Solid forged iron scrolls, anti-pry lock plates, and rust-inhibiting zinc primer.' },
    { title: 'Stainless Steel (SS-304) Balcony Railing', desc: 'TIG argon welding, seamless tube bending, and optical satin/mirror polish.' },
    { title: 'Industrial Steel Truss & Shed Fabrication', desc: 'I-beam rafters, corrugated sheet roofing, and wind-brace tension rod bolting.' },
    { title: 'Motorized Rolling Shutter Spring Tensioning', desc: 'Galvanized slat replacement, torsion spring calibration, and central gear motors.' },
  ],
  'pest-control': [
    { title: 'Pre/Post Construction Subterranean Termite Proofing', desc: 'High-pressure chemical soil barrier injection along foundation walls with long warranty.' },
    { title: 'Odorless Gel Baiting for German Cockroaches', desc: 'Fipronil micro-dot placement inside kitchen hinges, appliances, and crevices.' },
    { title: 'Bed Bug Heat & Residual Steam Eradication', desc: 'High-temperature mattress steaming and insect growth regulator (IGR) spraying.' },
    { title: 'Rodent Bait Stations & Structural Harbor Sealing', desc: 'Tamper-resistant bait boxes and heavy wire mesh burrow exclusion barriers.' },
  ],
  'sofa-cleaner': [
    { title: 'Deep Injection-Extraction Fabric Extraction', desc: 'Multi-stage hot water industrial extraction removing deep sweat, oil, and dust mites.' },
    { title: 'Anti-Microbial Sanitization & Odor Neutralization', desc: 'Eco-friendly enzymatic treatment eliminating pet and food odor permanently.' },
    { title: 'Genuine Leather Conditioning & Color Buffing', desc: 'pH-balanced balm nourishing dry leather, preventing cracking and restoring sheen.' },
    { title: 'Stain-Shield Hydrophobic Nano Protection', desc: 'Invisible fluoropolymer coating repelling coffee, tea, and grease spillages.' },
  ],

  // Security & Hardware
  'cctv-technician': [
    { title: '5MP/4K ColorVu IP Network Camera Installation', desc: 'Cat-6 shielded structured cabling, PoE switch setup, and RJ-45 crimping.' },
    { title: 'NVR/DVR Cloud Remote Viewing Calibration', desc: 'Static IP / P2P smartphone application streaming with push motion alert triggers.' },
    { title: 'PTZ 360-Degree Optical Tracking Setup', desc: 'Auto-cruise patrol tour programming, human/vehicle AI classification filtering.' },
    { title: 'Concealed Conduit & Weatherproof Junction Boxes', desc: 'UV-resistant external pipe routing and waterproof IP66 camera bases.' },
  ],
  locksmith: [
    { title: 'High-Security Anti-Snap Cylinder Installation', desc: 'Key-coded dimple lock barrels resisting picking, bumping, and drilling attacks.' },
    { title: 'Smart Fingerprint & RFID Digital Door Locks', desc: 'Biometric keypad installation with Bluetooth / Wi-Fi smartphone remote access.' },
    { title: 'Emergency Non-Destructive Door Opening', desc: 'Specialized lishi picking and bypass tools opening locked doors without lock damage.' },
    { title: 'Master Key System Hierarchical Charting', desc: 'Single master key configuring multiple doors with individual tenant restrictions.' },
  ],

  // Automotive Care
  'car-mechanic': [
    { title: 'OBD-II Computerized Engine Diagnostics', desc: 'Live sensor datastream analysis, ECU fault code clearance, and sensor tracing.' },
    { title: 'Complete Suspension & Shock Absorber Rebuild', desc: 'Bushing hydraulic pressing, ball joint replacement, and camber balance.' },
    { title: 'Hydraulic Brake Rotor Skimming & Ceramic Pads', desc: 'Brake fluid bleeding, ABS modulator testing, and disc rotor resurfacing.' },
    { title: 'Periodic Fluid Flushing & Synthetic Lubrication', desc: 'Engine oil, transmission fluid, radiator coolant, and differential oil replacement.' },
  ],
  'car-ac-technician': [
    { title: 'Automotive Compressor Magnetic Clutch Repair', desc: 'Coil shimming, pulley bearing pressing, and expansion valve cleaning.' },
    { title: 'Dashboard Evaporator Coil Leakage Testing', desc: 'Nitrogen pressure testing and careful dashboard removal without rattle damage.' },
    { title: 'R134a Precision Gas Recharge & PAG Oil Injection', desc: 'Vacuum decay testing and synthetic compressor oil balancing.' },
    { title: 'Cabin Pollen Filter & Air Duct Ozone Fumigation', desc: 'Ozone gas treatment destroying bacteria and musty odors in air vents.' },
  ],

  // Lifestyle & Design
  'home-chef': [
    { title: 'Hygienic Home Tiffin & Daily Meal Delivery', desc: 'Fresh, balanced home-cooked meals prepared with premium oil and spices.' },
    { title: 'Custom Party & Event Catering Menus', desc: 'Live barbecue, traditional biryani deghs, Continental platters, and custom desserts.' },
    { title: 'Diet-Specific Nutrition & Keto Cooking', desc: 'Portion-controlled diabetic, low-sodium, and high-protein calorie-tracked meals.' },
    { title: 'On-Demand Private Chef for Family Gatherings', desc: 'Full culinary preparation, on-site live cooking, and kitchen cleanup.' },
  ],
  'interior-designer': [
    { title: '3D Architectural Visualization & Space Planning', desc: 'Photorealistic 3D renders, furniture space planning, and layout optimization.' },
    { title: 'Bespoke False Ceiling & Concealed Lighting Design', desc: 'Gypsum board cove lighting, magnetic track lights, and acoustic baffles.' },
    { title: 'Material & Color Palette Selection Consultation', desc: 'Curated wall textures, fluted wall panels, hardware, and fabrics harmonization.' },
    { title: 'Full Turnkey Renovation & Site Execution', desc: 'End-to-end project management, carpenter/mason coordination, and quality delivery.' },
  ],
  'movers-packers': [
    { title: 'Multi-Layer Bubble & Corrugated Box Packing', desc: 'Shockproof wrapping for fragile glassware, chinaware, marble, and electronics.' },
    { title: 'Heavy Furniture Dismantling & Strapped Loading', desc: 'Professional disassembly of hydraulic beds, conference tables, and wardrobes.' },
    { title: 'Covered Container Vans & GPS Tracked Fleet', desc: 'Weatherproof enclosed cargo trucks with soft interior padding for long and short distance.' },
    { title: 'Unpacking & Furniture Reassembly', desc: 'Bed frame bolting, wardrobe shelf realignment, curtain rod fixing, and carton box placement.' },
  ],
};

export async function generateMetadata({ params }: ProviderPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { lang, country, city, category } = resolvedParams;
  const slug = resolvedParams['provider-slug'];
  const provider = await getProviderBySlug(city, category, slug);
  const categoryInfo = getCategoryBySlug(category);

  if (!provider) {
    return {
      title: 'Provider Not Found | Baseera',
    };
  }

  const cityName = getLocalizedCityName(city, lang);
  const categoryName = getCategoryName(categoryInfo, lang);
  const providerName = provider.name;
  const countryObj = getCountryByCode(country);
  const countryName = getLocalizedCountryName(countryObj, lang);

  // Exact Programmatic SEO Formula
  const title =
    lang === 'ur'
      ? `${providerName} - ${cityName} میں ماہر ${categoryName} | بصیرہ`
      : lang === 'ar'
      ? `${providerName} - فني ${categoryName} معتمد في ${cityName} | بصيرة`
      : `${providerName} - Expert ${categoryName} in ${cityName} | Baseera`;

  const description =
    lang === 'ur'
      ? `${cityName} میں ${categoryName} سروسز کے لیے ${providerName} سے رابطہ کریں۔ کام کی تصاویر دیکھیں، ریٹنگز جانچیں اور براہِ راست واٹس ایپ کریں۔`
      : lang === 'ar'
      ? `تواصل مع ${providerName} للحصول على خدمات ${categoryName} في ${cityName}. اطلع على معرض الأعمال وتواصل مباشرة عبر واتساب.`
      : `Contact ${providerName} for professional ${categoryName} services in ${cityName}. View their work gallery, core specialties, and message directly on WhatsApp.`;

  const canonicalUrl = `${DOMAIN}/${lang}/${country.toLowerCase()}/${city.toLowerCase()}/${category.toLowerCase()}/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${DOMAIN}/en/${country.toLowerCase()}/${city.toLowerCase()}/${category.toLowerCase()}/${slug}`,
        ur: `${DOMAIN}/ur/${country.toLowerCase()}/${city.toLowerCase()}/${category.toLowerCase()}/${slug}`,
        ar: `${DOMAIN}/ar/${country.toLowerCase()}/${city.toLowerCase()}/${category.toLowerCase()}/${slug}`,
        'x-default': `${DOMAIN}/en/${country.toLowerCase()}/${city.toLowerCase()}/${category.toLowerCase()}/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: lang === 'ur' ? 'بصیرہ ڈائریکٹری' : lang === 'ar' ? 'دليل بصيرة' : 'Baseera Local Services Directory',
      images: [
        {
          url: getProviderCoverUrl(provider),
          width: 1200,
          height: 630,
          alt: `${providerName} - ${categoryName} in ${cityName}`,
        },
      ],
      locale: lang === 'ur' ? 'ur_PK' : lang === 'ar' ? 'ar_AE' : 'en_US',
      type: 'profile',
    },
  };
}

export default async function DynamicProviderProfilePage({ params }: ProviderPageProps) {
  const resolvedParams = await params;
  const { lang, country, city, category } = resolvedParams;
  const slug = resolvedParams['provider-slug'];

  const provider = await getProviderBySlug(city, category, slug);
  const categoryInfo = getCategoryBySlug(category);
  const categoryName = getCategoryName(categoryInfo, lang);
  const dict = await getDictionary(lang);

  if (!provider) {
    notFound();
  }

  const similarProviders = await getProviders(city, category);
  const cityName = getLocalizedCityName(city, lang);
  const countryObj = getCountryByCode(country);
  const countryName = getLocalizedCountryName(countryObj, lang);
  const countryCode = countryObj.code.toUpperCase();
  const providerName = provider.name;
  const canonicalUrl = `${DOMAIN}/${lang}/${country.toLowerCase()}/${city.toLowerCase()}/${category.toLowerCase()}/${slug}`;

  const effectiveCover = getProviderCoverUrl(provider);
  const effectiveAvatar = getProviderAvatarUrl(provider);

  // 1. DYNAMIC JSON-LD BREADCRUMBLIST SCHEMA
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: lang === 'ur' ? 'مرکزی صفحہ' : lang === 'ar' ? 'الرئيسية' : 'Home',
        item: `${DOMAIN}/${lang}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: countryName,
        item: `${DOMAIN}/${lang}/${country.toLowerCase()}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: cityName,
        item: `${DOMAIN}/${lang}/${country.toLowerCase()}/${city.toLowerCase()}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: categoryName,
        item: `${DOMAIN}/${lang}/${country.toLowerCase()}/${city.toLowerCase()}/${category.toLowerCase()}`,
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: providerName,
        item: canonicalUrl,
      },
    ],
  };

  // 2. DYNAMIC JSON-LD LOCALBUSINESS & SERVICE SCHEMA MARKUP (LOCAL SEO)
  const areaServedList =
    Array.isArray(provider.service_area) && provider.service_area.length > 0
      ? provider.service_area.map((area: string) => ({
          '@type': 'AdministrativeArea',
          name: `${area}, ${cityName}`,
        }))
      : [
          {
            '@type': 'City',
            name: cityName,
          },
        ];

  const localBusinessSchema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ProfessionalService'],
    '@id': canonicalUrl,
    name: providerName,
    description:
      provider.short_bio ||
      `${providerName} is a verified ${categoryName} serving ${cityName}, ${countryName}. Direct contact with zero middleman commission.`,
    image: [effectiveCover, effectiveAvatar].filter(Boolean),
    telephone: provider.whatsapp_number,
    url: canonicalUrl,
    serviceType: categoryName,
    category: categoryName,
    priceRange: formatVisitingPrice(provider.starting_price, provider.country_code || country),
    address: {
      '@type': 'PostalAddress',
      addressLocality: cityName,
      addressRegion: cityName,
      addressCountry: countryCode,
    },
    areaServed: areaServedList,
  };

  if (provider.review_count && provider.review_count > 0) {
    localBusinessSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(provider.rating || 5).toFixed(1),
      reviewCount: String(provider.review_count || 1),
      bestRating: '5',
      worstRating: '1',
    };
  }

  // GEO Quick Facts Items
  const providerFacts = [
    {
      label: lang === 'ur' ? 'تصدیق کا درجہ' : lang === 'ar' ? 'حالة التوثيق' : 'Verification Status',
      value: provider.is_verified ? (lang === 'ur' ? '100% تصدیق شدہ کاریگر' : lang === 'ar' ? 'معتمد وموثق 100%' : '100% Verified Specialist') : 'Active Provider',
      highlight: true,
      badge: 'Verified',
      icon: 'verified' as const,
    },
    {
      label: lang === 'ur' ? 'پلیٹ فارم فیس' : lang === 'ar' ? 'رسوم المنصة' : 'Platform Fee',
      value: lang === 'ur' ? '0% بغیر کسی کمیشن کے' : lang === 'ar' ? '0% بدون أي عمولة' : '0% Zero Commission',
      highlight: true,
      icon: 'fee' as const,
    },
    {
      label: lang === 'ur' ? 'رابطہ کا ذریعہ' : lang === 'ar' ? 'قناة التواصل' : 'Direct Contact',
      value: lang === 'ur' ? 'فوری واٹس ایپ چیٹ' : lang === 'ar' ? 'واتساب مباشر فوري' : 'Instant WhatsApp Chat',
      icon: 'contact' as const,
    },
    {
      label: lang === 'ur' ? 'وزٹ چارجز' : lang === 'ar' ? 'رسوم الزيارة' : 'Visiting Charges',
      value: formatVisitingPrice(provider.starting_price, provider.country_code || country),
      icon: 'price' as const,
    },
    {
      label: lang === 'ur' ? 'ریٹنگ اور جائزے' : lang === 'ar' ? 'تقييمات العملاء' : 'Customer Rating',
      value: `${Number(provider.rating || 5).toFixed(1)} ★ (${provider.review_count || 1} Reviews)`,
      icon: 'rating' as const,
    },
    {
      label: lang === 'ur' ? 'بنیادی علاقہ' : lang === 'ar' ? 'منطقة التغطية' : 'Service Area',
      value: provider.district ? `${provider.district}, ${cityName}` : cityName,
      icon: 'location' as const,
    },
  ];

  // Portfolio photos with category cover banner as slide #1
  const portfolioPhotos = [
    effectiveCover,
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
  ];

  // Dynamic Specializations
  const normalizedCategoryKey = (categoryInfo?.id || category).toLowerCase();
  const specializations =
    CATEGORY_SPECIALIZATIONS[normalizedCategoryKey] ||
    CATEGORY_SPECIALIZATIONS[category] ||
    CATEGORY_SPECIALIZATIONS['electrician'];

  const whatsappMessageText =
    lang === 'ur'
      ? `السلام علیکم ${provider.name}، میں نے بصیرہ پر آپ کا تصدیق شدہ پروفائل دیکھا ہے۔ مجھے ${cityName} میں آپ کی ${categoryName} سروسز کے لیے معلومات درکار ہیں۔ کیا آپ آج دستیاب ہیں؟`
      : lang === 'ar'
      ? `مرحباً ${provider.name}، لقد شاهدت ملفك الموثق على منصة بصيرة في ${cityName}. أود الاستفسار عن خدمات ${categoryName}. هل أنت متاح اليوم؟`
      : `Assalam-o-Alaikum ${provider.name}, I found your verified profile on Baseera directory in ${cityName}. I need consultation for ${categoryName}. Are you available today?`;

  const whatsappDirectUrl = getCleanWhatsAppUrl(provider.whatsapp_number, whatsappMessageText);
  const telDirectUrl = getCleanTelUrl(provider.whatsapp_number);

  return (
    <div className={`min-h-screen bg-white text-neutral-900 pb-28 ${lang === 'ur' ? 'font-urdu' : lang === 'ar' ? 'font-tajawal' : 'font-sans'}`}>
      {/* Programmatic BreadcrumbList & LocalBusiness JSON-LD Injection */}
      <JsonLd data={[breadcrumbSchema, localBusinessSchema]} />

      {/* Breadcrumbs Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link href={`/${lang}`} className="hover:text-[#059669] transition-colors">
              {lang === 'ur' ? 'مرکزی صفحہ' : lang === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 rtl:rotate-180" />
            <Link href={`/${lang}/${country.toLowerCase()}`} className="hover:text-[#059669] transition-colors">
              {countryName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 rtl:rotate-180" />
            <Link href={`/${lang}/${country.toLowerCase()}/${city.toLowerCase()}`} className="hover:text-[#059669] transition-colors">
              {cityName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 rtl:rotate-180" />
            <Link href={`/${lang}/${country.toLowerCase()}/${city.toLowerCase()}/${category.toLowerCase()}`} className="hover:text-[#059669] transition-colors capitalize">
              {categoryName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 rtl:rotate-180" />
            <span className="text-neutral-900 font-semibold truncate">{providerName}</span>
          </nav>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* H2 for Portfolio: Work Showcase & Projects by ${providerName} */}
        <div className="mb-3">
          <h2 className={`text-base sm:text-lg font-semibold text-neutral-900 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.3]' : 'leading-snug'}`}>
            {lang === 'ur'
              ? `${providerName} کے کام کی تصاویر اور پروجیکٹس`
              : lang === 'ar'
              ? `معرض أعمال ومشاريع ${providerName}`
              : `Work Showcase & Projects by ${providerName}`}
          </h2>
        </div>

        {/* TOP IMAGE SLIDER (Next.js Image unoptimized={true}) */}
        <ProviderImageSlider images={portfolioPhotos} providerName={provider.name} />

        {/* OVERLAPPING AVATAR & BASIC DETAILS */}
        <div className="relative px-2 sm:px-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-4">
            {/* Circular Overlapping Avatar */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-white overflow-hidden shrink-0 shadow-md">
              <img
                src={effectiveAvatar}
                alt={`${provider.name} profile picture`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Availability Pill */}
            {provider.is_available && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-[#059669]" />
                <span>
                  {lang === 'ur'
                    ? 'آج سروس کے لیے دستیاب'
                    : lang === 'ar'
                    ? 'متاح للخدمة اليوم'
                    : 'Available for Service Today'}
                </span>
              </div>
            )}
          </div>

          {/* Name & Trade Title */}
          <div className="space-y-1.5 overflow-visible">
            <div className="flex flex-wrap items-center gap-2 overflow-visible">
              <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.5] mb-4 pt-2' : 'leading-tight'}`}>
                {providerName}
              </h1>
              {provider.is_verified && (
                <span
                  title={lang === 'ur' ? 'بصیرہ سے تصدیق شدہ' : lang === 'ar' ? 'موثق من قبل بصيرة' : 'Verified by Baseera'}
                  className="inline-flex items-center text-[#059669]"
                >
                  <BadgeCheck className="w-6 h-6 fill-emerald-50 text-[#059669]" />
                </span>
              )}
            </div>

            {/* Primary Category Title */}
            <p className={`text-base font-bold text-[#059669] overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.3]' : ''}`}>
              <span>{categoryName}</span>
              {provider.trade_title && provider.trade_title.toLowerCase() !== categoryName.toLowerCase() && (
                <span className="text-gray-500 font-medium text-sm ms-2">
                  • {provider.trade_title}
                </span>
              )}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pt-1">
              <div className="flex items-center gap-1 text-amber-600 font-bold">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{provider.rating.toFixed(1)}</span>
                <span className="text-gray-400 font-normal">
                  ({provider.review_count} {lang === 'ur' ? 'کسٹمر ریویوز' : lang === 'ar' ? 'تقييمات عملاء' : 'client reviews'})
                </span>
              </div>

              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{provider.district}، {cityName}</span>
              </div>

              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-[#059669]" />
                <span>
                  {provider.total_leads}+ {lang === 'ur' ? 'کسٹمر رابطے' : lang === 'ar' ? 'طلب عميل' : 'Client Connections'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* GEO Quick Facts Component */}
        <div className="px-2 sm:px-6 mb-6">
          <QuickFacts facts={providerFacts} lang={lang} />
        </div>

        {/* PROFILE BODY & SERVICE AREAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 px-2 sm:px-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <div className="p-6 border border-gray-200 rounded-2xl bg-white overflow-visible">
              <h2 className={`text-xl font-semibold text-neutral-900 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.3] mb-4 pt-1' : 'leading-snug mb-2'}`}>
                {lang === 'ur' ? 'تعارف اور پیشہ ورانہ تجربہ' : lang === 'ar' ? 'نبذة عن الخبرة المهنية' : 'About & Professional Experience'}
              </h2>
              <p className={`text-base text-gray-700 whitespace-pre-line overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.5]' : 'leading-relaxed'}`}>
                {provider.short_bio}
              </p>
            </div>

            {/* DYNAMIC CORE SPECIALIZATIONS */}
            <div className="p-6 border border-gray-200 rounded-2xl bg-white overflow-visible">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-semibold text-neutral-900 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.3]' : 'leading-snug'}`}>
                  {lang === 'ur' ? 'اہم مہارتیں اور خدمات' : lang === 'ar' ? 'التخصصات والخدمات الأساسية' : 'Core Specializations'}
                </h2>
                <span className="text-xs text-[#059669] font-bold">
                  {lang === 'ur' ? 'کیٹیگری تصدیق شدہ' : lang === 'ar' ? 'تخصص معتمد' : 'Category Verified'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {specializations.map((spec, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 overflow-visible">
                    <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                    <div className="overflow-visible">
                      <h3 className={`text-base sm:text-lg font-semibold text-neutral-900 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.2] mb-1' : 'leading-snug'}`}>{spec.title}</h3>
                      <p className={`text-sm text-gray-600 mt-0.5 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.2]' : 'leading-relaxed'}`}>{spec.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Area Tags */}
            <div className="p-6 border border-gray-200 rounded-2xl bg-white overflow-visible">
              <h2 className={`text-xl font-semibold text-neutral-900 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.3] mb-4 pt-1' : 'leading-snug mb-3'}`}>
                {lang === 'ur'
                  ? `${cityName} میں سروس ایریا اور علاقے`
                  : lang === 'ar'
                  ? `نطاق الخدمة في ${cityName}`
                  : `Service Area Coverage in ${cityName}`}
              </h2>
              <div className="flex flex-wrap gap-2">
                {provider.service_area.map((area, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-xl bg-white flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-[#059669] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-neutral-900">
                    {lang === 'ur' ? 'تصدیق شدہ کاریگر' : lang === 'ar' ? 'فني معتمد' : 'Verified Specialist'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {lang === 'ur' ? 'شناخت اور مہارت کی تصدیق' : lang === 'ar' ? 'التحقق من الهوية والمهارة' : 'Identity & Trade Approved'}
                  </div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-xl bg-white flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#059669] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-neutral-900">
                    {lang === 'ur' ? 'براہِ راست ادائیگی' : lang === 'ar' ? 'دفع مباشر' : 'Direct Pay'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {lang === 'ur' ? 'کوئی پیشگی یا بکنگ فیس نہیں' : lang === 'ar' ? 'بدون رسوم حجز مسبقة' : 'No Booking Fees'}
                  </div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-xl bg-white flex items-center gap-3">
                <Clock className="w-6 h-6 text-[#059669] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-neutral-900">
                    {lang === 'ur' ? 'فوری جواب' : lang === 'ar' ? 'استجابة سريعة' : 'Fast Response'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {lang === 'ur' ? 'براہِ راست واٹس ایپ' : lang === 'ar' ? 'محادثة واتساب مباشرة' : 'Direct WhatsApp'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Direct Booking Sidebar */}
          <div className="space-y-6">
            <div className="p-6 border border-gray-200 rounded-2xl bg-white sticky top-24">
              {/* Plain Text Visiting Charges */}
              <div className="pb-4 mb-4 border-b border-gray-100">
                <span className="text-xs uppercase tracking-wider font-semibold text-gray-500 block mb-1">
                  {lang === 'ur' ? 'وزٹ چارجز' : lang === 'ar' ? 'رسوم الزيارة' : 'Visiting Charges'}
                </span>
                <div className="text-lg font-bold text-neutral-900">
                  {formatVisitingPrice(provider.starting_price, provider.country_code || country)}
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {lang === 'ur'
                    ? 'کام دیکھنے کے بعد براہِ راست کاریگر کو ادا کریں۔ کوئی ایڈوانس یا مڈل مین کمیشن نہیں۔'
                    : lang === 'ar'
                    ? 'الدفع مباشرة للفني عند الفحص. بدون دفع مسبق أو عمولة للمنصة.'
                    : 'Pay directly upon inspection. No online prepayment or platform commission.'}
                </p>
              </div>

              {/* Direct Contact Actions */}
              <div className="space-y-3">
                <LeadTrackButton
                  href={whatsappDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  providerId={provider.id}
                  categoryId={category}
                  cityId={city}
                  clickType="whatsapp"
                  className="w-full py-3 bg-[#059669] hover:bg-[#047857] active:scale-[0.99] text-white transition-all rounded-xl flex items-center justify-center gap-2 font-semibold text-sm cursor-pointer shadow-xs"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-current" />
                  <span>{lang === 'ur' ? 'واٹس ایپ پر رابطہ کریں' : lang === 'ar' ? 'محادثة عبر واتساب' : 'Chat on WhatsApp'}</span>
                </LeadTrackButton>

                <LeadTrackButton
                  href={telDirectUrl}
                  target="_self"
                  providerId={provider.id}
                  categoryId={category}
                  cityId={city}
                  clickType="call"
                  className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-800 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-gray-600" />
                  <span>
                    {lang === 'ur'
                      ? `براہِ راست کال کریں (${provider.whatsapp_number})`
                      : lang === 'ar'
                      ? `اتصال هاتفي مباشر (${provider.whatsapp_number})`
                      : `Call Direct (${provider.whatsapp_number})`}
                  </span>
                </LeadTrackButton>
              </div>

              <div className="text-xs text-gray-600 space-y-2 border-t border-gray-100 pt-4 mt-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                  <span>
                    {lang === 'ur'
                      ? 'کاریگر کی آمد سے پہلے مفت منسوخی'
                      : lang === 'ar'
                      ? 'إلغاء مجاني قبل وصول الفني'
                      : 'Free cancellation before specialist arrival'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                  <span>
                    {lang === 'ur'
                      ? 'بڑے کاموں اور میٹریل کے ریٹس موقع پر طے کریں'
                      : lang === 'ar'
                      ? 'التفاوض المباشر على الإصلاحات الكبرى في الموقع'
                      : 'Negotiate major repairs on-site directly'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Specialists Near You Slider */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <RelatedSlider
            type="providers"
            title={
              lang === 'ur'
                ? `آپ کے قریب دیگر تصدیق شدہ ${categoryName} ماہرین`
                : lang === 'ar'
                ? `متخصصون آخرون في ${categoryName} بالقرب منك`
                : `Similar ${categoryName} Specialists Near You`
            }
            subtitle={
              lang === 'ur'
                ? `${cityName} میں دستیاب دیگر اعلیٰ ریٹنگ والے تصدیق شدہ کاریگر`
                : lang === 'ar'
                ? `فنيون موثقون يقدمون نفس الخدمة في ${cityName}`
                : `Verified professionals in ${cityName} specializing in ${categoryName.toLowerCase()}`
            }
            items={similarProviders}
            currentSlug={slug}
            lang={lang}
            country={country}
            city={city}
            category={category}
            viewAllHref={`/${lang}/${country.toLowerCase()}/${city.toLowerCase()}/${category.toLowerCase()}`}
          />
        </div>

        {/* More Featured Specialists in City Slider (Excludes Current Provider) */}
        <FeaturedProfilesSlider
          categoryId={category}
          cityId={city}
          currentProviderSlug={slug}
          lang={lang}
          country={country}
          title={
            lang === 'ur'
              ? `${cityName} میں مزید نمایاں ${categoryName} ماہرین`
              : lang === 'ar'
              ? `المزيد من ${categoryName} المميزين في ${cityName}`
              : `More Featured ${categoryName}s in ${cityName}`
          }
        />
      </main>

      {/* CRITICAL UI: STICKY FLOATING ACTION BUTTON (FAB) ANCHORED BOTTOM-RIGHT WITH LEAD TRACKING */}
      <ProviderContactFAB
        providerId={provider.id}
        providerName={provider.name}
        contactMethod="whatsapp"
        contactValue={provider.whatsapp_number}
        categoryTitle={categoryName}
        categoryId={category}
        cityName={cityName}
        cityId={city}
      />
    </div>
  );
}
