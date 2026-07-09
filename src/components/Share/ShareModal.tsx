'use client';

import { useCallback, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Check, Copy, Share2 } from 'lucide-react';
import BottomSheet from '@/components/common/BottomSheet';
import { focusRing } from '@/components/common/focusRing';
import { encodeBeatToUrl } from '@/lib/utils';
import { useGridStore } from '@/stores/useGridStore';
import { useProjectStore } from '@/stores/useProjectStore';

/** Props for {@link ShareModal}. */
interface ShareModalProps {
  /** Whether the sheet is currently visible. */
  open: boolean;
  /** Callback to close the sheet. */
  onClose: () => void;
}

const UrlRow = styled.div`
  display: flex;
  align-items: center;
  min-height: 44px;
  padding: 8px 12px;
  border-radius: 12px;
  background: var(--genre-cell-off);
  margin-bottom: 16px;
`;

const UrlText = styled.span`
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.85rem;
  color: var(--genre-text-dim);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
`;

const ActionButton = styled.button`
  appearance: none;
  border: none;
  width: 100%;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: box-shadow 0.15s ease, background-color 0.15s ease;

  &:focus-visible {
    ${focusRing()}
  }
`;

const PrimaryButton = styled(ActionButton)<{ $done: boolean }>`
  background: ${(p) => (p.$done ? 'var(--genre-accent)' : 'var(--genre-primary)')};
  color: var(--genre-surface);
  box-shadow: 0 0 var(--genre-glow-blur, 12px) var(--genre-glow);
`;

const SecondaryButton = styled(ActionButton)`
  background: transparent;
  border: 1px solid var(--genre-text-dim);
  color: var(--genre-text);
  margin-top: 10px;
`;

/**
 * Bottom-sheet for sharing the current beat as a URL. The share link
 * round-trips the beat's genre, BPM, grid, sound selections, and volumes
 * through {@link encodeBeatToUrl}, so opening it lands on `/beat` with the
 * same beat rendered read-only. Offers a clipboard copy (with a transient
 * "Copied!" confirmation) and, when the browser supports it, the native Web
 * Share sheet via `navigator.share`.
 */
export default function ShareModal({ open, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const title = useProjectStore((s) => s.currentTitle);

  const genre = useGridStore((s) => s.genre);
  const bpm = useGridStore((s) => s.bpm);
  const grid = useGridStore((s) => s.grid);
  const sounds = useGridStore((s) => s.sounds);
  const volumes = useGridStore((s) => s.volumes);

  const shareUrl = useMemo(() => {
    const path = encodeBeatToUrl({ genre, bpm, grid, sounds, volumes });
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${path}`;
    }
    return path;
  }, [genre, bpm, grid, sounds, volumes]);

  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (unsupported browser/insecure context) — no-op.
    }
  }, [shareUrl]);

  const handleNativeShare = useCallback(async () => {
    try {
      await navigator.share({
        title: `${title} — NI Play`,
        text: 'Check out this beat I made!',
        url: shareUrl,
      });
    } catch {
      // User cancelled the share sheet, or the platform rejected it — no-op.
    }
  }, [title, shareUrl]);

  return (
    <BottomSheet open={open} onClose={onClose} title="Share your beat">
      <UrlRow>
        <UrlText>{shareUrl}</UrlText>
      </UrlRow>

      <PrimaryButton type="button" onClick={handleCopy} $done={copied}>
        {copied ? (
          <Check size={18} strokeWidth={2.5} aria-hidden="true" />
        ) : (
          <Copy size={18} strokeWidth={2.25} aria-hidden="true" />
        )}
        {copied ? 'Copied!' : 'Copy link'}
      </PrimaryButton>

      {canShare && (
        <SecondaryButton type="button" onClick={handleNativeShare}>
          <Share2 size={18} strokeWidth={2.25} aria-hidden="true" />
          Share…
        </SecondaryButton>
      )}
    </BottomSheet>
  );
}
