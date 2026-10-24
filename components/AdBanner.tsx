'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface AdBannerProps {
  /**
   * Google AdSense Ad Slot ID (e.g., '1234567890')
   */
  adSlot?: string;

  /**
   * Google AdSense Publisher ID (e.g., 'ca-pub-1234567890123456')
   * Defaults to NEXT_PUBLIC_ADSENSE_CLIENT_ID
   */
  adClient?: string;

  /**
   * Ad layout format
   */
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';

  /**
   * Layout key for In-feed native ads
   */
  layoutKey?: string;

  /**
   * Whether the ad is full-width responsive
   */
  responsive?: boolean;

  /**
   * Explicit min-height to guarantee zero Cumulative Layout Shift (CLS)
   */
  minHeight?: number | string;

  /**
   * Optional custom styling
   */
  className?: string;

  /**
   * Language for disclosure label ('en' | 'ur' | 'ar')
   */
  lang?: string;

  /**
   * Custom disclosure label override
   */
  label?: string;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export default function AdBanner({
  adSlot = 'default-slot',
  adClient,
  format = 'auto',
  layoutKey,
  responsive = true,
  minHeight,
  className = '',
  lang = 'en',
  label,
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const [adPushed, setAdPushed] = useState(false);

  const effectiveClient =
    adClient ||
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ||
    '';

  // Determine standard min-height to prevent Cumulative Layout Shift (CLS)
  const defaultMinHeight =
    minHeight !== undefined
      ? typeof minHeight === 'number'
        ? `${minHeight}px`
        : minHeight
      : format === 'horizontal'
      ? '90px'
      : format === 'vertical'
      ? '600px'
      : format === 'rectangle'
      ? '250px'
      : '280px'; // 'auto' or 'fluid' in-feed

  const disclosureLabel =
    label ||
    (lang === 'ur'
      ? 'اشتہار / اسپانسرڈ'
      : lang === 'ar'
      ? 'إعلان تجاري'
      : 'Advertisement');

  useEffect(() => {
    // Only attempt to push when a real client ID is configured and DOM element is mounted
    if (!effectiveClient || adPushed) return;

    try {
      if (typeof window !== 'undefined') {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        setAdPushed(true);
      }
    } catch (err) {
      // Ignore Adsbygoogle duplicate push errors
      console.warn('AdSense push notice:', err);
    }
  }, [effectiveClient, adPushed]);

  return (
    <div
      className={`ad-banner-container relative flex flex-col items-center justify-center overflow-hidden transition-all ${className}`}
      style={{ minHeight: defaultMinHeight }}
      aria-label="Advertisement"
    >
      {/* Policy Compliance Disclosure Label */}
      <div className="w-full flex items-center justify-between px-3 py-1 text-[10px] uppercase tracking-wider font-semibold text-gray-400 select-none border-b border-gray-100/80 bg-gray-50/50">
        <span>{disclosureLabel}</span>
        <span className="text-[9px] text-gray-300">Baseera Ad Network</span>
      </div>

      {effectiveClient ? (
        /* Real Google AdSense Tag */
        <div className="w-full flex-1 flex items-center justify-center p-2">
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{
              display: 'block',
              width: '100%',
              minHeight: defaultMinHeight,
            }}
            data-ad-client={effectiveClient}
            data-ad-slot={adSlot}
            data-ad-format={layoutKey ? undefined : format}
            data-ad-layout-key={layoutKey || undefined}
            data-full-width-responsive={responsive ? 'true' : 'false'}
          />
        </div>
      ) : (
        /* CLS Reserved Space Placeholder (Active during development / before publisher approval) */
        <div
          className="w-full flex-1 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-gray-50/60 via-slate-50/40 to-gray-100/40 border border-dashed border-gray-200/90 rounded-b-xl"
          style={{ minHeight: defaultMinHeight }}
        >
          <div className="w-8 h-8 rounded-full bg-gray-200/70 flex items-center justify-center text-gray-400 text-xs font-bold mb-2">
            AD
          </div>
          <p className="text-xs font-semibold text-gray-500">
            {disclosureLabel}
          </p>
          <p className="text-[11px] text-gray-400 max-w-xs mt-0.5">
            Reserved space for high-relevance local trade promotions. No layout shift.
          </p>
        </div>
      )}
    </div>
  );
}
