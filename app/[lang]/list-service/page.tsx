'use client';

import React, { useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
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
  ShieldCheck,
  ArrowRight,
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

function ListServiceContent({ lang }: { lang: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const defaultCountry = searchParams?.get('country') || 'pk';
  const defaultCity = searchParams?.get('city') || 'karachi';
  const defaultCategory = searchParams?.get('category') || 'electrician';

  // Form states
  const [name, setName] = useState('');
  const [contactChannel, setContactChannel] = useState<ContactChannel>('whatsapp');
  const [contactNumber, setContactNumber] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  // 1. STATE MANAGEMENT (Cascading Country & City Dropdowns)
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
  const [startingPrice, setStartingPrice] = useState(() => String(getCountryCurrency(defaultCountry).defaultFee));
  const [profileType, setProfileType] = useState<'individual' | 'shop'>('individual');

  const selectedCurrency = getCountryCurrency(countryCode);

  // 2. CASCADING LOGIC: Filter cities immediately and reset city selection on country change
  const handleCountryChange = (newCountryCode: string) => {
    setSelectedCountryId(newCountryCode);
    // Automatically reset/clear the City selection
    setCityName('');

    if (newCountryCode) {
      const filtered = getCitiesByCountry(newCountryCode);
      setAvailableCities(filtered);
      const curr = getCountryCurrency(newCountryCode);
      setStartingPrice(String(curr.defaultFee));
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

  // Switch form language while preserving URL query params
  function switchLanguage(targetLang: string) {
    const qs = searchParams?.toString() ? `?${searchParams.toString()}` : '';
    router.push(`/${targetLang}/list-service${qs}`);
  }

  // Allowed MIME types & 10MB limit check
  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAvatarError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setAvatarError(
        lang === 'ur'
          ? 'صرف JPG, PNG, JPEG یا WEBP فارمیٹ کی اجازت ہے۔'
          : 'Only JPG, PNG, JPEG, and WEBP formats are supported.'
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setAvatarError(
        lang === 'ur'
          ? 'تصویر کا سائز 10 MB سے زیادہ نہیں ہونا چاہیے۔'
          : 'File size exceeds 10MB limit. Please choose an image under 10MB.'
      );
      return;
    }

    try {
      const compressed = await compressImage(file, 400, 0.85);
      setAvatarPreview(compressed);
      setAvatarBase64(compressed);
    } catch {
      setAvatarError('Failed to process image. Please try another file.');
    }
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCoverError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setCoverError(
        lang === 'ur'
          ? 'صرف JPG, PNG, JPEG یا WEBP فارمیٹ کی اجازت ہے۔'
          : 'Only JPG, PNG, JPEG, and WEBP formats are supported.'
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setCoverError(
        lang === 'ur'
          ? 'کور فوٹو کا سائز 10 MB سے زیادہ نہیں ہونا چاہیے۔'
          : 'File size exceeds 10MB limit. Please choose an image under 10MB.'
      );
      return;
    }

    try {
      const compressed = await compressImage(file, 1200, 0.85);
      setCoverPreview(compressed);
      setCoverBase64(compressed);
    } catch {
      setCoverError('Failed to process cover image. Please try another file.');
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
    if (!name.trim() || !contactNumber.trim() || !selectedCountryId.trim() || !cityName.trim()) {
      setErrorMsg(
        lang === 'ur'
          ? 'براہِ کرم اپنا نام، رابطہ نمبر، ملک اور شہر منتخب کریں۔'
          : lang === 'ar'
          ? 'يرجى إدخال الاسم ورقم الاتصال وتحديد الدولة والمدينة.'
          : 'Please enter your full name, primary contact number, country, and select a city.'
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/providers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          whatsapp_number: contactNumber.trim(),
          phone_number: secondaryPhone.trim() || contactNumber.trim(),
          preferred_contact: contactChannel,
          country_code: countryCode.toLowerCase(),
          city_name: cityName.trim(),
          category_id: categoryId,
          trade_title: tradeTitle.trim(),
          short_bio: shortBio.trim(),
          service_area: serviceArea.split(',').map((s) => s.trim()).filter(Boolean),
          starting_price: cleanNumericPrice(startingPrice, getCountryCurrency(countryCode).defaultFee),
          profile_type: profileType,
          avatar_url: avatarBase64,
          cover_url: coverBase64,
          lang,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCreatedProfile({
          slug: data.slug,
          publicUrl: data.publicUrl,
        });
      } else {
        setErrorMsg(data.message || data.error || 'Failed to publish profile. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error while publishing profile.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const isRTL = lang === 'ur' || lang === 'ar';

  return (
    <div className="bg-[#f9f9ff] min-h-screen text-[#141b2b] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Back Link & Quick Language Switcher Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href={`/${lang}`}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#006948] font-semibold transition-colors"
          >
            <span>← {lang === 'ur' ? 'مرکزی ڈائریکٹری پر واپس جائیں' : lang === 'ar' ? 'العودة للدليل الرئيسي' : 'Back to Global Directory'}</span>
          </Link>

          {/* Form Language Selector (Ensures URL structure remains clean) */}
          <div className="flex items-center bg-white border border-gray-200/90 rounded-full p-1 shadow-2xs text-xs font-semibold">
            <span className="text-gray-500 text-xs uppercase font-bold px-2 hidden xs:inline">
              {lang === 'ur' ? 'زبان:' : lang === 'ar' ? 'اللغة:' : 'Language:'}
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
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer font-tajawal ${
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
                🎉 {lang === 'ur' ? 'پروفائل لائیو ہو گیا!' : 'Profile Created & Live!'}
              </span>
              <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight text-gray-950 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.5] mb-6 pt-2' : 'leading-tight mt-3'}`}>
                {lang === 'ur' ? `بصیرہ پر خوش آمدید، ${name}!` : `Welcome to Baseera, ${name}!`}
              </h1>
              <p className={`text-base text-gray-600 max-w-md mx-auto overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.5] mb-6' : 'leading-relaxed mt-2'}`}>
                {lang === 'ur'
                  ? 'آپ کا پروفائل کامیابی سے بن چکا ہے۔ اب کسٹمرز آپ سے بغیر کسی کمیشن کے براہِ راست رابطہ کر سکتے ہیں۔'
                  : 'Your public service page has been created dynamically. Customers can now discover your services and contact you directly with zero commission.'}
              </p>
            </div>

            <div className="w-full bg-[#f1f3ff] rounded-2xl p-4 flex flex-col gap-2 text-start border border-gray-200/70">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {lang === 'ur' ? 'آپ کا پبلک لنک:' : 'Your Public URL:'}
              </span>
              <code className="text-xs font-mono text-[#006948] break-all font-semibold">
                {createdProfile.publicUrl}
              </code>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <Link
                href={createdProfile.publicUrl}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white font-semibold text-sm shadow-xs transition-all text-center flex items-center justify-center gap-2"
              >
                <span>{lang === 'ur' ? 'پبلک پروفائل دیکھیں' : 'View My Public Profile Page'}</span>
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </Link>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`I have published my service profile on Baseera directory! View my page: https://baseera-services-directory.vercel.app${createdProfile.publicUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <WhatsAppIcon className="w-4 h-4 text-white fill-current" />
                <span>{lang === 'ur' ? 'واٹس ایپ پر شیئر کریں' : 'Share on WhatsApp'}</span>
              </a>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs flex flex-col gap-6 overflow-visible">
            
            {/* Header */}
            <div className="overflow-visible">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#006948] text-xs font-bold border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#006948]" />
                  {lang === 'ur' ? '100% مفت • زیرو کمیشن' : '100% Free • Zero Commission'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006948] animate-pulse"></span>
                  {lang === 'ur' ? 'فوری پبلک لسٹنگ' : 'Instant Public Profile'}
                </span>
              </div>
              <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight text-gray-950 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.5] mb-6 pt-2' : 'leading-tight'}`}>
                {lang === 'ur'
                  ? 'بطور سروس پرووائیڈر رجسٹر ہوں'
                  : lang === 'ar'
                  ? 'سجل كفني أو مقدم خدمة محلي'
                  : 'Register as a Local Specialist'}
              </h1>
              <p className={`text-base text-gray-600 overflow-visible ${lang === 'ur' ? 'font-urdu leading-[2.5] mb-4' : 'mt-1 leading-relaxed'}`}>
                {lang === 'ur'
                  ? 'بصیرہ پر اپنی سروس کا پروفائل شائع کریں اور اپنے شہر کے گاہکوں سے براہِ راست رابطہ حاصل کریں۔'
                  : 'Publish your service profile on Baseera. Customers in your city connect directly with you without any agency cut.'}
              </p>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-800 font-semibold flex items-start gap-3 shadow-xs">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  {errorMsg}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-900">
                  {lang === 'ur' ? 'پورا نام / کاروباری نام *' : 'Full Name / Business Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lang === 'ur' ? 'مثلاً: طارق محمود یا الرحمٰن الیکٹریکل ورکس' : 'e.g. Tariq Mahmood or Al-Rehman Electrical Works'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#006948] focus:bg-white transition-all"
                />
              </div>

              {/* Contact Channel Selector & Number */}
              <div className="flex flex-col gap-2 p-4 rounded-2xl bg-slate-50 border border-gray-200">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-900">
                    {lang === 'ur' ? 'رابطے کا بنیادی ذریعہ اور نمبر *' : 'Primary Contact Channel & Details *'}
                  </label>
                  <span className="text-xs text-[#006948] font-bold">
                    {lang === 'ur' ? 'براہِ راست کسٹمر رابطہ' : 'Direct Customer Leads'}
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
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                    <span>WhatsApp</span>
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
                    <Phone className="w-3.5 h-3.5" />
                    <span>{lang === 'ur' ? 'براہِ راست کال' : 'Direct Call'}</span>
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
                    <span>Telegram</span>
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
                    <span>{lang === 'ur' ? 'دونوں (WhatsApp & Call)' : 'Both'}</span>
                  </button>
                </div>

                {/* Primary Number / Handle */}
                <div className="relative mt-1">
                  <div className="absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400">
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
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder={
                      contactChannel === 'telegram'
                        ? '@username or t.me/username'
                        : 'e.g. +92 333 2145890 or +971 50 1234567'
                    }
                    className="w-full ps-10 pe-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#006948] transition-all font-medium"
                  />
                </div>

                {/* Secondary / Alternate Phone Number (Optional) */}
                <div className="mt-1">
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    {lang === 'ur' ? 'متبادل فون نمبر (اختیاری):' : 'Alternative / Direct Call Number (Optional):'}
                  </label>
                  <input
                    type="tel"
                    value={secondaryPhone}
                    onChange={(e) => setSecondaryPhone(e.target.value)}
                    placeholder="e.g. +92 300 9876543"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#006948] transition-all"
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {lang === 'ur'
                    ? 'کسٹمرز کے رابطہ بٹن اس نمبر پر ڈائریکٹ کال یا میسج کھولیں گے۔'
                    : 'Customer inquiry buttons on your profile will connect directly via your chosen method.'}
                </span>

                {/* Single Profile Policy Notice */}
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-950 flex items-start gap-2.5 mt-1">
                  <ShieldCheck className="w-4 h-4 text-[#006948] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {lang === 'ur'
                      ? 'قاعدہ: بصیرہ پر ایک فون / واٹس ایپ نمبر پر صرف ایک تصدیق شدہ پروفائل بنائی جا سکتی ہے۔ ایک ہی فرد / پرووائیڈر کے مختلف کیٹیگریز میں الگ الگ ڈپلیکیٹ پروفائلز بنانا سختی سے منع ہے۔'
                      : lang === 'ar'
                      ? 'قاعدة هامة: يُسمح بملف شخصي واحد موثق فقط لكل رقم هاتف / واتساب. يُحظر إنشاء حسابات مكررة بنفس الرقم عبر فئات متعددة.'
                      : 'Important Policy: Only one verified profile per phone / WhatsApp number is permitted on Baseera. Registering duplicate profiles across multiple categories using the same number is strictly prohibited.'}
                  </span>
                </div>
              </div>

              {/* Country & City (Cascading Dependent Dropdown) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Country Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-900">
                    {lang === 'ur' ? 'ملک *' : lang === 'ar' ? 'الدولة *' : 'Country *'}
                  </label>
                  <select
                    required
                    value={selectedCountryId}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-[#006948] focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="" disabled>
                      {lang === 'ur' ? '-- ملک منتخب کریں --' : lang === 'ar' ? '-- اختر الدولة --' : '-- Select Country --'}
                    </option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {getLocalizedCountryName(c.code, lang)} ({c.code.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Cascading City Selection */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-900">
                      {lang === 'ur' ? 'شہر کا نام *' : lang === 'ar' ? 'اسم المدينة *' : 'City Name *'}
                    </label>
                    {selectedCountryId && availableCities.length > 0 && (
                      <span className="text-[11px] text-gray-400 font-medium">
                        {availableCities.length} {lang === 'ur' ? 'شہر دستیاب' : lang === 'ar' ? 'مدن متاحة' : 'cities available'}
                      </span>
                    )}
                  </div>
                  <select
                    required
                    disabled={!selectedCountryId || availableCities.length === 0}
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all cursor-pointer ${
                      !selectedCountryId || availableCities.length === 0
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-75'
                        : 'bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-[#006948] focus:bg-white'
                    } ${lang === 'ur' ? 'font-urdu leading-[2.0]' : ''}`}
                  >
                    <option value="" disabled>
                      {!selectedCountryId
                        ? (lang === 'ur' ? 'پہلے ملک منتخب کریں...' : lang === 'ar' ? 'يرجى اختيار الدولة أولاً...' : 'Please select a country first...')
                        : (lang === 'ur' ? '-- شہر منتخب کریں --' : lang === 'ar' ? '-- اختر المدينة --' : '-- Select Operating City --')}
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
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-900">
                    {lang === 'ur' ? 'بنیادی سروس کیٹیگری *' : 'Primary Service Category *'}
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-[#006948] focus:bg-white transition-all cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {getCategoryName(cat, lang)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-900">
                    {lang === 'ur' ? 'پروفائل کی قسم' : 'Profile Classification'}
                  </label>
                  <select
                    value={profileType}
                    onChange={(e) => setProfileType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-[#006948] focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="individual">
                      {lang === 'ur'
                        ? 'انفرادی ماہر / آزاد پیشہ ور (Individual Specialist)'
                        : lang === 'ar'
                        ? 'أخصائي فردي / مستقل (Individual Specialist)'
                        : 'Individual Specialist / Freelance Professional'}
                    </option>
                    <option value="shop">
                      {lang === 'ur' ? 'رجسٹرڈ ورکشاپ / دکان / ایجنسی' : lang === 'ar' ? 'ورشة عمل مسجلة / وكالة / فريق' : 'Registered Workshop / Agency / Team'}
                    </option>
                  </select>
                </div>
              </div>

              {/* Trade Title / Headline + Explanation Helper */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    <span>{lang === 'ur' ? 'ٹریڈ ٹائٹل / ہیڈلائن' : 'Trade Title / Headline'}</span>
                    <button
                      type="button"
                      onClick={() => setShowTradeTitleHelp(!showTradeTitleHelp)}
                      className="text-gray-400 hover:text-emerald-700"
                      title="Learn what Trade Title is"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </label>
                  <span className="text-xs text-gray-500 font-medium">
                    {lang === 'ur' ? 'سرچ لسٹ اور پروفائل کے لیے' : 'Appears under your name'}
                  </span>
                </div>

                <input
                  type="text"
                  value={tradeTitle}
                  onChange={(e) => setTradeTitle(e.target.value)}
                  placeholder={
                    lang === 'ur'
                      ? 'مثلاً: ماسٹر انورٹر الیکٹریشن اور سولر ڈی بی اسپیشلسٹ'
                      : 'e.g. Master Inverter Electrician & Solar DB Specialist'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#006948] focus:bg-white transition-all font-medium"
                />

                {/* Explainer Box for Trade Title */}
                {showTradeTitleHelp && (
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-950 flex flex-col gap-1">
                    <p className="font-bold text-emerald-900">
                      💡 {lang === 'ur' ? 'Trade Title / Headline کس لیے استعمال ہوتی ہے؟' : 'What is Trade Title / Headline used for?'}
                    </p>
                    <p className="text-emerald-800 leading-relaxed">
                      {lang === 'ur'
                        ? 'یہ مختصر اور پرکشش عنوان آپ کے نام کے ٹھیک نیچے سرچ کارڈز اور آپ کے پبلک پروفائل پر سب سے پہلے نظر آتا ہے (مثلاً: "24/7 ایمرجنسی اے سی ریپئر" یا "ماسٹر پلمبر اور بورنگ اسپیشلسٹ")۔ اس سے گاہک فوراً جان جاتا ہے کہ آپ کس خاص شعبے کے سب سے بڑے ماہر ہیں۔'
                        : 'This short headline appears directly under your name on search cards and at the top of your public profile banner. It gives customers immediate confidence in your core superpower before opening your profile.'}
                    </p>
                  </div>
                )}
              </div>

              {/* IMAGE UPLOADS: Profile Picture & Cover Photo (Max 10MB each, JPG/PNG/JPEG/WEBP) */}
              <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-50 border border-gray-200">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                    <ImageIcon className="w-4 h-4 text-[#006948]" />
                    <span>{lang === 'ur' ? 'پروفائل تصویر اور کور فوٹو' : 'Profile Picture & Cover Photo'}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {lang === 'ur' ? 'زیادہ سے زیادہ 10 MB فی تصویر • JPG, PNG, JPEG, WEBP' : 'Max 10MB each • JPG, PNG, JPEG, WEBP'}
                  </span>
                </div>

                {/* Reassurance Callout: Photos are optional & automatic fallbacks are provided */}
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-950 flex items-start gap-2">
                  <span className="text-sm mt-0.5 shrink-0">ℹ️</span>
                  <div className="leading-relaxed">
                    <span className="font-bold text-emerald-900">
                      {lang === 'ur' ? 'تصاویر اپ لوڈ کرنا اختیاری ہے (Optional): ' : 'Photos are 100% Optional: '}
                    </span>
                    <span className="text-emerald-800">
                      {lang === 'ur'
                        ? 'اگر آپ کے پاس ابھی تصاویر نہیں ہیں تو کوئی مسئلہ نہیں، آپ کی لسٹنگ فوراً ایکٹو ہو جائے گی اور آپ کے منتخب کردہ شعبے (جیسے الیکٹریشن، پلمبر وغیرہ) کا تصدیق شدہ کور بینر اور نام کا برانڈڈ اوتار خودکار طریقے سے لگ جائے گا۔ آپ کو لسٹ سے ہرگز باہر نہیں کیا جائے گا۔'
                        : 'If you do not have photos right now, you can still publish your profile immediately. A professional category-specific cover banner and branded initials avatar will be generated for your profile automatically.'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  
                  {/* 1. Profile Picture (Avatar) */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-gray-700">
                      {lang === 'ur' ? '1. پروفائل تصویر (Avatar / Logo):' : '1. Profile Picture (Avatar / Face):'}
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
                            className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-sm transition-all"
                            title="Remove Profile Image"
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
                            {lang === 'ur' ? 'تصویر منتخب کریں' : 'Upload Profile Photo'}
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
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-gray-700">
                      {lang === 'ur' ? '2. کور بینر (Cover Banner / Workshop):' : '2. Cover Banner (Shop / Workshop):'}
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
                            className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-sm transition-all"
                            title="Remove Cover Photo"
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
                            {lang === 'ur' ? 'کور بینر اپ لوڈ کریں' : 'Upload Cover Banner'}
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

              {/* Service Areas */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-900">
                  {lang === 'ur' ? 'سروس کوریج کے علاقے / محلے' : 'Service Coverage Areas / Neighborhoods'}
                </label>
                <input
                  type="text"
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  placeholder={
                    lang === 'ur'
                      ? 'مثلاً: کلفٹن، ڈی ایچ اے، پی ای سی ایچ ایس، گلشن (کوما سے الگ کریں)'
                      : 'e.g. Clifton, DHA Phases 1-8, PECHS, Gulshan (comma separated)'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#006948] focus:bg-white transition-all"
                />
              </div>

              {/* Visiting Charges (Country-localized input with dynamic currency badge) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-900">
                    {lang === 'ur' ? 'وزٹنگ چارجز / فیس (اختیاری)' : 'Visiting Charges (Optional)'}
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
                    className="w-full ps-14 pe-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#006948] focus:bg-white transition-all font-semibold"
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {lang === 'ur'
                    ? `آپ کے منتخب کردہ ملک (${COUNTRIES.find(c => c.code === countryCode)?.name || 'Pakistan'}) کی کرنسی ${selectedCurrency.symbol} (${selectedCurrency.currencyCode}) میں وزٹ فیس کا ابتدائی تخمینہ۔`
                    : `Initial consultation estimate in ${selectedCurrency.name} (${selectedCurrency.symbol}). Standard for ${COUNTRIES.find(c => c.code === countryCode)?.name || 'selected country'}.`}
                </span>
              </div>

              {/* Short Bio */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-900">
                  {lang === 'ur' ? 'مختصر تعارف / خصوصیات' : 'Short Bio / Specializations'}
                </label>
                <textarea
                  rows={3}
                  value={shortBio}
                  onChange={(e) => setShortBio(e.target.value)}
                  placeholder={
                    lang === 'ur'
                      ? 'اپنے تجربے، مہارت، اوزار اور سروس کی وارنٹی کے بارے میں بتائیں...'
                      : 'Describe your years of experience, tools, guarantees, and key specialties...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#006948] focus:bg-white transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-[#006948] hover:bg-[#00855d] active:scale-[0.99] text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>{lang === 'ur' ? 'پروفائل شائع ہو رہا ہے...' : 'Publishing Your Page to Baseera...'}</span>
                ) : (
                  <>
                    <span>
                      {lang === 'ur'
                        ? 'بصیرہ پر میرا پروفائل شائع کریں'
                        : lang === 'ar'
                        ? 'نشر ملفي الشخصي في بصيرة'
                        : 'Publish My Profile on Baseera'}
                    </span>
                    <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center leading-relaxed">
                {lang === 'ur'
                  ? 'پروفائل شائع کرنے پر آپ کا رابطہ نمبر گاہکوں کے لیے دستیاب ہوگا تاکہ وہ براہِ راست رابطہ کر سکیں۔ صفر کمیشن۔'
                  : 'By publishing, you agree that your contact channel will be displayed publicly to allow customers to reach you directly. Zero commission.'}
              </p>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ListServicePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const [lang, setLang] = useState('en');

  React.useEffect(() => {
    params.then((p) => setLang(p.lang || 'en'));
  }, [params]);

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f9f9ff] p-8 text-center text-xs text-gray-400">Loading List Service Studio...</div>}>
      <ListServiceContent lang={lang} />
    </Suspense>
  );
}
