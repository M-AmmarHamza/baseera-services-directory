'use client';

import React, { useState } from 'react';
import { MessageCircle, Send, Phone, Mail } from 'lucide-react';

interface Props {
  providerId: string;
  providerName: string;
  contactMethod?: string; // 'whatsapp' | 'telegram' | 'phone' | 'email'
  contactValue: string; // phone number, username, or email
  categoryTitle?: string;
  cityName?: string;
}

export default function ProviderContactFAB({
  providerId,
  providerName,
  contactMethod = 'whatsapp',
  contactValue,
  categoryTitle = 'Services',
  cityName = 'Karachi',
}: Props) {
  const [clicked, setClicked] = useState(false);

  // Clean value
  const cleanNumber = contactValue.replace(/[^0-9]/g, '');

  let directUrl = '';
  let label = 'Chat on WhatsApp';
  let Icon = MessageCircle;

  switch (contactMethod.toLowerCase()) {
    case 'telegram':
      const tgUser = contactValue.replace('@', '');
      directUrl = `https://t.me/${tgUser}`;
      label = 'Contact on Telegram';
      Icon = Send;
      break;

    case 'phone':
      directUrl = `tel:${contactValue}`;
      label = `Call ${providerName}`;
      Icon = Phone;
      break;

    case 'email':
      directUrl = `mailto:${contactValue}?subject=${encodeURIComponent(`Service Inquiry via Baseera`)}`;
      label = 'Send Email';
      Icon = Mail;
      break;

    case 'whatsapp':
    default:
      const defaultMsg = encodeURIComponent(
        `Assalam-o-Alaikum ${providerName}, I found your verified profile on Baseera in ${cityName}. I would like to inquire about your ${categoryTitle} services.`
      );
      directUrl = `https://wa.me/${cleanNumber}?text=${defaultMsg}`;
      label = 'Chat on WhatsApp';
      Icon = MessageCircle;
      break;
  }

  const handleClick = () => {
    setClicked(true);

    // Track lead click in Supabase in background
    try {
      if (typeof window !== 'undefined') {
        const payload = JSON.stringify({ provider_id: providerId });
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/leads/click', payload);
        } else {
          fetch('/api/leads/click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Click tracking error:', e);
    }
  };

  return (
    <aside aria-label="Quick contact" className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40">
      <a
        href={directUrl}
        target={contactMethod === 'phone' ? '_self' : '_blank'}
        rel="noopener noreferrer"
        onClick={handleClick}
        className="group flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-full border border-emerald-700 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
        aria-label={label}
      >
        <Icon className="w-5 h-5 fill-current shrink-0 group-hover:scale-110 transition-transform" />
        <span className="text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap">
          {label}
        </span>
      </a>
    </aside>
  );
}
