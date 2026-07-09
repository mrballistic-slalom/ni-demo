'use client';

import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { motion, useReducedMotion } from 'motion/react';
import { DISPLAY_FONT_CLASS } from '@/theme/fonts';
import { SKINS, skinToCssVars } from '@/theme/skins';
import { GENRES } from '@/data/genres';
import { focusRing } from '@/components/common/focusRing';
import MiniGrid from './MiniGrid';

const SEEN_HERO_KEY = 'ni_seen_hero';

const Section = styled(motion.section)`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  overflow: hidden;
  isolation: isolate;
`;

const Glow = styled.div`
  position: absolute;
  inset: -20% -10%;
  z-index: -1;
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 31, 61, 0.35), transparent 45%),
    radial-gradient(circle at 80% 10%, rgba(138, 91, 255, 0.35), transparent 45%),
    radial-gradient(circle at 50% 90%, rgba(255, 95, 190, 0.25), transparent 50%);
  filter: blur(48px);
  pointer-events: none;
`;

const Wordmark = styled.h1<{ $compact: boolean }>`
  margin: 0;
  font-size: ${(p) => (p.$compact ? 'clamp(1.5rem, 4vw, 1.9rem)' : 'clamp(2.75rem, 10vw, 5.5rem)')};
  font-weight: 900;
  line-height: 0.95;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #ff1f3d 0%, #ff5fbe 45%, #8a5bff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: font-size 0.3s ease;
`;

const Pitch = styled.p`
  margin: 14px 0 32px;
  max-width: 460px;
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.5;
`;

const PreviewFrame = styled.div`
  padding: 18px;
  border-radius: 20px;
  background: var(--genre-surface);
  box-shadow: 0 0 var(--genre-glow-blur, 20px) var(--genre-glow);
  margin-bottom: 36px;
`;

const CtaButton = styled(motion.button)`
  appearance: none;
  border: none;
  cursor: pointer;
  padding: 14px 32px;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 700;
  color: #0a0a0a;
  background: linear-gradient(135deg, #ff5fbe, #8a5bff);
  box-shadow: 0 8px 30px rgba(138, 91, 255, 0.4);

  &:focus-visible {
    ${focusRing(3)}
  }
`;

const CompactBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  max-width: 640px;
  padding: 14px 20px;
`;

export interface HeroProps {
  /** Called when the primary CTA is pressed; the caller owns the scroll-to-picker behavior. */
  onCtaClick: () => void;
}

/**
 * Landing page hero: full-bleed wordmark, one-line pitch, a looping mini
 * preview of a genre's step pattern, and the primary "Pick your sound" CTA.
 *
 * On repeat visits (a `ni_seen_hero` flag in `localStorage`), collapses to a
 * compact header — wordmark + CTA only, no glow/pitch/preview — so returning
 * users aren't re-sold the pitch every time. First-time visitors always see
 * the full hero; the flag is set after the first render so it never nags.
 */
export default function Hero({ onCtaClick }: HeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const [compact, setCompact] = useState(false);
  const previewSkin = SKINS.house;

  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(SEEN_HERO_KEY);
      if (seen) {
        setCompact(true);
      } else {
        window.localStorage.setItem(SEEN_HERO_KEY, '1');
      }
    } catch {
      // localStorage unavailable (private mode, etc.) — always show the full hero.
    }
  }, []);

  if (compact) {
    return (
      <Section layout={!prefersReducedMotion} transition={{ duration: 0.3 }} data-testid="hero-compact">
        <CompactBar>
          <Wordmark $compact className={DISPLAY_FONT_CLASS.trap}>NI Play</Wordmark>
          <CtaButton
            type="button"
            onClick={onCtaClick}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
          >
            Pick your sound
          </CtaButton>
        </CompactBar>
      </Section>
    );
  }

  return (
    <Section
      layout={!prefersReducedMotion}
      transition={{ duration: 0.3 }}
      style={{ padding: '64px 20px 56px' }}
      data-testid="hero-full"
    >
      <Glow aria-hidden="true" />
      <Wordmark $compact={false} className={DISPLAY_FONT_CLASS.trap}>NI Play</Wordmark>
      <Pitch>Make a beat in your browser — no app, no account, no clue required.</Pitch>
      <PreviewFrame style={skinToCssVars(previewSkin)}>
        <MiniGrid grid={GENRES.house.template.grid} cellSize={9} gap={3} />
      </PreviewFrame>
      <CtaButton
        type="button"
        onClick={onCtaClick}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
      >
        Pick your sound
      </CtaButton>
    </Section>
  );
}
