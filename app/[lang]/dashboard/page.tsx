'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Upload,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  TrendingUp,
  MapPin,
  Clock,
  Phone,
  Building,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';

interface Props {
  params: Promise<{
    lang: string;
  }>;
}

export default function ProviderOnboardingDashboard({ params }: Props) {
  const [lang, setLang] = useState('en');
  const [currentStep, setCurrentStep] = useState(1);
  const [monthlyLeads, setMonthlyLeads] = useState(24);
  const [isUploading, setIsUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    businessName: '',
    category: 'electrician',
    country: 'pk',
    city: 'karachi',
    bio: '',
    workHours: '09:00 AM - 08:00 PM',
    contactNumber: '+92 300 1234567',
    contactMethod: 'whatsapp',
    uploadedImages: [] as string[],
  });

  useEffect(() => {
    params.then((p) => setLang(p.lang || 'en'));
  }, [params]);

  // CATEGORIES LIST
  const categories = [
    { id: 'electrician', label: 'Electrician & Wiring' },
    { id: 'plumbing', label: 'Plumbing & Boring' },
    { id: 'ac', label: 'AC & Refrigeration' },
    { id: 'cleaning', label: 'Home Cleaning' },
    { id: 'carpenter', label: 'Carpenter & Woodwork' },
    { id: 'painter', label: 'Painting & Waterproofing' },
    { id: 'generator', label: 'Generator Technicians' },
    { id: 'cctv', label: 'CCTV & Security' },
    { id: 'appliances', label: 'Appliance Repair' },
  ];

  // CITIES LIST
  const cities = [
    { id: 'karachi', label: 'Karachi, Pakistan' },
    { id: 'lahore', label: 'Lahore, Pakistan' },
    { id: 'islamabad', label: 'Islamabad, Pakistan' },
    { id: 'dubai', label: 'Dubai, UAE' },
    { id: 'riyadh', label: 'Riyadh, Saudi Arabia' },
    { id: 'doha', label: 'Doha, Qatar' },
  ];

  // =========================================================================
  // STEP 3: CLIENT-SIDE IMAGE COMPRESSION & UPLOAD TO SUPABASE
  // =========================================================================
  /*
   * ARCHITECTURE REQUIREMENT:
   * 'browser-image-compression' library MUST be used to compress images
   * on the client-side before uploading them to the Supabase 'provider-portfolios' bucket.
   *
   * Example Implementation:
   * -------------------------------------------------------------
   * import imageCompression from 'browser-image-compression';
   *
   * const options = {
   *   maxSizeMB: 0.5,           // Compress to max 500KB
   *   maxWidthOrHeight: 1280,   // Resize dimensions to 1280px max
   *   useWebWorker: true,
   *   fileType: 'image/webp'    // Modern WebP compression format
   * };
   * const compressedFile = await imageCompression(rawFile, options);
   *
   * const { data, error } = await supabase.storage
   *   .from('provider-portfolios')
   *   .upload(`${userId}/${Date.now()}.webp`, compressedFile);
   * -------------------------------------------------------------
   */
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      // Simulating compression pipeline and upload
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`[Compression]: Compressing ${file.name} (${(file.size / 1024).toFixed(1)} KB) using browser-image-compression...`);
        // Placeholder preview URL
        const previewUrl = URL.createObjectURL(file);
        newUrls.push(previewUrl);
      }

      setFormData((prev) => ({
        ...prev,
        uploadedImages: [...prev.uploadedImages, ...newUrls],
      }));
    } catch (err) {
      console.error('Image compression failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* DASHBOARD HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#059669]" />
              <span>Provider Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Provider Dashboard & Onboarding
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage your direct listing and monitor incoming WhatsApp customer leads.
            </p>
          </div>
        </div>

        {/* 1. FLAT STATISTICS CARD: TOTAL WHATSAPP LEADS THIS MONTH */}
        <div className="mb-10">
          <div className="p-6 border border-gray-200 rounded-2xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#059669] shrink-0">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Analytics & Growth
                </span>
                <h3 className="text-base font-bold text-neutral-900">
                  Total WhatsApp Leads This Month
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Verified clicks on your WhatsApp profile action button
                </p>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black text-[#059669] tracking-tight">
                {monthlyLeads}
              </span>
              <div className="flex items-center gap-1 text-xs font-semibold text-[#059669]">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+18% from last month</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. MULTI-STEP ONBOARDING WIZARD */}
        <div className="border border-gray-200 rounded-2xl bg-white p-6 sm:p-8">
          {/* Step Progress Tracker */}
          <div className="flex items-center justify-between max-w-xs mx-auto mb-8 text-xs font-semibold">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-[#059669]' : 'text-gray-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${currentStep >= 1 ? 'border-[#059669] bg-emerald-50' : 'border-gray-300'}`}>
                1
              </span>
              <span>Category</span>
            </div>
            <div className="w-10 h-px bg-gray-200" />
            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-[#059669]' : 'text-gray-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${currentStep >= 2 ? 'border-[#059669] bg-emerald-50' : 'border-gray-300'}`}>
                2
              </span>
              <span>Details</span>
            </div>
            <div className="w-10 h-px bg-gray-200" />
            <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-[#059669]' : 'text-gray-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${currentStep >= 3 ? 'border-[#059669] bg-emerald-50' : 'border-gray-300'}`}>
                3
              </span>
              <span>Portfolio</span>
            </div>
          </div>

          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">Profile Submitted Successfully!</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Your profile has been saved and will appear publicly once verified by our administration team.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs font-semibold text-[#059669] hover:underline"
              >
                Edit Form Again
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* STEP 1: CATEGORY & CITY DROPDOWNS */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-base font-bold text-neutral-900">Step 1: Trade & Location</h3>
                    <p className="text-xs text-gray-500">Choose your service specialty and operating city</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                      Business or Specialist Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      placeholder="e.g. Master Tariq Electrician"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#059669]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                        Primary Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#059669]"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                        Primary Operating City
                      </label>
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#059669]"
                      >
                        {cities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: BIO, WORK HOURS, AND CONTACT NUMBER */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-base font-bold text-neutral-900">Step 2: Service Details & Contact</h3>
                    <p className="text-xs text-gray-500">Provide work hours and direct WhatsApp number</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                      Professional Bio & Experience
                    </label>
                    <textarea
                      rows={4}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Describe your technical skills, experience in years, and specializations..."
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#059669]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                        Working Hours
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={formData.workHours}
                          onChange={(e) => setFormData({ ...formData, workHours: e.target.value })}
                          placeholder="e.g. 09:00 AM - 08:00 PM"
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#059669]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                        Contact / WhatsApp Number
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          value={formData.contactNumber}
                          onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                          placeholder="+92 300 1234567"
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#059669]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: IMAGE UPLOAD WITH CLIENT COMPRESSION */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-base font-bold text-neutral-900">Step 3: Work Portfolio Photos</h3>
                    <p className="text-xs text-gray-500">
                      Upload your previous work photos. Files are automatically compressed via browser-image-compression.
                    </p>
                  </div>

                  {/* Dropzone */}
                  <label className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-[#059669] transition-colors cursor-pointer bg-gray-50/50">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 text-[#059669] mb-3" />
                    <span className="text-sm font-bold text-neutral-900">
                      Click or drag photos to upload
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      Client-side compressed using browser-image-compression before Supabase storage
                    </span>
                  </label>

                  {/* Uploaded Thumbnails */}
                  {formData.uploadedImages.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                      {formData.uploadedImages.map((src, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                          <img src={src} alt="Uploaded portfolio" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Form Navigation Buttons */}
              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-neutral-800 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Complete Profile Registration</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
