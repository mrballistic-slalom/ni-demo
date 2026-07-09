'use client';

import { useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import { useGridStore } from '@/stores/useGridStore';
import { SKINS, skinEasingToBezier } from '@/theme/skins';
import { focusRing } from '@/components/common/focusRing';

const SEEN_STUDIO_HINT_KEY = 'ni_seen_studio_hint';

const HintBar = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 0 2px 8px;
  padding: 9px 8px 9px 14px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--genre-surface) 88%, transparent);
  border: 1px solid color-mix(in srgb, var(--genre-primary) 30%, transparent);
`;

const HintText = styled.p`
  margin: 0;
  font-size: 0.82rem;
  color: var(--genre-text-dim);
`;

const DismissButton = styled.button`
  appearance: none;
  border: none;
  background: transparent;
  color: var(--genre-text-dim);
  cursor: pointer;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  &:focus-visible {
    ${focusRing()}
  }
`;

/**
 * Light, dismissible first-run hint ("Tap the squares to make a beat")
 * shown above the grid the first time a user reaches the studio, gated by
 * the `ni_seen_studio_hint` localStorage flag. Dismissed by any tap/click
 * interaction anywhere on the page (making a beat is itself a dismissal)
 * or by its own close button; once dismissed the flag is set and it never
 * shows again. Skinned via the active genre's CSS custom properties, and
 * its entrance/exit is eased with that genre's `motion.easing` (skipped
 * under `prefers-reduced-motion`, where it just appears/disappears).
 */
export default function StudioHint() {
  const [visible, setVisible] = useState(false);
  const genre = useGridStore((s) => s.genre);
  const prefersReducedMotion = useReducedMotion();
  const easing = skinEasingToBezier(SKINS[genre].motion.easing);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(SEEN_STUDIO_HINT_KEY)) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable (private mode, etc.) -- skip the hint
      // rather than risk showing it on every visit.
    }
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      window.localStorage.setItem(SEEN_STUDIO_HINT_KEY, '1');
    } catch {
      // Nothing we can do if storage is unavailable -- the hint just
      // won't be remembered across reloads, which is a safe fallback.
    }
  }, []);

  // Any tap/click interaction with the studio (e.g. toggling a grid cell)
  // counts as "got it" and dismisses the hint, in addition to its own X.
  useEffect(() => {
    if (!visible) return;
    window.addEventListener('pointerdown', dismiss);
    return () => window.removeEventListener('pointerdown', dismiss);
  }, [visible, dismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <HintBar
          role="status"
          data-testid="studio-hint"
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.28, ease: easing }}
        >
          <HintText>Tap the squares to make a beat</HintText>
          <DismissButton type="button" aria-label="Dismiss hint" onClick={dismiss}>
            <X size={15} strokeWidth={2.5} aria-hidden="true" />
          </DismissButton>
        </HintBar>
      )}
    </AnimatePresence>
  );
}
