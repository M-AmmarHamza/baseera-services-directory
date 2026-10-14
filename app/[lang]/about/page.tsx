import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Compass, CheckCircle2, ChevronRight, Globe2, ShieldCheck, Zap } from 'lucide-react';

interface PageProps {
  params: Promise<{
    lang: string;
  }>;
}

const DOMAIN = 'https://baseera-services-directory.vercel.app';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: 'About Us | Baseera Local Services Directory',
    description: 'Learn about Baseera, the global open directory connecting households directly with trusted local tradespeople and specialists without commission fees.',
    alternates: {
      canonical: `${DOMAIN}/${lang}/about`,
      languages: {
        en: `${DOMAIN}/en/about`,
        ur: `${DOMAIN}/ur/about`,
        ar: `${DOMAIN}/ar/about`,
      },
    },
  };
}

export default async function AboutPage({ params }: PageProps) {
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
            <span className="text-neutral-900 font-semibold">About Us</span>
          </nav>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Page Title */}
        <div className="mb-10 pb-8 border-b border-gray-200">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200 mb-4">
            <Compass className="w-4 h-4" />
            <span>Our Vision &amp; Platform Mission</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mb-2">
            About Baseera
          </h1>
          <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
            &quot;Baseera&quot; (بصيرة) signifies insight, discernment, and clarity. We exist to make finding skilled, honest local service specialists transparent, fast, and completely commission-free.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="p-6 border border-gray-200 rounded-2xl bg-white">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-neutral-900 mb-1">Direct Connection</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              No booking call centers or agency queues. Message or call verified karigars directly on WhatsApp.
            </p>
          </div>

          <div className="p-6 border border-gray-200 rounded-2xl bg-white">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-neutral-900 mb-1">0% Commission</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              100% of hard-earned wages go to the technician. No platform cuts, no artificial fee inflations.
            </p>
          </div>

          <div className="p-6 border border-gray-200 rounded-2xl bg-white">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center mb-3">
              <Globe2 className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-neutral-900 mb-1">Global &amp; Local</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Designed for cities across Pakistan, UAE, Saudi Arabia, and worldwide hubs, localized in English, Urdu, and Arabic.
            </p>
          </div>
        </div>

        {/* Story */}
        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">
              Why We Built Baseera
            </h2>
            <p>
              In many cities, homeowners face a frustrating dilemma when hiring home service technicians: traditional agency middlemen take 20% to 35% commission off every service call, while paying local tradespeople meager wages. Meanwhile, finding reliable independent specialists relies on word-of-mouth.
            </p>
            <p className="mt-3">
              Baseera solves this by creating an open, community-first directory where every skilled specialist—from master residential electricians and inverter AC technicians to sanitary plumbers and home chefs—can publish their profile, portfolio, and direct contact details for free.
            </p>
          </section>

          <section className="pt-4 border-t border-gray-200">
            <h2 className="text-lg font-bold text-neutral-900 mb-2">
              Are You a Service Specialist?
            </h2>
            <p className="mb-4">
              Join thousands of verified technicians growing their direct customer base on Baseera. Registration takes less than 3 minutes.
            </p>
            <Link
              href={`/${lang}/join`}
              className="inline-flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-2xs"
            >
              <span>List Your Service Free</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}
