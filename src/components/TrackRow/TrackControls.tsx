'use client';

import { useCallback } from 'react';
import styled from '@emotion/styled';
import { Volume2, VolumeX, Headphones } from 'lucide-react';
import IconButton from '@/components/common/IconButton';
import Fader from '@/components/common/Fader';
import { focusRing } from '@/components/common/focusRing';
import { useGridStore } from '@/stores/useGridStore';
import { getSound } from '@/data/sounds';
import { TRACK_ICONS, TRACK_LABELS } from '@/data/trackMeta';
import { TrackCategory } from '@/types';

/** Props for {@link TrackControls}. */
interface TrackControlsProps {
  /** The track category to render controls for. */
  track: TrackCategory;
  /** Callback invoked when the sound name label is clicked. */
  onSoundClick: (track: TrackCategory) => void;
}

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 0;
`;

const TrackLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  width: 56px;
  flex-shrink: 0;
  color: var(--genre-text-dim);
`;

const LabelText = styled.span`
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FaderWrap = styled.div`
  flex: 1 1 auto;
  min-width: 44px;
  max-width: 140px;
`;

const SoundLabel = styled.button`
  appearance: none;
  background: none;
  border: none;
  flex: 0 1 auto;
  min-width: 0;
  padding: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--genre-accent);
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: background-color 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  &:focus-visible {
    ${focusRing()}
  }
`;

/**
 * Per-track mixer channel strip: mute + solo toggles, a volume fader, and a
 * tappable sound name that opens the sound browser via `onSoundClick`.
 */
export default function TrackControls({ track, onSoundClick }: TrackControlsProps) {
  const muted = useGridStore((s) => s.mutes[track]);
  const soloed = useGridStore((s) => s.solos[track]);
  const volume = useGridStore((s) => s.volumes[track]);
  const toggleMute = useGridStore((s) => s.toggleMute);
  const toggleSolo = useGridStore((s) => s.toggleSolo);
  const setVolume = useGridStore((s) => s.setVolume);
  const soundId = useGridStore((s) => s.sounds[track]);
  const soundName = getSound(soundId)?.name ?? soundId;
  const Icon = TRACK_ICONS[track];

  const handleVolumeChange = useCallback(
    (value: number) => setVolume(track, value),
    [track, setVolume]
  );

  return (
    <Row>
      <TrackLabel>
        <Icon size={13} strokeWidth={2.25} aria-hidden="true" />
        <LabelText>{TRACK_LABELS[track]}</LabelText>
      </TrackLabel>

      <IconButton
        icon={muted ? VolumeX : Volume2}
        label={muted ? `Unmute ${track}` : `Mute ${track}`}
        active={muted}
        size={32}
        onClick={() => toggleMute(track)}
      />

      <IconButton
        icon={Headphones}
        label={soloed ? `Unsolo ${track}` : `Solo ${track}`}
        active={soloed}
        size={32}
        onClick={() => toggleSolo(track)}
      />

      <FaderWrap>
        <Fader
          value={volume}
          min={0}
          max={1}
          step={0.01}
          onChange={handleVolumeChange}
          ariaLabel={`${track} volume`}
        />
      </FaderWrap>

      <SoundLabel type="button" onClick={() => onSoundClick(track)}>
        {soundName}
      </SoundLabel>
    </Row>
  );
}
