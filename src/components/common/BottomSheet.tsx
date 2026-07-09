'use client';

import { useCallback, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
`;

const Sheet = styled(motion.div)`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1001;
  background: var(--genre-surface);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.5);
  max-height: 85dvh;
  overflow-y: auto;
  padding: 8px 20px calc(20px + env(safe-area-inset-bottom));
  color: var(--genre-text);
  touch-action: none;
`;

const Grabber = styled.div`
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: var(--genre-text-dim);
  opacity: 0.5;
  margin: 8px auto 12px;
`;

const Title = styled.h2`
  margin: 0 0 12px;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--genre-text);
`;

const Content = styled.div`
  touch-action: pan-y;
`;

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

/**
 * Dark, skin-aware bottom sheet. Replaces MUI's `Drawer` for mobile-first
 * modal content (sound browser, export options, etc.).
 *
 * Accessibility: renders `role="dialog"` + `aria-modal="true"`, traps focus
 * while open, restores focus to the previously-focused element on close,
 * and closes on `Escape`. Body scroll is locked while open so background
 * content can't scroll behind the sheet.
 *
 * Dismissal: clicking the backdrop, pressing Escape, or dragging the sheet
 * down past a threshold all call `onClose`. The slide-in/out and drag
 * transforms are skipped (snap instantly) when the user has
 * `prefers-reduced-motion` enabled.
 */
export default function BottomSheet({ open, onClose, children, title }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Body scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Focus management: focus the sheet on open, restore focus on close.
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      const el = sheetRef.current;
      const firstFocusable = el?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (firstFocusable ?? el)?.focus();
    } else {
      previouslyFocused.current?.focus?.();
      previouslyFocused.current = null;
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const el = sheetRef.current;
      if (!el) return;
      const focusable = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
      if (info.offset.y > 100 || info.velocity.y > 500) {
        onClose();
      }
    },
    [onClose]
  );

  const transition = prefersReducedMotion ? { duration: 0 } : { type: 'spring' as const, damping: 32, stiffness: 320 };
  const fadeTransition = prefersReducedMotion ? { duration: 0 } : { duration: 0.2 };

  return (
    <AnimatePresence>
      {open && (
        <>
          <Backdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fadeTransition}
            onClick={onClose}
            aria-hidden="true"
            data-testid="bottom-sheet-backdrop"
          />
          <Sheet
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={transition}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={handleDragEnd}
          >
            <Grabber />
            {title && <Title>{title}</Title>}
            <Content>{children}</Content>
          </Sheet>
        </>
      )}
    </AnimatePresence>
  );
}
