# Baseera (بصیرہ) - Karachi Services Directory
**Design System: Karachi Directory Minimal | Version 2.0**

A modern, high-density, flat-minimalist local services discovery platform designed specifically for Karachi metropolitan context. It connects homeowners and residents directly to verified local specialists (Electricians, Plumbers, AC Technicians, Home Chefs, etc.) via low-friction direct **WhatsApp Inquiries** and phone calls.

---

## 🌟 Key Features

1. **Direct WhatsApp Lead Generation:**
   - Pre-formatted, context-aware WhatsApp greeting messages specifying the provider's name, requested service, and locality.
   - Zero e-commerce baggage: no cart, no checkout, no intermediary delay.

2. **Karachi Localized Information Architecture:**
   - District filter chips: DHA & Clifton, Gulshan-e-Iqbal, PECHS, North Nazimabad, Bahadurabad, Malir Cantt.
   - Verified IDs and "Urgent Ready" live pulsing availability badges.

3. **Complete Interactive Screens:**
   - **`index.html`**: Home page featuring Hero search, Karachi district chips, 3x3 category grid, featured verified pros, and editorial guides.
   - **`categories.html`**: Searchable category listings with real-time text search and filter chips (Individuals, Shops, Available Today, Area).
   - **`provider-profile.html`**: Detailed provider page with photo gallery carousel of past work, trust badges, scope of work with starting prices, customer reviews, and persistent sticky WhatsApp CTA bar.
   - **`provider-dashboard.html`**: Vendor Studio dashboard with live "Available Now" toggle switch, lead counters, performance metrics, and profile editor.
   - **`saved.html`**: Bookmarked pros synchronized in real-time via `localStorage` with dynamic add/remove animations.
   - **`settings.html`**: User account settings with Karachi district preference selector, notification toggles, and helpdesk links.
   - **`blog.html`**: Karachi homeowner guides (Monsoon safety checks, solar inverter maintenance, and Karachi utilities emergency helplines: KE 118, KW&SB 1339, SSGC 1199).

4. **Zero-Dependency Architecture:**
   - Built on pure HTML5, modern Tailwind CSS, and vanilla modular JavaScript.
   - Runs directly in any web browser without needing `npm install` or local server setups.
   - Includes a **Desktop / Mobile Shell Switcher** button in the top corner for comfortable viewing on any screen size.

---

## 📁 Project Structure

```
directory site/
├── index.html                  # Main Home discovery screen
├── categories.html             # Category listings & search filters
├── provider-profile.html       # Provider portfolio & rate cards
├── provider-dashboard.html     # Vendor Studio & availability toggle
├── saved.html                  # Shortlisted pros (localStorage)
├── settings.html               # User preferences & district setup
├── blog.html                   # Karachi resident guides & helplines
├── css/
│   └── styles.css              # Design system tokens & animations
├── js/
│   ├── data.js                 # Karachi providers & categories database
│   └── app.js                  # Shared logic, WhatsApp lead URL & toast
└── README.md                   # Project documentation
```

---

## 🚀 How to Run & Preview

Double click on `index.html` or open it with any web browser (Chrome, Edge, Safari, Firefox). You can also run Live Server or any static hosting service (GitHub Pages, Vercel, Netlify).
