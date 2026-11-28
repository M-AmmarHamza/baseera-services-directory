import React from 'react';
import NotFoundView from '@/components/NotFoundView';

export default function LocalizedNotFound() {
  return (
    <>
      <title>Page Not Found | Baseera</title>
      <meta name="robots" content="noindex, nofollow" />
      <NotFoundView lang="en" country="pk" city="karachi" />
    </>
  );
}
