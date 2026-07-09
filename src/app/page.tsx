'use client';

import { useCallback } from 'react';
import Hero from '@/components/Landing/Hero';
import HowItWorks from '@/components/Landing/HowItWorks';
import GenrePicker from '@/components/Landing/GenrePicker';

const PICKER_ID = 'genre-picker';

/**
 * The landing page: hero (collapses to a compact header on repeat visits,
 * per the `ni_seen_hero` flag Hero manages internally) flowing into three
 * "how it works" beats and the five-skin genre picker, all in one scroll.
 * The hero's CTA smooth-scrolls down to the picker rather than navigating.
 */
export default function Home() {
  const scrollToPicker = useCallback(() => {
    document.getElementById(PICKER_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <main>
      <Hero onCtaClick={scrollToPicker} />
      <HowItWorks />
      <GenrePicker id={PICKER_ID} />
    </main>
  );
}
