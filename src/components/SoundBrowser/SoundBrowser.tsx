'use client';

import { useCallback, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { Play, Check } from 'lucide-react';
import BottomSheet from '@/components/common/BottomSheet';
import IconButton from '@/components/common/IconButton';
import { TrackCategory } from '@/types';
import { useGridStore } from '@/stores/useGridStore';
import { getSounds } from '@/data/sounds';
import { swapSound } from '@/audio/soundLoader';
import { getVoice } from '@/audio/synthKit';
import { getTone } from '@/audio/tone';
import { TRACK_LABELS } from '@/data/trackMeta';

/** Props for {@link SoundBrowser}. */
interface SoundBrowserProps {
  /** Whether the sheet is currently visible. */
  open: boolean;
  /** Callback to close the sheet. */
  onClose: () => void;
  /** The track to browse sounds for, or `null` when inactive. */
  track: TrackCategory | null;
}

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Row = styled.li<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 6px 8px;
  border-radius: 10px;
  background: ${(p) => (p.$selected ? 'var(--genre-cell-off)' : 'transparent')};
  transition: background-color 0.15s ease;
`;

const NameButton = styled.button<{ $selected: boolean }>`
  appearance: none;
  background: none;
  border: none;
  flex: 1 1 auto;
  min-width: 0;
  text-align: left;
  padding: 8px 4px;
  cursor: pointer;
  color: ${(p) => (p.$selected ? 'var(--genre-primary)' : 'var(--genre-text)')};
  font-weight: ${(p) => (p.$selected ? 700 : 500)};
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 8px;

  &:focus-visible {
    outline: 2px solid var(--genre-accent);
    outline-offset: 2px;
  }
`;

const SelectedMark = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  color: var(--genre-primary);
  filter: drop-shadow(0 0 6px var(--genre-glow));
`;

const SelectedMarkSpacer = styled.span`
  display: inline-block;
  width: 22px;
  flex-shrink: 0;
`;

const Empty = styled.p`
  margin: 12px 0;
  color: var(--genre-text-dim);
  font-size: 0.85rem;
`;

const ConfirmButton = styled.button`
  appearance: none;
  border: none;
  width: 100%;
  min-height: 44px;
  margin-top: 12px;
  border-radius: 12px;
  background: var(--genre-primary);
  color: var(--genre-surface);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow: 0 0 var(--genre-glow-blur, 12px) var(--genre-glow);
  transition: box-shadow 0.15s ease;

  &:focus-visible {
    outline: 2px solid var(--genre-accent);
    outline-offset: 2px;
  }
`;

/**
 * Bottom-sheet browser that lists the available sound variants for a given
 * track in the current genre. Tapping a variant previews it by swapping it
 * into the live audio kit and auditioning a one-shot hit; the "Use this
 * sound" action confirms the swap and closes. Dismissing the sheet any
 * other way (backdrop tap, Escape, drag-down) reverts to the sound that
 * was assigned when the sheet opened.
 */
export default function SoundBrowser({ open, onClose, track }: SoundBrowserProps) {
  const genre = useGridStore((s) => s.genre);
  const currentSoundId = useGridStore((s) => (track ? s.sounds[track] : null));
  const originalSoundIdRef = useRef<string | null>(null);

  // Remember the sound that was assigned when the sheet opened, so an
  // unconfirmed dismissal can revert to it.
  useEffect(() => {
    if (open && track) {
      originalSoundIdRef.current = useGridStore.getState().sounds[track];
    }
  }, [open, track]);

  const sounds = track ? getSounds(genre, track) : [];

  const handlePreview = useCallback(
    (soundId: string) => {
      if (!track) return;
      void (async () => {
        await swapSound(track, soundId);
        try {
          getVoice(track)?.trigger(getTone().now());
        } catch {
          // Tone.js not loaded yet -- swap still applied, just no audition.
        }
      })();
    },
    [track]
  );

  const handleConfirm = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleDismiss = useCallback(() => {
    const original = originalSoundIdRef.current;
    if (track && original && original !== useGridStore.getState().sounds[track]) {
      void swapSound(track, original);
    }
    onClose();
  }, [track, onClose]);

  const title = track ? `Choose ${TRACK_LABELS[track].toLowerCase()} sound` : 'Choose sound';

  return (
    <BottomSheet open={open} onClose={handleDismiss} title={title}>
      {sounds.length === 0 ? (
        <Empty>No sounds available for this track yet.</Empty>
      ) : (
        <List>
          {sounds.map((sound) => {
            const selected = sound.id === currentSoundId;
            return (
              <Row key={sound.id} $selected={selected}>
                <IconButton
                  icon={Play}
                  label={`Preview ${sound.name}`}
                  size={36}
                  onClick={() => handlePreview(sound.id)}
                />
                <NameButton
                  type="button"
                  onClick={() => handlePreview(sound.id)}
                  aria-pressed={selected}
                  $selected={selected}
                >
                  {sound.name}
                </NameButton>
                {selected ? (
                  <SelectedMark aria-hidden="true">
                    <Check size={18} strokeWidth={2.5} />
                  </SelectedMark>
                ) : (
                  <SelectedMarkSpacer aria-hidden="true" />
                )}
              </Row>
            );
          })}
        </List>
      )}

      <ConfirmButton type="button" onClick={handleConfirm}>
        Use this sound
      </ConfirmButton>
    </BottomSheet>
  );
}
