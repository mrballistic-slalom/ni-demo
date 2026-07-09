'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { motion, useReducedMotion } from 'motion/react';
import { Genre } from '@/types';
import { GENRES, GENRE_LIST } from '@/data/genres';
import { SKINS, skinToCssVars, skinEasingToBezier } from '@/theme/skins';
import { DISPLAY_FONT_CLASS } from '@/theme/fonts';
import { initAudio } from '@/audio/engine';
import { useTransportStore } from '@/stores/useTransportStore';
import { useGridStore } from '@/stores/useGridStore';
import { focusRing } from '@/components/common/focusRing';
import MiniGrid from './MiniGrid';

/** How long the chosen card's morph plays before navigating away, in ms. */
const MORPH_MS = 260;

const Section = styled.section`
  padding: 8px 20px 72px;
  max-width: 960px;
  margin: 0 auto;
`;

const Heading = styled.h2`
  margin: 0 0 6px;
  text-align: center;
  font-size: clamp(1.4rem, 4vw, 1.9rem);
  font-weight: 800;
  color: #fff;
`;

const Subheading = styled.p`
  margin: 0 0 28px;
  text-align: center;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.6);
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;

  @media (min-width: 720px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }
`;

const Card = styled(motion.button)`
  appearance: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 22px 14px 20px;
  border-radius: 18px;
  border: 1px solid color-mix(in srgb, var(--genre-primary) 35%, transparent);
  background: var(--genre-surface);
  box-shadow: 0 0 var(--genre-glow-blur, 16px) color-mix(in srgb, var(--genre-glow) 60%, transparent);
  color: var(--genre-text);
  transform-origin: center;

  &:focus-visible {
    ${focusRing(3)}
  }

  &:disabled {
    cursor: default;
  }
`;

const Label = styled.h3`
  margin: 4px 0 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--genre-primary);
`;

const Tagline = styled.p`
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.35;
  color: var(--genre-text-dim);
`;

const PreviewFrame = styled.div`
  padding: 10px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--genre-cell-off) 70%, transparent);
`;

export interface GenrePickerProps {
  /** Optional id applied to the section, so a caller (e.g. the Hero CTA) can scroll to it. */
  id?: string;
}

/** Scale/opacity target for a genre card during the pick morph. */
function getCardAnimation(prefersReducedMotion: boolean, isPicked: boolean, isOther: boolean) {
  if (prefersReducedMotion) return undefined;
  if (isPicked) return { scale: 1.08, opacity: 1 };
  if (isOther) return { scale: 0.94, opacity: 0.25 };
  return { scale: 1, opacity: 1 };
}

/**
 * The landing page's genre picker: one card per genre, each rendered in
 * that genre's own skin (colors, geometry, display font) all at once, with
 * a shimmering `MiniGrid` preview of its signature pattern. Tapping a card
 * boots the audio engine (inside the click handler, for the iOS user-gesture
 * requirement), seeds the grid store with that genre, plays a short "morph"
 * — the chosen card grows while its siblings fade, eased with that card's
 * own `motion.easing` — then navigates to the studio already in that
 * genre's skin.
 */
export default function GenrePicker({ id }: GenrePickerProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [picked, setPicked] = useState<Genre | null>(null);

  const handlePick = async (genreId: Genre) => {
    if (picked) return;
    setPicked(genreId);

    await initAudio();
    useTransportStore.getState().setAudioContextStarted(true);
    useGridStore.getState().setGenre(genreId);

    if (!prefersReducedMotion) {
      await new Promise((resolve) => setTimeout(resolve, MORPH_MS));
    }
    router.push('/studio');
  };

  return (
    <Section id={id} aria-label="Pick your sound">
      <Heading>Pick your sound</Heading>
      <Subheading>Five genres, five skins — tap one to start.</Subheading>
      <CardsGrid>
        {GENRE_LIST.map((genreId) => {
          const genre = GENRES[genreId];
          const skin = SKINS[genreId];
          const isPicked = picked === genreId;
          const isOther = picked !== null && !isPicked;

          return (
            <Card
              key={genreId}
              type="button"
              disabled={picked !== null}
              onClick={() => handlePick(genreId)}
              style={skinToCssVars(skin)}
              className={DISPLAY_FONT_CLASS[genreId]}
              aria-label={`Pick ${genre.label} — ${genre.tagline}`}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
              animate={getCardAnimation(!!prefersReducedMotion, isPicked, isOther)}
              transition={{ duration: MORPH_MS / 1000, ease: skinEasingToBezier(skin.motion.easing) }}
            >
              <PreviewFrame style={skinToCssVars(skin)}>
                <MiniGrid grid={genre.template.grid} cellSize={7} gap={2} />
              </PreviewFrame>
              <Label>{genre.label}</Label>
              <Tagline>{genre.tagline}</Tagline>
            </Card>
          );
        })}
      </CardsGrid>
    </Section>
  );
}
