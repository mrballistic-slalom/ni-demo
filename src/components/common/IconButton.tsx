'use client';

import styled from '@emotion/styled';
import { motion, useReducedMotion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { focusRing } from './focusRing';

const StyledButton = styled(motion.button)<{ $active?: boolean; $size: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  min-width: 44px;
  min-height: 44px;
  border: none;
  border-radius: 50%;
  background: ${(p) => (p.$active ? 'var(--genre-primary)' : 'transparent')};
  color: ${(p) => (p.$active ? 'var(--genre-surface)' : 'var(--genre-text)')};
  cursor: pointer;
  padding: 0;
  transition: background-color 0.15s ease, box-shadow 0.15s ease, color 0.15s ease;
  box-shadow: ${(p) => (p.$active ? '0 0 var(--genre-glow-blur, 12px) var(--genre-glow)' : 'none')};

  &:hover {
    background: ${(p) => (p.$active ? 'var(--genre-primary)' : 'rgba(255, 255, 255, 0.08)')};
    box-shadow: 0 0 var(--genre-glow-blur, 12px) var(--genre-glow);
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
      $size={size}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.88 }}
      transition={{ duration: 0.1 }}
    >
      <Icon size={iconSize} strokeWidth={2.25} aria-hidden="true" />
    </StyledButton>
  );
}
