'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import NotFoundView from '@/components/NotFoundView';

export default function LocalizedNotFound() {
  const params = useParams();
  const lang = (params?.lang as string) || 'en';
  const country = (params?.country as string) || 'pk';
  const city = (params?.city as string) || 'karachi';

  return <NotFoundView lang={lang} country={country} city={city} />;
}
