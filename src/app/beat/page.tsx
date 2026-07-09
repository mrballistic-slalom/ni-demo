import { Suspense } from 'react';
import type { Metadata } from 'next';
import BeatContent from './BeatContent';

interface BeatPageProps {
  searchParams: Promise<{ b?: string }>;
}

/**
 * Server-side metadata for a shared beat link, including a per-beat dynamic
 * OG image (`/beat/og?b=<b>`, see `src/app/beat/og/route.tsx`). Lives here
 * rather than on `BeatContent` because `generateMetadata` only runs on
 * server components, and only a page (not a layout) receives `searchParams`
 * — so the interactive, `'use client'` beat UI is split into a child
 * component instead.
 */
export async function generateMetadata({ searchParams }: BeatPageProps): Promise<Metadata> {
  const { b } = await searchParams;
  const title = 'NI Play — Shared beat';
  const description = 'Tap play to hear this beat, or make your own in NI Play — no app, no account.';
  const ogImage = b ? `/beat/og?b=${encodeURIComponent(b)}` : '/beat/og';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function SharedBeatPage() {
  return (
    <Suspense>
      <BeatContent />
    </Suspense>
  );
}
