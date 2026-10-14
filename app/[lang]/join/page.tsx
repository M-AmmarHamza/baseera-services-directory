'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function JoinRedirectContent({ lang }: { lang: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams?.toString() ? `?${searchParams.toString()}` : '';
    router.replace(`/${lang}/list-service${qs}`);
  }, [lang, searchParams, router]);

  return (
    <div className="min-h-screen bg-[#f9f9ff] flex items-center justify-center p-8 text-center text-xs text-gray-500">
      Redirecting to List Service...
    </div>
  );
}

export default function JoinRedirectPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const [lang, setLang] = React.useState('en');

  React.useEffect(() => {
    params.then((p) => setLang(p.lang || 'en'));
  }, [params]);

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f9f9ff] p-8 text-center text-xs text-gray-400">Redirecting...</div>}>
      <JoinRedirectContent lang={lang} />
    </Suspense>
  );
}
