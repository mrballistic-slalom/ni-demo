'use client';

import { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { motion, useReducedMotion } from 'motion/react';

/** Props for {@link Playhead}. */
export interface PlayheadProps {
  /** Total number of steps across the current pattern (`patternLength * STEPS_PER_BAR`). */
  totalSteps: number;
  /** Zero-based index of the step currently playing, or -1 when stopped. */
  currentStep: number;
}

const Track = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

const Beam = styled(motion.div)`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    transparent 0%,
    var(--genre-glow) 45%,
    var(--genre-glow) 55%,
    transparent 100%
  );
  filter: blur(var(--genre-glow-blur, 12px));
  mix-blend-mode: screen;
  will-change: transform;
`;

/**
 * Sweeping light-beam overlay that tracks the sequencer's playhead across
 * the step grid's columns. Meant to be absolutely positioned as a sibling
 * layered on top of a track's step cells (its own container fills its
 * parent via `inset: 0`).
 *
 * Measures its container's actual rendered width via `ResizeObserver` so
 * the beam aligns with real column edges regardless of gap/label sizing,
 * then animates a `translateX` (Motion's `x`) to the current step's
 * position -- blurred via `--genre-glow-blur` for a soft glow rather than
 * a hard-edged bar. Renders nothing while stopped (`currentStep < 0`) or
 * before the first layout measurement, and jumps instantly instead of
 * tweening under `prefers-reduced-motion`.
 */
export default function Playhead({ totalSteps, currentStep }: PlayheadProps) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stepWidth = totalSteps > 0 ? width / totalSteps : 0;
  const visible = currentStep >= 0 && stepWidth > 0;
  const x = stepWidth * Math.max(currentStep, 0);

  return (
    <Track ref={containerRef} aria-hidden="true">
      {visible && (
        <Beam
          style={{ width: stepWidth }}
          initial={{ x }}
          animate={{ x }}
          transition={prefersReducedMotion ? { duration: 0 } : { type: 'tween', duration: 0.09, ease: 'linear' }}
        />
      )}
    </Track>
  );
}
