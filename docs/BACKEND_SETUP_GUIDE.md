# Baseera (بصیرہ) Karachi - Backend & Google Auth Setup Guide

Yeh guide aapko Baseera Karachi platform ke live backend (Supabase PostgreSQL + Google OAuth + Vercel Serverless Functions) ko connect karne ka mukammal tareeqa batati hai.

---

## ⚡ Current Status (Mawjooda Halat)
Aapka pura backend architecture live aur deployable state mein tayar hai:
- **Serverless API Endpoints**:
  - `/api/health`: Health status & system diagnostic check
  - `/api/providers`: Providers live query, district filtering, search & vendor studio profile updates
  - `/api/leads`: Direct WhatsApp & call lead logging with studio metrics
  - `/api/reviews`: Verified customer ratings & feedback submission
  - `/api/auth`: Google OAuth session validation & profile synchronization
  - `/api/categories`: 8 primary Karachi service categories
- **Universal Leads Tracker (`js/leads-tracker.js`)**:
  - Jab bhi koi customer kisi bhi page par "Chat on WhatsApp" ya direct contact par click karta hai, system automatically background mein `/api/leads` ko lead bhej kar record karta hai, aur real-time conversion rates update hoti hain.
- **Fail-Safe Fallback**:
  - Agar Supabase keys set na bhi hon, to bhi pura platform bina kisi rukawat ke 100% smoothly chalta hai!

---

## 🛠️ Step-by-Step Supabase & Google Auth Setup

### Step 1: Supabase Project Create Karein
1. [supabase.com](https://supabase.com) par jayein aur **New Project** banayein.
2. Project name: `baseera-karachi`
3. Region: `Singapore (ap-southeast-1)` (Pakistan ke liye sab se fast latency).

### Step 2: Database Schema Run Karein
1. Supabase Dashboard mein baayein taraf **SQL Editor** par click karein.
2. Is repository ki file `database/schema.sql` ka pura code copy karein.
3. SQL Editor mein paste karke **Run** dabayein.
4. Tamam tables (`profiles`, `categories`, `providers`, `leads`, `reviews`), RLS security policies, aur verified Karachi seed data ek click mein create ho jayega!

### Step 3: Vercel mein Environment Variables Add Karein
1. Supabase Dashboard mein **Project Settings > API** par jayein.
2. Wahan se **Project URL** aur **anon public key** copy karein.
3. [vercel.com](https://vercel.com) par apne project `baseera-services-directory` mein jayein:
   - **Settings > Environment Variables** open karein.
   - Do variables add karein:
     - `SUPABASE_URL`: (Aapka Supabase project URL, e.g. `https://xyz.supabase.co`)
     - `SUPABASE_ANON_KEY`: (Aapki Supabase anon public key)
4. **Save** par click karein aur project ko redeploy karein (ya naya git commit push karein).

### Step 4: Google OAuth Enable Karein (Optional - Live Google Sign-In)
1. [console.cloud.google.com](https://console.cloud.google.com) par jayein aur ek OAuth 2.0 Client ID banayein.
2. Supabase Dashboard mein **Authentication > Providers > Google** open karein:
   - Google provider ko **Enable** karein.
   - Google Client ID aur Client Secret paste karein.
   - Redirect URL ko copy karke Google Cloud Console ke "Authorized redirect URIs" mein add karein.
3. Ab koi bhi Karachi resident ya service vendor ek click par Google account se login kar sakta hai!

---

## 🎯 Verification & Testing
Aap in URLs ko direct browser mein check kar sakte hain:
- `https://baseera-services-directory.vercel.app/api/health`
- `https://baseera-services-directory.vercel.app/api/providers`
- `https://baseera-services-directory.vercel.app/api/categories`
- `https://baseera-services-directory.vercel.app/settings.html` (Google Auth & Database Status)
- `https://baseera-services-directory.vercel.app/provider-dashboard.html` (Vendor Studio Live Leads)
