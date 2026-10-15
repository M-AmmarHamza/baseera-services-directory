'use client';

import React, { useState } from 'react';
import { MessageCircle, Send, Phone, Mail } from 'lucide-react';
import { getCleanWhatsAppUrl, getCleanTelUrl } from '@/lib/phone';
import { trackLeadClick } from '@/lib/analytics';

interface Props {
  providerId: string;
  providerName: string;
  contactMethod?: string; // 'whatsapp' | 'telegram' | 'phone' | 'email'
  contactValue: string; // phone number, username, or email
  categoryTitle?: string;
  categoryId?: string;
  cityName?: string;
  cityId?: string;
}

export default function ProviderContactFAB({
  providerId,
  providerName,
  contactMethod = 'whatsapp',
  contactValue,
  categoryTitle = 'Services',
  categoryId,
  cityName = 'Karachi',
  cityId,
}: Props) {
  const [clicked, setClicked] = useState(false);

  let directUrl = '';
  let label = 'Chat on WhatsApp';
  let Icon = MessageCircle;
  let clickType: 'whatsapp' | 'call' | 'telegram' | 'email' = 'whatsapp';

  switch (contactMethod.toLowerCase()) {
    case 'telegram':
      const tgUser = contactValue.replace('@', '');
      directUrl = `https://t.me/${tgUser}`;
      label = 'Contact on Telegram';
      Icon = Send;
      clickType = 'telegram';
      break;

    case 'phone':
      directUrl = getCleanTelUrl(contactValue);
      label = `Call ${providerName}`;
      Icon = Phone;
      clickType = 'call';
      break;

    case 'email':
      directUrl = `mailto:${contactValue}?subject=${encodeURIComponent(`Service Inquiry via Baseera`)}`;
      label = 'Send Email';
      Icon = Mail;
      clickType = 'email';
      break;

    case 'whatsapp':
    default:
      const defaultMsg = `Assalam-o-Alaikum ${providerName}, I found your verified profile on Baseera in ${cityName}. I would like to inquire about your ${categoryTitle} services.`;
      directUrl = getCleanWhatsAppUrl(contactValue, defaultMsg);
      label = 'Chat on WhatsApp';
      Icon = MessageCircle;
      clickType = 'whatsapp';
      break;
  }

  const handleClick = () => {
    setClicked(true);
    trackLeadClick({
      providerId,
      categoryId,
      cityId,
      clickType,
    });
  };

  return (
    <aside aria-label="Quick contact" className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40">
      <a
        href={directUrl}
        target={clickType === 'call' || clickType === 'email' ? '_self' : '_blank'}
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
