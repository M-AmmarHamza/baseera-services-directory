// Baseera Data Access Layer (Supabase + Resilient Local Seed Data)
import { createClient } from '@supabase/supabase-js';

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
  avatar_url: string;
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
    category_id: 'ac',
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
    category_id: 'food',
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
    category_id: 'ac',
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
  }
];

export const COUNTRIES = [
  { code: 'pk', name: 'Pakistan', defaultCity: 'karachi' },
  { code: 'ae', name: 'United Arab Emirates', defaultCity: 'dubai' },
  { code: 'sa', name: 'Saudi Arabia', defaultCity: 'riyadh' },
];

export const CITIES = [
  { slug: 'karachi', name: 'Karachi', countryCode: 'pk' },
  { slug: 'lahore', name: 'Lahore', countryCode: 'pk' },
  { slug: 'islamabad', name: 'Islamabad', countryCode: 'pk' },
  { slug: 'dubai', name: 'Dubai', countryCode: 'ae' },
  { slug: 'sharjah', name: 'Sharjah', countryCode: 'ae' },
  { slug: 'abu-dhabi', name: 'Abu Dhabi', countryCode: 'ae' },
  { slug: 'riyadh', name: 'Riyadh', countryCode: 'sa' },
  { slug: 'jeddah', name: 'Jeddah', countryCode: 'sa' },
];

export const CATEGORIES = [
  { id: 'electrician', slug: 'electrician', name: 'Electrician & Wiring', icon: 'bolt', count: 42 },
  { id: 'ac', slug: 'ac-repair', name: 'AC & Refrigeration', icon: 'mode_fan', count: 58 },
  { id: 'plumbing', slug: 'plumbing', name: 'Plumbing & Boring', icon: 'plumbing', count: 37 },
  { id: 'generator', slug: 'generators', name: 'Generator Technicians', icon: 'power', count: 19 },
  { id: 'solar', slug: 'solar-energy', name: 'Solar Energy & Net Metering', icon: 'solar_power', count: 26 },
  { id: 'cctv', slug: 'cctv-security', name: 'CCTV & Home Security', icon: 'videocam', count: 31 },
  { id: 'ro-water', slug: 'ro-plants', name: 'RO Plants & Filters', icon: 'water_drop', count: 22 },
  { id: 'food', slug: 'home-chefs', name: 'Home Chefs & Catering', icon: 'restaurant', count: 45 },
];

export function getCategoryBySlug(slug: string) {
  const normalized = slug.toLowerCase();
  return CATEGORIES.find((c) => c.slug.toLowerCase() === normalized || c.id.toLowerCase() === normalized) || null;
}

export async function getProviders(citySlug: string, categorySlug?: string): Promise<Provider[]> {
  const category = categorySlug ? getCategoryBySlug(categorySlug) : null;
  const targetCategoryIds = category ? [category.id, category.slug] : categorySlug ? [categorySlug] : [];

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      let q = supabase.from('providers').select('*').eq('city_slug', citySlug.toLowerCase());
      if (category) {
        q = q.in('category_id', targetCategoryIds);
      }
      const { data, error } = await q;
      if (!error && data && data.length > 0) return data as Provider[];
    } catch (e) {
      console.warn('Supabase fetch note:', e);
    }
  }

  // Fallback seed
  return SEED_PROVIDERS.filter((p) => {
    const cityMatch = p.city_slug.toLowerCase() === citySlug.toLowerCase();
    if (!categorySlug) return cityMatch;
    const catMatch =
      p.category_id.toLowerCase() === categorySlug.toLowerCase() ||
      (category && p.category_id.toLowerCase() === category.id.toLowerCase()) ||
      p.slug.includes(categorySlug);
    return cityMatch && catMatch;
  });
}

export async function getProviderBySlug(citySlug: string, categorySlug: string, providerSlug: string): Promise<Provider | null> {
  const providers = await getProviders(citySlug, categorySlug);
  return providers.find((p) => p.slug === providerSlug) || null;
}

export async function getAllProviders(): Promise<Provider[]> {
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data, error } = await supabase.from('providers').select('*');
      if (!error && data && data.length > 0) return data as Provider[];
    } catch (e) {
      console.warn('Supabase fetch all providers note:', e);
    }
  }
  return SEED_PROVIDERS;
}
