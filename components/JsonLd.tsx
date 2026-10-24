import React from 'react';
import { safeJsonLdStringify } from '@/lib/security';

interface JsonLdProps {
  data: Record<string, any> | Array<Record<string, any>>;
}

/**
 * Safely injects structured JSON-LD data into the document head.
 * Uses safeJsonLdStringify to neutralize script break-out and XSS sequences (<, >, &, \u2028, \u2029).
 */
export default function JsonLd({ data }: JsonLdProps) {
  if (!data) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: safeJsonLdStringify(data),
      }}
    />
  );
}
