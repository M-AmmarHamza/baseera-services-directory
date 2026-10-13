// Baseera Karachi - Master Application Logic & Helpers

const APP_STORAGE_KEY = 'baseera_saved_pros';
const APP_DISTRICT_KEY = 'baseera_user_district';
const APP_WIDE_KEY = 'baseera_wide_mode';

// Toast System
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? 'check_circle' : 'info';
  toast.innerHTML = `
    <span class="material-symbols-outlined text-[18px] text-emerald-400">${icon}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.95)';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// Saved Pros LocalStorage API
const StorageService = {
  getSavedIds() {
    try {
      const data = localStorage.getItem(APP_STORAGE_KEY);
      return data ? JSON.parse(data) : ['tariq-electric', 'master-plumber-saleem'];
    } catch (e) {
      return ['tariq-electric'];
    }
  },

  isSaved(providerId) {
    const list = this.getSavedIds();
    return list.includes(providerId);
  },

  toggleSave(providerId, providerName = 'Provider') {
    let list = this.getSavedIds();
    const index = list.indexOf(providerId);
    let isNowSaved = false;

    if (index > -1) {
      list.splice(index, 1);
      showToast(`${providerName} removed from saved pros`, 'info');
      isNowSaved = false;
    } else {
      list.push(providerId);
      showToast(`${providerName} saved to shortlist!`, 'success');
      isNowSaved = true;
    }

    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(list));
    this.updateBadgeCounts();
    return isNowSaved;
  },

  updateBadgeCounts() {
    const count = this.getSavedIds().length;
    document.querySelectorAll('.saved-count-badge').forEach(badge => {
      badge.textContent = `${count} Saved`;
    });
    document.querySelectorAll('.saved-nav-badge').forEach(dot => {
      if (count > 0) {
        dot.classList.remove('hidden');
      } else {
        dot.classList.add('hidden');
      }
    });
  },

  getUserDistrict() {
    return localStorage.getItem(APP_DISTRICT_KEY) || 'dha-clifton';
  },

  setUserDistrict(districtId) {
    localStorage.setItem(APP_DISTRICT_KEY, districtId);
    showToast('Karachi district preference updated', 'success');
  }
};

// WhatsApp Lead Link Helper & Realtime Tracker
function openWhatsAppLead(providerId, customNote = '') {
  let provider = null;
  if (typeof BASEERA_DATA !== 'undefined' && BASEERA_DATA.providers) {
    provider = BASEERA_DATA.providers.find(p => p.id === providerId);
  }
  
  const whatsappNumber = provider ? provider.whatsapp : '923332145890';
  const providerName = provider ? provider.name : 'Specialist';
  const businessName = provider ? provider.businessName : 'Baseera Pro';

  // 1. Asynchronously log lead to serverless backend
  if (window.BaseeraBackend && typeof window.BaseeraBackend.recordLead === 'function') {
    window.BaseeraBackend.recordLead({
      provider_id: providerId,
      service_requested: customNote || `${businessName} Inquiry`,
      district: provider ? provider.district : 'Karachi',
      lead_type: 'whatsapp'
    });
  }

  showToast('Connecting directly via WhatsApp...', 'success');

  const defaultNote = `Assalam-o-Alaikum ${providerName}, I found your verified profile on Baseera Karachi for ${businessName}. I have an urgent service inquiry.`;
  const text = encodeURIComponent(customNote || defaultNote);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${text}`;
  
  // Smoothly open WhatsApp
  setTimeout(() => {
    window.open(whatsappUrl, '_blank');
  }, 200);
}


// Generate Standard Bottom Navigation
function renderBottomNav(activeTab = 'home') {
  const navContainer = document.getElementById('bottom-nav');
  if (!navContainer) return;

  const tabs = [
    { id: 'home', label: 'Home', icon: 'grid_view', href: 'index.html' },
    { id: 'search', label: 'Explore', icon: 'search', href: 'categories.html' },
    { id: 'saved', label: 'Saved', icon: 'bookmark', href: 'saved.html', hasBadge: true },
    { id: 'profile', label: 'Profile', icon: 'person', href: 'settings.html' }
  ];

  navContainer.className = "fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.03)]";
  
  navContainer.innerHTML = `
    <div class="h-16 px-4 flex items-center justify-around max-w-[480px] mx-auto w-full">
      ${tabs.map(tab => {
        const isActive = tab.id === activeTab;
        const colorClass = isActive ? 'text-primary font-semibold' : 'text-slate-500 hover:text-slate-800';
        const iconFill = isActive ? `style="font-variation-settings: 'FILL' 1;"` : '';
        return `
          <a href="${tab.href}" class="flex flex-col items-center justify-center flex-1 py-1 relative ${colorClass} transition-colors group">
            <div class="relative">
              <span class="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform" ${iconFill}>${tab.icon}</span>
              ${tab.hasBadge ? `<span class="saved-nav-badge absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-primary ring-2 ring-white"></span>` : ''}
            </div>
            <span class="text-[11px] mt-0.5 tracking-tight">${tab.label}</span>
          </a>
        `;
      }).join('')}
    </div>
  `;

  StorageService.updateBadgeCounts();
}

// Generate Common Top Header
function renderHeader({ title = 'Baseera', showBack = false, subtitle = 'Karachi', backHref = 'index.html' } = {}) {
  const headerContainer = document.getElementById('app-header');
  if (!headerContainer) return;

  headerContainer.className = "fixed top-0 left-0 right-0 z-50 pt-safe bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.02)]";
  
  headerContainer.innerHTML = `
    <div class="h-16 px-4 flex items-center justify-between max-w-[480px] mx-auto w-full">
      <div class="flex items-center gap-2.5">
        ${showBack ? `
          <a href="${backHref}" aria-label="Go Back" class="w-10 h-10 -ml-2 flex items-center justify-center text-gray-800 hover:text-primary transition-colors">
            <span class="material-symbols-outlined text-[24px]">arrow_back</span>
          </a>
        ` : ''}
        <div class="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-white font-bold text-sm shadow-xs">
          ب
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-[16px] text-gray-950 tracking-tight leading-none">${title}</span>
          <span class="text-[11px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">${subtitle}</span>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <a href="blog.html" class="text-xs font-semibold text-primary hover:underline hidden sm:inline-block">Guides</a>
        <a href="provider-dashboard.html" class="text-[11px] font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors">
          Vendor Studio
        </a>
        <a href="settings.html" class="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
          <img alt="User Profile" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDahkD_4FnolcsH23Eu1ovizQwNtkPo8LaH5qxVqfYv48IkIj6H8bNoD_B6OdHKBYD7SZ3psn_Y4zQDVfMe8_dc7jty6Gpfm59YFYFxQwL_9RGC9ZkTcNhDX9bKO6We3oNZCopF4cIbuNOh9E5ebmi84HxfA3L9s_Nqx477jIDEu15unl8gdUICHojc3XPGuxolZtAZOD_bJYBxHudXCDVKVMHpyGbxkmS9tEerxSW9EkZjBzqxNZC" />
        </a>
      </div>
    </div>
  `;
}

// Desktop Frame Mode Switcher
function initDesktopToggle() {
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'view-mode-toggle';
  toggleBtn.innerHTML = `
    <span class="material-symbols-outlined text-[16px]">devices</span>
    <span id="view-mode-text">Mobile View (480px)</span>
  `;
  document.body.appendChild(toggleBtn);

  const isWide = localStorage.getItem(APP_WIDE_KEY) === 'true';
  if (isWide) {
    document.body.classList.add('wide-mode');
    document.getElementById('view-mode-text').textContent = 'Desktop Wide (1120px)';
  }

  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('wide-mode');
    const wideActive = document.body.classList.contains('wide-mode');
    localStorage.setItem(APP_WIDE_KEY, wideActive ? 'true' : 'false');
    document.getElementById('view-mode-text').textContent = wideActive ? 'Desktop Wide (1120px)' : 'Mobile View (480px)';
    showToast(wideActive ? 'Wide desktop layout enabled' : 'Compact mobile view enabled', 'info');
  });
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  initDesktopToggle();
  StorageService.updateBadgeCounts();
});
