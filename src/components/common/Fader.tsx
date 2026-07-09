'use client';

import { useCallback, type ChangeEvent } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

const thumbStyles = css`
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--genre-primary);
  border: 2px solid var(--genre-surface);
  box-shadow: 0 0 var(--genre-glow-blur, 10px) var(--genre-glow);
  cursor: pointer;
  transition: transform 0.1s ease;
`;

const StyledRange = styled.input<{ $orientation: 'horizontal' | 'vertical' }>`
  appearance: none;
  -webkit-appearance: none;
  width: ${(p) => (p.$orientation === 'vertical' ? '8px' : '100%')};
  height: ${(p) => (p.$orientation === 'vertical' ? '160px' : '8px')};
  ${(p) =>
    p.$orientation === 'vertical' &&
    css`
      writing-mode: vertical-lr;
      direction: rtl;
    `}
  background: var(--genre-cell-off);
  border-radius: 999px;
  outline: none;
  margin: 0;
  cursor: pointer;

  &::-webkit-slider-thumb {
    ${thumbStyles}
    margin-top: 0;
  }

  &::-moz-range-thumb {
    ${thumbStyles}
  }

  &::-moz-range-track {
    background: var(--genre-cell-off);
    border-radius: 999px;
  }

  &:focus-visible {
    outline: 2px solid var(--genre-accent);
    outline-offset: 3px;
  }

  &:active::-webkit-slider-thumb {
    transform: scale(1.15);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export interface FaderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  ariaLabel: string;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
}

/**
 * Skin-aware replacement for MUI's `Slider`, built on a native
 * `input[type="range"]` so it keeps free keyboard support (arrow keys,
 * Home/End, Page Up/Down), screen-reader value announcements, and touch
 * dragging without any custom pointer-event handling. Used for BPM,
 * volume, and other continuous controls.
 */
export default function Fader({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  ariaLabel,
  orientation = 'horizontal',
  disabled = false,
}: FaderProps) {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange]
  );

  return (
    <StyledRange
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={handleChange}
      aria-label={ariaLabel}
      aria-orientation={orientation}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      disabled={disabled}
      $orientation={orientation}
      // `orient` is a non-standard attribute Firefox honors for vertical range inputs.
      {...(orientation === 'vertical' ? { orient: 'vertical' } : {})}
    />
  );
}
