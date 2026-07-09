'use client';

import styled from '@emotion/styled';
import { motion, useReducedMotion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { focusRing } from './focusRing';

/**
 * Visual treatment for the `active` state.
 * - `accent` (default): solid genre-primary fill + glow — an engaged toggle
 *   (e.g. solo).
 * - `muted`: dimmed/desaturated outline, no glow — a suppressed/off state
 *   (e.g. mute), deliberately distinct from `accent` so the two don't read
 *   as the same "active" look.
 */
type IconButtonActiveVariant = 'accent' | 'muted';

const StyledButton = styled(motion.button)<{
  $active?: boolean;
  $size: number;
  $activeVariant: IconButtonActiveVariant;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  min-width: 44px;
  min-height: 44px;
  border: 1.5px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  padding: 0;
  transition: background-color 0.15s ease, box-shadow 0.15s ease, color 0.15s ease,
    border-color 0.15s ease, opacity 0.15s ease;

  ${(p) => {
    if (!p.$active) {
      return `
        background: transparent;
        color: var(--genre-text);
        box-shadow: none;
      `;
    }
    if (p.$activeVariant === 'muted') {
      return `
        background: rgba(255, 255, 255, 0.06);
        border-color: var(--genre-text-dim);
        color: var(--genre-text-dim);
        opacity: 0.75;
        box-shadow: none;
      `;
    }
    return `
      background: var(--genre-primary);
      border-color: var(--genre-primary);
      color: var(--genre-surface);
      box-shadow: 0 0 var(--genre-glow-blur, 12px) var(--genre-glow);
    `;
  }}

  &:hover {
    ${(p) =>
      p.$active
        ? ''
        : `
      background: rgba(255, 255, 255, 0.08);
      box-shadow: 0 0 var(--genre-glow-blur, 12px) var(--genre-glow);
    `}
  }

  &:focus-visible {
    ${focusRing()}
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

export interface IconButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  active?: boolean;
  /** Visual treatment for the active state. Defaults to `'accent'`. */
  activeVariant?: IconButtonActiveVariant;
  size?: number;
  disabled?: boolean;
}

/**
 * Round, ≥44px-hit-area icon button used throughout the transport, sound
 * browser, and grid toolbars in place of MUI's `IconButton`. Always
 * requires an `aria-label` (via the `label` prop) since it renders no
 * visible text. Glow/hover treatment reads the active genre skin's CSS
 * custom properties, and the press animation is a Motion `whileTap` scale
 * (skipped when the user prefers reduced motion).
 */
export default function IconButton({
  icon: Icon,
  label,
  onClick,
  active = false,
  activeVariant = 'accent',
  size = 44,
  disabled = false,
}: IconButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const iconSize = Math.round(size * 0.5);

  return (
    <StyledButton
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      onClick={onClick}
      disabled={disabled}
      $active={active}
      $activeVariant={activeVariant}
      $size={size}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.88 }}
      transition={{ duration: 0.1 }}
    >
      <Icon size={iconSize} strokeWidth={2.25} aria-hidden="true" />
    </StyledButton>
  );
}
