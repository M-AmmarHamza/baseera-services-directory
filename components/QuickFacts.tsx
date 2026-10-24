import React from 'react';
import {
  ShieldCheck,
  Zap,
  PhoneCall,
  Clock,
  Coins,
  CheckCircle,
  MapPin,
  Star,
  Award,
} from 'lucide-react';

export interface FactItem {
  label: string;
  value: string;
  highlight?: boolean;
  badge?: string;
  icon?: 'verified' | 'fee' | 'contact' | 'time' | 'price' | 'location' | 'rating' | 'experience';
}

interface QuickFactsProps {
  title?: string;
  subtitle?: string;
  facts: FactItem[];
  lang?: string;
  className?: string;
}

export default function QuickFacts({
  title,
  subtitle,
  facts,
  lang = 'en',
  className = '',
}: QuickFactsProps) {
  const isUrdu = lang === 'ur';
  const isArabic = lang === 'ar';
  const isRTL = isUrdu || isArabic;

  const defaultTitle = isUrdu
    ? 'فوری حقائق اور معلومات'
    : isArabic
    ? 'معلومات سريعة وملخص الخدمة'
    : 'Quick Facts & Key Details';

  const renderIcon = (type?: string) => {
    switch (type) {
      case 'verified':
        return <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'fee':
        return <Coins className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'contact':
        return <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'time':
        return <Clock className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'price':
        return <Zap className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'location':
        return <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'rating':
        return <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />;
      case 'experience':
        return <Award className="w-4 h-4 text-emerald-600 shrink-0" />;
      default:
        return <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />;
    }
  };

  return (
    <section
      aria-label="Quick Facts"
      className={`bg-gradient-to-br from-emerald-50/50 via-white to-gray-50/50 border border-emerald-100 rounded-2xl p-4 sm:p-5 shadow-2xs ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0 animate-pulse" />
          <h3
            className={`font-bold text-sm sm:text-base text-gray-900 ${
              isUrdu ? 'font-urdu leading-[2.2]' : ''
            }`}
          >
            {title || defaultTitle}
          </h3>
        </div>
        {subtitle && (
          <span
            className={`text-[11px] font-medium text-gray-500 hidden sm:inline-block ${
              isUrdu ? 'font-urdu' : ''
            }`}
          >
            {subtitle}
          </span>
        )}
      </div>

      {/* Perfectly Balanced 3-Column Grid Layout (3x2 for 6 items) */}
      <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 text-start">
        {facts.map((fact, idx) => (
          <div
            key={idx}
            className={`flex flex-col justify-between p-2.5 sm:p-3 rounded-xl border transition-all ${
              fact.highlight
                ? 'bg-emerald-50/70 border-emerald-200 ring-1 ring-emerald-500/20'
                : 'bg-white border-gray-200/80 hover:border-gray-300'
            }`}
          >
            <dt className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-gray-500 mb-1">
              {renderIcon(fact.icon)}
              <span className={`truncate ${isUrdu ? 'font-urdu leading-[2.0]' : ''}`}>
                {fact.label}
              </span>
            </dt>
            <dd className="mt-auto">
              <span
                className={`block text-xs sm:text-sm font-bold text-gray-900 break-words ${
                  isUrdu ? 'font-urdu leading-[2.2]' : ''
                }`}
              >
                {fact.value}
              </span>
              {fact.badge && (
                <span className="inline-block mt-1 text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {fact.badge}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
