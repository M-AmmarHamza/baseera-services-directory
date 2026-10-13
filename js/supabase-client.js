// Baseera Karachi - Client-Side Supabase & Backend API Bridge
// Provides Google Authentication, Realtime Leads Tracking & Provider Cloud Sync

const BASEERA_CONFIG = {
  supabaseUrl: window.SUPABASE_URL || localStorage.getItem('baseera_supabase_url') || '',
  supabaseKey: window.SUPABASE_ANON_KEY || localStorage.getItem('baseera_supabase_anon_key') || '',
  apiBase: '/api'
};

// Initialize Supabase if SDK is loaded on page
let supabase = null;
if (window.supabase && BASEERA_CONFIG.supabaseUrl && BASEERA_CONFIG.supabaseKey) {
  try {
    supabase = window.supabase.createClient(BASEERA_CONFIG.supabaseUrl, BASEERA_CONFIG.supabaseKey);
    console.log('✓ Supabase Client connected to live project');
  } catch (e) {
    console.warn('Supabase initialization note:', e.message);
  }
}

const BaseeraBackend = {
  // 1. Google OAuth Authentication
  async signInWithGoogle() {
    if (supabase) {
      const redirectUrl = window.location.origin + '/settings.html';
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      if (error) throw error;
      return data;
    } else {
      // Instant Mock Google Login for demo & immediate testing
      const mockEmail = 'ammar.hamza@karachi.pk';
      const mockUser = {
        id: 'usr_google_102',
        email: mockEmail,
        user_metadata: {
          full_name: 'Muhammad Ammar Hamza',
          avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDahkD_4FnolcsH23Eu1ovizQwNtkPo8LaH5qxVqfYv48IkIj6H8bNoD_B6OdHKBYD7SZ3psn_Y4zQDVfMe8_dc7jty6Gpfm59YFYFxQwL_9RGC9ZkTcNhDX9bKO6We3oNZCopF4cIbuNOh9E5ebmi84HxfA3L9s_Nqx477jIDEu15unl8gdUICHojc3XPGuxolZtAZOD_bJYBxHudXCDVKVMHpyGbxkmS9tEerxSW9EkZjBzqxNZC'
        }
      };
      localStorage.setItem('baseera_auth_user', JSON.stringify(mockUser));
      await this.syncProfile(mockUser);
      return mockUser;
    }
  },

  async signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('baseera_auth_user');
    window.location.reload();
  },

  async getCurrentUser() {
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) return user;
    }
    try {
      const saved = localStorage.getItem('baseera_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  },

  async syncProfile(user) {
    if (!user) return null;
    try {
      const res = await fetch(`${BASEERA_CONFIG.apiBase}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url || '',
          role: 'provider'
        })
      });
      return await res.json();
    } catch (e) {
      console.warn('Sync profile warning:', e.message);
      return null;
    }
  },

  // 2. Lead Tracking Engine (Direct WhatsApp & Call Logging)
  async recordLead({ provider_id, customer_phone, service_requested, district, lead_type = 'whatsapp' }) {
    try {
      const payload = {
        provider_id,
        customer_phone,
        service_requested,
        district: district || localStorage.getItem('baseera_user_district') || 'Karachi',
        lead_type
      };

      // Background tracking to serverless API
      fetch(`${BASEERA_CONFIG.apiBase}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(err => console.log('Lead beacon note:', err));

      // Also persist in local activity log
      const localHistory = JSON.parse(localStorage.getItem('baseera_lead_history') || '[]');
      localHistory.unshift({
        ...payload,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('baseera_lead_history', JSON.stringify(localHistory.slice(0, 30)));
    } catch (e) {
      console.warn('Lead tracking exception:', e);
    }
  },

  // 3. Provider Studio - Metrics & Profile Updates
  async getLeadMetrics(providerId) {
    try {
      const res = await fetch(`${BASEERA_CONFIG.apiBase}/leads?provider_id=${encodeURIComponent(providerId)}`);
      return await res.json();
    } catch (e) {
      return { success: false, total_leads: 0, leads: [] };
    }
  },

  async saveProviderProfile(providerData) {
    try {
      const res = await fetch(`${BASEERA_CONFIG.apiBase}/providers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(providerData)
      });
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // 4. Verified Reviews
  async getReviews(providerId) {
    try {
      const res = await fetch(`${BASEERA_CONFIG.apiBase}/reviews?provider_id=${encodeURIComponent(providerId)}`);
      return await res.json();
    } catch (e) {
      return { success: false, reviews: [] };
    }
  },

  async postReview(reviewData) {
    try {
      const res = await fetch(`${BASEERA_CONFIG.apiBase}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // 5. Providers Live Query
  async getProviders(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${BASEERA_CONFIG.apiBase}/providers${query ? '?' + query : ''}`);
      return await res.json();
    } catch (e) {
      console.warn('API fetch providers error:', e);
      return null;
    }
  }
};

window.BaseeraBackend = BaseeraBackend;
