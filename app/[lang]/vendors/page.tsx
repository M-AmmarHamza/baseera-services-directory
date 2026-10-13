import React from 'react';
import { Metadata } from 'next';
import { getAllProviders } from '@/lib/db';
import VendorsDirectoryView from '@/components/VendorsDirectoryView';

interface VendorsPageProps {
  params: Promise<{
    lang: string;
  }>;
}

const DOMAIN = 'https://baseera-services-directory.vercel.app';

export async function generateMetadata({ params }: VendorsPageProps): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: 'All Listed Vendors & Verified Specialists | Baseera Directory',
    description: 'Browse all ID-verified electricians, plumbers, AC technicians, painters, and specialists. Direct WhatsApp contact with zero intermediary commissions.',
    alternates: {
      canonical: `${DOMAIN}/${lang}/vendors`,
    },
    openGraph: {
      title: 'All Listed Vendors & Service Specialists | Baseera',
      description: 'Connect directly with verified local specialists across the globe with zero commissions.',
      url: `${DOMAIN}/${lang}/vendors`,
      siteName: 'Baseera',
      locale: lang === 'ur' ? 'ur_PK' : lang === 'ar' ? 'ar_AE' : 'en_US',
      type: 'website',
    },
  };
}

export default async function VendorsPage({ params }: VendorsPageProps) {
  const { lang } = await params;
  const providers = await getAllProviders();

  return <VendorsDirectoryView initialProviders={providers} lang={lang} />;
}
