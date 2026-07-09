'use client';

import { useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Download, Loader2 } from 'lucide-react';
import BottomSheet from '@/components/common/BottomSheet';
import { focusRing } from '@/components/common/focusRing';
import { renderToWav } from '@/audio/exporter';
import { useGridStore } from '@/stores/useGridStore';
import { useProjectStore } from '@/stores/useProjectStore';

/** Props for {@link ExportModal}. */
interface ExportModalProps {
  /** Whether the sheet is currently visible. */
  open: boolean;
  /** Callback to close the sheet. */
  onClose: () => void;
}

const Description = styled.p`
  margin: 0 0 16px;
  color: var(--genre-text-dim);
  font-size: 0.85rem;
`;

const ExportButton = styled.button`
  appearance: none;
  border: none;
  width: 100%;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 12px;
  background: var(--genre-primary);
  color: var(--genre-surface);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow: 0 0 var(--genre-glow-blur, 12px) var(--genre-glow);
  transition: box-shadow 0.15s ease, opacity 0.15s ease;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &:focus-visible {
    ${focusRing()}
  }
`;

const Spinner = styled(Loader2)`
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const Meta = styled.p`
  margin: 12px 0 0;
  color: var(--genre-text-dim);
  font-size: 0.75rem;
`;

const ErrorText = styled.p`
  margin: 12px 0 0;
  color: #ff6b6b;
  font-size: 0.8rem;
`;

/**
 * Bottom-sheet for exporting the current beat as a downloadable WAV file.
 * Rendering happens off the main sequencer clock via
 * {@link renderToWav}'s `Tone.Offline` pass, so it's safe to trigger even
 * while the live beat is playing. Shows a spinner while the (async, can
 * take a moment) render is in flight, then downloads the resulting `Blob`
 * via a temporary object URL, or shows an inline error message on failure.
 */
export default function ExportModal({ open, onClose }: ExportModalProps) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const genre = useGridStore((s) => s.genre);
  const bpm = useGridStore((s) => s.bpm);
  const title = useProjectStore((s) => s.currentTitle);

  // The sheet stays mounted (only `open` toggles) so a failed export's error
  // and any in-flight progress must be cleared whenever the sheet closes or
  // reopens, or the next open would show a stale error/spinner.
  useEffect(() => {
    setError(null);
    setExporting(false);
  }, [open]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    setError(null);
    try {
      const blob = await renderToWav();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${genre}-${Math.round(bpm)}bpm.wav`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('WAV export failed:', err);
      setError("Couldn't export your beat. Please try again.");
    } finally {
      setExporting(false);
    }
  }, [genre, bpm]);

  return (
    <BottomSheet open={open} onClose={onClose} title="Export">
      <Description>Download your beat as a WAV file.</Description>

      <ExportButton type="button" onClick={handleExport} disabled={exporting}>
        {exporting ? (
          <Spinner size={18} strokeWidth={2.25} aria-hidden="true" />
        ) : (
          <Download size={18} strokeWidth={2.25} aria-hidden="true" />
        )}
        {exporting ? 'Rendering…' : 'Export WAV'}
      </ExportButton>

      {error && <ErrorText role="alert">{error}</ErrorText>}

      <Meta>
        {title} · {genre} · {Math.round(bpm)} BPM
      </Meta>
    </BottomSheet>
  );
}
