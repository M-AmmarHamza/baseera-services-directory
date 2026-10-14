import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ShieldCheck, Lock, EyeOff, FileText, ChevronRight, CheckCircle2 } from 'lucide-react';

interface PageProps {
  params: Promise<{
    lang: string;
  }>;
}

const DOMAIN = 'https://baseera-services-directory.vercel.app';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: 'Privacy Policy | Baseera Local Services Directory',
    description: 'Learn how Baseera protects your privacy. Zero user tracking, zero data selling, and 100% direct connection between customers and local specialists.',
    alternates: {
      canonical: `${DOMAIN}/${lang}/privacy`,
      languages: {
        en: `${DOMAIN}/en/privacy`,
        ur: `${DOMAIN}/ur/privacy`,
        ar: `${DOMAIN}/ar/privacy`,
      },
    },
  };
}

export default async function PrivacyPolicyPage({ params }: PageProps) {
  const { lang } = await params;

  return (
    <div className="min-h-screen bg-white text-neutral-900 pb-20 font-sans">
      {/* Breadcrumb Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500">
            <Link href={`/${lang}`} className="hover:text-[#059669] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-neutral-900 font-semibold">Privacy Policy</span>
          </nav>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Page Title */}
        <div className="mb-10 pb-8 border-b border-gray-200">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200 mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>Data Transparency &amp; Protection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-neutral-900 mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500">
            Last Updated: October 2026 • Effective Worldwide
          </p>
        </div>

        {/* Core Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50">
            <EyeOff className="w-5 h-5 text-[#059669] mb-2" />
            <h3 className="text-base font-semibold text-neutral-900 leading-snug">Zero Data Monetization</h3>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              We never sell, rent, or trade your personal contact details to advertising brokers.
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50">
            <Lock className="w-5 h-5 text-[#059669] mb-2" />
            <h3 className="text-base font-semibold text-neutral-900 leading-snug">No Mandatory Sign-Up</h3>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              Browse services and contact technicians directly on WhatsApp without creating an account.
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50">
            <CheckCircle2 className="w-5 h-5 text-[#059669] mb-2" />
            <h3 className="text-base font-semibold text-neutral-900 leading-snug">Direct Deals</h3>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              All communications and pricing agreements happen directly off-platform between both parties.
            </p>
          </div>
        </div>

        {/* Policy Body */}
        <div className="space-y-8 text-base text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2 leading-snug">
              1. Overview &amp; Mission
            </h2>
            <p>
              Baseera Directory (&quot;Baseera&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates as a free, transparent local services directory. Our mission is to connect households and businesses directly with independent local technicians (such as electricians, plumbers, AC mechanics, carpenters, and painters) with zero intermediary fees and zero platform markups.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2 leading-snug">
              2. Information We Collect
            </h2>
            <div className="space-y-3">
              <div>
                <strong className="text-neutral-900 block font-semibold">For Directory Visitors &amp; Customers:</strong>
                <p className="text-gray-600">
                  You can browse all cities, categories, and provider profiles without creating an account. We do not require payment card details or private residential addresses. When you click &quot;Chat on WhatsApp&quot; or &quot;Call Direct&quot;, you are redirected to WhatsApp or your phone dialer. We only record anonymous aggregated lead counts to help providers know how many inquiries they receive.
                </p>
              </div>

              <div>
                <strong className="text-neutral-900 block font-semibold">For Registered Service Providers:</strong>
                <p className="text-gray-600">
                  When a specialist voluntarily lists their business, we collect basic professional information including: business name, trade category, service areas/district, WhatsApp contact number, professional experience bio, and portfolio photos.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2 leading-snug">
              3. How We Use Information
            </h2>
            <p className="mb-2">We use the collected information exclusively to:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ps-2">
              <li>Publish your public profile so local residents can discover your services.</li>
              <li>Provide direct contact links so clients can message or call you directly.</li>
              <li>Prevent spam and duplicate listings.</li>
              <li>Improve site performance and search responsiveness.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2 leading-snug">
              4. Payment &amp; Financial Information
            </h2>
            <p>
              Baseera is strictly a lead-generation directory, not an e-commerce checkout platform. We do not store, process, or ask for credit card numbers, debit cards, or banking credentials. Any payment for completed work is negotiated and settled directly between the customer and the service technician upon completion of on-site work.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2 leading-snug">
              5. Data Security &amp; Storage
            </h2>
            <p>
              Our database is protected by PostgreSQL Row-Level Security (RLS) policies and HTTPS encryption in transit. Sensitive administrative data is restricted strictly to authenticated administrators.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2 leading-snug">
              6. Profile Deletion &amp; Updates
            </h2>
            <p>
              Service providers retain full ownership of their information. If you wish to update your contact number, change service areas, or permanently remove your public listing from Baseera, you may do so through your dashboard or by contacting our administration.
            </p>
          </section>

          <section className="pt-4 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-neutral-900 mb-2 leading-snug">
              7. Contact Us
            </h2>
            <p className="text-gray-600">
              For any questions regarding this Privacy Policy or your data, please contact the Baseera administration at{' '}
              <a href="mailto:support@baseera.directory" className="text-[#059669] font-semibold hover:underline">
                support@baseera.directory
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
