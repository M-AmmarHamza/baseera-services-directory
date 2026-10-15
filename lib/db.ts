// Baseera Data Access Layer (Supabase + Resilient Local Seed Data)
import { createClient } from '@supabase/supabase-js';
import { cleanNumericPrice, getCountryCurrency } from './currencies';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export interface Provider {
  id: string;
  name: string;
  slug: string;
  profile_type: 'individual' | 'shop';
  category_id: string;
  trade_title: string;
  city_slug: string;
  country_code: string;
  district: string;
  service_area: string[];
  whatsapp_number: string;
  phone_number?: string;
  telegram_handle?: string;
  preferred_contact?: string;
  avatar_url: string;
  cover_url?: string;
  short_bio: string;
  starting_price: number;
  rating: number;
  review_count: number;
  total_leads: number;
  is_verified: boolean;
  is_available: boolean;
}

export const SEED_PROVIDERS: Provider[] = [
  {
    id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Tariq Mahmood',
    slug: 'tariq-mahmood',
    profile_type: 'individual',
    category_id: 'electrician',
    trade_title: 'Master Residential & Commercial Electrician',
    city_slug: 'karachi',
    country_code: 'pk',
    district: 'PECHS',
    service_area: ['PECHS', 'Clifton', 'DHA Phases 1-8', 'Bahadurabad'],
    whatsapp_number: '+923332145890',
    avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBK9qWTJzXQzuvOCxeaY9oaT5QnMSIE_WRvPrYq3ndOxqfGwgRJiuusiLQI6ptKnL9aXydagk97uFwsxC7j-gxTH2VH5N_HAJpsT3T0CG_IE0OBqsRNY1C_6XY0VC8sNDh1YBotW-weRk3E7XwleN6ZT1cvkRynmWL_e-anI_it8xQNPs3oqJRRO7Xrk7PfW-P6i2RwcClJxEboVmdY8ZF6bL0HcCJgGu5qW0x9sje5DlC6qn7x4H7V',
    short_bio: '18+ years experience servicing residential bungalows and commercial apartments across Karachi. Specialized in DB panel troubleshooting, short circuit emergency clearance, and hybrid solar UPS load segregation.',
    starting_price: 800,
    rating: 4.9,
    review_count: 128,
    total_leads: 342,
    is_verified: true,
    is_available: true,
  },
  {
    id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    name: 'Kashif Ali',
    slug: 'kashif-ali',
    profile_type: 'individual',
    category_id: 'ac-technician',
    trade_title: 'AC & Refrigeration Specialist',
    city_slug: 'karachi',
    country_code: 'pk',
    district: 'Gulshan-e-Iqbal',
    service_area: ['Gulshan-e-Iqbal', 'Gulistan-e-Jauhar', 'Federal B Area'],
    whatsapp_number: '+923012349811',
    avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrVEOf4Kmm3ZmFg2SVyQFHc7CD8jvopigKY9y06BL7csj1WLTVWDmQqVt9BLA-VImJWY1FnjTlOTMBdLORMVFgTEdwQKPPqGcSnJWhS5AriQLENY6vHirxqBOzQHMWyqZjRyr6tgRG-1ieePqu9nM2GIZj-GUmMil3H8fWsOahBKbVJj1EXc7oGAdad_P_Cb1e1CbAKo9FYlkkU-0dpz0biB1i9POZASr1lFg6dTIGFODNEO_8u9eb',
    short_bio: 'Certified Inverter AC technician with digital manifold gauges and genuine R410a/R32 refrigerants. Specializing in error code diagnosis, PCB card repairs, and anti-bacterial pressure washing.',
    starting_price: 1200,
    rating: 4.8,
    review_count: 94,
    total_leads: 189,
    is_verified: true,
    is_available: true,
  },
  {
    id: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    name: 'Farzana Kitchen',
    slug: 'farzana-kitchen',
    profile_type: 'shop',
    category_id: 'home-chef',
    trade_title: 'Authentic Karachi Home Chef & Tiffin',
    city_slug: 'karachi',
    country_code: 'pk',
    district: 'DHA Phase 5',
    service_area: ['DHA Phase 5', 'Clifton', 'Zamzama'],
    whatsapp_number: '+923325567890',
    avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZZ3jFfYAUp1f6ZwaA3bw9DUYqcbD067tf2DiX2SWLVRwTUhafGFCOzOzsUTICpmDPFe91mBv1GRm3r-qyUJZbnBeN57VtXsCuKHMVsXx1aioXkyo3Sw6_yQg78DkkPYzj3soUYY7YS49NK-hbHVquzL-bkNCxoWMINuv2OS5c5kG0a8JFOI5irxZcGHL_fDVrQ4YMj7ltf8FV7Xr-DHs1rDSBoxy0sTlo2SIaOGOn_DXV-DBQ1RiE',
    short_bio: 'Authentic Karachi homemade food, daily office lunchboxes, and bulk daawat orders. 100% hygienic canola oil, premium basmati rice, and mutton biryani.',
    starting_price: 550,
    rating: 5.0,
    review_count: 210,
    total_leads: 520,
    is_verified: true,
    is_available: true,
  },
  {
    id: 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
    name: 'Rashid Al-Nuaimi',
    slug: 'rashid-al-nuaimi',
    profile_type: 'shop',
    category_id: 'ac-technician',
    trade_title: 'Certified HVAC & Chiller Specialist',
    city_slug: 'dubai',
    country_code: 'ae',
    district: 'Deira & Business Bay',
    service_area: ['Deira', 'Business Bay', 'Downtown Dubai', 'Jumeirah'],
    whatsapp_number: '+971501234567',
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Rashid%20HVAC',
    short_bio: 'Dubai Municipality approved HVAC contractor with rapid response vans across Sheikh Zayed Road. Emergency refrigerant leaks and compressor swaps.',
    starting_price: 150,
    rating: 4.9,
    review_count: 88,
    total_leads: 290,
    is_verified: true,
    is_available: true,
  },
  {
    id: 'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b',
    name: 'Saleem Akhtar (Master Plumber)',
    slug: 'saleem-master-plumber',
    profile_type: 'individual',
    category_id: 'plumber',
    trade_title: 'Master Sanitary, Boring & Leakage Plumber',
    city_slug: 'karachi',
    country_code: 'pk',
    district: 'Orangi Town',
    service_area: ['Orangi Town', 'Nazimabad', 'North Nazimabad', 'SITE Area', 'Banaras'],
    whatsapp_number: '+923129876543',
    avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdBMSKdjUaZYNoFJVhLPCwp0jLh0A0lFp02qzPqS8thUxIAOt2xcMZ8HJs-p4Yd6BEHLxhxNXSDbnc2XyjuEoXyPDB4fpoSe1wn0uAxNm7anPR5Vm1wbX_1WSVOcP5FMmvam2s6m_UDGAFPsonR65so8bKoVE-wdlliVhajpCE_oAkxu3Hbi6-eXakjY9Iv0NxZDAgq_mgbj8SAP_nHNIAe7wZue0Nmp6fDzdSl318N9xdvwj4Yeq8',
    short_bio: '22+ years experience in deep underground water line leakage detection, PPRC/UPVC pipe fittings, water motor installations, and sanitary bathroom fittings across Orangi Town, Nazimabad, and SITE industrial area.',
    starting_price: 700,
    rating: 4.9,
    review_count: 84,
    total_leads: 215,
    is_verified: true,
    is_available: true,
  },
  {
    id: 'f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c',
    name: 'Muhammad Raheem',
    slug: 'raheem-plumber',
    profile_type: 'individual',
    category_id: 'plumber',
    trade_title: 'Residential & Commercial Plumbing Specialist',
    city_slug: 'karachi',
    country_code: 'pk',
    district: 'Clifton',
    service_area: ['Clifton', 'DHA Phases 1-8', 'Saddar', 'Bath Island'],
    whatsapp_number: '+923004567891',
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Raheem%20Plumber',
    short_bio: 'Expert sanitary fixtures, geyser installations, pressure pump fittings, and bathroom pipeline renovations in Clifton and Defence Karachi.',
    starting_price: 900,
    rating: 4.8,
    review_count: 72,
    total_leads: 160,
    is_verified: true,
    is_available: true,
  },
  {
    id: 'a7b8c9d0-e1f2-3a4b-5c6d-7e8f9a0b1c2d',
    name: 'Asif Ali Electric Works',
    slug: 'asif-electric-works',
    profile_type: 'shop',
    category_id: 'electrician',
    trade_title: 'Emergency Wiring & Industrial Motor Works',
    city_slug: 'karachi',
    country_code: 'pk',
    district: 'Orangi Town',
    service_area: ['Orangi Town', 'Baldia Town', 'Banaras', 'Qasba Colony'],
    whatsapp_number: '+923337654321',
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Asif%20Electric',
    short_bio: 'Fast emergency electrician service in Orangi Town and Banaras. Specialized in single-phase and 3-phase motor rewinding, breaker trips, and meter wiring.',
    starting_price: 600,
    rating: 4.7,
    review_count: 65,
    total_leads: 140,
    is_verified: true,
    is_available: true,
  },
  {
    id: 'b8c9d0e1-f2a3-4b5c-6d7e-8f9a0b1c2d3e',
    name: 'Ustad Imtiaz Carpenter',
    slug: 'imtiaz-wood-craft',
    profile_type: 'individual',
    category_id: 'carpenter',
    trade_title: 'Master Wood Craftsman & Cabinet Maker',
    city_slug: 'karachi',
    country_code: 'pk',
    district: 'Gulshan-e-Iqbal',
    service_area: ['Gulshan-e-Iqbal', 'Bahadurabad', 'PECHS', 'Gulistan-e-Jauhar'],
    whatsapp_number: '+923218899123',
    avatar_url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=400&q=80',
    short_bio: '25+ years expertise in bespoke woodwork, modular kitchen cabinets, solid wood door polishing, and custom wardrobes with German hardware fittings.',
    starting_price: 1000,
    rating: 4.9,
    review_count: 112,
    total_leads: 280,
    is_verified: true,
    is_available: true,
  },
  {
    id: 'c9d0e1f2-a3b4-5c6d-7e8f-9a0b1c2d3e4f',
    name: 'Zahid Hussain Painter',
    slug: 'zahid-master-painter',
    profile_type: 'individual',
    category_id: 'painter',
    trade_title: 'Interior Velvet & Weather-Shield Specialist',
    city_slug: 'karachi',
    country_code: 'pk',
    district: 'DHA Phase 6',
    service_area: ['DHA Phase 1-8', 'Clifton', 'Bath Island', 'Navy Housing'],
    whatsapp_number: '+923452233445',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    short_bio: 'Premium wall texture coatings, anti-fungal dampness treatments, rockwall exterior weather proofing, and Italian decorative wall finishes.',
    starting_price: 1500,
    rating: 5.0,
    review_count: 146,
    total_leads: 310,
    is_verified: true,
    is_available: true,
  },
  {
    id: 'd0e1f2a3-b4c5-6d7e-8f9a-0b1c2d3e4f5a',
    name: 'Kamran Solar & DB Works',
    slug: 'kamran-solar-electric',
    profile_type: 'shop',
    category_id: 'electrician',
    trade_title: 'Hybrid Solar & Net-Metering Inverter Engineer',
    city_slug: 'lahore',
    country_code: 'pk',
    district: 'Johar Town',
    service_area: ['Johar Town', 'Model Town', 'Faisal Town', 'WAPDA Town'],
    whatsapp_number: '+923007788990',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    short_bio: 'Certified solar inverter engineer. Specialized in hybrid inverter calibration, lithium battery BMS setup, earthing pit resistance testing, and load optimization.',
    starting_price: 1500,
    rating: 4.9,
    review_count: 168,
    total_leads: 420,
    is_verified: true,
    is_available: true,
  },
  {
    id: 'e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b',
    name: 'Yasmin Gourmet Tiffin',
    slug: 'chef-yasmin-kitchen',
    profile_type: 'shop',
    category_id: 'home-chef',
    trade_title: 'Hygiene Certified Home Tiffin & Party Catering',
    city_slug: 'lahore',
    country_code: 'pk',
    district: 'Gulberg III',
    service_area: ['Gulberg', 'Garden Town', 'Cavalry Ground', 'DHA Phase 1-5'],
    whatsapp_number: '+923349988776',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    short_bio: 'Wholesome home-cooked daily corporate lunch boxes and special weekend daawat catering. 100% olive/corn oil, organic spices, and premium meat standards.',
    starting_price: 600,
    rating: 5.0,
    review_count: 185,
    total_leads: 490,
    is_verified: true,
    is_available: true,
  },
  {
    id: 'f2a3b4c5-d6e7-8f9a-0b1c-2d3e4f5a6b7c',
    name: 'Hamza Smart CCTV',
    slug: 'hamza-cctv-security',
    profile_type: 'shop',
    category_id: 'cctv-security',
    trade_title: '4K IP Surveillance & Remote Monitoring Expert',
    city_slug: 'karachi',
    country_code: 'pk',
    district: 'Bahadurabad',
    service_area: ['Bahadurabad', 'Tariq Road', 'Gulshan', 'DHA Phases 1-8'],
    whatsapp_number: '+923214455667',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    short_bio: 'Installation and cloud configuration of Dahua & Hikvision IP cameras, night-vision colorVu systems, biometric door locks, and smartphone live streaming.',
    starting_price: 1200,
    rating: 4.8,
    review_count: 98,
    total_leads: 230,
    is_verified: true,
    is_available: true,
  },
  {
    id: 'a3b4c5d6-e7f8-9a0b-1c2d-3e4f5a6b7c8d',
    name: 'Bilal Auto Diagnostics',
    slug: 'bilal-auto-mechanic',
    profile_type: 'shop',
    category_id: 'auto-mechanic',
    trade_title: 'EFI Computerized Engine & Suspension Specialist',
    city_slug: 'karachi',
    country_code: 'pk',
    district: 'PECHS Block 2',
    service_area: ['PECHS', 'Tariq Road', 'Shahrah-e-Faisal', 'Clifton'],
    whatsapp_number: '+923135566778',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    short_bio: 'Mobile OBD-II scanning, hybrid battery health checks, ABS brake servicing, and emergency on-road breakdown assistance across central Karachi.',
    starting_price: 1000,
    rating: 4.9,
    review_count: 134,
    total_leads: 360,
    is_verified: true,
    is_available: true,
  },
  {
    id: 'b4c5d6e7-f8a9-0b1c-2d3e-4f5a6b7c8d9e',
    name: 'Naeem Ullah Sanitary & Boring',
    slug: 'naeem-sanitary-plumber',
    profile_type: 'individual',
    category_id: 'plumber',
    trade_title: 'Underground Leak Detection & Sanitary Engineer',
    city_slug: 'islamabad',
    country_code: 'pk',
    district: 'Sector F-8',
    service_area: ['Sector F-8', 'Sector F-10', 'Sector G-9', 'Sector G-11', 'Sector E-11'],
    whatsapp_number: '+923335544332',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    short_bio: 'High-precision acoustic pipeline leak detection, concealed shower mixer installations, and automatic pressure water pump fittings in Islamabad capital sectors.',
    starting_price: 1200,
    rating: 4.9,
    review_count: 91,
    total_leads: 210,
    is_verified: true,
    is_available: true,
  },
  {
    id: 'c5d6e7f8-a9b0-1c2d-3e4f-5a6b7c8d9e0f',
    name: 'Al-Maktoum Auto Care',
    slug: 'al-maktoum-auto-repair',
    profile_type: 'shop',
    category_id: 'auto-mechanic',
    trade_title: 'German & Japanese Auto AC & Transmission',
    city_slug: 'dubai',
    country_code: 'ae',
    district: 'Al Quoz Industrial 3',
    service_area: ['Al Quoz', 'Al Barsha', 'Business Bay', 'Downtown Dubai'],
    whatsapp_number: '+971529988776',
    avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
    short_bio: 'Dubai RTA certified workshop specializing in German & Japanese auto climate control systems, automatic gearbox overhauls, and mobile recovery service.',
    starting_price: 200,
    rating: 4.8,
    review_count: 76,
    total_leads: 190,
    is_verified: true,
    is_available: true,
  },
  {
    id: 'd6e7f8a9-b0c1-2d3e-4f5a-6b7c8d9e0f1a',
    name: 'Sajid Cool Point',
    slug: 'sajid-cool-point',
    profile_type: 'individual',
    category_id: 'ac-technician',
    trade_title: 'Inverter AC Deep Jet Washing & PCB Specialist',
    city_slug: 'lahore',
    country_code: 'pk',
    district: 'DHA Phase 5',
    service_area: ['DHA Phase 1-8', 'Gulberg', 'Cantt', 'Askari 10'],
    whatsapp_number: '+923224433221',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    short_bio: 'Certified Daikin and Gree inverter technician with high-pressure coil wash equipment, zero-mess water jackets, and capacitor/inverter board repairs.',
    starting_price: 1200,
    rating: 4.9,
    review_count: 142,
    total_leads: 380,
    is_verified: true,
    is_available: true,
  },
  {
    id: 'e7f8a9b0-c1d2-3e4f-5a6b-7c8d9e0f1a2b',
    name: 'Master Altaf Woodcraft',
    slug: 'altaf-furniture-art',
    profile_type: 'shop',
    category_id: 'carpenter',
    trade_title: 'Sheesham Furniture Restoration & Lacquer Polish',
    city_slug: 'rawalpindi',
    country_code: 'pk',
    district: 'Saddar',
    service_area: ['Saddar', 'Bahria Town Phases 1-8', 'Chaklala Scheme 3', 'Westridge'],
    whatsapp_number: '+923015566443',
    avatar_url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80',
    short_bio: 'Master antique restoration, high-gloss PU deco polish, custom luxury sofas, and precision architectural woodworking for residential estates.',
    starting_price: 1200,
    rating: 4.8,
    review_count: 87,
    total_leads: 205,
    is_verified: true,
    is_available: true,
  },
  {
    id: 'f8a9b0c1-d2e3-4f5a-6b7c-8d9e0f1a2b3c',
    name: 'Safeer Digital Surveillance',
    slug: 'safeer-surveillance-sa',
    profile_type: 'shop',
    category_id: 'cctv-security',
    trade_title: 'Smart Villa Security & Intercom Solutions',
    city_slug: 'riyadh',
    country_code: 'sa',
    district: 'Al Olaya',
    service_area: ['Al Olaya', 'Al Malqa', 'Al Nakheel', 'Al Yasmin'],
    whatsapp_number: '+966501234567',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    short_bio: 'Riyadh security authority compliant installation of high-speed motorized PTZ cameras, fiber optic networks, gate barriers, and video door phones.',
    starting_price: 250,
    rating: 4.9,
    review_count: 104,
    total_leads: 270,
    is_verified: true,
    is_available: true,
  },
  {
    id: 'a9b0c1d2-e3f4-5a6b-7c8d-9e0f1a2b3c4d',
    name: 'ArchStudio Interior Concepts',
    slug: 'archstudio-interior-concepts',
    profile_type: 'shop',
    category_id: 'interior-designer',
    trade_title: 'Luxury Home & Commercial Interior Designer',
    city_slug: 'karachi',
    country_code: 'pk',
    district: 'DHA Phase 6',
    service_area: ['DHA Phase 1-8', 'Clifton', 'PECHS', 'KDA Scheme 1'],
    whatsapp_number: '+923334411223',
    avatar_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80',
    short_bio: 'Full-service interior architecture & design studio specializing in modern luxury residences, 3D photorealistic renderings, false ceilings, lighting layouts, and custom bespoke furniture.',
    starting_price: 3500,
    rating: 4.9,
    review_count: 119,
    total_leads: 330,
    is_verified: true,
    is_available: true,
  },
  {
    id: 'b0c1d2e3-f4a5-6b7c-8d9e-0f1a2b3c4d5e',
    name: 'Al-Madina Water Motors & Sanitary',
    slug: 'al-madina-plumbing-motors',
    profile_type: 'shop',
    category_id: 'plumber',
    trade_title: 'Submersible Motors, Boring & Pipeline Repairs',
    city_slug: 'karachi',
    country_code: 'pk',
    district: 'Federal B Area',
    service_area: ['Federal B Area', 'North Nazimabad', 'Gulberg', 'Buffer Zone'],
    whatsapp_number: '+923152233889',
    avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80',
    short_bio: 'Submersible water pump installation, automatic water level controller wiring, heavy pipeline blockage clearance, and copper motor rewinding.',
    starting_price: 800,
    rating: 4.8,
    review_count: 95,
    total_leads: 260,
    is_verified: true,
    is_available: true,
  }
];

export interface Country {
  code: string;
  name: string;
  defaultCity: string;
  flag: string;
  region: 'Middle East' | 'Asia' | 'Americas' | 'Europe' | 'Africa' | 'Oceania' | 'Global';
}

export interface City {
  slug: string;
  name: string;
  countryCode: string;
}

export const COUNTRIES: Country[] = [
  // Middle East & South Asia
  { code: 'pk', name: 'Pakistan', defaultCity: 'karachi', flag: '🇵🇰', region: 'Asia' },
  { code: 'ae', name: 'United Arab Emirates', defaultCity: 'dubai', flag: '🇦🇪', region: 'Middle East' },
  { code: 'sa', name: 'Saudi Arabia', defaultCity: 'riyadh', flag: '🇸🇦', region: 'Middle East' },
  { code: 'qa', name: 'Qatar', defaultCity: 'doha', flag: '🇶🇦', region: 'Middle East' },
  { code: 'kw', name: 'Kuwait', defaultCity: 'kuwait', flag: '🇰🇼', region: 'Middle East' },
  { code: 'bh', name: 'Bahrain', defaultCity: 'manama', flag: '🇧🇭', region: 'Middle East' },
  { code: 'om', name: 'Oman', defaultCity: 'muscat', flag: '🇴🇲', region: 'Middle East' },
  { code: 'in', name: 'India', defaultCity: 'mumbai', flag: '🇮🇳', region: 'Asia' },
  { code: 'bd', name: 'Bangladesh', defaultCity: 'dhaka', flag: '🇧🇩', region: 'Asia' },
  { code: 'tr', name: 'Turkey', defaultCity: 'istanbul', flag: '🇹🇷', region: 'Middle East' },

  // Americas
  { code: 'us', name: 'United States', defaultCity: 'new-york', flag: '🇺🇸', region: 'Americas' },
  { code: 'ca', name: 'Canada', defaultCity: 'toronto', flag: '🇨🇦', region: 'Americas' },
  { code: 'mx', name: 'Mexico', defaultCity: 'mexico-city', flag: '🇲🇽', region: 'Americas' },
  { code: 'br', name: 'Brazil', defaultCity: 'sao-paulo', flag: '🇧🇷', region: 'Americas' },

  // Europe
  { code: 'gb', name: 'United Kingdom', defaultCity: 'london', flag: '🇬🇧', region: 'Europe' },
  { code: 'de', name: 'Germany', defaultCity: 'berlin', flag: '🇩🇪', region: 'Europe' },
  { code: 'fr', name: 'France', defaultCity: 'paris', flag: '🇫🇷', region: 'Europe' },
  { code: 'it', name: 'Italy', defaultCity: 'rome', flag: '🇮🇹', region: 'Europe' },
  { code: 'es', name: 'Spain', defaultCity: 'madrid', flag: '🇪🇸', region: 'Europe' },
  { code: 'nl', name: 'Netherlands', defaultCity: 'amsterdam', flag: '🇳🇱', region: 'Europe' },
  { code: 'ie', name: 'Ireland', defaultCity: 'dublin', flag: '🇮🇪', region: 'Europe' },
  { code: 'ch', name: 'Switzerland', defaultCity: 'zurich', flag: '🇨🇭', region: 'Europe' },

  // Asia Pacific & Oceania
  { code: 'au', name: 'Australia', defaultCity: 'sydney', flag: '🇦🇺', region: 'Oceania' },
  { code: 'nz', name: 'New Zealand', defaultCity: 'auckland', flag: '🇳🇿', region: 'Oceania' },
  { code: 'my', name: 'Malaysia', defaultCity: 'kuala-lumpur', flag: '🇲🇾', region: 'Asia' },
  { code: 'sg', name: 'Singapore', defaultCity: 'singapore', flag: '🇸🇬', region: 'Asia' },
  { code: 'id', name: 'Indonesia', defaultCity: 'jakarta', flag: '🇮🇩', region: 'Asia' },
  { code: 'jp', name: 'Japan', defaultCity: 'tokyo', flag: '🇯🇵', region: 'Asia' },

  // Africa
  { code: 'za', name: 'South Africa', defaultCity: 'johannesburg', flag: '🇿🇦', region: 'Africa' },
  { code: 'eg', name: 'Egypt', defaultCity: 'cairo', flag: '🇪🇬', region: 'Africa' },
  { code: 'ng', name: 'Nigeria', defaultCity: 'lagos', flag: '🇳🇬', region: 'Africa' },
  { code: 'ke', name: 'Kenya', defaultCity: 'nairobi', flag: '🇰🇪', region: 'Africa' },
];

export const CITIES: City[] = [
  // Pakistan
  { slug: 'karachi', name: 'Karachi', countryCode: 'pk' },
  { slug: 'lahore', name: 'Lahore', countryCode: 'pk' },
  { slug: 'islamabad', name: 'Islamabad', countryCode: 'pk' },
  { slug: 'rawalpindi', name: 'Rawalpindi', countryCode: 'pk' },
  { slug: 'faisalabad', name: 'Faisalabad', countryCode: 'pk' },

  // UAE
  { slug: 'dubai', name: 'Dubai', countryCode: 'ae' },
  { slug: 'sharjah', name: 'Sharjah', countryCode: 'ae' },
  { slug: 'abu-dhabi', name: 'Abu Dhabi', countryCode: 'ae' },
  { slug: 'ajman', name: 'Ajman', countryCode: 'ae' },

  // Saudi Arabia
  { slug: 'riyadh', name: 'Riyadh', countryCode: 'sa' },
  { slug: 'jeddah', name: 'Jeddah', countryCode: 'sa' },
  { slug: 'dammam', name: 'Dammam', countryCode: 'sa' },

  // Qatar, Kuwait, Oman, Bahrain
  { slug: 'doha', name: 'Doha', countryCode: 'qa' },
  { slug: 'kuwait', name: 'Kuwait City', countryCode: 'kw' },
  { slug: 'manama', name: 'Manama', countryCode: 'bh' },
  { slug: 'muscat', name: 'Muscat', countryCode: 'om' },

  // UK & US
  { slug: 'london', name: 'London', countryCode: 'gb' },
  { slug: 'manchester', name: 'Manchester', countryCode: 'gb' },
  { slug: 'birmingham', name: 'Birmingham', countryCode: 'gb' },
  { slug: 'new-york', name: 'New York', countryCode: 'us' },
  { slug: 'houston', name: 'Houston', countryCode: 'us' },
  { slug: 'chicago', name: 'Chicago', countryCode: 'us' },
  { slug: 'los-angeles', name: 'Los Angeles', countryCode: 'us' },

  // Canada & Australia
  { slug: 'toronto', name: 'Toronto', countryCode: 'ca' },
  { slug: 'vancouver', name: 'Vancouver', countryCode: 'ca' },
  { slug: 'sydney', name: 'Sydney', countryCode: 'au' },
  { slug: 'melbourne', name: 'Melbourne', countryCode: 'au' },

  // Europe & Asia & Africa
  { slug: 'berlin', name: 'Berlin', countryCode: 'de' },
  { slug: 'paris', name: 'Paris', countryCode: 'fr' },
  { slug: 'istanbul', name: 'Istanbul', countryCode: 'tr' },
  { slug: 'kuala-lumpur', name: 'Kuala Lumpur', countryCode: 'my' },
  { slug: 'singapore', name: 'Singapore', countryCode: 'sg' },
  { slug: 'mumbai', name: 'Mumbai', countryCode: 'in' },
  { slug: 'delhi', name: 'Delhi', countryCode: 'in' },
  { slug: 'dhaka', name: 'Dhaka', countryCode: 'bd' },
  { slug: 'cairo', name: 'Cairo', countryCode: 'eg' },
  { slug: 'johannesburg', name: 'Johannesburg', countryCode: 'za' },
  { slug: 'lagos', name: 'Lagos', countryCode: 'ng' },
  { slug: 'abuja', name: 'Abuja', countryCode: 'ng' },
  { slug: 'nairobi', name: 'Nairobi', countryCode: 'ke' },
];

export function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function getCountryByCode(code: string): Country {
  const norm = (code || 'pk').toLowerCase();
  const found = COUNTRIES.find((c) => c.code.toLowerCase() === norm);
  if (found) return found;

  // Universal fallback for any ISO country code using Intl.DisplayNames
  let resolvedName = norm.toUpperCase();
  try {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
    const name = displayNames.of(norm.toUpperCase());
    if (name) resolvedName = name;
  } catch {}

  return {
    code: norm,
    name: resolvedName,
    defaultCity: 'capital',
    flag: '🌍',
    region: 'Global',
  };
}

export function getCitiesByCountry(countryCode: string): City[] {
  const norm = (countryCode || 'pk').toLowerCase();
  const list = CITIES.filter((c) => c.countryCode.toLowerCase() === norm);
  if (list.length > 0) return list;

  const countryObj = getCountryByCode(norm);
  const defCity = countryObj.defaultCity && countryObj.defaultCity !== 'capital' ? countryObj.defaultCity : 'main-city';
  return [{ slug: defCity, name: toTitleCase(defCity), countryCode: norm }];
}

export interface CategoryDef {
  id: string;
  slug: string;
  aliases: string[];
  name: string;
  nameUr?: string;
  nameAr?: string;
  group: string;
  icon: string;
  count: number;
}

export const CATEGORIES: CategoryDef[] = [
  // Electrical & Power
  {
    id: 'electrician',
    slug: 'electrician',
    aliases: ['electrician', 'electrician-services', 'electricians'],
    name: 'Electrician',
    nameUr: 'الیکٹریشن',
    nameAr: 'كهربائي',
    group: 'Electrical & Power',
    icon: 'Zap',
    count: 42,
  },
  {
    id: 'ups-inverter-technician',
    slug: 'ups-inverter-technician',
    aliases: ['ups-inverter-technician', 'ups-repair', 'inverter-technician', 'ups'],
    name: 'UPS & Inverter Technician',
    nameUr: 'یو پی ایس اور انورٹر ٹیکنیشن',
    nameAr: 'فني يو بي إس ومحولات',
    group: 'Electrical & Power',
    icon: 'BatteryCharging',
    count: 28,
  },
  {
    id: 'solar-installer',
    slug: 'solar-installer',
    aliases: ['solar-installer', 'solar-energy', 'solar', 'solar-panel-installer'],
    name: 'Solar Panel Installer',
    nameUr: 'سولر پینل انسٹالر',
    nameAr: 'تركيب ألواح شمسية',
    group: 'Electrical & Power',
    icon: 'Sun',
    count: 34,
  },
  {
    id: 'generator-repair',
    slug: 'generator-repair',
    aliases: ['generator-repair', 'generator', 'generators', 'generator-services', 'generator-mechanic'],
    name: 'Generator Mechanic',
    nameUr: 'جنریٹر مکینک',
    nameAr: 'تصليح مولدات كهربائية',
    group: 'Electrical & Power',
    icon: 'Power',
    count: 19,
  },

  // Water & Plumbing
  {
    id: 'plumber',
    slug: 'plumber',
    aliases: ['plumber', 'plumbing', 'plumbing-services', 'plumbers'],
    name: 'Plumber',
    nameUr: 'پلمبر',
    nameAr: 'سباك',
    group: 'Water & Plumbing',
    icon: 'Wrench',
    count: 37,
  },
  {
    id: 'water-pump-repair',
    slug: 'water-pump-repair',
    aliases: ['water-pump-repair', 'water-pump', 'pump-mechanic'],
    name: 'Water Pump Mechanic',
    nameUr: 'واٹر پمپ مکینک',
    nameAr: 'تصليح مضخات المياه',
    group: 'Water & Plumbing',
    icon: 'Gauge',
    count: 24,
  },
  {
    id: 'water-boring',
    slug: 'water-boring',
    aliases: ['water-boring', 'boring', 'water-boring-specialist'],
    name: 'Water Boring Specialist',
    nameUr: 'واٹر بورنگ اسپیشلسٹ',
    nameAr: 'حفر وتمديد الآبار',
    group: 'Water & Plumbing',
    icon: 'Layers',
    count: 18,
  },
  {
    id: 'water-tank-cleaning',
    slug: 'water-tank-cleaning',
    aliases: ['water-tank-cleaning', 'tank-cleaning', 'water-tank-cleaner'],
    name: 'Water Tank Cleaner',
    nameUr: 'پانی کی ٹینکی کی صفائی',
    nameAr: 'تنظيف خزانات المياه',
    group: 'Water & Plumbing',
    icon: 'Waves',
    count: 31,
  },

  // Cooling & Home Appliances
  {
    id: 'ac-technician',
    slug: 'ac-technician',
    aliases: ['ac-technician', 'ac-repair', 'ac', 'ac-services'],
    name: 'AC Technician',
    nameUr: 'اے سی ٹیکنیشن',
    nameAr: 'فني تكييف وتبريد',
    group: 'Cooling & Home Appliances',
    icon: 'Wind',
    count: 58,
  },
  {
    id: 'fridge-repair',
    slug: 'fridge-repair',
    aliases: ['fridge-repair', 'fridge-mechanic', 'refrigerator-repair', 'freezer-repair'],
    name: 'Fridge & Freezer Mechanic',
    nameUr: 'فریج اور فریزر مکینک',
    nameAr: 'تصليح ثلاجات وفريزر',
    group: 'Cooling & Home Appliances',
    icon: 'Snowflake',
    count: 32,
  },
  {
    id: 'washing-machine-repair',
    slug: 'washing-machine-repair',
    aliases: ['washing-machine-repair', 'washing-machine', 'dryer-repair'],
    name: 'Washing Machine Repair',
    nameUr: 'واشنگ مشین ریپئرنگ',
    nameAr: 'تصليح غسالات',
    group: 'Cooling & Home Appliances',
    icon: 'RotateCw',
    count: 26,
  },
  {
    id: 'geyser-repair',
    slug: 'geyser-repair',
    aliases: ['geyser-repair', 'geyser-technician', 'geyser'],
    name: 'Geyser Technician',
    nameUr: 'گیزر ٹیکنیشن',
    nameAr: 'تصليح سخانات المياه',
    group: 'Cooling & Home Appliances',
    icon: 'Flame',
    count: 22,
  },

  // Maintenance & Construction
  {
    id: 'carpenter',
    slug: 'carpenter',
    aliases: ['carpenter', 'carpenter-services', 'carpentry'],
    name: 'Carpenter',
    nameUr: 'بڑھئی / کارپینٹر',
    nameAr: 'نجار',
    group: 'Maintenance & Construction',
    icon: 'Hammer',
    count: 25,
  },
  {
    id: 'painter',
    slug: 'painter',
    aliases: ['painter', 'painting-services', 'painting'],
    name: 'Painter',
    nameUr: 'پینٹر اور ڈیکو پالش',
    nameAr: 'دهان وصباغ',
    group: 'Maintenance & Construction',
    icon: 'Paintbrush',
    count: 31,
  },
  {
    id: 'aluminium-glass-worker',
    slug: 'aluminium-glass-worker',
    aliases: ['aluminium-glass-worker', 'aluminium-glass', 'glass-worker', 'aluminium'],
    name: 'Aluminium & Glass Worker',
    nameUr: 'ایلومینیم اور گلاس ورکر',
    nameAr: 'فني ألمنيوم وزجاج',
    group: 'Maintenance & Construction',
    icon: 'Frame',
    count: 20,
  },
  {
    id: 'welder',
    slug: 'welder',
    aliases: ['welder', 'welding', 'iron-works'],
    name: 'Welder',
    nameUr: 'ویلڈر اور گرل ورکر',
    nameAr: 'حداد ولحام',
    group: 'Maintenance & Construction',
    icon: 'Zap',
    count: 17,
  },
  {
    id: 'mason',
    slug: 'mason',
    aliases: ['mason', 'masonry', 'mistri'],
    name: 'Mason',
    nameUr: 'مستری اور ٹائل فکسر',
    nameAr: 'بناء وسيراميك',
    group: 'Maintenance & Construction',
    icon: 'Boxes',
    count: 23,
  },

  // Cleaning & Security
  {
    id: 'pest-control',
    slug: 'pest-control',
    aliases: ['pest-control', 'fumigation', 'termite-control'],
    name: 'Pest Control & Fumigation',
    nameUr: 'پیسٹ کنٹرول اور فیومیگیشن',
    nameAr: 'مكافحة حشرات',
    group: 'Cleaning & Security',
    icon: 'Bug',
    count: 21,
  },
  {
    id: 'sofa-carpet-cleaning',
    slug: 'sofa-carpet-cleaning',
    aliases: ['sofa-carpet-cleaning', 'carpet-cleaning', 'sofa-cleaning', 'home-cleaning', 'cleaning'],
    name: 'Sofa & Carpet Cleaning',
    nameUr: 'صوفہ اور قالین کی صفائی',
    nameAr: 'غسيل كنب وسجاد',
    group: 'Cleaning & Security',
    icon: 'Armchair',
    count: 29,
  },
  {
    id: 'cctv-installer',
    slug: 'cctv-installer',
    aliases: ['cctv-installer', 'cctv', 'cctv-security', 'security-cameras'],
    name: 'CCTV Installer',
    nameUr: 'سی سی ٹی وی کیمرہ انسٹالر',
    nameAr: 'تركيب كاميرات مراقبة',
    group: 'Cleaning & Security',
    icon: 'Camera',
    count: 31,
  },
  {
    id: 'locksmith',
    slug: 'locksmith',
    aliases: ['locksmith', 'locks-keys', 'lock-repair'],
    name: 'Locksmith',
    nameUr: 'چابی بنانے والا / لاک اسمتھ',
    nameAr: 'فني أقفال ومفاتيح',
    group: 'Cleaning & Security',
    icon: 'Key',
    count: 16,
  },

  // Lifestyle & Miscellaneous
  {
    id: 'home-chef',
    slug: 'home-chef',
    aliases: ['home-chef', 'food', 'home-chefs', 'catering'],
    name: 'Home Chef',
    nameUr: 'ہوم شیف اور کچن',
    nameAr: 'طاهي منزلي',
    group: 'Lifestyle & Miscellaneous',
    icon: 'Utensils',
    count: 45,
  },
  {
    id: 'interior-designer',
    slug: 'interior-designer',
    aliases: ['interior-designer', 'interior-design', 'interior-decorator', 'home-designer', 'interior-architect'],
    name: 'Interior Designer',
    nameUr: 'انٹیریئر ڈیزائنر',
    nameAr: 'مصمم ديكور داخلي',
    group: 'Home & Construction',
    icon: 'PaintRoller',
    count: 24,
  },
  {
    id: 'movers-packers',
    slug: 'movers-packers',
    aliases: ['movers-packers', 'movers', 'packers-and-movers'],
    name: 'Movers & Packers',
    nameUr: 'موورز اور پیکرز',
    nameAr: 'نقل وتغليف أثاث',
    group: 'Lifestyle & Miscellaneous',
    icon: 'Truck',
    count: 27,
  },
];

export function getCategoryName(cat: CategoryDef, lang: string): string {
  if (lang === 'ur' && cat.nameUr) return cat.nameUr;
  if (lang === 'ar' && cat.nameAr) return cat.nameAr;
  return cat.name;
}


export function getCategoryBySlug(slug: string): CategoryDef | null {
  const normalized = slug.toLowerCase();
  return (
    CATEGORIES.find(
      (c) =>
        c.slug.toLowerCase() === normalized ||
        c.id.toLowerCase() === normalized ||
        c.aliases.includes(normalized)
    ) || null
  );
}

function mapDbProvider(row: any, fallbackCity: string = 'karachi'): Provider {
  const citySlug = row.cities?.slug || fallbackCity;
  const countryCode = row.countries?.code || 'pk';
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    profile_type: row.profile_type || 'individual',
    category_id: row.category_id,
    trade_title: row.trade_title || `${row.name} - Verified Professional`,
    city_slug: citySlug,
    country_code: countryCode,
    district: Array.isArray(row.service_area) && row.service_area.length > 0 ? row.service_area[0] : 'Karachi',
    service_area: Array.isArray(row.service_area) ? row.service_area : [],
    whatsapp_number: row.whatsapp_number,
    avatar_url: row.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(row.name)}`,
    short_bio: row.short_bio || '',
    starting_price: cleanNumericPrice(row.starting_price, getCountryCurrency(countryCode).defaultFee),
    rating: Number(row.rating) || 4.8,
    review_count: Number(row.review_count) || 10,
    total_leads: Number(row.total_leads) || 25,
    is_verified: Boolean(row.is_verified),
    is_available: Boolean(row.is_available),
  };
}

async function fetchSupabase<T>(path: string): Promise<T | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${path}`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      next: { revalidate: 30 },
    });
    if (!res.ok) {
      console.warn(`Supabase REST note [${res.status}]`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn('Supabase fetch note:', err);
    return null;
  }
}

export async function getProviders(citySlug: string, categorySlug?: string): Promise<Provider[]> {
  const category = categorySlug ? getCategoryBySlug(categorySlug) : null;
  const targetCategoryIds = category ? [category.id, category.slug] : categorySlug ? [categorySlug] : [];

  let queryPath = `providers?select=*,cities!inner(slug),countries!inner(code)&cities.slug=eq.${encodeURIComponent(citySlug.toLowerCase())}`;
  if (category) {
    queryPath += `&category_id=in.(${targetCategoryIds.map(encodeURIComponent).join(',')})`;
  }

  const dbRows = await fetchSupabase<any[]>(queryPath);
  if (dbRows && dbRows.length > 0) {
    return dbRows.map((r) => mapDbProvider(r, citySlug));
  }

  // Fallback seed
  return SEED_PROVIDERS.filter((p) => {
    const cityMatch = p.city_slug.toLowerCase() === citySlug.toLowerCase();
    if (!categorySlug) return cityMatch;
    const catMatch =
      p.category_id.toLowerCase() === categorySlug.toLowerCase() ||
      (category && p.category_id.toLowerCase() === category.id.toLowerCase()) ||
      (category && category.aliases?.includes(p.category_id.toLowerCase())) ||
      p.slug.includes(categorySlug);
    return cityMatch && catMatch;
  });
}

export async function getProviderBySlug(citySlug: string, categorySlug: string, providerSlug: string): Promise<Provider | null> {
  const providers = await getProviders(citySlug, categorySlug);
  return providers.find((p) => p.slug === providerSlug) || null;
}

export async function getAllProviders(): Promise<Provider[]> {
  const dbRows = await fetchSupabase<any[]>('providers?select=*,cities!inner(slug),countries!inner(code)');
  if (dbRows && dbRows.length > 0) {
    return dbRows.map((r) => mapDbProvider(r, 'karachi'));
  }
  return SEED_PROVIDERS;
}
