import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { FileText, ShieldAlert, CheckCircle2, ChevronRight, Scale, Handshake } from 'lucide-react';

interface PageProps {
  params: Promise<{
    lang: string;
  }>;
}

const DOMAIN = 'https://baseera-services-directory.vercel.app';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: 'Terms & Conditions | Baseera Local Services Directory',
    description: 'Read the Terms and Conditions for using the Baseera platform. Independent service provider agreements, customer guidelines, and community policies.',
    alternates: {
      canonical: `${DOMAIN}/${lang}/terms`,
      languages: {
        en: `${DOMAIN}/en/terms`,
        ur: `${DOMAIN}/ur/terms`,
        ar: `${DOMAIN}/ar/terms`,
      },
    },
  };
}

export default async function TermsAndConditionsPage({ params }: PageProps) {
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
            <span className="text-neutral-900 font-semibold">Terms &amp; Conditions</span>
          </nav>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Page Title */}
        <div className="mb-10 pb-8 border-b border-gray-200">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200 mb-4">
            <Scale className="w-4 h-4" />
            <span>Community Agreement</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-neutral-900 mb-2">
            Terms &amp; Conditions
          </h1>
          <p className="text-sm text-gray-500">
            Last Updated: October 2026 • Effective Worldwide
          </p>
        </div>

        {/* Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50">
            <Handshake className="w-5 h-5 text-[#059669] mb-2" />
            <h3 className="text-base font-semibold text-neutral-900 leading-snug">Direct Contractor Relationship</h3>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              Service technicians are independent tradespeople, not employees or agents of Baseera.
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50">
            <CheckCircle2 className="w-5 h-5 text-[#059669] mb-2" />
            <h3 className="text-base font-semibold text-neutral-900 leading-snug">Zero Middleman Surcharge</h3>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              Baseera does not take commissions from technician wages or customer repair bills.
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50">
            <ShieldAlert className="w-5 h-5 text-[#059669] mb-2" />
            <h3 className="text-base font-semibold text-neutral-900 leading-snug">On-Site Agreement</h3>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              Inspect work and agree on parts and labor pricing directly prior to work commencement.
            </p>
          </div>
        </div>

        {/* Terms Body */}
        <div className="space-y-8 text-base text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2 leading-snug">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or listing services on Baseera Directory (&quot;Baseera&quot;), you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the directory.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2 leading-snug">
              2. Nature of the Platform
            </h2>
            <p className="mb-2">
              Baseera is an open discovery directory. We provide technical infrastructure to facilitate direct communication between:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ps-2 mb-2">
              <li><strong>Customers:</strong> Individuals seeking local repair, maintenance, or home services.</li>
              <li><strong>Service Providers:</strong> Independent self-employed technicians, mechanics, and small local shops.</li>
            </ul>
            <p>
              Baseera is not a contractor, employer, or broker. We do not participate in negotiations, warranty claims, service execution, or payment collection.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2 leading-snug">
              3. Service Provider Obligations
            </h2>
            <p className="mb-2">Providers who list their services on Baseera agree to:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ps-2">
              <li>Provide accurate, truthful information regarding their trade expertise, credentials, and work history.</li>
              <li>Maintain an active, valid WhatsApp or telephone contact number.</li>
              <li>Treat customer premises with respect, professionalism, and honesty.</li>
              <li>Provide clear, upfront quotes before initiating any major repair work or purchasing replacement parts.</li>
              <li>Refrain from posting duplicate, deceptive, or spam profiles.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2 leading-snug">
              4. Customer Guidelines &amp; Precautions
            </h2>
            <p>
              Customers are encouraged to practice standard diligence: verify the technician&apos;s identity upon arrival, confirm visiting inspection charges beforehand, and inspect completed work thoroughly before direct cash or bank transfer payment. Baseera is not responsible for disputes arising from on-site agreements between customer and technician.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2 leading-snug">
              5. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, Baseera and its creators disclaim all liability for any direct, indirect, incidental, consequential, or punitive damages arising from work performed by listed service providers or interactions facilitated through the directory.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2 leading-snug">
              6. Content Removal &amp; Profile Suspension
            </h2>
            <p>
              Baseera reserves the right to unpublish or permanently remove any provider profile found to engage in deceptive practices, abusive behavior, fraud, or spam, without prior notice.
            </p>
          </section>

          <section className="pt-4 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-neutral-900 mb-2 leading-snug">
              7. Contact &amp; Inquiries
            </h2>
            <p className="text-gray-600">
              For any questions or concerns regarding our community terms, please contact us at{' '}
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
