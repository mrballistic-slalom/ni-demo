'use client';

import { useCallback, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { motion, useReducedMotion } from 'motion/react';
import { Play, Square } from 'lucide-react';
import Fader from '@/components/common/Fader';
import { useGridStore } from '@/stores/useGridStore';
import { useTransportStore } from '@/stores/useTransportStore';
import { startPlayback, stopPlayback, updateBpm, createSequence } from '@/audio/sequencer';
import { loadAllSounds } from '@/audio/soundLoader';
import { GENRES } from '@/data/genres';
import type { Genre } from '@/types';

const Bar = styled.div`
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
  background: rgba(8, 8, 8, 0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Section = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

const SectionLabel = styled.span`
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--genre-text-dim);
  flex-shrink: 0;
`;

const Readout = styled.span`
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  font-size: 0.75rem;
  color: var(--genre-primary);
  min-width: 40px;
  flex-shrink: 0;
  text-align: right;
  text-shadow: 0 0 8px var(--genre-glow);
`;

const BarChips = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  flex: 1;
`;

const Chip = styled.button<{ $active: boolean }>`
  appearance: none;
  border: 1px solid ${(p) => (p.$active ? 'transparent' : 'rgba(255, 255, 255, 0.16)')};
  border-radius: 999px;
  padding: 4px 10px;
  min-height: 28px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  background: ${(p) => (p.$active ? 'var(--genre-primary)' : 'transparent')};
  color: ${(p) => (p.$active ? 'var(--genre-surface)' : 'var(--genre-text-dim)')};
  box-shadow: ${(p) => (p.$active ? '0 0 var(--genre-glow-blur, 10px) var(--genre-glow)' : 'none')};
  transition: background-color 0.15s ease, box-shadow 0.15s ease, color 0.15s ease;

  &:focus-visible {
    outline: 2px solid var(--genre-accent);
    outline-offset: 2px;
  }
`;

const Spacer = styled.div`
  flex: 1;
`;

const PlayButton = styled(motion.button)`
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: var(--genre-primary);
  color: var(--genre-surface);
  cursor: pointer;
  box-shadow: 0 0 var(--genre-glow-blur, 16px) var(--genre-glow), inset 0 0 6px rgba(255, 255, 255, 0.25);
  transition: box-shadow 0.15s ease;

  &:hover {
    box-shadow: 0 0 calc(var(--genre-glow-blur, 16px) * 1.4) var(--genre-glow),
      inset 0 0 6px rgba(255, 255, 255, 0.3);
  }

  &:focus-visible {
    outline: 2px solid var(--genre-accent);
    outline-offset: 3px;
  }
`;

/**
 * Sticky bottom transport: a BPM fader (ranged to the active genre's
 * `bpmRange`) and 1/2/4-bar length chips on top, a swing fader and the big
 * central Play/Stop button below. Manages audio playback lifecycle via
 * {@link startPlayback}/{@link stopPlayback}/{@link updateBpm}.
 *
 * Sound loading is deduplicated: a mount/genre-change effect and a rapid
 * Play click both want the current kit loaded, but {@link loadAllSounds}
 * rebuilds the whole Tone.js kit, so calling it twice back-to-back (e.g. a
 * fast double-tap on Play before the mount load resolves) would otherwise
 * fetch every sample twice. `ensureSoundsLoaded` caches the in-flight
 * promise per genre so concurrent callers share one load.
 */
export default function TransportBar() {
  const isPlaying = useTransportStore((s) => s.isPlaying);
  const genre = useGridStore((s) => s.genre);
  const bpm = useGridStore((s) => s.bpm);
  const swing = useGridStore((s) => s.swing);
  const patternLength = useGridStore((s) => s.patternLength);
  const setBpm = useGridStore((s) => s.setBpm);
  const setSwing = useGridStore((s) => s.setSwing);
  const setPatternLength = useGridStore((s) => s.setPatternLength);
  const prefersReducedMotion = useReducedMotion();

  const genreDef = GENRES[genre];

  const loadedGenreRef = useRef<Genre | null>(null);
  const loadPromiseRef = useRef<Promise<void> | null>(null);

  const ensureSoundsLoaded = useCallback((): Promise<void> => {
    if (!loadPromiseRef.current || loadedGenreRef.current !== genre) {
      loadedGenreRef.current = genre;
      loadPromiseRef.current = loadAllSounds().catch((e) => {
        // Only cache the promise on success -- a rejected promise is
        // truthy, so leaving it cached would make every subsequent caller
        // (mount effect, every Play tap) re-await the same failure forever.
        // Clear the cache so the next call retries a fresh load.
        loadPromiseRef.current = null;
        loadedGenreRef.current = null;
        throw e;
      });
    }
    return loadPromiseRef.current;
  }, [genre]);

  // Load sounds once on mount and whenever the genre changes.
  useEffect(() => {
    ensureSoundsLoaded();
  }, [ensureSoundsLoaded]);

  const handlePlayToggle = useCallback(async () => {
    if (isPlaying) {
      stopPlayback();
      useTransportStore.getState().setPlaying(false);
    } else {
      try {
        await ensureSoundsLoaded();
      } catch (e) {
        // Sound load failed -- leave the transport stopped so a later
        // Play tap can retry (see ensureSoundsLoaded's cache-clear above)
        // instead of throwing uncaught out of this click handler.
        console.error('Failed to load sounds for playback:', e);
        return;
      }
      createSequence();
      startPlayback();
      useTransportStore.getState().setPlaying(true);
    }
  }, [isPlaying, ensureSoundsLoaded]);

  const handleBpmChange = useCallback(
    (value: number) => {
      setBpm(value);
      updateBpm(value);
    },
    [setBpm]
  );

  const handlePatternLengthChange = useCallback(
    (length: 1 | 2 | 4) => {
      if (isPlaying) {
        stopPlayback();
        useTransportStore.getState().setPlaying(false);
      }
      setPatternLength(length);
    },
    [isPlaying, setPatternLength]
  );

  return (
    <Bar>
      <Row>
        <Section>
          <SectionLabel>BPM</SectionLabel>
          <Fader
            value={bpm}
            min={genreDef.bpmRange[0]}
            max={genreDef.bpmRange[1]}
            onChange={handleBpmChange}
            ariaLabel="Tempo in beats per minute"
          />
          <Readout>{bpm}</Readout>
        </Section>
        <BarChips>
          {([1, 2, 4] as const).map((len) => (
            <Chip
              key={len}
              type="button"
              $active={patternLength === len}
              aria-pressed={patternLength === len}
              onClick={() => handlePatternLengthChange(len)}
            >
              {len} bar{len > 1 ? 's' : ''}
            </Chip>
          ))}
        </BarChips>
      </Row>

      <Row>
        <Section>
          <SectionLabel>SWING</SectionLabel>
          <Fader value={swing} min={0} max={100} onChange={setSwing} ariaLabel="Swing amount" />
        </Section>
        <PlayButton
          type="button"
          aria-label={isPlaying ? 'Stop playback' : 'Start playback'}
          onClick={handlePlayToggle}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.92 }}
          transition={{ duration: 0.1 }}
        >
          {isPlaying ? (
            <Square size={26} fill="currentColor" strokeWidth={0} aria-hidden="true" />
          ) : (
            <Play size={28} fill="currentColor" strokeWidth={0} aria-hidden="true" />
          )}
        </PlayButton>
        <Spacer />
      </Row>
    </Bar>
  );
}
