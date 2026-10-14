import React from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function MainLayout({ children, params }: MainLayoutProps) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'en';
  const isRTL = lang === 'ur' || lang === 'ar';

  return (
    <div className={`baseera-main-layout w-full flex-1 flex flex-col ${isRTL ? 'rtl' : 'ltr'}`}>
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}
