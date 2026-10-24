/**
 * Outbound Lead Click Analytics Tracking
 * Sends asynchronous beacon/fetch events to /api/track-lead without delaying user action.
 */

export interface LeadClickEvent {
  providerId: string;
  categoryId?: string;
  cityId?: string;
  clickType: 'whatsapp' | 'call' | 'telegram' | 'email';
}

export function trackLeadClick({
  providerId,
  categoryId,
  cityId,
  clickType,
}: LeadClickEvent): void {
  if (typeof window === 'undefined') return;

  const payload = JSON.stringify({
    provider_id: providerId,
    category_id: categoryId,
    city_id: cityId,
    click_type: clickType,
  });

  try {
    // 1. Prefer navigator.sendBeacon as it survives page unloads and protocol transitions (wa.me / tel:)
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/track/whatsapp-click', blob);
      const sent = navigator.sendBeacon('/api/track-lead', blob);
      if (sent) return;
    }

    // 2. Fallback to fetch with keepalive: true
    fetch('/api/track/whatsapp-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {});

    fetch('/api/track-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Non-blocking catch to ensure zero UI interruption
    });
  } catch (err) {
    console.warn('Lead tracking error:', err);
  }
}
