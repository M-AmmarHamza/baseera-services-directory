'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { COUNTRIES, CATEGORIES } from '@/lib/db';
import {
  BadgeCheck,
  ShieldCheck,
  WhatsAppIcon,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Globe,
} from '@/components/Icons';

function JoinFormContent({ lang }: { lang: string }) {
  const searchParams = useSearchParams();
  const defaultCountry = searchParams?.get('country') || 'pk';
  const defaultCity = searchParams?.get('city') || 'karachi';
  const defaultCategory = searchParams?.get('category') || 'electrician';

  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [countryCode, setCountryCode] = useState(defaultCountry);
  const [cityName, setCityName] = useState(defaultCity);
  const [categoryId, setCategoryId] = useState(defaultCategory);
  const [tradeTitle, setTradeTitle] = useState('');
  const [shortBio, setShortBio] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [startingPrice, setStartingPrice] = useState('800');
  const [profileType, setProfileType] = useState<'individual' | 'shop'>('individual');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdProfile, setCreatedProfile] = useState<{
    slug: string;
    publicUrl: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim() || !cityName.trim()) {
      setErrorMsg('Please enter your full name, WhatsApp number, and city.');
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
          whatsapp_number: whatsapp.trim(),
          country_code: countryCode.toLowerCase(),
          city_name: cityName.trim(),
          category_id: categoryId,
          trade_title: tradeTitle.trim(),
          short_bio: shortBio.trim(),
          service_area: serviceArea.split(',').map((s) => s.trim()).filter(Boolean),
          starting_price: Number(startingPrice) || 500,
          profile_type: profileType,
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
        setErrorMsg(data.error || 'Failed to publish profile. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error while publishing profile.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-[#f9f9ff] min-h-screen text-[#141b2b] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Back Link */}
        <Link
          href={`/${lang}`}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#006948] font-semibold mb-6 transition-colors"
        >
          <span>← Back to Global Directory</span>
        </Link>

        {createdProfile ? (
          /* Success Screen */
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-emerald-200 shadow-sm text-center flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#006948] flex items-center justify-center ring-8 ring-emerald-50/50">
              <CheckCircle2 className="w-10 h-10 text-[#006948]" />
            </div>

            <div>
              <span className="text-xs bg-emerald-50 text-[#006948] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100">
                🎉 Profile Created & Live!
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 mt-3 tracking-tight">
                Welcome to Baseera, {name}!
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-md mx-auto leading-relaxed">
                Your public service page has been created dynamically. Customers can now discover your services and contact you directly on WhatsApp with zero commission.
              </p>
            </div>

            <div className="w-full bg-[#f1f3ff] rounded-2xl p-4 flex flex-col gap-2 text-start border border-gray-200/70">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Your Public URL:
              </span>
              <code className="text-xs font-mono text-[#006948] break-all font-semibold">
                {createdProfile.publicUrl}
              </code>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <Link
                href={createdProfile.publicUrl}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white font-bold text-xs shadow-xs transition-all text-center flex items-center justify-center gap-2"
              >
                <span>View My Public Profile Page</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`I have published my service profile on Baseera directory! View my page: https://baseera-services-directory.vercel.app${createdProfile.publicUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <WhatsAppIcon className="w-4 h-4 text-white fill-current" />
                <span>Share on WhatsApp</span>
              </a>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs flex flex-col gap-6">
            
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#006948] text-xs font-bold border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#006948]" />
                  100% Free • Zero Commission
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006948] animate-pulse"></span>
                  Instant Public Profile
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
                Register as a Local Specialist
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                Publish your service profile on Baseera. Customers in your city connect directly with you on WhatsApp without any agency cut.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-900">
                  Full Name / Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tariq Mahmood or Al-Rehman Electrical Works"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#006948] focus:bg-white transition-all"
                />
              </div>

              {/* WhatsApp Number */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-900">
                    WhatsApp Number (Primary Lead Channel) *
                  </label>
                  <span className="text-[11px] text-[#006948] font-bold">
                    Direct Customer Chats
                  </span>
                </div>
                <div className="relative">
                  <WhatsAppIcon className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2 fill-current" />
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="e.g. +92 333 2145890 or +971 50 1234567"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#006948] focus:bg-white transition-all font-medium"
                  />
                </div>
                <span className="text-[11px] text-gray-400">
                  All customer inquiry buttons will open a WhatsApp conversation directly with this number.
                </span>
              </div>

              {/* Country & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-900">
                    Country *
                  </label>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#006948] focus:bg-white transition-all"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name} ({c.code.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-900">
                    City Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    placeholder="e.g. Karachi, Lahore, Dubai, London..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#006948] focus:bg-white transition-all capitalize"
                  />
                </div>
              </div>

              {/* Category & Classification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-900">
                    Primary Service Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#006948] focus:bg-white transition-all"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-900">
                    Profile Classification
                  </label>
                  <select
                    value={profileType}
                    onChange={(e) => setProfileType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#006948] focus:bg-white transition-all"
                  >
                    <option value="individual">Individual Karigar / Freelance Master</option>
                    <option value="shop">Registered Workshop / Agency / Team</option>
                  </select>
                </div>
              </div>

              {/* Trade Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-900">
                  Trade Title / Headline
                </label>
                <input
                  type="text"
                  value={tradeTitle}
                  onChange={(e) => setTradeTitle(e.target.value)}
                  placeholder="e.g. Master Inverter Electrician & Solar DB Specialist"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#006948] focus:bg-white transition-all"
                />
              </div>

              {/* Service Areas */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-900">
                  Service Coverage Areas / Neighborhoods
                </label>
                <input
                  type="text"
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  placeholder="e.g. Clifton, DHA Phases 1-8, PECHS, Gulshan (comma separated)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#006948] focus:bg-white transition-all"
                />
              </div>

              {/* Short Bio */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-900">
                  Short Bio / Specializations
                </label>
                <textarea
                  rows={3}
                  value={shortBio}
                  onChange={(e) => setShortBio(e.target.value)}
                  placeholder="Describe your years of experience, tools, guarantees, and key specialties..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#006948] focus:bg-white transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-[#006948] hover:bg-[#00855d] active:scale-[0.99] text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Publishing Your Page to Baseera...</span>
                ) : (
                  <>
                    <span>Publish My Profile on Baseera</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-gray-400 text-center">
                By publishing, you agree that your WhatsApp number will be displayed publicly to allow customers to reach you directly. Zero commission.
              </p>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default function JoinVendorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const [lang, setLang] = useState('en');

  React.useEffect(() => {
    params.then((p) => setLang(p.lang || 'en'));
  }, [params]);

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f9f9ff] p-8 text-center text-xs text-gray-400">Loading Vendor Studio...</div>}>
      <JoinFormContent lang={lang} />
    </Suspense>
  );
}
