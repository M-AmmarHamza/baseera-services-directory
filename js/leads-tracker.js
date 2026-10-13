// Baseera Karachi - Universal WhatsApp Leads Tracker
// Automatically records customer conversion leads before opening WhatsApp

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', (e) => {
    const waLink = e.target.closest('a[href*="wa.me"], button[onclick*="openWhatsAppLead"]');
    if (!waLink) return;

    // If it's an anchor with wa.me href and didn't already have openWhatsAppLead handling
    if (waLink.tagName === 'A' && waLink.href && waLink.href.includes('wa.me')) {
      e.preventDefault();
      const href = waLink.href;

      let providerId = 'karachi-specialist';
      const article = waLink.closest('article');
      if (article) {
        const idLink = article.querySelector('a[href*="id="]');
        if (idLink) {
          const match = idLink.href.match(/id=([^&]+)/);
          if (match) providerId = match[1];
        }
      }

      let serviceRequested = 'Service Inquiry';
      try {
        const urlObj = new URL(href);
        const note = urlObj.searchParams.get('text');
        if (note) serviceRequested = note.slice(0, 80);
      } catch (err) {}

      // Asynchronously record lead to Vercel Serverless / Supabase backend
      if (window.BaseeraBackend && typeof window.BaseeraBackend.recordLead === 'function') {
        window.BaseeraBackend.recordLead({
          provider_id: providerId,
          service_requested: serviceRequested,
          district: localStorage.getItem('baseera_user_district') || 'Karachi',
          lead_type: 'whatsapp'
        });
      }

      if (typeof showToast === 'function') {
        showToast('Connecting on WhatsApp...', 'success');
      }

      setTimeout(() => {
        window.open(href, '_blank');
      }, 150);
    }
  });
});
