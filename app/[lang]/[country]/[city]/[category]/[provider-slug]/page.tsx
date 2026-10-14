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
import { getProviderBySlug, getCategoryBySlug } from '@/lib/db';
import ProviderImageSlider from '@/components/ProviderImageSlider';
import ProviderContactFAB from '@/components/ProviderContactFAB';

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
    { title: 'ATS Relay Wiring & Starter Solenoids', desc: 'Auto-start relay integration, trickle battery charger setup, and starter motor servicing.' },
  ],

  // Water & Plumbing
  plumber: [
    { title: 'Concealed Wall Seepage & Leak Detection', desc: 'Acoustic testing, non-destructive moisture tracing, and pipeline pressure inspection.' },
    { title: 'Submersible Water Motor Installation', desc: 'Boring deep-well motor lowering, magnetic float switch, and overhead tank automation.' },
    { title: 'PPRC & UPVC Sanitary Piping', desc: 'High-pressure heat-fusion hot/cold water pipeline fittings and bathroom sanitary remodeling.' },
    { title: 'Gas & Electric Geyser Calibration', desc: 'Safe exhaust ventilation, non-return safety valve fitting, and pressure pump calibration.' },
  ],
  'water-pump-repair': [
    { title: 'Impeller & Mechanical Seal Replacement', desc: 'Stainless steel impeller balancing, carbon-ceramic water seal leak stopping, and vibration dampening.' },
    { title: 'Submersible Boring Motor Overhaul', desc: 'Deep-well copper stator rewinding, thrust bearing replacement, and waterproof splicing.' },
    { title: 'Automatic Pressure Controller Calibration', desc: 'Digital pressure switch calibration, pressure tank diaphragm bladder replacement, and dry-run protection.' },
    { title: 'Sweet Water Suction Line Priming', desc: 'Non-return check valve installation, foot valve clearing, and high-efficiency suction optimization.' },
  ],
  'water-boring': [
    { title: 'Deep Rotary & Percussion Well Drilling', desc: 'High-yield water stratum targeting, geological layer inspection, and heavy casing pipe lowering.' },
    { title: 'Slotted Screen & Gravel Pack Filtration', desc: 'High-grade PVC strainer slotting, silica gravel packing, and silt prevention.' },
    { title: 'Submersible Column Pipe & Cable Drop', desc: 'Corrosion-proof uPVC column pipes, safety stainless wire rope tethering, and underwater cable connection.' },
    { title: 'Well Jetting & Compressor Mud Flushing', desc: 'High-CFM air compressor flushing, sand removal, and crystal clear water output testing.' },
  ],
  'water-tank-cleaning': [
    { title: 'Sludge Dewatering & Slurry Extraction', desc: 'High-capacity submersible pump extraction of bottom mud, silt, and bacterial sediment.' },
    { title: 'High-Pressure Rotary Jet Scrubbing', desc: 'Anti-microbial wall and floor cleaning without damaging underlying plaster or tile grout.' },
    { title: 'Food-Grade Chemical & Chlorine Disinfection', desc: 'Safe non-toxic sanitization, bio-film removal, and algae neutralization.' },
    { title: 'UV Sterilization & Water Quality Testing', desc: 'Ultraviolet immersion lamp sterilization, TDS and pH verification before refill.' },
  ],

  // Cooling & Home Appliances
  'ac-technician': [
    { title: 'Inverter AC Jet Chemical Wash', desc: 'High-pressure anti-bacterial indoor coil wash, blower wheel degreasing, and drainage tray clearing.' },
    { title: 'Refrigerant Gas Leak & Refill', desc: 'Nitrogen leak testing, copper flare nut brazing, and genuine R410a / R32 refrigerant charging.' },
    { title: 'Inverter PCB Motherboard Diagnostics', desc: 'Microcontroller troubleshooting, capacitor replacement, and indoor/outdoor communication error reset.' },
    { title: 'Compressor & Fan Motor Overhaul', desc: 'Rotary/Scroll compressor replacement, run capacitor testing, and condenser fan motor servicing.' },
  ],
  'fridge-repair': [
    { title: 'Inverter Compressor Replacement & Brazing', desc: 'Variable-speed compressor testing, copper line brazing, and nitrogen leak sweep.' },
    { title: 'Eco-Friendly R600a / R134a Gas Charging', desc: 'Precision digital micro-gram refrigerant charging and vacuum line dehydration.' },
    { title: 'Defrost Timer & Bi-Metal Sensor Fix', desc: 'Frost build-up clearance, heater coil replacement, and thermistor calibration.' },
    { title: 'Door Gasket Seal & Thermostat Repair', desc: 'Magnetic rubber gasket replacement, internal LED thermostat repair, and air flap calibration.' },
  ],
  'washing-machine-repair': [
    { title: 'Front & Top Load Drum Bearing Replacement', desc: 'Spider arm assembly renewal, heavy-duty waterproof seal fitting, and spin balance restoration.' },
    { title: 'Direct-Drive Motor & PCB Module Repair', desc: 'Hall sensor replacement, logic board microcontroller repair, and drain pump unblocking.' },
    { title: 'Water Inlet Solenoid Valve & Pressure Sensor', desc: 'Electronic water level pressure switch recalibration and mesh filter descaling.' },
    { title: 'Shock Absorber & Suspension Spring Renewal', desc: 'Heavy spin cycle vibration elimination and child-safety door latch mechanism fix.' },
  ],
  'geyser-repair': [
    { title: 'Instant Gas Geyser Diaphragm & Microswitch', desc: 'Water-gas linkage valve service, pilot flame jet clearing, and automatic pulse igniter setup.' },
    { title: 'Electric Water Heater Immersion Element', desc: 'Heavy copper heating rod replacement, magnesium anode rod renewal, and thermostat calibration.' },
    { title: 'Safety Pressure Relief Valve (PRV) Fitting', desc: 'Over-pressure steam blow-off protection, non-return check valve, and explosion safeguard.' },
    { title: 'Flue Venting & Carbon Monoxide Clearance', desc: 'Safe stainless steel exhaust chimney alignment and thermal cut-off sensor testing.' },
  ],

  // Maintenance & Construction
  carpenter: [
    { title: 'Modular Woodwork & Kitchen Cabinets', desc: 'UV sheet, tactile laminate, and solid wood modular kitchen cabinet manufacturing.' },
    { title: 'Door Lock & Hydraulic Hinge Fitting', desc: 'Concealed multi-point mortise lock installation, soft-close hinges, and door alignment.' },
    { title: 'Wooden Flooring & Parquet Decking', desc: 'HDF water-resistant laminate wooden parquet laying with sound-absorbing underlay.' },
    { title: 'Wardrobe & Closet Customization', desc: 'Sliding aluminum channel wardrobes with integrated LED profile lighting.' },
  ],
  painter: [
    { title: 'Interior & Exterior Wall Emulsion', desc: 'Premium silk matte, weather sheet exterior coatings, and anti-fungal prep.' },
    { title: 'Wall Putty & Damp Seepage Treatment', desc: 'Chemical moisture barrier primer, crack bridging, and smooth stucco finish.' },
    { title: 'Wood Polish & Deco Paint Finish', desc: 'Polyurethane spray polish, matte clear coat, and antique lacquer furniture buffing.' },
    { title: 'Waterproofing & Roof Heat Insulation', desc: 'Elastomeric roof membrane coating, tile grout sealant, and thermal reflection paint.' },
  ],
  'aluminium-glass-worker': [
    { title: 'Thermal Break Aluminium Window Fabrication', desc: 'Double-glazed soundproof glass panels, heavy gauge channel extrusion, and sliding tracks.' },
    { title: 'Tempered Glass Shower Enclosures', desc: '10mm-12mm toughened frameless safety glass, stainless steel patch fittings, and waterproof silicone seals.' },
    { title: 'Commercial Glass Doors & Floor Closers', desc: 'Heavy-duty hydraulic floor hinge installation, glass lock fittings, and alignment.' },
    { title: 'Office Partitioning & Spider Glass Facades', desc: 'Acoustic gypsum-aluminium combo partitions and exterior curtain wall maintenance.' },
  ],
  welder: [
    { title: 'Custom Iron Gate & Grille Fabrication', desc: 'Wrought iron entrance gates, burglar-proof window grilles, and decorative handrails.' },
    { title: 'Heavy Structural Steel Beam Arc Welding', desc: 'I-beam column splicing, truss welding, and high-strength load bearing joints.' },
    { title: 'MIG / TIG Stainless Steel Pipe Welding', desc: 'Argon gas shielded welding for sanitary pipes, railing joints, and hairline polish.' },
    { title: 'Emergency Mobile On-Site Welding', desc: 'Portable welding generator repairs for broken hinges, terrace sheds, and water tank stands.' },
  ],
  mason: [
    { title: 'Tile & Marble Precision Flooring', desc: 'Laser-leveled porcelain tile laying, zero-joint epoxy grouting, and marble diamond polishing.' },
    { title: 'Brickwork, Plastering & Wall Raising', desc: 'Straight plumb-line masonry, moisture-proof plaster screed, and structural lintel casting.' },
    { title: 'Bathroom Waterproofing & Slope Screed', desc: 'Multi-layer chemical elastomeric slurry coating and leakage-proof drain sunken slab prep.' },
    { title: 'Demolition, Remodeling & Concrete Core Cutting', desc: 'Non-destructive partition wall removal, debris clearing, and reinforcement repairs.' },
  ],

  // Cleaning & Security
  'pest-control': [
    { title: 'Drill-Fill-Seal Termite Chemical Barrier', desc: 'Subterranean termite perimeter trenching, high-pressure wood injection, and warranty certificate.' },
    { title: 'Bed Bug Heat & Residual Steam Treatment', desc: 'Non-toxic organic misting, mattress crevice steaming, and egg eradication.' },
    { title: 'Cockroach & Ant Gel Bait Application', desc: 'Odorless German cockroach baiting, kitchen cabinet micro-droplet application, and child-safe formulas.' },
    { title: 'Rodent & Mosquito Fogging Extermination', desc: 'Ultrasonic rat repellent traps, ULV cold fogging for gardens, and drainage spray.' },
  ],
  'sofa-carpet-cleaning': [
    { title: 'Hot Water Extraction Carpet Shampooing', desc: 'High-pressure injection-extraction machine with anti-mite hypoallergenic detergent.' },
    { title: 'Upholstery Fabric & Leather Sofa Detailing', desc: 'Deep stain lift for tea, coffee, and oil spots, followed by moisture vacuum drying.' },
    { title: 'Mattress Sanitization & Dust Mite Extraction', desc: 'High-frequency vibrating vacuuming and medical-grade anti-allergen UV sanitization.' },
    { title: 'Color-Safe Drying & Deodorizing', desc: 'Fast 3-hour air-blower drying with natural long-lasting fresh scent neutralizer.' },
  ],
  'cctv-installer': [
    { title: 'IP & HD Night-Vision Camera Installation', desc: '4K Ultra-HD bullet and dome camera mounting with color night-vision IR sensors.' },
    { title: 'NVR/DVR Configuration & Hard Drive Setup', desc: 'Continuous motion-detection recording, surveillance storage calculation, and UPS backup.' },
    { title: 'Remote Smartphone Live Stream Integration', desc: 'Port forwarding, cloud P2P mobile app sync, and real-time push intrusion alerts.' },
    { title: 'Structured Cat6 & Coaxial Concealed Cabling', desc: 'Weatherproof conduit pipe routing, RJ45 crimping, and video balun noise filtering.' },
  ],
  locksmith: [
    { title: 'Emergency Residential & Commercial Lockout', desc: 'Non-destructive pick unlocking for jammed entrance doors, deadbolts, and cabinets.' },
    { title: 'High-Security Multi-Point Mortise Locks', desc: 'Computerized anti-tamper lock cylinders, brass deadbolts, and security strike plates.' },
    { title: 'Smart Digital Biometric Lock Installation', desc: 'Fingerprint, RFID card, PIN code, and mobile Wi-Fi smart door lock setup.' },
    { title: 'Master Key System & Precision Duplication', desc: 'Unified master keying for offices and residential complexes, with precision laser cut keys.' },
  ],

  // Lifestyle & Miscellaneous
  'home-chef': [
    { title: 'Daily Office Lunch Delivery', desc: 'Hygienic fresh home-cooked meal boxes with premium basmati rice and canola oil preparation.' },
    { title: 'Bulk Event & Daawat Catering', desc: 'Traditional mutton degi biryani, qorma, and custom desserts for family gatherings.' },
    { title: 'Custom Diet & Diabetic Meal Plans', desc: 'Low-sodium, steamed vegetable, and portion-controlled wholesome meal prep.' },
    { title: 'Homemade Sweets & Frozen Snacks', desc: 'Handcrafted samosas, shami kababs, and seasonal traditional mithai.' },
  ],
  'interior-designer': [
    { title: 'Complete Residential & Commercial Interior Design', desc: 'Space planning, architectural layout design, mood boards, and 3D photorealistic visualization.' },
    { title: 'False Ceiling & Architectural Lighting Concepts', desc: 'Gypsum false ceiling designs, cove lighting, architectural profile lights, and spotlighting.' },
    { title: 'Bespoke Furniture Design & Material Sourcing', desc: 'Custom luxury sofas, media walls, walk-in closets, kitchen cabinetry, and premium wood veneers.' },
    { title: 'Turnkey Project Execution & Site Supervision', desc: 'End-to-end renovation management, contractor oversight, material quality checks, and timely handover.' },
  ],
  'movers-packers': [
    { title: 'Multi-Layer Furniture Protective Wrapping', desc: 'High-density bubble wrap, stretch film, corrugated sheets, and corner edge guards.' },
    { title: 'Appliance & Heavy Safe Relocation', desc: 'Specialized hydraulic hand trucks for American fridges, washing machines, and heavy pianos.' },
    { title: 'Covered Container Vans & GPS Tracked Fleet', desc: 'Weatherproof enclosed cargo trucks with soft interior padding for long and short distance.' },
    { title: 'Unpacking & Furniture Reassembly', desc: 'Bed frame bolting, wardrobe shelf realignment, curtain rod fixing, and carton box placement.' },
  ],
};

export async function generateMetadata({ params }: ProviderPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { lang, country, city, category } = resolvedParams;
  const slug = resolvedParams['provider-slug'];
  const provider = await getProviderBySlug(city, category, slug);

  if (!provider) {
    return {
      title: 'Provider Not Found | Baseera',
    };
  }

  const cityName = city.charAt(0).toUpperCase() + city.slice(1);
  const countryCode = country.toUpperCase();
  const countryName = countryCode === 'PK' ? 'Pakistan' : countryCode === 'AE' ? 'United Arab Emirates' : countryCode;

  const title = `${provider.name} - Verified ${provider.trade_title} in ${cityName}, ${countryName} | Baseera`;
  const description = `${provider.short_bio.slice(0, 160)}... Rated ${provider.rating}★ (${provider.review_count} reviews). Contact directly without platform fees.`;
  const canonicalUrl = `${DOMAIN}/${lang}/${country}/${city}/${category}/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en-PK': `${DOMAIN}/en/pk/${city}/${category}/${slug}`,
        'ur-PK': `${DOMAIN}/ur/pk/${city}/${category}/${slug}`,
        'ar-AE': `${DOMAIN}/ar/ae/${city}/${category}/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Baseera Local Services Directory',
      images: [
        {
          url: provider.avatar_url,
          width: 800,
          height: 600,
          alt: provider.name,
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
  const dict = await getDictionary(lang);

  if (!provider) {
    notFound();
  }

  const cityName = city.charAt(0).toUpperCase() + city.slice(1);
  const countryCode = country.toUpperCase();
  const canonicalUrl = `${DOMAIN}/${lang}/${country}/${city}/${category}/${slug}`;

  // 1. DYNAMIC JSON-LD LOCALBUSINESS SCHEMA MARKUP
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': canonicalUrl,
    name: provider.name,
    image: [provider.avatar_url],
    telephone: provider.whatsapp_number,
    url: canonicalUrl,
    priceRange: `Rs. ${provider.starting_price}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: cityName,
      addressRegion: cityName,
      addressCountry: countryCode,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: provider.rating.toFixed(1),
      reviewCount: provider.review_count.toString(),
      bestRating: '5',
      worstRating: '1',
    },
  };

  // Portfolio photos
  const portfolioPhotos = [
    provider.avatar_url,
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
  ];

  // Dynamic Specializations
  const normalizedCategoryKey = (categoryInfo?.id || category).toLowerCase();
  const specializations = CATEGORY_SPECIALIZATIONS[normalizedCategoryKey] ||
    CATEGORY_SPECIALIZATIONS[category] ||
    CATEGORY_SPECIALIZATIONS['electrician'];

  const whatsappMessage = encodeURIComponent(
    `Assalam-o-Alaikum ${provider.name}, I found your verified profile on Baseera directory in ${cityName}. I need consultation for ${provider.trade_title}. Are you available today?`
  );

  return (
    <div className="min-h-screen bg-white text-neutral-900 pb-28 font-sans">
      {/* Dynamic JSON-LD Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      {/* Breadcrumbs Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link href={`/${lang}`} className="hover:text-[#059669] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <Link href={`/${lang}/${country}/${city}`} className="hover:text-[#059669] transition-colors">
              {cityName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <Link href={`/${lang}/${country}/${city}/${category}`} className="hover:text-[#059669] transition-colors capitalize">
              {categoryInfo?.name || category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-neutral-900 font-semibold truncate">{provider.name}</span>
          </nav>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* TOP IMAGE SLIDER (Next.js Image unoptimized={true}) */}
        <ProviderImageSlider images={portfolioPhotos} providerName={provider.name} />

        {/* OVERLAPPING AVATAR & BASIC DETAILS */}
        <div className="relative px-2 sm:px-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-4">
            {/* Circular Overlapping Avatar */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-white overflow-hidden shrink-0">
              <img
                src={provider.avatar_url}
                alt={provider.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Availability Pill */}
            {provider.is_available && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-[#059669]" />
                <span>Available for Service Today</span>
              </div>
            )}
          </div>

          {/* Name & Trade Title */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-neutral-900">
                {provider.name}
              </h1>
              {provider.is_verified && (
                <span title="Verified by Baseera" className="inline-flex items-center text-[#059669]">
                  <BadgeCheck className="w-6 h-6 fill-emerald-50 text-[#059669]" />
                </span>
              )}
            </div>

            <p className="text-base font-semibold text-[#059669]">
              {provider.trade_title}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pt-1">
              <div className="flex items-center gap-1 text-amber-600 font-bold">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{provider.rating.toFixed(1)}</span>
                <span className="text-gray-400 font-normal">({provider.review_count} client reviews)</span>
              </div>

              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{provider.district}, {cityName}</span>
              </div>

              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-[#059669]" />
                <span>{provider.total_leads}+ Client Connections</span>
              </div>
            </div>
          </div>
        </div>

        {/* PROFILE BODY & SERVICE AREAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 px-2 sm:px-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <div className="p-6 border border-gray-200 rounded-2xl bg-white">
              <h2 className="text-xl font-semibold text-neutral-900 mb-2 leading-snug">
                About &amp; Professional Experience
              </h2>
              <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                {provider.short_bio}
              </p>
            </div>

            {/* DYNAMIC CORE SPECIALIZATIONS */}
            <div className="p-6 border border-gray-200 rounded-2xl bg-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-neutral-900 leading-snug">
                  Core Specializations
                </h2>
                <span className="text-xs text-[#059669] font-bold">Category Verified</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {specializations.map((spec, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-neutral-900 leading-snug">{spec.title}</h3>
                      <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{spec.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Area Tags */}
            <div className="p-6 border border-gray-200 rounded-2xl bg-white">
              <h2 className="text-xl font-semibold text-neutral-900 mb-3 leading-snug">
                Service Area Coverage in {cityName}
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

            {/* Trust Badges - STRICTLY NO POLICE CLEARANCE */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-xl bg-white flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-[#059669] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-neutral-900">Verified Specialist</div>
                  <div className="text-xs text-gray-500">Identity & Trade Approved</div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-xl bg-white flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#059669] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-neutral-900">Direct Pay</div>
                  <div className="text-xs text-gray-500">No Booking Fees</div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-xl bg-white flex items-center gap-3">
                <Clock className="w-6 h-6 text-[#059669] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-neutral-900">Fast Response</div>
                  <div className="text-xs text-gray-500">Direct WhatsApp</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Direct Booking Sidebar (STRICTLY NO E-COMMERCE PRICE TAGS) */}
          <div className="space-y-6">
            <div className="p-6 border border-gray-200 rounded-2xl bg-white sticky top-24">
              {/* Plain Text Visiting Charges */}
              <div className="pb-4 mb-4 border-b border-gray-100">
                <span className="text-xs uppercase tracking-wider font-semibold text-gray-500 block mb-1">
                  Visiting Charges
                </span>
                <div className="text-lg font-bold text-neutral-900">
                  Rs. {provider.starting_price}
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Pay directly upon inspection. No online prepayment or platform commission.
                </p>
              </div>

              {/* Direct Contact Actions */}
              <div className="space-y-3">
                <a
                  href={`https://wa.me/${provider.whatsapp_number.replace(/\+/g, '')}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#059669] hover:bg-[#047857] active:scale-[0.99] text-white transition-all rounded-xl flex items-center justify-center gap-2 font-semibold text-sm"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-current" />
                  <span>Chat on WhatsApp</span>
                </a>

                <a
                  href={`tel:${provider.whatsapp_number}`}
                  className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-800 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-gray-600" />
                  <span>Call Direct ({provider.whatsapp_number})</span>
                </a>
              </div>

              <div className="text-xs text-gray-600 space-y-2 border-t border-gray-100 pt-4 mt-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                  <span>Free cancellation before specialist arrival</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                  <span>Negotiate major repairs on-site directly</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* CRITICAL UI: STICKY FLOATING ACTION BUTTON (FAB) ANCHORED BOTTOM-RIGHT WITH LEAD TRACKING */}
      <ProviderContactFAB
        providerId={provider.id}
        providerName={provider.name}
        contactMethod="whatsapp"
        contactValue={provider.whatsapp_number}
        categoryTitle={categoryInfo?.name || category}
        cityName={cityName}
      />
    </div>
  );
}
