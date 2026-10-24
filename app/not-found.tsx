import React from 'react';
import { Metadata } from 'next';
import NotFoundView from '@/components/NotFoundView';
import { tajawal, inter, notoNastaliqUrdu } from '@/app/fonts';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: '404 - Page Not Found | Baseera Directory',
  description: 'The requested page or specialist profile was not found on Baseera Local Services Directory.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${tajawal.variable} ${inter.variable} ${notoNastaliqUrdu.variable}`}>
      <body className="font-sans bg-[#f9f9ff] text-[#141b2b] min-h-screen antialiased flex flex-col">
        <NotFoundView lang="en" country="pk" city="karachi" />
      </body>
    </html>
  );
}
