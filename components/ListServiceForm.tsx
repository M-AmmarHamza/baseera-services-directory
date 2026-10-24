'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  COUNTRIES,
  CATEGORIES,
  getCategoryName,
  getCitiesByCountry,
  getLocalizedCountryName,
  getLocalizedCityName,
  City,
} from '@/lib/db';
import { getCountryCurrency, cleanNumericPrice } from '@/lib/currencies';
import {
  validateAndFormatE164,
  formatAsYouType,
  getCountryCallingCodeSafe,
} from '@/lib/phone';
import {
  createProviderRegistrationSchema,
  validateScript,
  getScriptErrorMessage,
  MAX_SERVICE_AREAS,
  MAX_BIO_LENGTH,
} from '@/lib/validations/provider';
import { getSiteUrl } from '@/lib/site-url';
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Phone,
  Camera,
  Upload,
  X,
  HelpCircle,
  ImageIcon,
  AlertCircle,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/Icons';

type ContactChannel = 'whatsapp' | 'phone' | 'telegram' | 'both';

// Helper to compress image on client-side before sending to prevent 413 Payload Too Large
async function compressImage(file: File, maxWidth: number, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // Use webp if supported, otherwise jpeg
        const compressedDataUrl = canvas.toDataURL('image/webp', quality) || canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Localization hook for provider registration form.
 * Reads keys from dictionary's registration section, with interpolation and dot-notation support.
 */
export function useTranslation(dict: any) {
  const t = (
    key: string,
    paramsOrFallback?: Record<string, string | number> | string,
    params?: Record<string, string | number>
  ): string => {
    let raw = dict?.registration?.[key];
    let interpolations: Record<string, string | number> | undefined;

    if (typeof paramsOrFallback === 'object') {
      interpolations = paramsOrFallback;
    } else if (typeof paramsOrFallback === 'string') {
      if (!raw) raw = paramsOrFallback;
      interpolations = params;
    }

    if (!raw) {
      const parts = key.split('.');
      let curr: any = dict;
      for (const p of parts) {
        if (!curr) break;
        curr = curr[p];
      }
      if (typeof curr === 'string') raw = curr;
    }

    if (!raw) return typeof paramsOrFallback === 'string' ? paramsOrFallback : key;

    if (interpolations) {
      return Object.entries(interpolations).reduce((str, [k, v]) => {
        return str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }, raw);
    }

    return raw;
  };

  return { t };
}

interface ListServiceFormProps {
  lang: string;
  dict: any;
}

export default function ListServiceForm({ lang, dict }: ListServiceFormProps) {
  const { t } = useTranslation(dict);
  const router = useRouter();
  const searchParams = useSearchParams();

  const isRTL = lang === 'ur' || lang === 'ar';
  const fontClass = lang === 'ur' ? 'font-urdu' : lang === 'ar' ? 'font-tajawal' : 'font-sans';

  const defaultCountry = searchParams?.get('country') || 'pk';
  const defaultCity = searchParams?.get('city') || 'karachi';
  const defaultCategory = searchParams?.get('category') || 'electrician';

  // Form states
  const [name, setName] = useState('');
  const [contactChannel, setContactChannel] = useState<ContactChannel>('whatsapp');
  const [contactNumber, setContactNumber] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');

  // Cascading Country & City Dropdowns
  const [selectedCountryId, setSelectedCountryId] = useState<string>(defaultCountry);
  const [availableCities, setAvailableCities] = useState<City[]>(() => {
    if (defaultCountry) {
      return getCitiesByCountry(defaultCountry);
    }
    return [];
  });
  const [cityName, setCityName] = useState<string>(() => {
    if (defaultCountry && defaultCity) {
      const cities = getCitiesByCountry(defaultCountry);
      const match = cities.find(
        (c) => c.slug.toLowerCase() === defaultCity.toLowerCase()
      );
      if (match) return match.slug;
      if (cities.length > 0) return cities[0].slug;
    }
    return '';
  });

  const countryCode = selectedCountryId;
  const [categoryId, setCategoryId] = useState(defaultCategory);
  const [tradeTitle, setTradeTitle] = useState('');
  const [shortBio, setShortBio] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [serviceAreaError, setServiceAreaError] = useState('');
  const [startingPrice, setStartingPrice] = useState(() => String(getCountryCurrency(defaultCountry).defaultFee));
  const [profileType, setProfileType] = useState<'individual' | 'shop'>('individual');

  // Script & Field-Specific Error States
  const [nameError, setNameError] = useState('');
  const [tradeTitleError, setTradeTitleError] = useState('');
  const [bioError, setBioError] = useState('');

  const handleNameChange = (val: string) => {
    setName(val);
    if (nameError && validateScript(val, lang, true)) {
      setNameError('');
    }
  };

  const handleNameBlur = () => {
    if (!name.trim()) return;
    if (!validateScript(name, lang, true)) {
      setNameError(t('err_name_script', getScriptErrorMessage(lang, 'name')));
    } else {
      setNameError('');
    }
  };

  const handleTradeTitleChange = (val: string) => {
    setTradeTitle(val);
    if (tradeTitleError && validateScript(val, lang, false)) {
      setTradeTitleError('');
    }
  };

  const handleTradeTitleBlur = () => {
    if (!tradeTitle.trim()) {
      setTradeTitleError('');
      return;
    }
    if (!validateScript(tradeTitle, lang, false)) {
      setTradeTitleError(t('err_trade_title_script', getScriptErrorMessage(lang, 'trade_title')));
    } else {
      setTradeTitleError('');
    }
  };

  const handleBioChange = (val: string) => {
    const truncated = val.slice(0, MAX_BIO_LENGTH);
    setShortBio(truncated);
    if (bioError && validateScript(truncated, lang, false)) {
      setBioError('');
    }
  };

  const handleBioBlur = () => {
    if (!shortBio.trim()) {
      setBioError('');
      return;
    }
    if (!validateScript(shortBio, lang, false)) {
      setBioError(t('err_bio_script', getScriptErrorMessage(lang, 'short_bio')));
    } else {
      setBioError('');
    }
  };

  const selectedCurrency = getCountryCurrency(countryCode);
  const countryCallingCode = getCountryCallingCodeSafe(countryCode);

  // Parse entered service areas (comma separated, max 3)
  const parsedAreas = serviceArea
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const handleServiceAreaChange = (val: string) => {
    const parts = val.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length > MAX_SERVICE_AREAS) {
      setServiceAreaError(t('err_max_areas'));
    } else {
      setServiceAreaError('');
    }
    setServiceArea(val);
  };

  const removeAreaByIndex = (indexToRemove: number) => {
    const updated = parsedAreas.filter((_, idx) => idx !== indexToRemove);
    setServiceArea(updated.join(', '));
    setServiceAreaError('');
  };

  // Cascading logic: reset cities on country change
  const handleCountryChange = (newCountryCode: string) => {
    setSelectedCountryId(newCountryCode);
    setCityName('');

    if (newCountryCode) {
      const filtered = getCitiesByCountry(newCountryCode);
      setAvailableCities(filtered);
      const curr = getCountryCurrency(newCountryCode);
      setStartingPrice(String(curr.defaultFee));

      if (contactNumber && contactChannel !== 'telegram') {
        setContactNumber(formatAsYouType(contactNumber, newCountryCode));
      }
      if (secondaryPhone) {
        setSecondaryPhone(formatAsYouType(secondaryPhone, newCountryCode));
      }
    } else {
      setAvailableCities([]);
    }
  };

  // Image Upload states (Max 10MB, JPG/PNG/JPEG/WEBP)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string>('');
  const [avatarError, setAvatarError] = useState<string>('');

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverBase64, setCoverBase64] = useState<string>('');
  const [coverError, setCoverError] = useState<string>('');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showTradeTitleHelp, setShowTradeTitleHelp] = useState(true);
  const [createdProfile, setCreatedProfile] = useState<{
    slug: string;
    publicUrl: string;
  } | null>(null);

  function switchLanguage(targetLang: string) {
    const qs = searchParams?.toString() ? `?${searchParams.toString()}` : '';
    router.push(`/${targetLang}/list-service${qs}`);
  }

  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAvatarError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setAvatarError(t('err_file_type'));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setAvatarError(t('err_file_size'));
      return;
    }

    try {
      const compressed = await compressImage(file, 400, 0.85);
      setAvatarPreview(compressed);
      setAvatarBase64(compressed);
    } catch {
      setAvatarError(t('err_process_avatar'));
    }
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCoverError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setCoverError(t('err_file_type'));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setCoverError(t('err_file_size'));
      return;
    }

    try {
      const compressed = await compressImage(file, 1200, 0.85);
      setCoverPreview(compressed);
      setCoverBase64(compressed);
    } catch {
      setCoverError(t('err_process_cover'));
    }
  }

  function removeAvatar() {
    setAvatarPreview(null);
    setAvatarBase64('');
    setAvatarError('');
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  }

  function removeCover() {
    setCoverPreview(null);
    setCoverBase64('');
    setCoverError('');
    if (coverInputRef.current) coverInputRef.current.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNameError('');
    setTradeTitleError('');
    setBioError('');

    if (!name.trim() || !contactNumber.trim() || !selectedCountryId.trim() || !cityName.trim()) {
      setErrorMsg(t('err_required_fields'));
      if (!name.trim()) {
        setNameError(t('err_name_script', getScriptErrorMessage(lang, 'name')));
      }
      return;
    }

    // Dynamic Script Validation checks for text-heavy fields
    let hasScriptError = false;
    if (!validateScript(name, lang, true)) {
      setNameError(t('err_name_script', getScriptErrorMessage(lang, 'name')));
      hasScriptError = true;
    }
    if (tradeTitle.trim() && !validateScript(tradeTitle, lang, false)) {
      setTradeTitleError(t('err_trade_title_script', getScriptErrorMessage(lang, 'trade_title')));
      hasScriptError = true;
    }
    if (shortBio.trim() && !validateScript(shortBio, lang, false)) {
      setBioError(t('err_bio_script', getScriptErrorMessage(lang, 'short_bio')));
      hasScriptError = true;
    }

    if (hasScriptError) {
      setErrorMsg(t('err_language_script', getScriptErrorMessage(lang)));
      return;
    }

    const areasArray = serviceArea
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (areasArray.length > MAX_SERVICE_AREAS) {
      setErrorMsg(t('err_max_areas'));
      return;
    }

    if (shortBio.trim().length > MAX_BIO_LENGTH) {
      setErrorMsg(t('err_bio_length'));
      return;
    }

    let finalWhatsAppNumber = '';
    let finalPhoneNumber = '';

    if (contactChannel === 'telegram') {
      const handle = contactNumber.trim();
      if (!handle) {
        setErrorMsg(t('err_telegram_handle'));
        return;
      }
      finalPhoneNumber = handle;
    } else {
      const primaryValidation = validateAndFormatE164(contactNumber, countryCode);
      if (!primaryValidation.isValid) {
        setErrorMsg(t('err_invalid_phone'));
        return;
      }
      finalWhatsAppNumber = primaryValidation.e164;
      finalPhoneNumber = primaryValidation.e164;
    }

    if (secondaryPhone.trim()) {
      const secValidation = validateAndFormatE164(secondaryPhone, countryCode);
      if (!secValidation.isValid) {
        setErrorMsg(t('err_invalid_secondary_phone'));
        return;
      }
      finalPhoneNumber = secValidation.e164;
    }

    const payload = {
      name: name.trim(),
      whatsapp_number: finalWhatsAppNumber || (contactChannel === 'telegram' ? '' : contactNumber.trim()),
      phone_number: finalPhoneNumber || (contactChannel === 'telegram' ? '' : (secondaryPhone.trim() || contactNumber.trim())),
      preferred_contact: contactChannel,
      country_code: countryCode.toLowerCase(),
      city_name: cityName.trim(),
      category_id: categoryId,
      trade_title: tradeTitle.trim(),
      short_bio: shortBio.trim(),
      service_area: areasArray,
      starting_price: cleanNumericPrice(startingPrice, getCountryCurrency(countryCode).defaultFee),
      profile_type: profileType,
      avatar_url: avatarBase64,
      cover_url: coverBase64,
      lang,
    };

    const schema = createProviderRegistrationSchema(lang);
    const clientValidation = schema.safeParse(payload);
    if (!clientValidation.success) {
      for (const issue of clientValidation.error.issues) {
        const field = issue.path[0];
        if (field === 'name') setNameError(issue.message);
        if (field === 'trade_title') setTradeTitleError(issue.message);
        if (field === 'short_bio') setBioError(issue.message);
      }
      setErrorMsg(clientValidation.error.issues[0]?.message || 'Please check form inputs.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/providers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCreatedProfile({
          slug: data.slug,
          publicUrl: data.publicUrl,
        });
      } else {
        setErrorMsg(data.message || data.error || t('err_publish_failed'));
      }
    } catch (err: any) {
      setErrorMsg(err?.message || t('err_network'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={`bg-[#f9f9ff] min-h-screen text-[#141b2b] py-8 px-4 sm:px-6 lg:px-8 ${fontClass}`}>
      <div className="max-w-2xl mx-auto">
        
        {/* Back Link & Quick Language Switcher Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href={`/${lang}`}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#006948] font-semibold transition-colors group"
          >
            {isRTL ? (
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            ) : (
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            )}
            <span>{t('back_to_directory')}</span>
          </Link>

          {/* Form Language Selector */}
          <div className="flex items-center bg-white border border-gray-200/90 rounded-full p-1 shadow-2xs text-xs font-semibold">
            <span className="text-gray-500 text-xs uppercase font-bold px-2 hidden xs:inline">
              {t('language_label')}
            </span>
            <button
              type="button"
              onClick={() => switchLanguage('en')}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-[#006948] text-white shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => switchLanguage('ur')}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer font-urdu ${
                lang === 'ur'
                  ? 'bg-[#006948] text-white shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              اردو
            </button>
            <button
              type="button"
              onClick={() => switchLanguage('ar')}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer font-tajawal ${
                lang === 'ar'
                  ? 'bg-[#006948] text-white shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              العربية
            </button>
          </div>
        </div>

        {createdProfile ? (
          /* Success Screen */
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-emerald-200 shadow-sm text-center flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#006948] flex items-center justify-center ring-8 ring-emerald-50/50">
              <CheckCircle2 className="w-10 h-10 text-[#006948]" />
            </div>

            <div>
              <span className="text-xs bg-emerald-50 text-[#006948] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100">
                {t('success_badge')}
              </span>
              <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight text-gray-950 overflow-visible ${
                lang === 'ur' ? 'font-urdu leading-[2.5] mb-6 pt-2' : lang === 'ar' ? 'font-tajawal leading-snug mt-3' : 'leading-tight mt-3'
              }`}>
                {t('success_welcome', { name })}
              </h1>
              <p className={`text-base text-gray-600 max-w-md mx-auto overflow-visible ${
                lang === 'ur' ? 'font-urdu leading-[2.2] mb-6' : lang === 'ar' ? 'font-tajawal mt-2 leading-relaxed' : 'leading-relaxed mt-2'
              }`}>
                {t('success_desc')}
              </p>
            </div>

            <div className="w-full bg-[#f1f3ff] rounded-2xl p-4 flex flex-col gap-2 text-start border border-gray-200/70">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t('your_public_url')}
              </span>
              <code className="text-xs font-mono text-[#006948] break-all font-semibold dir-ltr text-start">
                {createdProfile.publicUrl}
              </code>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <Link
                href={createdProfile.publicUrl}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white font-semibold text-sm shadow-xs transition-all text-center flex items-center justify-center gap-2"
              >
                <span>{t('view_public_profile')}</span>
                <ArrowRight className={`w-4 h-4 shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
              </Link>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${t('whatsapp_share_text')}${typeof window !== 'undefined' ? window.location.origin : getSiteUrl()}${createdProfile.publicUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <WhatsAppIcon className="w-4 h-4 text-white fill-current shrink-0" />
                <span>{t('share_whatsapp')}</span>
              </a>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs flex flex-col gap-6 overflow-visible text-start">
            
            {/* Header */}
            <div className="overflow-visible text-start">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#006948] text-xs font-bold border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#006948] shrink-0" />
                  <span>{t('badge_free')}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006948] animate-pulse shrink-0"></span>
                  <span>{t('badge_instant')}</span>
                </span>
              </div>
              <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight text-gray-950 overflow-visible ${
                lang === 'ur' ? 'font-urdu leading-[2.5] mb-6 pt-2' : lang === 'ar' ? 'font-tajawal leading-snug' : 'leading-tight'
              }`}>
                {t('page_title')}
              </h1>
              <p className={`text-base text-gray-600 overflow-visible ${
                lang === 'ur' ? 'font-urdu leading-[2.2] mb-4' : lang === 'ar' ? 'font-tajawal mt-1 leading-relaxed' : 'mt-1 leading-relaxed'
              }`}>
                {t('page_subtitle')}
              </p>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-800 font-semibold flex items-start gap-3 shadow-xs text-start">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  {errorMsg}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-start">
              
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-900 text-start">
                  {t('name_label')}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onBlur={handleNameBlur}
                  placeholder={t('name_placeholder')}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none transition-all text-start ${
                    nameError
                      ? 'bg-red-50/40 border border-red-400 focus:border-red-500 text-gray-900'
                      : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-[#006948] focus:bg-white'
                  }`}
                />
                {nameError && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 font-semibold px-1 mt-0.5 text-start">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{nameError}</span>
                  </div>
                )}
              </div>

              {/* Contact Channel Selector & Number */}
              <div className="flex flex-col gap-2 p-4 rounded-2xl bg-slate-50 border border-gray-200 text-start">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-900">
                    {t('contact_channel_label')}
                  </label>
                  <span className="text-xs text-[#006948] font-bold">
                    {t('direct_leads_badge')}
                  </span>
                </div>

                {/* Contact Options: WhatsApp, Direct Call, Telegram, Both */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setContactChannel('whatsapp')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      contactChannel === 'whatsapp'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-current shrink-0" />
                    <span>{t('channel_whatsapp')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContactChannel('phone')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      contactChannel === 'phone'
                        ? 'bg-[#006948] text-white border-[#006948] shadow-2xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>{t('channel_phone')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContactChannel('telegram')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      contactChannel === 'telegram'
                        ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span>{t('channel_telegram')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContactChannel('both')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      contactChannel === 'both'
                        ? 'bg-gray-900 text-white border-gray-900 shadow-2xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span>{t('channel_both')}</span>
                  </button>
                </div>

                {/* Primary Number / Handle */}
                <div className="relative mt-1">
                  <div className="absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    {contactChannel === 'whatsapp' || contactChannel === 'both' ? (
                      <WhatsAppIcon className="w-4 h-4 text-emerald-600 fill-current" />
                    ) : contactChannel === 'phone' ? (
                      <Phone className="w-4 h-4 text-[#006948]" />
                    ) : (
                      <span className="font-bold text-xs text-sky-600">@</span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={contactNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (contactChannel === 'telegram') {
                        setContactNumber(val);
                      } else {
                        setContactNumber(formatAsYouType(val, selectedCountryId));
                      }
                    }}
                    placeholder={
                      contactChannel === 'telegram'
                        ? t('telegram_placeholder')
                        : countryCallingCode
                        ? `+${countryCallingCode} ...`
                        : t('phone_placeholder', { code: '92' })
                    }
                    className="w-full ps-10 pe-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#006948] transition-all font-medium text-start"
                  />
                </div>

                {/* Live E.164 Format Feedback */}
                {contactChannel !== 'telegram' && contactNumber.trim().length >= 4 && (() => {
                  const check = validateAndFormatE164(contactNumber, selectedCountryId);
                  if (check.isValid) {
                    return (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium px-1 text-start">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          {t('verified_e164')}{' '}
                          <code className="font-mono font-semibold text-emerald-800 dir-ltr inline-block">{check.e164}</code>
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 font-normal px-1 text-start">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        {t('enter_valid_phone', { code: countryCallingCode || '92' })}
                      </span>
                    </div>
                  );
                })()}

                {/* Secondary / Alternate Phone Number (Optional) */}
                <div className="mt-1">
                  <label className="text-xs font-semibold text-gray-700 block mb-1 text-start">
                    {t('secondary_phone_label')}
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={secondaryPhone}
                    onChange={(e) => setSecondaryPhone(formatAsYouType(e.target.value, selectedCountryId))}
                    placeholder={countryCallingCode ? `+${countryCallingCode} ...` : '+92 300 9876543'}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#006948] transition-all text-start"
                  />
                </div>
                <span className="text-xs text-gray-500 text-start">
                  {t('secondary_phone_help')}
                </span>

                {/* Single Profile Policy Notice */}
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-950 flex items-start gap-2.5 mt-1 text-start">
                  <ShieldCheck className="w-4 h-4 text-[#006948] shrink-0 mt-0.5" />
                  <span className={`leading-relaxed ${lang === 'ur' ? 'font-urdu leading-[2.0]' : ''}`}>
                    {t('single_profile_policy')}
                  </span>
                </div>
              </div>

              {/* Country & City (Cascading Dependent Dropdown) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Country Selection */}
                <div className="flex flex-col gap-1.5 text-start">
                  <label className="text-sm font-semibold text-gray-900">
                    {t('country_label')}
                  </label>
                  <select
                    required
                    value={selectedCountryId}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-[#006948] focus:bg-white transition-all cursor-pointer text-start"
                  >
                    <option value="" disabled>
                      {t('select_country_placeholder')}
                    </option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {getLocalizedCountryName(c.code, lang)} ({c.code.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Cascading City Selection */}
                <div className="flex flex-col gap-1.5 text-start">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-900">
                      {t('city_label')}
                    </label>
                    {selectedCountryId && availableCities.length > 0 && (
                      <span className="text-[11px] text-gray-400 font-medium">
                        {availableCities.length} {t('cities_available')}
                      </span>
                    )}
                  </div>
                  <select
                    required
                    disabled={!selectedCountryId || availableCities.length === 0}
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all cursor-pointer text-start ${
                      !selectedCountryId || availableCities.length === 0
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-75'
                        : 'bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-[#006948] focus:bg-white'
                    } ${lang === 'ur' ? 'font-urdu leading-[2.0]' : ''}`}
                  >
                    <option value="" disabled>
                      {!selectedCountryId
                        ? t('select_country_first')
                        : t('select_city_placeholder')}
                    </option>
                    {availableCities.map((city) => {
                      const localizedTitle = getLocalizedCityName(city.slug, lang);
                      const displayTitle = lang === 'en' ? city.name : localizedTitle;
                      return (
                        <option key={city.slug} value={city.slug}>
                          {displayTitle}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Category & Classification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5 text-start">
                  <label className="text-sm font-semibold text-gray-900">
                    {t('category_label')}
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-[#006948] focus:bg-white transition-all cursor-pointer text-start"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {getCategoryName(cat, lang)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 text-start">
                  <label className="text-sm font-semibold text-gray-900">
                    {t('profile_type_label')}
                  </label>
                  <select
                    value={profileType}
                    onChange={(e) => setProfileType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-[#006948] focus:bg-white transition-all cursor-pointer text-start"
                  >
                    <option value="individual">
                      {t('profile_type_individual')}
                    </option>
                    <option value="shop">
                      {t('profile_type_shop')}
                    </option>
                  </select>
                </div>
              </div>

              {/* Trade Title / Headline + Explanation Helper */}
              <div className="flex flex-col gap-1.5 text-start">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    <span>{t('trade_title')}</span>
                    <button
                      type="button"
                      onClick={() => setShowTradeTitleHelp(!showTradeTitleHelp)}
                      className="text-gray-400 hover:text-emerald-700 cursor-pointer"
                      title={t('trade_title_help_title')}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </label>
                  <span className="text-xs text-gray-500 font-medium">
                    {t('trade_title_sub')}
                  </span>
                </div>

                <input
                  type="text"
                  value={tradeTitle}
                  onChange={(e) => handleTradeTitleChange(e.target.value)}
                  onBlur={handleTradeTitleBlur}
                  placeholder={t('trade_title_placeholder')}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none transition-all font-medium text-start ${
                    tradeTitleError
                      ? 'bg-red-50/40 border border-red-400 focus:border-red-500 text-gray-900'
                      : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-[#006948] focus:bg-white'
                  }`}
                />

                {tradeTitleError && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 font-semibold px-1 mt-0.5 text-start">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{tradeTitleError}</span>
                  </div>
                )}

                {/* Explainer Box for Trade Title */}
                {showTradeTitleHelp && (
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-950 flex flex-col gap-1 text-start">
                    <p className="font-bold text-emerald-900 flex items-center gap-1">
                      <span>💡</span>
                      <span>{t('trade_title_help_title')}</span>
                    </p>
                    <p className={`text-emerald-800 leading-relaxed ${lang === 'ur' ? 'font-urdu leading-[2.0]' : ''}`}>
                      {t('trade_title_help_desc')}
                    </p>
                  </div>
                )}
              </div>

              {/* IMAGE UPLOADS: Profile Picture & Cover Photo */}
              <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-50 border border-gray-200 text-start">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                    <ImageIcon className="w-4 h-4 text-[#006948] shrink-0" />
                    <span>{t('photos_section_title')}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {t('photos_specs')}
                  </span>
                </div>

                {/* Reassurance Callout: Photos are optional & automatic fallbacks are provided */}
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-950 flex items-start gap-2 text-start">
                  <span className="text-sm mt-0.5 shrink-0">ℹ️</span>
                  <div className="leading-relaxed">
                    <span className="font-bold text-emerald-900">
                      {t('photo_instructions_title')}{' '}
                    </span>
                    <span className={`text-emerald-800 ${lang === 'ur' ? 'font-urdu leading-[2.0]' : ''}`}>
                      {t('photo_instructions')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  
                  {/* 1. Profile Picture (Avatar) */}
                  <div className="flex flex-col gap-2 text-start">
                    <label className="text-xs font-semibold text-gray-700">
                      {t('avatar_label')}
                    </label>

                    <div className="relative">
                      {avatarPreview ? (
                        <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-[#006948] bg-white shadow-2xs group mx-auto sm:mx-0">
                          <img
                            src={avatarPreview}
                            alt="Profile Avatar Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={removeAvatar}
                            className="absolute top-1 end-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-sm transition-all cursor-pointer"
                            title={t('remove_image')}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="avatar-upload"
                          className="flex flex-col items-center justify-center h-28 rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#006948] bg-white hover:bg-emerald-50/30 transition-all cursor-pointer text-center p-3"
                        >
                          <Camera className="w-6 h-6 text-gray-400 mb-1" />
                          <span className="text-xs font-semibold text-gray-700">
                            {t('avatar_upload_btn')}
                          </span>
                          <span className="text-xs text-gray-500 mt-0.5">
                            JPG, PNG, WEBP (Max 10MB)
                          </span>
                        </label>
                      )}
                      <input
                        id="avatar-upload"
                        ref={avatarInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>
                    {avatarError && (
                      <span className="text-xs text-red-600 font-semibold">{avatarError}</span>
                    )}
                  </div>

                  {/* 2. Cover Photo (Banner) */}
                  <div className="flex flex-col gap-2 text-start">
                    <label className="text-xs font-semibold text-gray-700">
                      {t('cover_label')}
                    </label>

                    <div className="relative">
                      {coverPreview ? (
                        <div className="relative h-28 w-full rounded-2xl overflow-hidden border-2 border-[#006948] bg-white shadow-2xs group">
                          <img
                            src={coverPreview}
                            alt="Cover Photo Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={removeCover}
                            className="absolute top-1 end-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-sm transition-all cursor-pointer"
                            title={t('remove_image')}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="cover-upload"
                          className="flex flex-col items-center justify-center h-28 rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#006948] bg-white hover:bg-emerald-50/30 transition-all cursor-pointer text-center p-3"
                        >
                          <Upload className="w-6 h-6 text-gray-400 mb-1" />
                          <span className="text-xs font-semibold text-gray-700">
                            {t('cover_upload_btn')}
                          </span>
                          <span className="text-xs text-gray-500 mt-0.5">
                            JPG, PNG, WEBP (Max 10MB)
                          </span>
                        </label>
                      )}
                      <input
                        id="cover-upload"
                        ref={coverInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        onChange={handleCoverChange}
                        className="hidden"
                      />
                    </div>
                    {coverError && (
                      <span className="text-xs text-red-600 font-semibold">{coverError}</span>
                    )}
                  </div>

                </div>
              </div>

              {/* Service Areas (Strict limit: Max 3 areas) */}
              <div className="flex flex-col gap-1.5 text-start">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-900">
                    {t('service_areas_label')}
                  </label>
                  <span
                    className={`text-xs font-semibold tabular-nums ${
                      parsedAreas.length > MAX_SERVICE_AREAS
                        ? 'text-red-600 font-bold'
                        : parsedAreas.length === MAX_SERVICE_AREAS
                        ? 'text-emerald-700'
                        : 'text-gray-400'
                    }`}
                  >
                    {parsedAreas.length}/{MAX_SERVICE_AREAS} {t('areas_count')}
                  </span>
                </div>
                <input
                  type="text"
                  value={serviceArea}
                  onChange={(e) => handleServiceAreaChange(e.target.value)}
                  placeholder={t('service_areas_placeholder')}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition-all text-start ${
                    parsedAreas.length > MAX_SERVICE_AREAS || serviceAreaError
                      ? 'bg-red-50/50 border border-red-400 text-gray-900 focus:outline-none focus:border-red-500'
                      : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#006948] focus:bg-white'
                  }`}
                />

                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="text-xs text-gray-500">
                    {t('service_areas_helper')}
                  </span>
                  {(serviceAreaError || parsedAreas.length > MAX_SERVICE_AREAS) && (
                    <span className="text-xs font-semibold text-red-600">
                      {serviceAreaError || t('service_areas_max_error')}
                    </span>
                  )}
                </div>

                {/* Interactive Area Tag Chips */}
                {parsedAreas.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {parsedAreas.map((area, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          idx < MAX_SERVICE_AREAS
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-300'
                        }`}
                      >
                        <span>{area}</span>
                        <button
                          type="button"
                          onClick={() => removeAreaByIndex(idx)}
                          className="hover:text-red-600 text-gray-400 hover:bg-white rounded-full p-0.5 transition-colors cursor-pointer"
                          title={t('remove_image')}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Visiting Charges */}
              <div className="flex flex-col gap-1.5 text-start">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-900">
                    {t('visiting_charges_label')}
                  </label>
                  <span className="text-xs font-bold text-[#006948] bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    {selectedCurrency.symbol} ({selectedCurrency.currencyCode})
                  </span>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute start-3.5 text-sm font-bold text-gray-500 pointer-events-none select-none">
                    {selectedCurrency.symbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(e.target.value)}
                    placeholder={`${selectedCurrency.defaultFee}`}
                    className="w-full ps-14 pe-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#006948] focus:bg-white transition-all font-semibold text-start"
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {t('visiting_charges_estimate', {
                    country: COUNTRIES.find((c) => c.code === countryCode)?.name || (lang === 'ur' ? 'منتخب ملک' : lang === 'ar' ? 'الدولة المحددة' : 'selected country'),
                    symbol: selectedCurrency.symbol,
                    currency: selectedCurrency.currencyCode,
                  })}
                </span>
              </div>

              {/* Short Bio (Strict limit: Max 150 characters) */}
              <div className="flex flex-col gap-1.5 text-start">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-900">
                    {t('bio_label')}
                  </label>
                  <span
                    className={`text-xs font-semibold tabular-nums ${
                      shortBio.length >= MAX_BIO_LENGTH
                        ? 'text-amber-600 font-bold'
                        : shortBio.length >= 130
                        ? 'text-gray-700'
                        : 'text-gray-400'
                    }`}
                  >
                    {shortBio.length}/{MAX_BIO_LENGTH} {t('characters_count')}
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={MAX_BIO_LENGTH}
                  value={shortBio}
                  onChange={(e) => handleBioChange(e.target.value)}
                  onBlur={handleBioBlur}
                  placeholder={t('bio_placeholder')}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm placeholder:text-gray-400 focus:outline-none transition-all resize-none text-start ${
                    bioError || shortBio.length >= MAX_BIO_LENGTH
                      ? 'bg-red-50/40 border border-red-400 focus:border-red-500 text-gray-900'
                      : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-[#006948] focus:bg-white'
                  }`}
                />
                {bioError && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 font-semibold px-1 mt-0.5 text-start">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{bioError}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {t('bio_helper')}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {MAX_BIO_LENGTH - shortBio.length} {t('remaining_count')}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-[#006948] hover:bg-[#00855d] active:scale-[0.99] text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>{t('submitting_btn')}</span>
                ) : (
                  <>
                    <span>{t('submit_btn')}</span>
                    <ArrowRight className={`w-4 h-4 shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>

              <p className={`text-xs text-gray-500 text-center leading-relaxed ${lang === 'ur' ? 'font-urdu leading-[2.0]' : ''}`}>
                {t('disclaimer')}
              </p>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
