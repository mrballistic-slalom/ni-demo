'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styled from '@emotion/styled';
import { motion, useReducedMotion } from 'motion/react';
import { Play, Square, Sparkles } from 'lucide-react';
import { decodeBeatFromUrl, formatBPM } from '@/lib/utils';
import { firstBar } from '@/lib/beatPreview';
import { useGridStore } from '@/stores/useGridStore';
import { useTransportStore } from '@/stores/useTransportStore';
import { GENRES } from '@/data/genres';
import { SKINS, skinToCssVars } from '@/theme/skins';
import { DISPLAY_FONT_CLASS } from '@/theme/fonts';
import { initAudio } from '@/audio/engine';
import { loadAllSounds } from '@/audio/soundLoader';
import { startPlayback, stopPlayback, createSequence } from '@/audio/sequencer';
import { focusRing } from '@/components/common/focusRing';
import MiniGrid from '@/components/Landing/MiniGrid';
import { STEPS_PER_BAR } from '@/types';

const Page = styled.div`
  position: relative;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  isolation: isolate;
  padding: 56px 20px calc(48px + env(safe-area-inset-bottom));
  gap: 6px;
  background: var(--genre-bg);
  color: var(--genre-text);
`;

const Glow = styled.div`
  position: absolute;
  inset: -20% -10%;
  z-index: -1;
  background: radial-gradient(circle at 50% 0%, var(--genre-glow), transparent 55%);
  filter: blur(56px);
  pointer-events: none;
`;

const Wordmark = styled.h1`
  margin: 0;
  font-size: clamp(1.1rem, 3vw, 1.3rem);
  font-weight: 900;
  letter-spacing: -0.01em;
  background: linear-gradient(135deg, #ff1f3d 0%, #ff5fbe 45%, #8a5bff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const GenreLabel = styled.h2`
  margin: 10px 0 0;
  font-size: clamp(2rem, 8vw, 3.2rem);
  font-weight: 800;
  line-height: 1;
  color: var(--genre-primary);
  text-shadow: 0 0 var(--genre-glow-blur, 20px) var(--genre-glow);
`;

const Tagline = styled.p`
  margin: 10px 0 0;
  max-width: 420px;
  font-size: 1rem;
  line-height: 1.45;
  color: var(--genre-text-dim);
`;

const BpmReadout = styled.span`
  margin-top: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--genre-text-dim);
`;

const PreviewFrame = styled.div`
  margin: 28px 0 32px;
  padding: 16px;
  border-radius: 18px;
  background: var(--genre-surface);
  box-shadow: 0 0 var(--genre-glow-blur, 20px) var(--genre-glow);
`;

const PlayButton = styled(motion.button)`
  width: 88px;
  height: 88px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  appearance: none;
  border: none;
  border-radius: 50%;
  background: var(--genre-primary);
  color: var(--genre-surface);
  cursor: pointer;
  box-shadow: 0 0 var(--genre-glow-blur, 20px) var(--genre-glow), inset 0 0 8px rgba(255, 255, 255, 0.25);
  transition: box-shadow 0.15s ease;

  &:hover {
    box-shadow: 0 0 calc(var(--genre-glow-blur, 20px) * 1.4) var(--genre-glow),
      inset 0 0 8px rgba(255, 255, 255, 0.3);
  }

  &:focus-visible {
    ${focusRing(3)}
  }
`;

const PlayHint = styled.p`
  margin: 14px 0 0;
  font-size: 0.8rem;
  color: var(--genre-text-dim);
`;

const CtaLink = styled(motion.create(Link))`
  margin-top: 36px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  appearance: none;
  text-decoration: none;
  padding: 14px 30px;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0a0a0a;
  background: linear-gradient(135deg, #ff5fbe, #8a5bff);
  box-shadow: 0 8px 30px rgba(138, 91, 255, 0.4);

  &:focus-visible {
    ${focusRing(3)}
  }
`;

const FallbackPage = styled.div`
  position: relative;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  isolation: isolate;
  padding: 56px 20px calc(48px + env(safe-area-inset-bottom));
  gap: 10px;
  background: radial-gradient(circle at 50% 0%, #1a0a1a, #0a0a0a);
  color: #fff;
`;

const FallbackHeading = styled.h2`
  margin: 18px 0 0;
  font-size: clamp(1.4rem, 5vw, 1.9rem);
  font-weight: 800;
`;

const FallbackText = styled.p`
  margin: 0;
  max-width: 380px;
  font-size: 0.95rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.65);
`;

/** Valid pattern lengths (in bars), matching {@link Project.pattern_length}. */
const PATTERN_LENGTHS: readonly (1 | 2 | 4)[] = [1, 2, 4];

/**
 * Rounds a step count to whole bars and snaps to the nearest supported
 * pattern length (1, 2, or 4 bars), defaulting to 1 bar for zero, negative,
 * or otherwise out-of-range input. Used to recover `patternLength` from a
 * decoded share link's raw grid length, which the URL encoding doesn't
 * store directly.
 * @param totalSteps - Total step count of a decoded track's grid row.
 */
function toPatternLength(totalSteps: number): 1 | 2 | 4 {
  const bars = Math.round(totalSteps / STEPS_PER_BAR);
  return PATTERN_LENGTHS.reduce((closest, candidate) =>
    Math.abs(candidate - bars) < Math.abs(closest - bars) ? candidate : closest
  );
}

/**
 * Reads `?b=` from the URL, decodes it via `decodeBeatFromUrl`, and renders
 * the shared beat in its own genre's skin: a big Play button (booting the
 * audio engine on first tap, per iOS's user-gesture requirement) plus a
 * "Make your own" CTA back to the landing page. Falls back to a friendly,
 * genre-neutral message — never a crash — when `b` is missing, malformed,
 * or names an unknown genre.
 */
export default function BeatContent() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get('b');
  const isPlaying = useTransportStore((s) => s.isPlaying);
  const prefersReducedMotion = useReducedMotion();

  const decoded = useMemo(() => {
    if (!encoded) return null;
    const result = decodeBeatFromUrl(encoded);
    if (!result || !(result.genre in GENRES)) return null;
    return result;
  }, [encoded]);

  const audioInitedRef = useRef(false);
  const loadPromiseRef = useRef<Promise<void> | null>(null);

  // Hydrate the shared grid store so the genre skin applies app-wide and the
  // sequencer/sound-loader (which always read the store, not props) play
  // the shared beat rather than whatever was last saved locally.
  useEffect(() => {
    if (!decoded) return;
    useGridStore.getState().loadProject({
      genre: decoded.genre,
      bpm: decoded.bpm,
      pattern_length: toPatternLength(decoded.grid.kick.length),
      swing: 0,
      grid: decoded.grid,
      sounds: decoded.sounds,
      volumes: decoded.volumes,
    });
  }, [decoded]);

  // Stop playback if the visitor navigates away (e.g. taps "Make your own")
  // while the beat is still playing.
  useEffect(() => {
    return () => {
      if (useTransportStore.getState().isPlaying) {
        stopPlayback();
        useTransportStore.getState().setPlaying(false);
      }
    };
  }, []);

  const ensureSoundsLoaded = useCallback((): Promise<void> => {
    if (!loadPromiseRef.current) {
      loadPromiseRef.current = loadAllSounds().catch((e) => {
        loadPromiseRef.current = null;
        throw e;
      });
    }
    return loadPromiseRef.current;
  }, []);

  const handlePlayToggle = useCallback(async () => {
    if (isPlaying) {
      stopPlayback();
      useTransportStore.getState().setPlaying(false);
      return;
    }

    if (!audioInitedRef.current) {
      await initAudio();
      useTransportStore.getState().setAudioContextStarted(true);
      audioInitedRef.current = true;
    }

    try {
      await ensureSoundsLoaded();
    } catch (e) {
      console.error('Failed to load sounds for shared-beat playback:', e);
      return;
    }

    createSequence();
    startPlayback();
    useTransportStore.getState().setPlaying(true);
  }, [isPlaying, ensureSoundsLoaded]);

  if (!decoded) {
    return (
      <FallbackPage data-testid="beat-fallback">
        <Wordmark>NI Play</Wordmark>
        <FallbackHeading>This beat link looks broken</FallbackHeading>
        <FallbackText>
          The link might be incomplete or out of date. Make your own beat instead — it only takes a tap.
        </FallbackText>
        <CtaLink href="/">
          <Sparkles size={18} strokeWidth={2.25} aria-hidden="true" />
          Make your own
        </CtaLink>
      </FallbackPage>
    );
  }

  const skin = SKINS[decoded.genre];
  const genreDef = GENRES[decoded.genre];

  return (
    <Page
      style={skinToCssVars(skin)}
      className={DISPLAY_FONT_CLASS[decoded.genre]}
      data-testid="beat-page"
    >
      <Glow aria-hidden="true" />
      <Wordmark>NI Play</Wordmark>
      <GenreLabel>{genreDef.label} beat</GenreLabel>
      <Tagline>{genreDef.tagline}</Tagline>
      <BpmReadout>{formatBPM(decoded.bpm)}</BpmReadout>

      <PreviewFrame>
        <MiniGrid grid={firstBar(decoded.grid)} cellSize={11} gap={4} />
      </PreviewFrame>

      <PlayButton
        type="button"
        aria-label={isPlaying ? 'Stop playback' : 'Play this beat'}
        onClick={handlePlayToggle}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.92 }}
        transition={{ duration: 0.1 }}
      >
        {isPlaying ? (
          <Square size={32} fill="currentColor" strokeWidth={0} aria-hidden="true" />
        ) : (
          <Play size={34} fill="currentColor" strokeWidth={0} aria-hidden="true" />
        )}
      </PlayButton>
      <PlayHint>{isPlaying ? 'Playing…' : 'Tap to play'}</PlayHint>

      <CtaLink href="/">
        <Sparkles size={18} strokeWidth={2.25} aria-hidden="true" />
        Make your own
      </CtaLink>
    </Page>
  );
}
