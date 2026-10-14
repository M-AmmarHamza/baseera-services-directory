import { Tajawal, Inter } from 'next/font/google';

export const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700'], // Regular, Medium, Bold
  display: 'swap',
  variable: '--font-tajawal', // For Tailwind CSS integration
});

export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-inter',
});
