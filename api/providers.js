// Vercel Serverless Function: /api/providers
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Mock Fallback Database
const FALLBACK_PROVIDERS = [
  {
    id: 'tariq-electric',
    name: 'Tariq Mahmood',
    category_id: 'electrician',
    trade_title: 'Master Electrician & Wiring',
    district: 'PECHS',
    coverage_areas: ['PECHS', 'Clifton', 'DHA Phases 1-8', 'Bahadurabad'],
    phone: '+923332145890',
    whatsapp_number: '+923332145890',
    avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBK9qWTJzXQzuvOCxeaY9oaT5QnMSIE_WRvPrYq3ndOxqfGwgRJiuusiLQI6ptKnL9aXydagk97uFwsxC7j-gxTH2VH5N_HAJpsT3T0CG_IE0OBqsRNY1C_6XY0VC8sNDh1YBotW-weRk3E7XwleN6ZT1cvkRynmWL_e-anI_it8xQNPs3oqJRRO7Xrk7PfW-P6i2RwcClJxEboVmdY8ZF6bL0HcCJgGu5qW0x9sje5DlC6qn7x4H7V',
    bio: '18+ years experience servicing residential bungalows and commercial apartments across Karachi. Specialized in DB panel troubleshooting, short circuit emergency clearance, and hybrid solar UPS load segregation.',
    starting_price: 800,
    max_price: 4500,
    rating: 4.9,
    review_count: 128,
    is_available: true,
    is_verified: true,
    badge_text: 'Verified Pro',
    total_leads: 342,
    services: [
      { name: 'Standard Inspection & Diagnosis', price: 'Rs. 800', desc: 'On-site electrical testing, load calculation, and safety check.' },
      { name: 'Main DB Breaker / Circuit Board Repair', price: 'Rs. 1,500 - 3,500', desc: 'Replacing damaged trip breakers, contactors, and busbar cleaning.' },
      { name: 'UPS & Inverter Home Wiring Integration', price: 'Rs. 2,000 - 4,500', desc: 'Separate line rewiring, battery water top-up, and cut-off calibration.' }
    ]
  },
  {
    id: 'karachi-cooling-expert',
    name: 'Kashif Ali',
    category_id: 'ac',
    trade_title: 'AC & Refrigeration Specialist',
    district: 'Gulshan-e-Iqbal',
    coverage_areas: ['Gulshan-e-Iqbal', 'Gulistan-e-Jauhar', 'Federal B Area'],
    phone: '+923012349811',
    whatsapp_number: '+923012349811',
    avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrVEOf4Kmm3ZmFg2SVyQFHc7CD8jvopigKY9y06BL7csj1WLTVWDmQqVt9BLA-VImJWY1FnjTlOTMBdLORMVFgTEdwQKPPqGcSnJWhS5AriQLENY6vHirxqBOzQHMWyqZjRyr6tgRG-1ieePqu9nM2GIZj-GUmMil3H8fWsOahBKbVJj1EXc7oGAdad_P_Cb1e1CbAKo9FYlkkU-0dpz0biB1i9POZASr1lFg6dTIGFODNEO_8u9eb',
    bio: 'Certified Inverter AC technician with digital manifold gauges and genuine R410a/R32 refrigerants. Specializing in error code diagnosis, PCB card repairs, and anti-bacterial pressure washing.',
    starting_price: 1200,
    max_price: 6000,
    rating: 4.8,
    review_count: 94,
    is_available: true,
    is_verified: true,
    badge_text: 'Quick Reply',
    total_leads: 189,
    services: [
      { name: 'Complete Jet Pressure Chemical Service', price: 'Rs. 1,500', desc: 'Indoor blower removal, outdoor condenser pressure washing.' },
      { name: 'Genuine Inverter Gas Charging (R410A / R32)', price: 'Rs. 3,500 - 5,500', desc: 'Nitrogen leak testing, vacuum pull, and precision digital gas filling.' }
    ]
  },
  {
    id: 'dha-home-chef-fatima',
    name: 'Farzana Kitchen',
    category_id: 'chef',
    trade_title: 'Authentic Home Cook & Daawat Specialist',
    district: 'DHA & Clifton',
    coverage_areas: ['DHA Phases 1-8', 'Clifton', 'Bath Island'],
    phone: '+923325567890',
    whatsapp_number: '+923325567890',
    avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZZ3jFfYAUp1f6ZwaA3bw9DUYqcbD067tf2DiX2SWLVRwTUhafGFCOzOzsUTICpmDPFe91mBv1GRm3r-qyUJZbnBeN57VtXsCuKHMVsXx1aioXkyo3Sw6_yQg78DkkPYzj3soUYY7YS49NK-hbHVquzL-bkNCxoWMINuv2OS5c5kG0a8JFOI5irxZcGHL_fDVrQ4YMj7ltf8FV7Xr-DHs1rDSBoxy0sTlo2SIaOGOn_DXV-DBQ1RiE',
    bio: 'Pure hygienic home cooking prepared with premium branded spices and filtered water. Supplying daily executive lunch tiffins and weekend family dinner daawat platters.',
    starting_price: 650,
    max_price: 4500,
    rating: 5.0,
    review_count: 210,
    is_available: true,
    is_verified: true,
    badge_text: 'Top Rated',
    total_leads: 512,
    services: [
      { name: 'Daily Executive Single Tiffin', price: 'Rs. 650', desc: '1 Salan, 2 Roti, Raita & Fresh Salad.' },
      { name: 'Special Weekend Sindhi Biryani Deg (5kg)', price: 'Rs. 4,200', desc: 'Long grain basmati rice with succulent potatoes and farm chicken.' }
    ]
  }
];

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Fetch providers with filtering
  if (req.method === 'GET') {
    const { id, category, district, q, available } = req.query;

    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        let query = supabase.from('providers').select('*');

        if (id) {
          const { data, error } = await query.eq('id', id).single();
          if (error) throw error;
          return res.status(200).json({ success: true, data });
        }

        if (category) query = query.eq('category_id', category);
        if (district) query = query.ilike('district', `%${district}%`);
        if (available === 'true') query = query.eq('is_available', true);
        if (q) query = query.or(`name.ilike.%${q}%,trade_title.ilike.%${q}%,bio.ilike.%${q}%`);

        const { data, error } = await query.order('rating', { ascending: false });
        if (error) throw error;

        return res.status(200).json({ success: true, count: data.length, data });
      } catch (err) {
        console.error('Supabase query error, using fallback:', err.message);
      }
    }

    // Fallback in-memory response
    if (id) {
      const match = FALLBACK_PROVIDERS.find(p => p.id === id);
      if (!match) return res.status(404).json({ success: false, message: 'Provider not found' });
      return res.status(200).json({ success: true, data: match });
    }

    let results = [...FALLBACK_PROVIDERS];
    if (category) results = results.filter(p => p.category_id === category);
    if (district) results = results.filter(p => p.district.toLowerCase().includes(district.toLowerCase()));
    if (available === 'true') results = results.filter(p => p.is_available);
    if (q) {
      const term = q.toLowerCase();
      results = results.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.trade_title.toLowerCase().includes(term) ||
        p.bio.toLowerCase().includes(term)
      );
    }

    return res.status(200).json({ success: true, count: results.length, data: results });
  }

  // POST: Update or create provider (For Vendor Studio)
  if (req.method === 'POST') {
    const body = req.body;
    if (!body || !body.id) {
      return res.status(400).json({ success: false, message: 'Provider ID required' });
    }

    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        const { data, error } = await supabase.from('providers').upsert({
          ...body,
          updated_at: new Date().toISOString()
        }).select();

        if (error) throw error;
        return res.status(200).json({ success: true, message: 'Provider updated in Supabase', data });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Provider updated (Local state)',
      data: body
    });
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
