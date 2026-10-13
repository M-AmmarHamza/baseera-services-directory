// Vercel Serverless Function: /api/providers
import { createClient } from '@supabase/supabase-js';
import { generateEnglishSlug, transliterate } from '../lib/transliterate.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Bigram / Trigram Fuzzy Similarity Calculator (Handles typos like "alectrician" -> "electrician")
function computeSimilarity(str1 = '', str2 = '') {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.85;

  const getBigrams = (s) => {
    const set = new Set();
    for (let i = 0; i < s.length - 1; i++) {
      set.add(s.slice(i, i + 2));
    }
    return set;
  };

  const b1 = getBigrams(s1);
  const b2 = getBigrams(s2);
  let intersection = 0;
  for (const b of b1) {
    if (b2.has(b)) intersection++;
  }
  return (2.0 * intersection) / (b1.size + b2.size || 1);
}

// Fallback Providers (Aligned with Baseera Schema: slug, profile_type, service_area)
const FALLBACK_PROVIDERS = [
  {
    id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    slug: 'tariq-mahmood',
    name: 'Tariq Mahmood',
    category_id: 'electrician',
    trade_title: 'Master Electrician & Wiring',
    profile_type: 'individual',
    district: 'PECHS',
    service_area: ['PECHS', 'Clifton', 'DHA Phases 1-8', 'Bahadurabad'],
    phone: '+923332145890',
    whatsapp_number: '+923332145890',
    avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBK9qWTJzXQzuvOCxeaY9oaT5QnMSIE_WRvPrYq3ndOxqfGwgRJiuusiLQI6ptKnL9aXydagk97uFwsxC7j-gxTH2VH5N_HAJpsT3T0CG_IE0OBqsRNY1C_6XY0VC8sNDh1YBotW-weRk3E7XwleN6ZT1cvkRynmWL_e-anI_it8xQNPs3oqJRRO7Xrk7PfW-P6i2RwcClJxEboVmdY8ZF6bL0HcCJgGu5qW0x9sje5DlC6qn7x4H7V',
    short_bio: '18+ years experience servicing residential bungalows and commercial apartments across Karachi. Specialized in DB panel troubleshooting, short circuit emergency clearance, and hybrid solar UPS load segregation.',
    starting_price: 800,
    rating: 4.9,
    review_count: 128,
    is_available: true,
    is_verified: true,
    total_leads: 342
  },
  {
    id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    slug: 'kashif-ali',
    name: 'Kashif Ali',
    category_id: 'ac',
    trade_title: 'AC & Refrigeration Specialist',
    profile_type: 'individual',
    district: 'Gulshan-e-Iqbal',
    service_area: ['Gulshan-e-Iqbal', 'Gulistan-e-Jauhar', 'Federal B Area'],
    phone: '+923012349811',
    whatsapp_number: '+923012349811',
    avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrVEOf4Kmm3ZmFg2SVyQFHc7CD8jvopigKY9y06BL7csj1WLTVWDmQqVt9BLA-VImJWY1FnjTlOTMBdLORMVFgTEdwQKPPqGcSnJWhS5AriQLENY6vHirxqBOzQHMWyqZjRyr6tgRG-1ieePqu9nM2GIZj-GUmMil3H8fWsOahBKbVJj1EXc7oGAdad_P_Cb1e1CbAKo9FYlkkU-0dpz0biB1i9POZASr1lFg6dTIGFODNEO_8u9eb',
    short_bio: 'Certified Inverter AC technician with digital manifold gauges and genuine R410a/R32 refrigerants. Specializing in error code diagnosis, PCB card repairs, and anti-bacterial pressure washing.',
    starting_price: 1200,
    rating: 4.8,
    review_count: 94,
    is_available: true,
    is_verified: true,
    total_leads: 189
  },
  {
    id: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    slug: 'farzana-kitchen',
    name: 'Farzana Kitchen',
    category_id: 'food',
    trade_title: 'Authentic Karachi Home Chef & Tiffin',
    profile_type: 'shop',
    district: 'DHA Phase 5',
    service_area: ['DHA Phase 5', 'Clifton', 'Zamzama'],
    phone: '+923325567890',
    whatsapp_number: '+923325567890',
    avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZZ3jFfYAUp1f6ZwaA3bw9DUYqcbD067tf2DiX2SWLVRwTUhafGFCOzOzsUTICpmDPFe91mBv1GRm3r-qyUJZbnBeN57VtXsCuKHMVsXx1aioXkyo3Sw6_yQg78DkkPYzj3soUYY7YS49NK-hbHVquzL-bkNCxoWMINuv2OS5c5kG0a8JFOI5irxZcGHL_fDVrQ4YMj7ltf8FV7Xr-DHs1rDSBoxy0sTlo2SIaOGOn_DXV-DBQ1RiE',
    short_bio: 'Authentic Karachi homemade food, daily office lunchboxes, and bulk daawat orders. 100% hygienic canola oil, premium basmati rice, and mutton biryani.',
    starting_price: 550,
    rating: 5.0,
    review_count: 210,
    is_available: true,
    is_verified: true,
    total_leads: 520
  }
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Providers search & filtering with Fuzzy Typos matching
  if (req.method === 'GET') {
    const { id, slug, category, district, q, available, profile_type } = req.query;

    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

        // If fuzzy search query 'q' provided, try Supabase FTS / pg_trgm RPC
        if (q) {
          const { data: fuzzyData, error: fError } = await supabase.rpc('fuzzy_search_providers', {
            search_term: q,
            target_city: 'karachi'
          });
          if (!fError && fuzzyData && fuzzyData.length > 0) {
            return res.status(200).json({ success: true, source: 'supabase_fuzzy', count: fuzzyData.length, data: fuzzyData });
          }
        }

        let query = supabase.from('providers').select('*');
        if (id) query = query.eq('id', id);
        if (slug) query = query.eq('slug', slug);
        if (category) query = query.eq('category_id', category);
        if (available === 'true') query = query.eq('is_available', true);
        if (profile_type) query = query.eq('profile_type', profile_type);

        const { data, error } = await query;
        if (error) throw error;

        if (data && data.length > 0) {
          return res.status(200).json({ success: true, source: 'supabase', count: data.length, data: id || slug ? data[0] : data });
        }
      } catch (err) {
        console.warn('Supabase query note, using memory fallback:', err.message);
      }
    }

    // In-Memory Fallback with Fuzzy Matching
    if (id) {
      const match = FALLBACK_PROVIDERS.find(p => p.id === id || p.slug === id);
      if (!match) return res.status(404).json({ success: false, message: 'Provider not found' });
      return res.status(200).json({ success: true, data: match });
    }

    if (slug) {
      const match = FALLBACK_PROVIDERS.find(p => p.slug === slug);
      if (!match) return res.status(404).json({ success: false, message: 'Provider not found' });
      return res.status(200).json({ success: true, data: match });
    }

    let results = [...FALLBACK_PROVIDERS];
    if (category) results = results.filter(p => p.category_id === category);
    if (district) results = results.filter(p => p.district.toLowerCase().includes(district.toLowerCase()));
    if (available === 'true') results = results.filter(p => p.is_available);
    if (profile_type) results = results.filter(p => p.profile_type === profile_type);

    // Fuzzy search matching for typos (e.g. "alectrician" -> "electrician")
    if (q) {
      const romanizedQ = transliterate(q).toLowerCase().trim();
      results = results.filter(p => {
        const nameSim = computeSimilarity(romanizedQ, p.name);
        const catSim = computeSimilarity(romanizedQ, p.category_id);
        const tradeSim = computeSimilarity(romanizedQ, p.trade_title);
        const bioMatch = p.short_bio.toLowerCase().includes(romanizedQ);
        return nameSim > 0.4 || catSim > 0.4 || tradeSim > 0.4 || bioMatch;
      });
    }

    return res.status(200).json({ success: true, count: results.length, data: results });
  }

  // POST: Create or Update Provider with Strictly English Slugs
  if (req.method === 'POST') {
    const body = req.body || {};
    const { name, whatsapp_number, trade_title, short_bio, profile_type, service_area, is_available } = body;

    // Auto-generate strictly English slug from name (Transliterate Urdu/Arabic)
    const englishSlug = generateEnglishSlug(name || 'karachi-provider');

    const providerRecord = {
      ...body,
      slug: englishSlug,
      profile_type: profile_type || 'individual',
      is_available: is_available !== undefined ? is_available : true,
      updated_at: new Date().toISOString()
    };

    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        const { data, error } = await supabase.from('providers').upsert(providerRecord).select();
        if (error) throw error;
        return res.status(200).json({ success: true, source: 'supabase', message: 'Provider updated', data: data[0] });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }

    return res.status(200).json({
      success: true,
      source: 'local',
      message: 'Provider updated with English transliterated slug',
      data: providerRecord
    });
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
