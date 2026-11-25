'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface PublicIdBadgeProps {
  publicId?: number | string;
  lang?: string;
  className?: string;
}

export default function PublicIdBadge({
  publicId,
  lang = 'en',
  className = '',
}: PublicIdBadgeProps) {
  const [copied, setCopied] = useState(false);

  if (!publicId) return null;

  const displayId = String(publicId).replace(/^#/, '');

  const label =
    lang === 'ur'
      ? 'بصیرہ ID:'
      : lang === 'ar'
      ? 'معرّف بصيرة:'
      : 'Baseera ID:';

  const copiedText =
    lang === 'ur'
      ? 'کاپی ہو گیا!'
      : lang === 'ar'
      ? 'تم النسخ!'
      : 'Copied!';

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(`#${displayId}`);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = `#${displayId}`;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Copy to clipboard failed:', err);
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200/90 text-gray-700 text-xs shadow-2xs transition-all hover:bg-gray-100/80 hover:border-gray-300 ${className}`}
      title={lang === 'ur' ? 'شناختی نمبر کاپی کرنے کے لیے کلک کریں' : lang === 'ar' ? 'انقر لنسخ المعرّف' : 'Click to copy provider ID'}
    >
      <span className="font-semibold text-gray-500 text-[11px] uppercase tracking-wider">
        {label}
      </span>
      <span className="font-mono font-bold text-gray-900 tracking-tight">
        #{displayId}
      </span>

      <button
        type="button"
        onClick={handleCopy}
        className="ms-0.5 p-1 rounded hover:bg-gray-200/70 text-gray-400 hover:text-emerald-700 transition-colors focus:outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer"
        aria-label={`Copy Baseera ID #${displayId}`}
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>

      {copied && (
        <span className="text-[10px] font-bold text-emerald-700 animate-in fade-in slide-in-from-left-1">
          {copiedText}
        </span>
      )}
    </div>
  );
}
