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
  status?: 'pending' | 'approved' | 'rejected' | 'suspended';
  is_featured?: boolean;
}

// In-memory runtime override store shared across admin and frontend
export const localProvidersOverrides: Map<string, Partial<Provider>> = new Map();

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
    is_featured: true,
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
    is_featured: true,
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
    is_featured: true,
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
    is_featured: true,
  },
  {
    id: 'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b',
    name: 'Saleem Akhtar',
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
    is_featured: true,
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
    name: 'Asif Ali',
    slug: 'asif-electric-works',
    profile_type: 'individual',
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
    is_featured: true,
  },
  {
    id: 'b8c9d0e1-f2a3-4b5c-6d7e-8f9a0b1c2d3e',
    name: 'Ustad Imtiaz',
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
    name: 'Zahid Hussain',
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
    name: 'Kamran Khan',
    slug: 'kamran-solar-electric',
    profile_type: 'individual',
    category_id: 'solar-installer',
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
    name: 'Hamza Farooq',
    slug: 'hamza-cctv-security',
    profile_type: 'individual',
    category_id: 'cctv-technician',
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
    name: 'Bilal Ahmed',
    slug: 'bilal-auto-mechanic',
    profile_type: 'individual',
    category_id: 'car-mechanic',
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
    name: 'Naeem Ullah',
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
    category_id: 'car-mechanic',
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
    name: 'Sajid Mehmood',
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
    is_featured: true,
  },
  {
    id: 'e7f8a9b0-c1d2-3e4f-5a6b-7c8d9e0f1a2b',
    name: 'Master Altaf',
    slug: 'altaf-furniture-art',
    profile_type: 'individual',
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
  { code: 'co', name: 'Colombia', defaultCity: 'bogota', flag: '🇨🇴', region: 'Americas' },

  // Europe
  { code: 'uk', name: 'United Kingdom', defaultCity: 'london', flag: '🇬🇧', region: 'Europe' },
  { code: 'gb', name: 'United Kingdom', defaultCity: 'london', flag: '🇬🇧', region: 'Europe' },
  { code: 'de', name: 'Germany', defaultCity: 'berlin', flag: '🇩🇪', region: 'Europe' },
  { code: 'fr', name: 'France', defaultCity: 'paris', flag: '🇫🇷', region: 'Europe' },
  { code: 'it', name: 'Italy', defaultCity: 'rome', flag: '🇮🇹', region: 'Europe' },
  { code: 'es', name: 'Spain', defaultCity: 'madrid', flag: '🇪🇸', region: 'Europe' },
  { code: 'nl', name: 'Netherlands', defaultCity: 'amsterdam', flag: '🇳🇱', region: 'Europe' },
  { code: 'se', name: 'Sweden', defaultCity: 'stockholm', flag: '🇸🇪', region: 'Europe' },
  { code: 'ch', name: 'Switzerland', defaultCity: 'zurich', flag: '🇨🇭', region: 'Europe' },
  { code: 'be', name: 'Belgium', defaultCity: 'brussels', flag: '🇧🇪', region: 'Europe' },
  { code: 'at', name: 'Austria', defaultCity: 'vienna', flag: '🇦🇹', region: 'Europe' },
  { code: 'pl', name: 'Poland', defaultCity: 'warsaw', flag: '🇵🇱', region: 'Europe' },
  { code: 'ie', name: 'Ireland', defaultCity: 'dublin', flag: '🇮🇪', region: 'Europe' },

  // Asia Pacific & Oceania
  { code: 'au', name: 'Australia', defaultCity: 'sydney', flag: '🇦🇺', region: 'Oceania' },
  { code: 'nz', name: 'New Zealand', defaultCity: 'auckland', flag: '🇳🇿', region: 'Oceania' },
  { code: 'id', name: 'Indonesia', defaultCity: 'jakarta', flag: '🇮🇩', region: 'Asia' },
  { code: 'my', name: 'Malaysia', defaultCity: 'kuala-lumpur', flag: '🇲🇾', region: 'Asia' },
  { code: 'sg', name: 'Singapore', defaultCity: 'singapore-city', flag: '🇸🇬', region: 'Asia' },
  { code: 'ph', name: 'Philippines', defaultCity: 'manila', flag: '🇵🇭', region: 'Asia' },
  { code: 'th', name: 'Thailand', defaultCity: 'bangkok', flag: '🇹🇭', region: 'Asia' },
  { code: 'vn', name: 'Vietnam', defaultCity: 'ho-chi-minh-city', flag: '🇻🇳', region: 'Asia' },
  { code: 'jp', name: 'Japan', defaultCity: 'tokyo', flag: '🇯🇵', region: 'Asia' },
  { code: 'kr', name: 'South Korea', defaultCity: 'seoul', flag: '🇰🇷', region: 'Asia' },

  // Africa (Top 10 African Countries)
  { code: 'ng', name: 'Nigeria', defaultCity: 'lagos', flag: '🇳🇬', region: 'Africa' },
  { code: 'za', name: 'South Africa', defaultCity: 'johannesburg', flag: '🇿🇦', region: 'Africa' },
  { code: 'eg', name: 'Egypt', defaultCity: 'cairo', flag: '🇪🇬', region: 'Africa' },
  { code: 'ke', name: 'Kenya', defaultCity: 'nairobi', flag: '🇰🇪', region: 'Africa' },
  { code: 'gh', name: 'Ghana', defaultCity: 'accra', flag: '🇬🇭', region: 'Africa' },
  { code: 'ma', name: 'Morocco', defaultCity: 'casablanca', flag: '🇲🇦', region: 'Africa' },
  { code: 'tz', name: 'Tanzania', defaultCity: 'dar-es-salaam', flag: '🇹🇿', region: 'Africa' },
  { code: 'ug', name: 'Uganda', defaultCity: 'kampala', flag: '🇺🇬', region: 'Africa' },
  { code: 'dz', name: 'Algeria', defaultCity: 'algiers', flag: '🇩🇿', region: 'Africa' },
  { code: 'et', name: 'Ethiopia', defaultCity: 'addis-ababa', flag: '🇪🇹', region: 'Africa' },
];

export const CITIES: City[] = [
  // Pakistan (Top 30 Cities)
  { slug: 'karachi', name: 'Karachi', countryCode: 'pk' },
  { slug: 'lahore', name: 'Lahore', countryCode: 'pk' },
  { slug: 'faisalabad', name: 'Faisalabad', countryCode: 'pk' },
  { slug: 'rawalpindi', name: 'Rawalpindi', countryCode: 'pk' },
  { slug: 'gujranwala', name: 'Gujranwala', countryCode: 'pk' },
  { slug: 'peshawar', name: 'Peshawar', countryCode: 'pk' },
  { slug: 'multan', name: 'Multan', countryCode: 'pk' },
  { slug: 'hyderabad', name: 'Hyderabad', countryCode: 'pk' },
  { slug: 'islamabad', name: 'Islamabad', countryCode: 'pk' },
  { slug: 'quetta', name: 'Quetta', countryCode: 'pk' },
  { slug: 'bahawalpur', name: 'Bahawalpur', countryCode: 'pk' },
  { slug: 'sargodha', name: 'Sargodha', countryCode: 'pk' },
  { slug: 'sialkot', name: 'Sialkot', countryCode: 'pk' },
  { slug: 'sukkur', name: 'Sukkur', countryCode: 'pk' },
  { slug: 'larkana', name: 'Larkana', countryCode: 'pk' },
  { slug: 'sheikhupura', name: 'Sheikhupura', countryCode: 'pk' },
  { slug: 'rahim-yar-khan', name: 'Rahim Yar Khan', countryCode: 'pk' },
  { slug: 'jhang', name: 'Jhang', countryCode: 'pk' },
  { slug: 'dera-ghazi-khan', name: 'Dera Ghazi Khan', countryCode: 'pk' },
  { slug: 'gujrat', name: 'Gujrat', countryCode: 'pk' },
  { slug: 'sahiwal', name: 'Sahiwal', countryCode: 'pk' },
  { slug: 'wah-cantonment', name: 'Wah Cantonment', countryCode: 'pk' },
  { slug: 'mardan', name: 'Mardan', countryCode: 'pk' },
  { slug: 'kasur', name: 'Kasur', countryCode: 'pk' },
  { slug: 'okara', name: 'Okara', countryCode: 'pk' },
  { slug: 'mingora', name: 'Mingora', countryCode: 'pk' },
  { slug: 'nawabshah', name: 'Nawabshah', countryCode: 'pk' },
  { slug: 'chiniot', name: 'Chiniot', countryCode: 'pk' },
  { slug: 'kotri', name: 'Kotri', countryCode: 'pk' },
  { slug: 'kamoke', name: 'Kamoke', countryCode: 'pk' },

  // UAE (7 Emirates + Al Ain)
  { slug: 'dubai', name: 'Dubai', countryCode: 'ae' },
  { slug: 'abu-dhabi', name: 'Abu Dhabi', countryCode: 'ae' },
  { slug: 'sharjah', name: 'Sharjah', countryCode: 'ae' },
  { slug: 'ajman', name: 'Ajman', countryCode: 'ae' },
  { slug: 'ras-al-khaimah', name: 'Ras Al Khaimah', countryCode: 'ae' },
  { slug: 'fujairah', name: 'Fujairah', countryCode: 'ae' },
  { slug: 'umm-al-quwain', name: 'Umm Al Quwain', countryCode: 'ae' },
  { slug: 'al-ain', name: 'Al Ain', countryCode: 'ae' },

  // Saudi Arabia (Top 16 Major Cities)
  { slug: 'riyadh', name: 'Riyadh', countryCode: 'sa' },
  { slug: 'jeddah', name: 'Jeddah', countryCode: 'sa' },
  { slug: 'makkah', name: 'Makkah', countryCode: 'sa' },
  { slug: 'madinah', name: 'Madinah', countryCode: 'sa' },
  { slug: 'dammam', name: 'Dammam', countryCode: 'sa' },
  { slug: 'khobar', name: 'Khobar', countryCode: 'sa' },
  { slug: 'dhahran', name: 'Dhahran', countryCode: 'sa' },
  { slug: 'jubail', name: 'Jubail', countryCode: 'sa' },
  { slug: 'taif', name: 'Taif', countryCode: 'sa' },
  { slug: 'tabuk', name: 'Tabuk', countryCode: 'sa' },
  { slug: 'abha', name: 'Abha', countryCode: 'sa' },
  { slug: 'buraydah', name: 'Buraydah', countryCode: 'sa' },
  { slug: 'yanbu', name: 'Yanbu', countryCode: 'sa' },
  { slug: 'najran', name: 'Najran', countryCode: 'sa' },
  { slug: 'al-qatif', name: 'Al Qatif', countryCode: 'sa' },
  { slug: 'hail', name: 'Hail', countryCode: 'sa' },

  // Qatar (7 Cities)
  { slug: 'doha', name: 'Doha', countryCode: 'qa' },
  { slug: 'al-rayyan', name: 'Al Rayyan', countryCode: 'qa' },
  { slug: 'al-wakrah', name: 'Al Wakrah', countryCode: 'qa' },
  { slug: 'al-khor', name: 'Al Khor', countryCode: 'qa' },
  { slug: 'umm-salal', name: 'Umm Salal', countryCode: 'qa' },
  { slug: 'lusail', name: 'Lusail', countryCode: 'qa' },
  { slug: 'madinat-ash-shamal', name: 'Madinat ash Shamal', countryCode: 'qa' },

  // Kuwait (7 Cities)
  { slug: 'kuwait-city', name: 'Kuwait City', countryCode: 'kw' },
  { slug: 'al-ahmadi', name: 'Al Ahmadi', countryCode: 'kw' },
  { slug: 'hawalli', name: 'Hawalli', countryCode: 'kw' },
  { slug: 'salmiya', name: 'Salmiya', countryCode: 'kw' },
  { slug: 'al-farwaniyah', name: 'Al Farwaniyah', countryCode: 'kw' },
  { slug: 'al-jahra', name: 'Al Jahra', countryCode: 'kw' },
  { slug: 'mubarak-al-kabeer', name: 'Mubarak Al-Kabeer', countryCode: 'kw' },

  // Oman (3 Cities)
  { slug: 'muscat', name: 'Muscat', countryCode: 'om' },
  { slug: 'salalah', name: 'Salalah', countryCode: 'om' },
  { slug: 'sohar', name: 'Sohar', countryCode: 'om' },

  // Bahrain (3 Cities)
  { slug: 'manama', name: 'Manama', countryCode: 'bh' },
  { slug: 'muharraq', name: 'Muharraq', countryCode: 'bh' },
  { slug: 'riffa', name: 'Riffa', countryCode: 'bh' },

  // United States (Top 15 Cities)
  { slug: 'new-york', name: 'New York', countryCode: 'us' },
  { slug: 'los-angeles', name: 'Los Angeles', countryCode: 'us' },
  { slug: 'chicago', name: 'Chicago', countryCode: 'us' },
  { slug: 'houston', name: 'Houston', countryCode: 'us' },
  { slug: 'phoenix', name: 'Phoenix', countryCode: 'us' },
  { slug: 'philadelphia', name: 'Philadelphia', countryCode: 'us' },
  { slug: 'san-antonio', name: 'San Antonio', countryCode: 'us' },
  { slug: 'san-diego', name: 'San Diego', countryCode: 'us' },
  { slug: 'dallas', name: 'Dallas', countryCode: 'us' },
  { slug: 'san-jose', name: 'San Jose', countryCode: 'us' },
  { slug: 'austin', name: 'Austin', countryCode: 'us' },
  { slug: 'san-francisco', name: 'San Francisco', countryCode: 'us' },
  { slug: 'seattle', name: 'Seattle', countryCode: 'us' },
  { slug: 'denver', name: 'Denver', countryCode: 'us' },
  { slug: 'washington', name: 'Washington', countryCode: 'us' },

  // Canada (Top 10 Cities)
  { slug: 'toronto', name: 'Toronto', countryCode: 'ca' },
  { slug: 'montreal', name: 'Montreal', countryCode: 'ca' },
  { slug: 'vancouver', name: 'Vancouver', countryCode: 'ca' },
  { slug: 'calgary', name: 'Calgary', countryCode: 'ca' },
  { slug: 'edmonton', name: 'Edmonton', countryCode: 'ca' },
  { slug: 'ottawa', name: 'Ottawa', countryCode: 'ca' },
  { slug: 'winnipeg', name: 'Winnipeg', countryCode: 'ca' },
  { slug: 'quebec-city', name: 'Quebec City', countryCode: 'ca' },
  { slug: 'hamilton', name: 'Hamilton', countryCode: 'ca' },
  { slug: 'halifax', name: 'Halifax', countryCode: 'ca' },

  // Latin America (9 Cities)
  // Brazil (3 Cities)
  { slug: 'sao-paulo', name: 'Sao Paulo', countryCode: 'br' },
  { slug: 'rio-de-janeiro', name: 'Rio de Janeiro', countryCode: 'br' },
  { slug: 'brasilia', name: 'Brasilia', countryCode: 'br' },

  // Mexico (3 Cities)
  { slug: 'mexico-city', name: 'Mexico City', countryCode: 'mx' },
  { slug: 'guadalajara', name: 'Guadalajara', countryCode: 'mx' },
  { slug: 'monterrey', name: 'Monterrey', countryCode: 'mx' },

  // Colombia (3 Cities)
  { slug: 'bogota', name: 'Bogota', countryCode: 'co' },
  { slug: 'medellin', name: 'Medellin', countryCode: 'co' },
  { slug: 'cali', name: 'Cali', countryCode: 'co' },

  // United Kingdom (Top 10 Cities) - Dual code support ('uk' and 'gb')
  { slug: 'london', name: 'London', countryCode: 'uk' },
  { slug: 'birmingham', name: 'Birmingham', countryCode: 'uk' },
  { slug: 'manchester', name: 'Manchester', countryCode: 'uk' },
  { slug: 'glasgow', name: 'Glasgow', countryCode: 'uk' },
  { slug: 'liverpool', name: 'Liverpool', countryCode: 'uk' },
  { slug: 'edinburgh', name: 'Edinburgh', countryCode: 'uk' },
  { slug: 'leeds', name: 'Leeds', countryCode: 'uk' },
  { slug: 'sheffield', name: 'Sheffield', countryCode: 'uk' },
  { slug: 'bristol', name: 'Bristol', countryCode: 'uk' },
  { slug: 'cardiff', name: 'Cardiff', countryCode: 'uk' },
  { slug: 'london', name: 'London', countryCode: 'gb' },
  { slug: 'birmingham', name: 'Birmingham', countryCode: 'gb' },
  { slug: 'manchester', name: 'Manchester', countryCode: 'gb' },
  { slug: 'glasgow', name: 'Glasgow', countryCode: 'gb' },
  { slug: 'liverpool', name: 'Liverpool', countryCode: 'gb' },
  { slug: 'edinburgh', name: 'Edinburgh', countryCode: 'gb' },
  { slug: 'leeds', name: 'Leeds', countryCode: 'gb' },
  { slug: 'sheffield', name: 'Sheffield', countryCode: 'gb' },
  { slug: 'bristol', name: 'Bristol', countryCode: 'gb' },
  { slug: 'cardiff', name: 'Cardiff', countryCode: 'gb' },
  // Australia (10 Cities)
  { slug: 'sydney', name: 'Sydney', countryCode: 'au' },
  { slug: 'melbourne', name: 'Melbourne', countryCode: 'au' },
  { slug: 'brisbane', name: 'Brisbane', countryCode: 'au' },
  { slug: 'perth', name: 'Perth', countryCode: 'au' },
  { slug: 'adelaide', name: 'Adelaide', countryCode: 'au' },
  { slug: 'gold-coast', name: 'Gold Coast', countryCode: 'au' },
  { slug: 'canberra', name: 'Canberra', countryCode: 'au' },
  { slug: 'newcastle', name: 'Newcastle', countryCode: 'au' },
  { slug: 'hobart', name: 'Hobart', countryCode: 'au' },
  { slug: 'darwin', name: 'Darwin', countryCode: 'au' },

  // New Zealand (3 Cities)
  { slug: 'auckland', name: 'Auckland', countryCode: 'nz' },
  { slug: 'wellington', name: 'Wellington', countryCode: 'nz' },
  { slug: 'christchurch', name: 'Christchurch', countryCode: 'nz' },

  // Turkey (3 Cities)
  { slug: 'istanbul', name: 'Istanbul', countryCode: 'tr' },
  { slug: 'ankara', name: 'Ankara', countryCode: 'tr' },
  { slug: 'izmir', name: 'Izmir', countryCode: 'tr' },

  // Middle East & South Asia
  { slug: 'mumbai', name: 'Mumbai', countryCode: 'in' },
  { slug: 'delhi', name: 'Delhi', countryCode: 'in' },

  // Top Asian Countries (33 Cities)
  // 1. Indonesia ('id')
  { slug: 'jakarta', name: 'Jakarta', countryCode: 'id' },
  { slug: 'surabaya', name: 'Surabaya', countryCode: 'id' },
  { slug: 'bandung', name: 'Bandung', countryCode: 'id' },
  { slug: 'medan', name: 'Medan', countryCode: 'id' },
  { slug: 'denpasar', name: 'Denpasar', countryCode: 'id' },

  // 2. Malaysia ('my')
  { slug: 'kuala-lumpur', name: 'Kuala Lumpur', countryCode: 'my' },
  { slug: 'george-town', name: 'George Town', countryCode: 'my' },
  { slug: 'johor-bahru', name: 'Johor Bahru', countryCode: 'my' },
  { slug: 'shah-alam', name: 'Shah Alam', countryCode: 'my' },

  // 3. Singapore ('sg')
  { slug: 'singapore-city', name: 'Singapore City', countryCode: 'sg' },
  { slug: 'singapore', name: 'Singapore', countryCode: 'sg' },

  // 4. Philippines ('ph')
  { slug: 'manila', name: 'Manila', countryCode: 'ph' },
  { slug: 'quezon-city', name: 'Quezon City', countryCode: 'ph' },
  { slug: 'cebu-city', name: 'Cebu City', countryCode: 'ph' },
  { slug: 'davao-city', name: 'Davao City', countryCode: 'ph' },

  // 5. Thailand ('th')
  { slug: 'bangkok', name: 'Bangkok', countryCode: 'th' },
  { slug: 'chiang-mai', name: 'Chiang Mai', countryCode: 'th' },
  { slug: 'phuket', name: 'Phuket', countryCode: 'th' },
  { slug: 'pattaya', name: 'Pattaya', countryCode: 'th' },

  // 6. Vietnam ('vn')
  { slug: 'ho-chi-minh-city', name: 'Ho Chi Minh City', countryCode: 'vn' },
  { slug: 'hanoi', name: 'Hanoi', countryCode: 'vn' },
  { slug: 'da-nang', name: 'Da Nang', countryCode: 'vn' },

  // 7. Bangladesh ('bd')
  { slug: 'dhaka', name: 'Dhaka', countryCode: 'bd' },
  { slug: 'chittagong', name: 'Chittagong', countryCode: 'bd' },
  { slug: 'sylhet', name: 'Sylhet', countryCode: 'bd' },
  { slug: 'rajshahi', name: 'Rajshahi', countryCode: 'bd' },

  // 8. Japan ('jp')
  { slug: 'tokyo', name: 'Tokyo', countryCode: 'jp' },
  { slug: 'osaka', name: 'Osaka', countryCode: 'jp' },
  { slug: 'yokohama', name: 'Yokohama', countryCode: 'jp' },
  { slug: 'kyoto', name: 'Kyoto', countryCode: 'jp' },

  // 9. South Korea ('kr')
  { slug: 'seoul', name: 'Seoul', countryCode: 'kr' },
  { slug: 'busan', name: 'Busan', countryCode: 'kr' },
  { slug: 'incheon', name: 'Incheon', countryCode: 'kr' },
  { slug: 'daegu', name: 'Daegu', countryCode: 'kr' },

  // Top 10 European Countries (42 Cities)
  // 1. Germany ('de')
  { slug: 'berlin', name: 'Berlin', countryCode: 'de' },
  { slug: 'munich', name: 'Munich', countryCode: 'de' },
  { slug: 'frankfurt', name: 'Frankfurt', countryCode: 'de' },
  { slug: 'hamburg', name: 'Hamburg', countryCode: 'de' },
  { slug: 'cologne', name: 'Cologne', countryCode: 'de' },

  // 2. France ('fr')
  { slug: 'paris', name: 'Paris', countryCode: 'fr' },
  { slug: 'marseille', name: 'Marseille', countryCode: 'fr' },
  { slug: 'lyon', name: 'Lyon', countryCode: 'fr' },
  { slug: 'toulouse', name: 'Toulouse', countryCode: 'fr' },
  { slug: 'nice', name: 'Nice', countryCode: 'fr' },

  // 3. Italy ('it')
  { slug: 'rome', name: 'Rome', countryCode: 'it' },
  { slug: 'milan', name: 'Milan', countryCode: 'it' },
  { slug: 'naples', name: 'Naples', countryCode: 'it' },
  { slug: 'turin', name: 'Turin', countryCode: 'it' },
  { slug: 'florence', name: 'Florence', countryCode: 'it' },

  // 4. Spain ('es')
  { slug: 'madrid', name: 'Madrid', countryCode: 'es' },
  { slug: 'barcelona', name: 'Barcelona', countryCode: 'es' },
  { slug: 'valencia', name: 'Valencia', countryCode: 'es' },
  { slug: 'seville', name: 'Seville', countryCode: 'es' },
  { slug: 'zaragoza', name: 'Zaragoza', countryCode: 'es' },

  // 5. Netherlands ('nl')
  { slug: 'amsterdam', name: 'Amsterdam', countryCode: 'nl' },
  { slug: 'rotterdam', name: 'Rotterdam', countryCode: 'nl' },
  { slug: 'the-hague', name: 'The Hague', countryCode: 'nl' },
  { slug: 'utrecht', name: 'Utrecht', countryCode: 'nl' },
  { slug: 'eindhoven', name: 'Eindhoven', countryCode: 'nl' },

  // 6. Sweden ('se')
  { slug: 'stockholm', name: 'Stockholm', countryCode: 'se' },
  { slug: 'gothenburg', name: 'Gothenburg', countryCode: 'se' },
  { slug: 'malmo', name: 'Malmo', countryCode: 'se' },

  // 7. Switzerland ('ch')
  { slug: 'zurich', name: 'Zurich', countryCode: 'ch' },
  { slug: 'geneva', name: 'Geneva', countryCode: 'ch' },
  { slug: 'basel', name: 'Basel', countryCode: 'ch' },
  { slug: 'bern', name: 'Bern', countryCode: 'ch' },

  // 8. Belgium ('be')
  { slug: 'brussels', name: 'Brussels', countryCode: 'be' },
  { slug: 'antwerp', name: 'Antwerp', countryCode: 'be' },
  { slug: 'ghent', name: 'Ghent', countryCode: 'be' },

  // 9. Austria ('at')
  { slug: 'vienna', name: 'Vienna', countryCode: 'at' },
  { slug: 'graz', name: 'Graz', countryCode: 'at' },
  { slug: 'linz', name: 'Linz', countryCode: 'at' },

  // 10. Poland ('pl')
  { slug: 'warsaw', name: 'Warsaw', countryCode: 'pl' },
  { slug: 'krakow', name: 'Krakow', countryCode: 'pl' },
  { slug: 'lodz', name: 'Lodz', countryCode: 'pl' },
  { slug: 'wroclaw', name: 'Wroclaw', countryCode: 'pl' },

  // 11. Ireland ('ie' - 3 Cities)
  { slug: 'dublin', name: 'Dublin', countryCode: 'ie' },
  { slug: 'cork', name: 'Cork', countryCode: 'ie' },
  { slug: 'galway', name: 'Galway', countryCode: 'ie' },

  // Top 10 African Countries (39 Cities)
  // 1. Nigeria ('ng')
  { slug: 'lagos', name: 'Lagos', countryCode: 'ng' },
  { slug: 'abuja', name: 'Abuja', countryCode: 'ng' },
  { slug: 'port-harcourt', name: 'Port Harcourt', countryCode: 'ng' },
  { slug: 'kano', name: 'Kano', countryCode: 'ng' },
  { slug: 'ibadan', name: 'Ibadan', countryCode: 'ng' },

  // 2. South Africa ('za')
  { slug: 'johannesburg', name: 'Johannesburg', countryCode: 'za' },
  { slug: 'cape-town', name: 'Cape Town', countryCode: 'za' },
  { slug: 'durban', name: 'Durban', countryCode: 'za' },
  { slug: 'pretoria', name: 'Pretoria', countryCode: 'za' },
  { slug: 'port-elizabeth', name: 'Port Elizabeth', countryCode: 'za' },

  // 3. Egypt ('eg')
  { slug: 'cairo', name: 'Cairo', countryCode: 'eg' },
  { slug: 'alexandria', name: 'Alexandria', countryCode: 'eg' },
  { slug: 'giza', name: 'Giza', countryCode: 'eg' },
  { slug: 'sharm-el-sheikh', name: 'Sharm El Sheikh', countryCode: 'eg' },

  // 4. Kenya ('ke')
  { slug: 'nairobi', name: 'Nairobi', countryCode: 'ke' },
  { slug: 'mombasa', name: 'Mombasa', countryCode: 'ke' },
  { slug: 'kisumu', name: 'Kisumu', countryCode: 'ke' },
  { slug: 'nakuru', name: 'Nakuru', countryCode: 'ke' },

  // 5. Ghana ('gh')
  { slug: 'accra', name: 'Accra', countryCode: 'gh' },
  { slug: 'kumasi', name: 'Kumasi', countryCode: 'gh' },
  { slug: 'tamale', name: 'Tamale', countryCode: 'gh' },
  { slug: 'sekondi-takoradi', name: 'Sekondi-Takoradi', countryCode: 'gh' },

  // 6. Morocco ('ma')
  { slug: 'casablanca', name: 'Casablanca', countryCode: 'ma' },
  { slug: 'rabat', name: 'Rabat', countryCode: 'ma' },
  { slug: 'marrakech', name: 'Marrakech', countryCode: 'ma' },
  { slug: 'tangier', name: 'Tangier', countryCode: 'ma' },

  // 7. Tanzania ('tz')
  { slug: 'dar-es-salaam', name: 'Dar es Salaam', countryCode: 'tz' },
  { slug: 'dodoma', name: 'Dodoma', countryCode: 'tz' },
  { slug: 'arusha', name: 'Arusha', countryCode: 'tz' },
  { slug: 'zanzibar-city', name: 'Zanzibar City', countryCode: 'tz' },

  // 8. Uganda ('ug')
  { slug: 'kampala', name: 'Kampala', countryCode: 'ug' },
  { slug: 'entebbe', name: 'Entebbe', countryCode: 'ug' },
  { slug: 'jinja', name: 'Jinja', countryCode: 'ug' },

  // 9. Algeria ('dz')
  { slug: 'algiers', name: 'Algiers', countryCode: 'dz' },
  { slug: 'oran', name: 'Oran', countryCode: 'dz' },
  { slug: 'constantine', name: 'Constantine', countryCode: 'dz' },

  // 10. Ethiopia ('et')
  { slug: 'addis-ababa', name: 'Addis Ababa', countryCode: 'et' },
  { slug: 'dire-dawa', name: 'Dire Dawa', countryCode: 'et' },
  { slug: 'mekelle', name: 'Mekelle', countryCode: 'et' },
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

export const COUNTRY_NAMES_UR: Record<string, string> = {
  pk: 'پاکستان',
  ae: 'متحدہ عرب امارات',
  sa: 'سعودی عرب',
  qa: 'قطر',
  kw: 'کویت',
  bh: 'بحرین',
  om: 'عمان',
  in: 'بھارت',
  bd: 'بنگلہ دیش',
  tr: 'ترکی',
  us: 'امریکہ',
  ca: 'کینیڈا',
  mx: 'میکسیکو',
  br: 'برازیل',
  co: 'کولمبیا',
  uk: 'برطانیہ',
  gb: 'برطانیہ',
  de: 'جرمنی',
  fr: 'فرانس',
  it: 'اٹلی',
  es: 'اسپین',
  nl: 'نیدرلینڈز',
  se: 'سویڈن',
  ch: 'سوئٹزرلینڈ',
  be: 'بیلجیم',
  at: 'آسٹریا',
  pl: 'پولینڈ',
  ie: 'آئرلینڈ',
  au: 'آسٹریلیا',
  nz: 'نیوزی لینڈ',
  my: 'ملائیشیا',
  sg: 'سنگاپور',
  id: 'انڈونیشیا',
  ph: 'فلپائن',
  th: 'تھائی لینڈ',
  vn: 'ویتنام',
  jp: 'جاپان',
  kr: 'جنوبی کوریا',
  za: 'جنوبی افریقہ',
  eg: 'مصر',
  ng: 'نائجیریا',
  ke: 'کینیا',
  gh: 'گھانا',
  ma: 'مراکش',
  tz: 'تنزانیہ',
  ug: 'یوگنڈا',
  dz: 'الجزائر',
  et: 'ایتھوپیا',
};

export const COUNTRY_NAMES_AR: Record<string, string> = {
  pk: 'باكستان',
  ae: 'الإمارات العربية المتحدة',
  sa: 'المملكة العربية السعودية',
  qa: 'قطر',
  kw: 'الكويت',
  bh: 'البحرين',
  om: 'عُمان',
  in: 'الهند',
  bd: 'بنغلاديش',
  tr: 'تركيا',
  us: 'الولايات المتحدة',
  ca: 'كندا',
  mx: 'المكسيك',
  br: 'البرازيل',
  co: 'كولومبيا',
  uk: 'المملكة المتحدة',
  gb: 'المملكة المتحدة',
  de: 'ألمانيا',
  fr: 'فرنسا',
  it: 'إيطاليا',
  es: 'إسبانيا',
  nl: 'هولندا',
  se: 'السويد',
  ch: 'سويسرا',
  be: 'بلجيكا',
  at: 'النمسا',
  pl: 'بولندا',
  ie: 'أيرلندا',
  au: 'أستراليا',
  nz: 'نيوزيلندا',
  my: 'ماليزيا',
  sg: 'سنغافورة',
  id: 'إندونيسيا',
  ph: 'الفلبين',
  th: 'تايلاند',
  vn: 'فيتنام',
  jp: 'اليابان',
  kr: 'كوريا الجنوبية',
  za: 'جنوب أفريقيا',
  eg: 'مصر',
  ng: 'نيجيريا',
  ke: 'كينيا',
  gh: 'غانا',
  ma: 'المغرب',
  tz: 'تنزانيا',
  ug: 'أوغندا',
  dz: 'الجزائر',
  et: 'إثيوبيا',
};

export const CITY_NAMES_UR: Record<string, string> = {
  // Pakistan (Top 30 Cities)
  karachi: 'کراچی',
  lahore: 'لاہور',
  faisalabad: 'فیصل آباد',
  rawalpindi: 'راولپنڈی',
  gujranwala: 'گوجرانوالہ',
  peshawar: 'پشاور',
  multan: 'ملتان',
  hyderabad: 'حیدرآباد',
  islamabad: 'اسلام آباد',
  quetta: 'کوئٹہ',
  bahawalpur: 'بہاولپور',
  sargodha: 'سرگودھا',
  sialkot: 'سیالکوٹ',
  sukkur: 'سکھر',
  larkana: 'لاڑکانہ',
  sheikhupura: 'شیخوپورہ',
  'rahim-yar-khan': 'رحیم یار خان',
  jhang: 'جھنگ',
  'dera-ghazi-khan': 'ڈیرہ غازی خان',
  gujrat: 'گجرات',
  sahiwal: 'ساہیوال',
  'wah-cantonment': 'واہ کینٹ',
  mardan: 'مردان',
  kasur: 'قصور',
  okara: 'اوکاڑہ',
  mingora: 'مینگورہ',
  nawabshah: 'نواب شاہ',
  chiniot: 'چنیوٹ',
  kotri: 'کوٹری',
  kamoke: 'کامونکے',

  // UAE
  dubai: 'دبئی',
  'abu-dhabi': 'ابوظہبی',
  sharjah: 'شارجہ',
  ajman: 'عجمان',
  'ras-al-khaimah': 'راس الخیمہ',
  fujairah: 'فجیرہ',
  'umm-al-quwain': 'ام القیوین',
  'al-ain': 'العین',

  // Saudi Arabia
  riyadh: 'ریاض',
  jeddah: 'جدہ',
  makkah: 'مکہ مکرمہ',
  madinah: 'مدینہ منورہ',
  dammam: 'دمام',
  khobar: 'الخبر',
  dhahran: 'ظہران',
  jubail: 'جبیل',
  taif: 'طائف',
  tabuk: 'تبوک',
  abha: 'ابہا',
  buraydah: 'بریدہ',
  yanbu: 'ینبع',
  najran: 'نجران',
  'al-qatif': 'قطیف',
  hail: 'حائل',
  // Qatar
  doha: 'دوحہ',
  'al-rayyan': 'الریان',
  'al-wakrah': 'الواکرہ',
  'al-khor': 'الخور',
  'umm-salal': 'ام صلال',
  lusail: 'لوسیل',
  'madinat-ash-shamal': 'مدینۃ الشمال',

  // Kuwait
  'kuwait-city': 'کویت سٹی',
  kuwait: 'کویت سٹی',
  'al-ahmadi': 'الاحمدی',
  hawalli: 'حولی',
  salmiya: 'سالمية',
  'al-farwaniyah': 'الفروانیہ',
  'al-jahra': 'الجھراء',
  'mubarak-al-kabeer': 'مبارک الکبیر',

  // Oman & Bahrain
  manama: 'منامہ',
  muscat: 'مسقط',

  // United States
  'new-york': 'نیویارک',
  'los-angeles': 'لاس اینجلس',
  chicago: 'شکاگو',
  houston: 'ہیوسٹن',
  phoenix: 'فینکس',
  philadelphia: 'فلاڈیلفیا',
  'san-antonio': 'سان انتونیو',
  'san-diego': 'سان ڈیاگو',
  dallas: 'ڈیلاس',
  'san-jose': 'سان ہوزے',
  austin: 'آسٹن',
  'san-francisco': 'سان فرانسسکو',
  seattle: 'سیئٹل',
  denver: 'ڈینور',
  washington: 'واشنگٹن',

  // Canada
  toronto: 'ٹورنٹو',
  montreal: 'مانٹریال',
  vancouver: 'وینکوور',
  calgary: 'کیلگری',
  edmonton: 'ایڈمنٹن',
  ottawa: 'اوٹاوا',
  winnipeg: 'ونی پیگ',
  'quebec-city': 'کیوبک سٹی',
  hamilton: 'ہیملٹن',
  halifax: 'ہیلی فیکس',

  // United Kingdom
  london: 'لندن',
  birmingham: 'برمنگھم',
  manchester: 'مانچسٹر',
  glasgow: 'گلاسگو',
  liverpool: 'لیورپول',
  edinburgh: 'ایڈنبرا',
  leeds: 'لیڈز',
  sheffield: 'شیفیلڈ',
  bristol: 'برسٹل',
  cardiff: 'کارڈف',

  // Australia
  sydney: 'سڈنی',
  melbourne: 'میلبورن',
  brisbane: 'برسبین',
  perth: 'پرتھ',
  adelaide: 'ایڈیلیڈ',
  'gold-coast': 'گولڈ کوسٹ',
  canberra: 'کینبرا',
  newcastle: 'نیو کیسل',
  hobart: 'ہوبارٹ',
  darwin: 'ڈارون',
  // Middle East & South Asia
  istanbul: 'استنبول',
  mumbai: 'ممبئی',
  delhi: 'دہلی',

  // Top Asian Countries (33 Cities)
  // 1. Indonesia ('id')
  jakarta: 'جکارتہ',
  surabaya: 'سورابایا',
  bandung: 'بانڈونگ',
  medan: 'میدان',
  denpasar: 'ڈنپاسار',

  // 2. Malaysia ('my')
  'kuala-lumpur': 'کوالالمپور',
  'george-town': 'جارج ٹاؤن',
  'johor-bahru': 'جوہر باہرُو',
  'shah-alam': 'شاہ عالم',

  // 3. Singapore ('sg')
  'singapore-city': 'سنگاپور سٹی',
  singapore: 'سنگاپور',

  // 4. Philippines ('ph')
  manila: 'منیلا',
  'quezon-city': 'کیوزون سٹی',
  'cebu-city': 'سیبو سٹی',
  'davao-city': 'داواؤ سٹی',

  // 5. Thailand ('th')
  bangkok: 'بینکاک',
  'chiang-mai': 'چیانگ مائی',
  phuket: 'فوکٹ',
  pattaya: 'پٹایا',

  // 6. Vietnam ('vn')
  'ho-chi-minh-city': 'ہو چی منہ سٹی',
  hanoi: 'ہنوئی',
  'da-nang': 'دا نانگ',

  // 7. Bangladesh ('bd')
  dhaka: 'ڈھاکہ',
  chittagong: 'چٹاگانگ',
  sylhet: 'سلہٹ',
  rajshahi: 'راجشاہی',

  // 8. Japan ('jp')
  tokyo: 'ٹوکیو',
  osaka: 'اوساکا',
  yokohama: 'یوکوہاما',
  kyoto: 'کیوٹو',

  // 9. South Korea ('kr')
  seoul: 'سیول',
  busan: 'بوسان',
  incheon: 'انچیون',
  daegu: 'ڈیگو',

  // Top 10 European Countries (42 Cities)
  // Germany
  berlin: 'برلن',
  munich: 'میونخ',
  frankfurt: 'فرینکفرٹ',
  hamburg: 'ہیمبرگ',
  cologne: 'کولون',

  // France
  paris: 'پیرس',
  marseille: 'مارسیل',
  lyon: 'لیون',
  toulouse: 'ٹولوز',
  nice: 'نائس',

  // Italy
  rome: 'روم',
  milan: 'میلان',
  naples: 'نیپلز',
  turin: 'ٹیورن',
  florence: 'فلورنس',

  // Spain
  madrid: 'میڈرڈ',
  barcelona: 'بارسلونا',
  valencia: 'ویلینسیا',
  seville: 'اشبیلیہ (سیویل)',
  zaragoza: 'سراگوسا',

  // Netherlands
  amsterdam: 'ایمسٹرڈم',
  rotterdam: 'روٹرڈم',
  'the-hague': 'دی ہیگ',
  utrecht: 'یوٹریکٹ',
  eindhoven: 'آئندھوون',

  // Sweden
  stockholm: 'اسٹاک ہوم',
  gothenburg: 'گوٹنبرگ',
  malmo: 'مالمو',

  // Switzerland
  zurich: 'زیورخ',
  geneva: 'جنیوا',
  basel: 'باسل',
  bern: 'برن',

  // Belgium
  brussels: 'برسلز',
  antwerp: 'اینٹورپ',
  ghent: 'گینٹ',

  // Austria
  vienna: 'ویانا',
  graz: 'گریز',
  linz: 'لنزم',

  // Poland
  warsaw: 'وارسا',
  krakow: 'کراکو',
  lodz: 'لوڈز',
  wroclaw: 'وروکلاو',

  // African Cities (Top 10 Countries)
  // Nigeria
  lagos: 'لاگوس',
  abuja: 'ابوجا',
  'port-harcourt': 'پورٹ ہارکورٹ',
  kano: 'کانو',
  ibadan: 'عبادان',

  // South Africa
  johannesburg: 'جوہانسبرگ',
  'cape-town': 'کیپ ٹاؤن',
  durban: 'ڈربن',
  pretoria: 'پریٹوریا',
  'port-elizabeth': 'پورٹ الزبتھ',

  // Egypt
  cairo: 'قاہرہ',
  alexandria: 'اسکندریہ',
  giza: 'جیزہ',
  'sharm-el-sheikh': 'شرم الشیخ',

  // Kenya
  nairobi: 'نیروبی',
  mombasa: 'ممباسا',
  kisumu: 'کسومو',
  nakuru: 'نکورو',

  // Ghana
  accra: 'اکرا',
  kumasi: 'کوماسی',
  tamale: 'تمالی',
  'sekondi-takoradi': 'سیکونڈی تکورادی',

  // Morocco
  casablanca: 'دار البیضاء (کاسا بلانکا)',
  rabat: 'رباط',
  marrakech: 'مراکش',
  tangier: 'طنجہ',

  // Tanzania
  'dar-es-salaam': 'دار السلام',
  dodoma: 'ڈوڈوما',
  arusha: 'اروشا',
  'zanzibar-city': 'زنجبار سٹی',

  // Uganda
  kampala: 'کمپالا',
  entebbe: 'اینتیبے',
  jinja: 'جنجا',

  // Algeria
  algiers: 'الجزائر شہر',
  oran: 'وہران',
  constantine: 'قسنطینہ',

  // Ethiopia
  'addis-ababa': 'ادیس ابابا',
  'dire-dawa': 'دائرے داوا',
  mekelle: 'میکیلے',

  // Brazil
  'sao-paulo': 'ساؤ پالو',
  'rio-de-janeiro': 'ریو ڈی جنیرو',
  brasilia: 'براسیلیا',

  // Mexico
  'mexico-city': 'میکسیکو سٹی',
  guadalajara: 'گوادلہارا',
  monterrey: 'مونٹیری',

  // Colombia
  bogota: 'بوگوٹا',
  medellin: 'میڈلین',
  cali: 'کالی',

  // Oman & Bahrain
  salalah: 'صلالہ',
  sohar: 'صحار',
  muharraq: 'محرق',
  riffa: 'رفاع',

  // New Zealand
  auckland: 'آکلینڈ',
  wellington: 'ویلنگٹن',
  christchurch: 'کرائسٹ چرچ',

  // Turkey
  ankara: 'انقرہ',
  izmir: 'ازمیر',

  // Ireland
  dublin: 'ڈبلن',
  cork: 'کارک',
  galway: 'گالوے',
};

export const CITY_NAMES_AR: Record<string, string> = {
  // Pakistan (Top 30 Cities)
  karachi: 'كراتشي',
  lahore: 'لاهور',
  faisalabad: 'فيصل آباد',
  rawalpindi: 'راولبندي',
  gujranwala: 'غوجرانوالا',
  peshawar: 'بيشاور',
  multan: 'ملتان',
  hyderabad: 'حيدر أباد',
  islamabad: 'إسلام آباد',
  quetta: 'كويتا',
  bahawalpur: 'بهاولبور',
  sargodha: 'سرغودها',
  sialkot: 'سيالكوت',
  sukkur: 'سكر',
  larkana: 'لاركانا',
  sheikhupura: 'شيخوبورا',
  'rahim-yar-khan': 'رحيم يار خان',
  jhang: 'جهانغ',
  'dera-ghazi-khan': 'ديرا غازي خان',
  gujrat: 'غوجرات',
  sahiwal: 'ساهيوال',
  'wah-cantonment': 'واه كانتونمنت',
  mardan: 'مردان',
  kasur: 'قصور',
  okara: 'أوكارا',
  mingora: 'مينغورا',
  nawabshah: 'نواب شاه',
  chiniot: 'شينيوت',
  kotri: 'كوتري',
  kamoke: 'كاموكي',

  // UAE
  dubai: 'دبي',
  'abu-dhabi': 'أبوظبي',
  sharjah: 'الشارقة',
  ajman: 'عجمان',
  'ras-al-khaimah': 'رأس الخيمة',
  fujairah: 'الفجيرة',
  'umm-al-quwain': 'أم القيوين',
  'al-ain': 'العين',

  // Saudi Arabia
  riyadh: 'الرياض',
  jeddah: 'جدة',
  makkah: 'مكة المكرمة',
  madinah: 'المدينة المنورة',
  dammam: 'الدمام',
  khobar: 'الخبر',
  dhahran: 'الظهران',
  jubail: 'الجبيل',
  taif: 'الطائف',
  tabuk: 'تبوك',
  abha: 'أبها',
  buraydah: 'بريدة',
  yanbu: 'ينبع',
  najran: 'نجران',
  'al-qatif': 'القطيف',
  hail: 'حائل',

  // Qatar
  doha: 'الدوحة',
  'al-rayyan': 'الريان',
  'al-wakrah': 'الوكرة',
  'al-khor': 'الخور',
  'umm-salal': 'أم صلال',
  lusail: 'لوسيل',
  'madinat-ash-shamal': 'مدينة الشمال',

  // Kuwait
  'kuwait-city': 'مدينة الكويت',
  kuwait: 'مدينة الكويت',
  'al-ahmadi': 'الأحمدي',
  hawalli: 'حولي',
  salmiya: 'السالمية',
  'al-farwaniyah': 'الفروانية',
  'al-jahra': 'الجهراء',
  'mubarak-al-kabeer': 'مبارك الكبير',

  // Oman & Bahrain
  manama: 'المنامة',
  muscat: 'مسقط',

  // United States
  'new-york': 'نيويورك',
  'los-angeles': 'لوس أنجلوس',
  chicago: 'شيكاغو',
  houston: 'هيوستن',
  phoenix: 'فينيكس',
  philadelphia: 'فيلادلفيا',
  'san-antonio': 'سان أنطونيو',
  'san-diego': 'سان دييغو',
  dallas: 'دالاس',
  'san-jose': 'سان خوسيه',
  austin: 'أوستن',
  'san-francisco': 'سان فرانسيسكو',
  seattle: 'سياتل',
  denver: 'دنفر',
  washington: 'واشنطن',

  // Canada
  toronto: 'تورونتو',
  montreal: 'مونتريال',
  vancouver: 'فانكوفر',
  calgary: 'كالغاري',
  edmonton: 'إدمونتون',
  ottawa: 'أوتاوا',
  winnipeg: 'وينيبيغ',
  'quebec-city': 'مدينة كيبك',
  hamilton: 'هاميلتون',
  halifax: 'هاليفاكس',

  // United Kingdom
  london: 'لندن',
  birmingham: 'برمنغهام',
  manchester: 'مانشستر',
  glasgow: 'غلاسكو',
  liverpool: 'ليفربول',
  edinburgh: 'إدنبرة',
  leeds: 'ليدز',
  sheffield: 'شيفيلد',
  bristol: 'بريستول',
  cardiff: 'كارديف',

  // Australia
  sydney: 'سيدني',
  melbourne: 'ملبورن',
  brisbane: 'بريزبان',
  perth: 'بيرث',
  adelaide: 'أديلايد',
  'gold-coast': 'غولد كوست',
  canberra: 'كانبرا',
  newcastle: 'نيوكاسل',
  hobart: 'هوبارت',
  darwin: 'داروين',
  // Middle East & South Asia
  istanbul: 'إسطنبول',
  mumbai: 'مومباي',
  delhi: 'دلهي',

  // Top Asian Countries (33 Cities)
  // 1. Indonesia ('id')
  jakarta: 'جاكرتا',
  surabaya: 'سورابايا',
  bandung: 'باندونغ',
  medan: 'ميدان',
  denpasar: 'دنپاسار',

  // 2. Malaysia ('my')
  'kuala-lumpur': 'كوالالمبور',
  'george-town': 'جورج تاون',
  'johor-bahru': 'جوهر بهرو',
  'shah-alam': 'شاه علم',

  // 3. Singapore ('sg')
  'singapore-city': 'مدينة سنغافورة',
  singapore: 'سنغافورة',

  // 4. Philippines ('ph')
  manila: 'مانيلا',
  'quezon-city': 'مدينة كيزون',
  'cebu-city': 'مدينة سيبو',
  'davao-city': 'مدينة دافاو',

  // 5. Thailand ('th')
  bangkok: 'بانكوك',
  'chiang-mai': 'تشيانغ ماي',
  phuket: 'بوكيت',
  pattaya: 'باتايا',

  // 6. Vietnam ('vn')
  'ho-chi-minh-city': 'مدينة هو تشي منه',
  hanoi: 'هانوي',
  'da-nang': 'دا نانغ',

  // 7. Bangladesh ('bd')
  dhaka: 'دكا',
  chittagong: 'شيتاغونغ',
  sylhet: 'سلهت',
  rajshahi: 'راجشاهي',

  // 8. Japan ('jp')
  tokyo: 'طوكيو',
  osaka: 'أوساكا',
  yokohama: 'يوكوهاما',
  kyoto: 'كيوتو',

  // 9. South Korea ('kr')
  seoul: 'سيول',
  busan: 'بوسان',
  incheon: 'إنشيون',
  daegu: 'دايغو',

  // Top 10 European Countries (42 Cities)
  // Germany
  berlin: 'برلين',
  munich: 'ميونخ',
  frankfurt: 'فرانكفورت',
  hamburg: 'هامبورغ',
  cologne: 'كولونيا',

  // France
  paris: 'باريس',
  marseille: 'مارسيليا',
  lyon: 'ليون',
  toulouse: 'تولوز',
  nice: 'نيس',

  // Italy
  rome: 'روما',
  milan: 'ميلانو',
  naples: 'نابولي',
  turin: 'تورينو',
  florence: 'فلورنسا',

  // Spain
  madrid: 'مدريد',
  barcelona: 'برشلونة',
  valencia: 'فالنسيا',
  seville: 'إشبيلية',
  zaragoza: 'سرقسطة',

  // Netherlands
  amsterdam: 'أمستردام',
  rotterdam: 'روتردام',
  'the-hague': 'لاهاي',
  utrecht: 'أوتريخت',
  eindhoven: 'آيندهوفن',

  // Sweden
  stockholm: 'ستوكهولم',
  gothenburg: 'غوتنبرغ',
  malmo: 'مالمو',

  // Switzerland
  zurich: 'زيورخ',
  geneva: 'جنيف',
  basel: 'بازل',
  bern: 'برن',

  // Belgium
  brussels: 'بروكسل',
  antwerp: 'أنتويرب',
  ghent: 'غنت',

  // Austria
  vienna: 'فيينا',
  graz: 'غراتس',
  linz: 'لينتس',

  // Poland
  warsaw: 'وارسو',
  krakow: 'كراكوف',
  lodz: 'وودج',
  wroclaw: 'فروتسواف',
  // African Cities (Top 10 Countries)
  // Nigeria
  lagos: 'لاغوس',
  abuja: 'أبوجا',
  'port-harcourt': 'بورت هاركورت',
  kano: 'كانو',
  ibadan: 'إبادان',

  // South Africa
  johannesburg: 'جوهانسبرغ',
  'cape-town': 'كيب تاون',
  durban: 'ديربان',
  pretoria: 'بريتوريا',
  'port-elizabeth': 'بورت إليزابيث',

  // Egypt
  cairo: 'القاهرة',
  alexandria: 'الإسكندرية',
  giza: 'الجيزة',
  'sharm-el-sheikh': 'شرم الشيخ',

  // Kenya
  nairobi: 'نيروبي',
  mombasa: 'مومباسا',
  kisumu: 'كيسومو',
  nakuru: 'ناكورو',

  // Ghana
  accra: 'أكرا',
  kumasi: 'كوماسي',
  tamale: 'تامالي',
  'sekondi-takoradi': 'سيكوندي تاكورادي',

  // Morocco
  casablanca: 'الدار البيضاء',
  rabat: 'الرباط',
  marrakech: 'مراكش',
  tangier: 'طنجة',

  // Tanzania
  'dar-es-salaam': 'دار السلام',
  dodoma: 'دودوما',
  arusha: 'أروشا',
  'zanzibar-city': 'مدينة زنجبار',

  // Uganda
  kampala: 'كامبالا',
  entebbe: 'عنتيبي',
  jinja: 'جينجا',

  // Algeria
  algiers: 'الجزائر',
  oran: 'وهران',
  constantine: 'قسنطينة',

  // Ethiopia
  'addis-ababa': 'أديس أبابا',
  'dire-dawa': 'ديري داوا',
  mekelle: 'ميكيلي',

  // Brazil
  'sao-paulo': 'ساو باولو',
  'rio-de-janeiro': 'ريو دي جانيرو',
  brasilia: 'برازيليا',

  // Mexico
  'mexico-city': 'مدينة مكسيكو',
  guadalajara: 'غوادالاخارا',
  monterrey: 'مونتيري',

  // Colombia
  bogota: 'بوغوتا',
  medellin: 'ميديلين',
  cali: 'كالي',

  // Oman & Bahrain
  salalah: 'صلالة',
  sohar: 'صحار',
  muharraq: 'المحرق',
  riffa: 'الرفاع',

  // New Zealand
  auckland: 'أوكلاند',
  wellington: 'ويلينغتون',
  christchurch: 'كرايستشيرش',

  // Turkey
  ankara: 'أنقرة',
  izmir: 'إزمير',

  // Ireland
  dublin: 'دبلن',
  cork: 'كورك',
  galway: 'غالواي',
};

export function getLocalizedCountryName(countryOrCode: Country | string, lang = 'en'): string {
  const code = typeof countryOrCode === 'string' ? countryOrCode.toLowerCase() : countryOrCode.code.toLowerCase();
  if (lang === 'ur' && COUNTRY_NAMES_UR[code]) return COUNTRY_NAMES_UR[code];
  if (lang === 'ar' && COUNTRY_NAMES_AR[code]) return COUNTRY_NAMES_AR[code];
  if (typeof countryOrCode === 'object' && countryOrCode.name) return countryOrCode.name;
  const c = getCountryByCode(code);
  return c.name;
}

export function getLocalizedCityName(cityOrSlug: City | string, lang = 'en'): string {
  const slug = typeof cityOrSlug === 'string' ? cityOrSlug.toLowerCase() : cityOrSlug.slug.toLowerCase();
  if (lang === 'ur' && CITY_NAMES_UR[slug]) return CITY_NAMES_UR[slug];
  if (lang === 'ar' && CITY_NAMES_AR[slug]) return CITY_NAMES_AR[slug];
  if (typeof cityOrSlug === 'object' && cityOrSlug.name) return cityOrSlug.name;
  return toTitleCase(slug);
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
export type Category = CategoryDef;

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
    icon: 'ArrowDownToLine',
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
    icon: 'Droplets',
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
    icon: 'PanelRight',
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
    icon: 'Sparkles',
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
    icon: 'BrickWall',
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
    icon: 'Brush',
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
    icon: 'Cctv',
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
    icon: 'ChefHat',
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
    icon: 'PenTool',
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

export function getCategoryName(catOrSlug: CategoryDef | string | undefined | null, lang = 'en'): string {
  if (!catOrSlug) return '';
  const cat = typeof catOrSlug === 'string' ? getCategoryBySlug(catOrSlug) : catOrSlug;
  if (!cat) {
    if (typeof catOrSlug === 'string') {
      const clean = catOrSlug.toLowerCase().trim();
      if (lang === 'ur' && (clean === 'car-mechanic' || clean === 'auto-mechanic')) return 'کار مکینک';
      if (lang === 'ar' && (clean === 'car-mechanic' || clean === 'auto-mechanic')) return 'ميكانيكي سيارات';
      return toTitleCase(catOrSlug);
    }
    return '';
  }
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
    status: row.status || (row.is_verified ? 'approved' : 'pending'),
    is_featured: Boolean(row.is_featured),
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
  const normCity = (citySlug || 'karachi').toLowerCase();
  const category = categorySlug ? getCategoryBySlug(categorySlug) : null;
  const targetCategoryIds = category ? [category.id, category.slug] : categorySlug ? [categorySlug.toLowerCase()] : [];

  let dbProviders: Provider[] = [];
  try {
    // Only approved providers are visible on the public frontend
    let queryPath = `providers?select=*,cities!inner(slug),countries!inner(code)&cities.slug=eq.${encodeURIComponent(normCity)}&status=eq.approved`;
    if (category) {
      queryPath += `&category_id=in.(${targetCategoryIds.map(encodeURIComponent).join(',')})`;
    }
    const dbRows = await fetchSupabase<any[]>(queryPath);
    if (dbRows && dbRows.length > 0) {
      dbProviders = dbRows.map((r) => mapDbProvider(r, normCity));
    }
  } catch (err) {
    console.warn('getProviders fetch note:', err);
  }

  // Matching approved seed providers for this city and category
  const matchingSeeds = SEED_PROVIDERS.filter((p) => {
    // Only approved providers should be visible on public frontend
    const override = localProvidersOverrides.get(p.id) || localProvidersOverrides.get(p.slug);
    const status = override?.status !== undefined ? override.status : p.status || (p.is_verified ? 'approved' : 'pending');
    if (status !== 'approved') return false;

    const cityMatch = p.city_slug.toLowerCase() === normCity;
    if (!categorySlug) return cityMatch;
    const catMatch =
      p.category_id.toLowerCase() === categorySlug.toLowerCase() ||
      (category && p.category_id.toLowerCase() === category.id.toLowerCase()) ||
      (category && category.aliases?.includes(p.category_id.toLowerCase())) ||
      p.slug.toLowerCase().includes(categorySlug.toLowerCase());
    return cityMatch && catMatch;
  });

  // Combine DB providers + Seed providers without duplicate slugs
  const seenSlugs = new Set<string>();
  const combined: Provider[] = [];

  for (const pro of [...dbProviders, ...matchingSeeds]) {
    const s = pro.slug.toLowerCase();
    if (!seenSlugs.has(s)) {
      seenSlugs.add(s);
      combined.push(pro);
    }
  }

  return combined;
}

export async function getFeaturedProviders(
  cityIdOrSlug: string,
  categoryIdOrSlug: string,
  currentProviderSlug?: string
): Promise<Provider[]> {
  const normCity = (cityIdOrSlug || 'karachi').toLowerCase().trim();
  const normCat = (categoryIdOrSlug || '').toLowerCase().trim();
  const normCurrentSlug = (currentProviderSlug || '').toLowerCase().trim();

  const category = normCat ? getCategoryBySlug(normCat) : null;
  const targetCategoryIds = category
    ? [category.id, category.slug, ...(category.aliases || [])]
    : normCat
    ? [normCat]
    : [];

  let dbProviders: Provider[] = [];
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(normCity);
    let queryPath = `providers?select=*,cities!inner(slug,name),countries!inner(code,name)&is_featured=eq.true&status=eq.approved`;

    if (isUuid) {
      queryPath += `&city_id=eq.${encodeURIComponent(normCity)}`;
    } else {
      queryPath += `&cities.slug=eq.${encodeURIComponent(normCity)}`;
    }

    if (targetCategoryIds.length > 0) {
      queryPath += `&category_id=in.(${targetCategoryIds.map(encodeURIComponent).join(',')})`;
    }

    if (normCurrentSlug) {
      queryPath += `&slug=neq.${encodeURIComponent(normCurrentSlug)}`;
    }

    queryPath += `&order=rating.desc,review_count.desc`;

    const dbRows = await fetchSupabase<any[]>(queryPath);
    if (dbRows && dbRows.length > 0) {
      dbProviders = dbRows.map((r) => mapDbProvider(r, normCity));
    }
  } catch (err) {
    console.warn('getFeaturedProviders fetch note:', err);
  }

  // Matching approved and featured seed providers
  const matchingSeeds = SEED_PROVIDERS.filter((p) => {
    // Check local in-memory override or static seed flag
    const override = localProvidersOverrides.get(p.id) || localProvidersOverrides.get(p.slug);
    const isFeatured = override?.is_featured !== undefined ? override.is_featured : p.is_featured;
    if (!isFeatured) return false;

    const status = override?.status !== undefined ? override.status : p.status || (p.is_verified ? 'approved' : 'pending');
    if (status !== 'approved') return false;

    // Filter by city
    const cityMatch =
      p.city_slug.toLowerCase() === normCity ||
      (p as any).city_id?.toLowerCase() === normCity;
    if (!cityMatch) return false;

    // Filter by category
    const catMatch =
      !normCat ||
      p.category_id.toLowerCase() === normCat ||
      targetCategoryIds.some((tc) => tc.toLowerCase() === p.category_id.toLowerCase()) ||
      (category && category.aliases?.some((a) => a.toLowerCase() === p.category_id.toLowerCase())) ||
      p.slug.toLowerCase().includes(normCat);
    if (!catMatch) return false;

    // Exclude current provider
    if (normCurrentSlug && p.slug.toLowerCase() === normCurrentSlug) {
      return false;
    }

    return true;
  });

  // Combine DB providers + Seed providers without duplicate slugs
  const seenSlugs = new Set<string>();
  const combined: Provider[] = [];

  for (const pro of [...dbProviders, ...matchingSeeds]) {
    const s = pro.slug.toLowerCase();
    if (normCurrentSlug && s === normCurrentSlug) continue;
    if (!seenSlugs.has(s)) {
      seenSlugs.add(s);
      combined.push(pro);
    }
  }

  return combined;
}

export async function getProviderBySlug(citySlug: string, categorySlug: string, providerSlug: string): Promise<Provider | null> {
  const normSlug = (providerSlug || '').toLowerCase();
  const normCity = (citySlug || 'karachi').toLowerCase();

  // 1. Direct query in Supabase by slug
  try {
    const dbRows = await fetchSupabase<any[]>(
      `providers?select=*,cities!inner(slug),countries!inner(code)&slug=eq.${encodeURIComponent(normSlug)}`
    );
    if (dbRows && dbRows.length > 0) {
      const p = mapDbProvider(dbRows[0], normCity);
      const override = localProvidersOverrides.get(p.id) || localProvidersOverrides.get(p.slug);
      if (override) {
        Object.assign(p, override);
      }
      return p;
    }
  } catch (err) {
    console.warn('getProviderBySlug direct fetch note:', err);
  }

  // 2. Direct match in SEED_PROVIDERS by exact slug or normalized slug
  const seed = SEED_PROVIDERS.find(
    (p) => p.slug.toLowerCase() === normSlug || p.slug.toLowerCase().replace(/-/g, '') === normSlug.replace(/-/g, '')
  );
  if (seed) {
    const pro = { ...seed };
    const override = localProvidersOverrides.get(pro.id) || localProvidersOverrides.get(pro.slug);
    if (override) {
      Object.assign(pro, override);
    } else if (!pro.status) {
      pro.status = pro.is_verified ? 'approved' : 'pending';
    }
    return pro;
  }

  // 3. Fallback: check local memory overrides directly by slug
  const directOverride = localProvidersOverrides.get(normSlug);
  if (directOverride) {
    return {
      id: directOverride.id || normSlug,
      name: directOverride.name || normSlug,
      slug: directOverride.slug || normSlug,
      profile_type: directOverride.profile_type || 'individual',
      category_id: directOverride.category_id || categorySlug,
      trade_title: directOverride.trade_title || directOverride.name || 'Specialist',
      city_slug: directOverride.city_slug || normCity,
      country_code: directOverride.country_code || 'pk',
      district: directOverride.district || normCity,
      service_area: directOverride.service_area || [],
      whatsapp_number: directOverride.whatsapp_number || '',
      avatar_url: directOverride.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(normSlug)}`,
      short_bio: directOverride.short_bio || '',
      starting_price: directOverride.starting_price || 500,
      rating: directOverride.rating || 5.0,
      review_count: directOverride.review_count || 1,
      total_leads: directOverride.total_leads || 0,
      is_verified: Boolean(directOverride.is_verified),
      is_available: Boolean(directOverride.is_available),
      status: directOverride.status || 'pending',
      is_featured: Boolean(directOverride.is_featured),
    };
  }

  return null;
}

export async function getAllProviders(): Promise<Provider[]> {
  let dbProviders: Provider[] = [];
  try {
    const dbRows = await fetchSupabase<any[]>('providers?select=*,cities!inner(slug),countries!inner(code)&status=eq.approved');
    if (dbRows && dbRows.length > 0) {
      dbProviders = dbRows.map((r) => mapDbProvider(r, 'karachi'));
    }
  } catch (err) {
    console.warn('getAllProviders fetch note:', err);
  }

  // Combine DB providers + Seed providers strictly filtering for status === 'approved'
  const seenSlugs = new Set<string>();
  const combined: Provider[] = [];

  const approvedSeeds = SEED_PROVIDERS.filter((p) => {
    const override = localProvidersOverrides.get(p.id) || localProvidersOverrides.get(p.slug);
    const status = override?.status !== undefined ? override.status : p.status || (p.is_verified ? 'approved' : 'pending');
    return status === 'approved';
  });

  for (const pro of [...dbProviders, ...approvedSeeds]) {
    const s = pro.slug.toLowerCase();
    if (!seenSlugs.has(s)) {
      seenSlugs.add(s);
      combined.push(pro);
    }
  }

  return combined;
}

export const CITY_DISTRICTS: Record<string, string[]> = {
  // Pakistan
  karachi: [
    'DHA & Clifton',
    'Gulshan-e-Iqbal',
    'PECHS',
    'North Nazimabad',
    'Bahadurabad',
    'Federal B Area',
    'Malir',
    'Korangi',
    'Saddar',
  ],
  lahore: [
    'DHA Phase 1-8',
    'Gulberg',
    'Johar Town',
    'Model Town',
    'Cantt',
    'Bahria Town',
    'Askari',
  ],
  islamabad: [
    'Sector F-7',
    'Sector F-8',
    'Sector F-10',
    'Sector G-9',
    'Sector G-11',
    'Sector E-11',
    'Bahria Town',
    'DHA Phase 2',
  ],
  rawalpindi: [
    'Saddar',
    'Bahria Town',
    'Satellite Town',
    'Chaklala Scheme',
    'Westridge',
  ],
  faisalabad: [
    'D Ground',
    'Madina Town',
    'Civil Lines',
    'Jinnah Colony',
    'Samanabad',
  ],
  multan: [
    'Gulgasht Colony',
    'Cantt',
    'Bosan Road',
    'Shah Rukn-e-Alam',
  ],
  peshawar: [
    'Hayatabad',
    'University Town',
    'Cantt',
    'Saddar',
  ],

  // UAE
  dubai: [
    'Deira',
    'Business Bay',
    'Downtown Dubai',
    'Al Quoz',
    'Jumeirah',
    'Dubai Marina',
    'Al Barsha',
  ],
  'abu-dhabi': [
    'Al Danah',
    'Al Reem Island',
    'Al Khalidiya',
    'Yas Island',
    'Musaffah',
  ],
  sharjah: [
    'Al Majaz',
    'Al Nahda',
    'Al Taawun',
    'Muwaileh',
  ],

  // Saudi Arabia
  riyadh: [
    'Al Olaya',
    'Al Malqa',
    'Al Nakheel',
    'Al Yasmin',
    'Al Sulaimaniyah',
  ],
  jeddah: [
    'Al Hamra',
    'Al Rawdah',
    'Al Naeem',
    'Al Zahra',
    'Al Salamah',
  ],
  dammam: [
    'Al Faisaliyah',
    'Al Shatie',
    'Al Jalawiyah',
  ],

  // Qatar
  doha: [
    'West Bay',
    'The Pearl',
    'Al Sadd',
    'Lusail',
    'Al Mansoura',
  ],

  // Kuwait
  'kuwait-city': [
    'Sharq',
    'Salmiya',
    'Hawalli',
    'Dasman',
  ],

  // United Kingdom
  london: [
    'Westminster',
    'Camden',
    'Kensington',
    'Greenwich',
    'Islington',
    'Canary Wharf',
  ],

  // United States
  'new-york': [
    'Manhattan',
    'Brooklyn',
    'Queens',
    'Bronx',
    'Staten Island',
  ],

  // Europe Hubs
  berlin: [
    'Mitte',
    'Kreuzberg',
    'Prenzlauer Berg',
    'Charlottenburg',
    'Friedrichshain',
  ],
  paris: [
    'Le Marais',
    'Montmartre',
    'Latin Quarter',
    'Champs-Élysées',
    'Saint-Germain-des-Prés',
  ],
  rome: [
    'Trastevere',
    'Centro Storico',
    'Prati',
    'Monti',
    'Testaccio',
  ],
  madrid: [
    'Salamanca',
    'Chamberí',
    'Malasaña',
    'Chueca',
    'Retiro',
  ],
  amsterdam: [
    'Centrum',
    'Jordaan',
    'De Pijp',
    'Oud-West',
    'Zuid',
  ],
  stockholm: [
    'Gamla Stan',
    'Södermalm',
    'Östermalm',
    'Norrmalm',
    'Kungsholmen',
  ],
  zurich: [
    'Altstadt',
    'Aussersihl',
    'Wiedikon',
    'Enge',
    'Oerlikon',
  ],
  brussels: [
    'Pentagone',
    'Ixelles',
    'Saint-Gilles',
    'Etterbeek',
    'Uccle',
  ],
  vienna: [
    'Innere Stadt',
    'Leopoldstadt',
    'Neubau',
    'Josefstadt',
    'Alsergrund',
  ],
  warsaw: [
    'Śródmieście',
    'Mokotów',
    'Wola',
    'Praga',
    'Ursynów',
  ],

  // Africa Hubs
  cairo: [
    'Zamalek',
    'Maadi',
    'Nasr City',
    'Heliopolis',
    'New Cairo',
    'Dokki',
  ],
  lagos: [
    'Victoria Island',
    'Ikoyi',
    'Lekki Phase 1',
    'Ikeja',
    'Yaba',
    'Surulere',
  ],
  johannesburg: [
    'Sandton',
    'Rosebank',
    'Randburg',
    'Midrand',
    'Soweto',
    'Fourways',
  ],
  nairobi: [
    'Westlands',
    'Kilimani',
    'Karen',
    'Lavington',
    'Upper Hill',
    'Kileleshwa',
  ],
  casablanca: [
    'Maârif',
    'Anfa',
    'Gauthier',
    'Bourgogne',
    'Ain Diab',
  ],

  // Australia
  sydney: [
    'Sydney CBD',
    'Bondi',
    'Surry Hills',
    'Parramatta',
    'Manly',
    'Chatswood',
  ],
  melbourne: [
    'Melbourne CBD',
    'Southbank',
    'St Kilda',
    'Carlton',
    'Richmond',
    'Docklands',
  ],
  brisbane: [
    'Brisbane CBD',
    'Fortitude Valley',
    'South Brisbane',
    'West End',
    'New Farm',
  ],
  perth: [
    'Perth CBD',
    'Northbridge',
    'Fremantle',
    'Subiaco',
    'Scarborough',
  ],

  // Asia Hubs
  tokyo: [
    'Shinjuku',
    'Shibuya',
    'Ginza',
    'Roppongi',
    'Minato',
    'Chiyoda',
  ],
  seoul: [
    'Gangnam',
    'Hongdae',
    'Itaewon',
    'Myeongdong',
    'Jongno',
    'Mapo',
  ],
  bangkok: [
    'Sukhumvit',
    'Silom',
    'Sathorn',
    'Siam',
    'Thonglor',
  ],
  jakarta: [
    'Menteng',
    'Kuningan',
    'Sudirman',
    'Kemang',
    'Kelapa Gading',
  ],
  'kuala-lumpur': [
    'Bukit Bintang',
    'KLCC',
    'Bangsar',
    'Mont Kiara',
    'Damansara',
  ],
  'singapore-city': [
    'Marina Bay',
    'Orchard Road',
    'Jurong',
    'Tampines',
    'Woodlands',
  ],
  'ho-chi-minh-city': [
    'District 1',
    'District 2 (Thao Dien)',
    'District 3',
    'Binh Thanh',
    'District 7',
  ],
  dhaka: [
    'Gulshan',
    'Banani',
    'Dhanmondi',
    'Uttara',
    'Mirpur',
  ],
  manila: [
    'Makati',
    'BGC',
    'Ortigas',
    'Ermita',
    'Malate',
  ],
};

export async function getCityDistricts(citySlug: string): Promise<string[]> {
  const normCity = (citySlug || '').toLowerCase().trim();
  if (!normCity) return [];

  const districtsSet = new Set<string>();

  // 1. Seeded districts mapped to this specific city
  if (CITY_DISTRICTS[normCity]) {
    for (const d of CITY_DISTRICTS[normCity]) {
      districtsSet.add(d);
    }
  }

  // 2. Query dynamic providers registered in this city from Supabase
  try {
    const dbRows = await fetchSupabase<any[]>(
      `providers?select=district,service_area,cities!inner(slug)&cities.slug=eq.${encodeURIComponent(normCity)}`
    );
    if (dbRows && Array.isArray(dbRows)) {
      for (const row of dbRows) {
        if (row.district && typeof row.district === 'string') {
          const trimmed = row.district.trim();
          if (trimmed && trimmed.toLowerCase() !== normCity) {
            districtsSet.add(trimmed);
          }
        }
        if (Array.isArray(row.service_area)) {
          for (const area of row.service_area) {
            if (typeof area === 'string') {
              const trimmed = area.trim();
              if (trimmed && trimmed.toLowerCase() !== normCity) {
                districtsSet.add(trimmed);
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('getCityDistricts fetch note:', err);
  }

  // 3. Dynamic districts from local SEED_PROVIDERS matching this city
  const seedsInCity = SEED_PROVIDERS.filter(
    (p) => p.city_slug.toLowerCase() === normCity
  );
  for (const sp of seedsInCity) {
    if (sp.district && sp.district.trim() && sp.district.toLowerCase() !== normCity) {
      districtsSet.add(sp.district.trim());
    }
    if (Array.isArray(sp.service_area)) {
      for (const area of sp.service_area) {
        if (typeof area === 'string' && area.trim() && area.toLowerCase() !== normCity) {
          districtsSet.add(area.trim());
        }
      }
    }
  }

  return Array.from(districtsSet).slice(0, 10);
}
