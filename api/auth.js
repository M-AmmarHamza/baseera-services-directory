// Vercel Serverless Function: /api/auth
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Check session / profile
  if (req.method === 'GET') {
    const { email } = req.query;

    if (!email) {
      return res.status(200).json({
        authenticated: false,
        message: 'No email session provided. Ready for Google Sign-In.'
      });
    }

    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*, providers(*)')
          .eq('email', email)
          .maybeSingle();

        if (error) throw error;

        if (profile) {
          return res.status(200).json({
            authenticated: true,
            source: 'supabase',
            profile
          });
        }
      } catch (err) {
        console.warn('Supabase auth profile lookup error:', err.message);
      }
    }

    // Default mock response for Google-signed user
    return res.status(200).json({
      authenticated: true,
      source: 'local',
      profile: {
        email,
        full_name: email.split('@')[0].replace(/[._]/g, ' '),
        role: email.includes('vendor') ? 'provider' : 'customer',
        district: 'Karachi Central',
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`
      }
    });
  }

  // POST: Sync profile on Google login or update role
  if (req.method === 'POST') {
    const body = req.body || {};
    const { email, full_name, avatar_url, role = 'customer', district = 'Karachi' } = body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        const { data, error } = await supabase
          .from('profiles')
          .upsert({
            email,
            full_name: full_name || email.split('@')[0],
            avatar_url,
            role,
            district,
            updated_at: new Date().toISOString()
          }, { onConflict: 'email' })
          .select();

        if (error) throw error;

        return res.status(200).json({
          success: true,
          source: 'supabase',
          message: 'Profile synchronized with Supabase',
          profile: data[0]
        });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }

    return res.status(200).json({
      success: true,
      source: 'local',
      message: 'Profile saved in local session',
      profile: {
        email,
        full_name: full_name || email.split('@')[0],
        avatar_url,
        role,
        district
      }
    });
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
