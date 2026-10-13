// Vercel Serverless Function: /api/categories
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const FALLBACK_CATEGORIES = [
  {
    id: 'electrician',
    slug: 'electricians',
    name: 'Electrician & Wiring',
    icon: 'bolt',
    active_count: 42,
    description: 'DB panel tripping, short circuit repairs, solar inverter wiring, and UPS battery backup systems across Karachi.'
  },
  {
    id: 'ac',
    slug: 'ac-repair',
    name: 'AC & Refrigeration',
    icon: 'mode_fan',
    active_count: 58,
    description: 'Inverter AC jet chemical servicing, genuine R410a gas refilling, PCB board repair, and compressor replacement.'
  },
  {
    id: 'plumbing',
    slug: 'plumbing',
    name: 'Plumbing & Boring',
    icon: 'plumbing',
    active_count: 37,
    description: 'Underground water line leak detection, sweet water tanker connection, submersible motor repair, and geyser installation.'
  },
  {
    id: 'generator',
    slug: 'generators',
    name: 'Generator Technicians',
    icon: 'power',
    active_count: 19,
    description: 'Gas to petrol converter kits, ATS panel automation, valve adjustment, and complete overhaul for 2kVA to 50kVA gensets.'
  },
  {
    id: 'solar',
    slug: 'solar-energy',
    name: 'Solar Energy & Net Metering',
    icon: 'solar_power',
    active_count: 26,
    description: 'On-grid, off-grid and hybrid solar installations, K-Electric net metering documentation, and high-efficiency panels.'
  },
  {
    id: 'cctv',
    slug: 'cctv-security',
    name: 'CCTV & Home Security',
    icon: 'videocam',
    active_count: 31,
    description: 'IP & HD camera cabling, mobile live remote monitoring, biometric smart door locks, and DVR hard disk backup.'
  },
  {
    id: 'ro-water',
    slug: 'ro-plants',
    name: 'RO Plants & Water Filters',
    icon: 'water_drop',
    active_count: 22,
    description: 'Commercial and residential RO plant membrane replacement, TDS adjustment, sediment filters, and UV purification.'
  },
  {
    id: 'food',
    slug: 'home-chefs',
    name: 'Home Chefs & Catering',
    icon: 'restaurant',
    active_count: 45,
    description: 'Hygienic daily office lunch subscriptions, authentic Karachi biryani daig orders, and homemade healthy tiffin services.'
  }
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;

      if (data && data.length > 0) {
        return res.status(200).json({
          success: true,
          source: 'supabase',
          categories: data
        });
      }
    } catch (err) {
      console.warn('Supabase categories error, using fallback:', err.message);
    }
  }

  return res.status(200).json({
    success: true,
    source: 'fallback',
    categories: FALLBACK_CATEGORIES
  });
}
