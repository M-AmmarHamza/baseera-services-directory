'use client';

import { useEffect, useRef } from 'react';

interface ProfileViewTrackerProps {
  providerId: string;
}

export default function ProfileViewTracker({ providerId }: ProfileViewTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!providerId || trackedRef.current) return;
    trackedRef.current = true;

    try {
      // Fire non-blocking beacon or fetch to increment profile_views
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        const sent = navigator.sendBeacon(`/api/providers/${encodeURIComponent(providerId)}`);
        if (sent) return;
      }

      fetch(`/api/providers/${encodeURIComponent(providerId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(() => {
        // Silently catch to avoid interrupting user experience
      });
    } catch (err) {
      console.warn('View tracking notice:', err);
    }
  }, [providerId]);

  return null;
}
