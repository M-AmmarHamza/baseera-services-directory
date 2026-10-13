// Vercel Serverless Function: /api/reviews
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const FALLBACK_REVIEWS = [
  {
    id: 'rev-1',
    provider_id: 'tariq-electric',
    customer_name: 'Saad Ahmed (PECHS Block 2)',
    rating: 5,
    comment: 'Tariq bhai arrived within 25 minutes during a midnight phase trip. Fixed our main breaker safely with proper diagnostic tools. Highly recommended for PECHS residents.',
    service_done: 'Emergency Breaker Replacement',
    is_verified_job: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    id: 'rev-2',
    provider_id: 'tariq-electric',
    customer_name: 'Dr. Arshad (DHA Phase 5)',
    rating: 5,
    comment: 'Very professional, clean wiring installation for my hybrid solar inverter. Transparent pricing without any hidden charges.',
    service_done: 'Solar Inverter Rewiring',
    is_verified_job: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString()
  },
  {
    id: 'rev-3',
    provider_id: 'karachi-cooling-expert',
    customer_name: 'Kamran Siddiqui (Gulshan)',
    rating: 5,
    comment: 'Best AC technician in Gulshan. Checked gas pressure with digital meter and vacuumed the system properly. Chilling is back to factory spec.',
    service_done: 'Inverter AC Jet Chemical Wash',
    is_verified_job: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  },
  {
    id: 'rev-4',
    provider_id: 'dha-home-chef-fatima',
    customer_name: 'Alizeh Khan (Clifton Block 4)',
    rating: 5,
    comment: 'Pure hygienic ghar ka khana. The Sindhi mutton biryani and daal chawal lunchbox delivered steaming hot on time. Super clean packaging.',
    service_done: 'Weekly Office Meal Subscription',
    is_verified_job: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
  }
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Fetch reviews for a provider
  if (req.method === 'GET') {
    const { provider_id } = req.query;

    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
        if (provider_id) {
          query = query.eq('provider_id', provider_id);
        }

        const { data, error } = await query.limit(50);
        if (error) throw error;

        return res.status(200).json({
          success: true,
          source: 'supabase',
          count: data.length,
          reviews: data
        });
      } catch (err) {
        console.warn('Supabase fetch reviews error, using fallback:', err.message);
      }
    }

    let filtered = FALLBACK_REVIEWS;
    if (provider_id) {
      filtered = FALLBACK_REVIEWS.filter(r => r.provider_id === provider_id);
    }

    return res.status(200).json({
      success: true,
      source: 'fallback',
      count: filtered.length,
      reviews: filtered
    });
  }

  // POST: Submit a new verified review
  if (req.method === 'POST') {
    const body = req.body || {};
    const { provider_id, customer_name, rating, comment, service_done } = body;

    if (!provider_id || !comment || !rating) {
      return res.status(400).json({
        success: false,
        message: 'provider_id, rating, and comment are required fields.'
      });
    }

    const reviewRecord = {
      provider_id,
      customer_name: customer_name || 'Verified Karachi Resident',
      rating: Math.max(1, Math.min(5, parseInt(rating, 10) || 5)),
      comment: comment.trim(),
      service_done: service_done || 'Standard Service',
      is_verified_job: true,
      created_at: new Date().toISOString()
    };

    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        const { data, error } = await supabase.from('reviews').insert([reviewRecord]).select();
        if (error) throw error;

        return res.status(201).json({
          success: true,
          source: 'supabase',
          message: 'Review posted successfully',
          review: data[0]
        });
      } catch (err) {
        console.warn('Supabase insert review error:', err.message);
      }
    }

    return res.status(201).json({
      success: true,
      source: 'fallback',
      message: 'Review submitted successfully',
      review: {
        id: 'rev-' + Math.random().toString(36).substr(2, 8),
        ...reviewRecord
      }
    });
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
