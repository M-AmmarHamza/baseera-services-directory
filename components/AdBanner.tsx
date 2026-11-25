'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Sparkles } from 'lucide-react';

export interface SponsorBannerData {
  id: string;
  slot: string;
  title: string;
  imageUrl: string;
  destinationUrl: string;
}

export interface AdBannerProps {
  /**
   * Placement slot key: 'top_banner' | 'in_feed' | 'profile_sidebar' | 'mobile_sticky'
   */
  slot?: 'top_banner' | 'in_feed' | 'profile_sidebar' | 'mobile_sticky' | string;

  /**
   * Google AdSense Ad Slot ID (e.g., '1234567890' or 'profile-sidebar')
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

  /**
   * Optional pre-loaded sponsor banner override
   */
  customSponsor?: SponsorBannerData;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

// In-memory client cache for ads configuration
let cachedAdConfig: {
  adsense_publisher_id: string;
  placements: Record<string, boolean>;
  sponsors: SponsorBannerData[];
  timestamp: number;
} | null = null;

export default function AdBanner({
  slot,
  adSlot = 'default-slot',
  adClient,
  format = 'auto',
  layoutKey,
  responsive = true,
  minHeight,
  className = '',
  lang = 'en',
  label,
  customSponsor,
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const [adPushed, setAdPushed] = useState(false);
  const [activeSponsor, setActiveSponsor] = useState<SponsorBannerData | null>(customSponsor || null);
  const [isPlacementEnabled, setIsPlacementEnabled] = useState(true);
  const [dynamicPublisherId, setDynamicPublisherId] = useState<string>(
    adClient || process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || ''
  );

  // Normalize slot identifier
  const resolvedSlot = (slot || adSlot || 'in_feed').toLowerCase().replace(/-/g, '_');

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
    let isMounted = true;

    async function loadConfig() {
      // Use cached config if fresh (< 60s)
      const now = Date.now();
      if (cachedAdConfig && now - cachedAdConfig.timestamp < 60000) {
        applyConfig(cachedAdConfig);
        return;
      }

      try {
        const res = await fetch('/api/ads/public');
        if (res.ok) {
          const data = await res.json();
          if (data.success && isMounted) {
            const config = {
              adsense_publisher_id: data.adsense_publisher_id || '',
              placements: data.placements || {},
              sponsors: Array.isArray(data.sponsors) ? data.sponsors : [],
              timestamp: now,
            };
            cachedAdConfig = config;
            applyConfig(config);
          }
        }
      } catch (err) {
        // Fallback to defaults
      }
    }

    function applyConfig(config: typeof cachedAdConfig) {
      if (!config) return;

      if (config.adsense_publisher_id && !adClient) {
        setDynamicPublisherId(config.adsense_publisher_id);
      }

      // Check slot placement toggle
      let enabled = true;
      if (resolvedSlot.includes('top')) {
        enabled = config.placements.top_banner !== false;
      } else if (resolvedSlot.includes('feed')) {
        enabled = config.placements.in_feed !== false;
      } else if (resolvedSlot.includes('sidebar')) {
        enabled = config.placements.profile_sidebar !== false;
      } else if (resolvedSlot.includes('sticky')) {
        enabled = config.placements.mobile_sticky !== false;
      }
      setIsPlacementEnabled(enabled);

      // Check for active private sponsor for this slot
      if (!customSponsor) {
        const matched = config.sponsors.find((s) => {
          const sSlot = s.slot.toLowerCase().replace(/-/g, '_');
          return (
            sSlot === resolvedSlot ||
            (resolvedSlot.includes('sidebar') && sSlot === 'profile_sidebar') ||
            (resolvedSlot.includes('top') && sSlot === 'top_banner') ||
            (resolvedSlot.includes('feed') && sSlot === 'in_feed') ||
            (resolvedSlot.includes('sticky') && sSlot === 'mobile_sticky')
          );
        });
        if (matched) {
          setActiveSponsor(matched);
        }
      }
    }

    loadConfig();

    return () => {
      isMounted = false;
    };
  }, [resolvedSlot, adClient, customSponsor]);

  useEffect(() => {
    // Only attempt to push when a real client ID is configured and DOM element is mounted
    if (!dynamicPublisherId || adPushed || activeSponsor || !isPlacementEnabled) return;

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
  }, [dynamicPublisherId, adPushed, activeSponsor, isPlacementEnabled]);

  // If placement is turned off by Super Admin, don't display
  if (!isPlacementEnabled) {
    return null;
  }

  // 1. Render Private Sponsor Banner if active
  if (activeSponsor) {
    return (
      <div
        className={`ad-banner-container relative flex flex-col items-center justify-center overflow-hidden transition-all rounded-2xl bg-white border border-emerald-500/20 shadow-xs group ${className}`}
        style={{ minHeight: defaultMinHeight }}
        aria-label="Sponsored Partner"
      >
        {/* Disclosure Tag */}
        <div className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-emerald-700 select-none border-b border-emerald-100 bg-emerald-50/70">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            {disclosureLabel}
          </span>
          <span className="text-[9px] text-emerald-600/80 font-medium">Verified Sponsor</span>
        </div>

        {/* Sponsor Banner Image with Destination Link */}
        <a
          href={activeSponsor.destinationUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="w-full flex-1 relative flex flex-col justify-center items-center overflow-hidden hover:opacity-95 transition-opacity"
          title={activeSponsor.title}
        >
          {activeSponsor.imageUrl ? (
            <div className="w-full h-full min-h-[140px] relative bg-slate-100 flex items-center justify-center overflow-hidden">
              <img
                src={activeSponsor.imageUrl}
                alt={activeSponsor.title}
                className="w-full h-full object-cover max-h-[300px] transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                <div className="flex items-center justify-between w-full">
                  <span className="text-white text-xs sm:text-sm font-bold tracking-tight line-clamp-1 drop-shadow-sm">
                    {activeSponsor.title}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full shrink-0 border border-emerald-500/30">
                    Visit Sponsor <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center">
              <h4 className="text-sm font-bold text-gray-800">{activeSponsor.title}</h4>
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1">
                Learn More <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          )}
        </a>
      </div>
    );
  }

  // 2. Render Google AdSense Tag or CLS Placeholder
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

      {dynamicPublisherId ? (
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
            data-ad-client={dynamicPublisherId}
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
