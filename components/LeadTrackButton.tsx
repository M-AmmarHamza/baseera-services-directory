'use client';

import React from 'react';
import { trackLeadClick } from '@/lib/analytics';

export interface LeadTrackButtonProps {
  href: string;
  providerId: string;
  categoryId?: string;
  cityId?: string;
  clickType: 'whatsapp' | 'call' | 'telegram' | 'email';
  target?: string;
  rel?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  title?: string;
  ariaLabel?: string;
}

export default function LeadTrackButton({
  href,
  providerId,
  categoryId,
  cityId,
  clickType,
  target = '_self',
  rel = 'noopener noreferrer',
  className,
  children,
  onClick,
  title,
  ariaLabel,
}: LeadTrackButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    trackLeadClick({
      providerId,
      categoryId,
      cityId,
      clickType,
    });
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={className}
      onClick={handleClick}
      title={title}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
}
